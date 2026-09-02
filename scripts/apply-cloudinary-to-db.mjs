#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const MAPPING_FILE = path.join(
  PROJECT_ROOT,
  "prisma",
  "cloudinary-migration-map.json"
);

function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function mappedReplace(value, mapping) {
  if (typeof value !== "string") return value;
  let out = value;
  const keys = Object.keys(mapping).sort((a, b) => b.length - a.length);
  for (const oldPath of keys) {
    const re = new RegExp(escapeRegex(oldPath), "g");
    if (re.test(out)) {
      out = out.replace(re, mapping[oldPath]);
    }
  }
  return out;
}

async function updateTable({
  prisma,
  tableName,
  idField,
  fields,
  getRows,
  update,
  mapping,
}) {
  const rows = await getRows();
  let changedRows = 0;
  let fieldChanges = 0;
  for (const row of rows) {
    const updates = {};
    let anyChange = false;
    for (const field of fields) {
      const before = row[field];
      if (before == null) continue;

      let after;
      if (Array.isArray(before)) {
        after = before.map((item) => {
          if (item && typeof item === "object" && "url" in item) {
            const newUrl = mappedReplace(item.url, mapping);
            return { ...item, url: newUrl };
          }
          if (typeof item === "string") {
            return mappedReplace(item, mapping);
          }
          return item;
        });
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          updates[field] = after;
          anyChange = true;
        }
      } else if (typeof before === "string") {
        after = mappedReplace(before, mapping);
        if (after !== before) {
          updates[field] = after;
          anyChange = true;
        }
      }

      if (anyChange && !(field in updates)) {
        continue;
      }
    }

    if (anyChange) {
      try {
        await update(row[idField], updates);
        changedRows++;
        fieldChanges += Object.keys(updates).length;
      } catch (e) {
        console.error(
          `   ❌ ${tableName}[${idField}=${row[idField]}]: ${e.message}`
        );
      }
    }
  }
  console.log(
    `   ▶️  ${tableName}: ${rows.length} rows → ${changedRows} updated (${fieldChanges} fields)`
  );
  return fieldChanges;
}

async function main() {
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error(
      "❌ Mapping missing. Run scripts/migrate-to-cloudinary.mjs first."
    );
    process.exit(1);
  }
  const { mapping } = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
  if (!mapping || !Object.keys(mapping).length) {
    console.error("❌ Empty mapping, nothing to do.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    console.log("🔌 Connecting to local MySQL...");
    await prisma.$queryRaw`SELECT 1`;
    console.log(
      `✅ Connected. Applying ${Object.keys(mapping).length} URL mappings.\n`
    );
  } catch (e) {
    console.warn(
      `\n⚠️  Local MySQL NOT available (${e.message}). Skipping DB step.\n` +
        `   This is OK if you haven't migrated+seeded yet — Prisma seed will use the\n` +
        `   already-updated data.json (which contains all new Cloudinary URLs).\n` +
        `   When you set up Aiven later, run:\n` +
        `     npx prisma migrate deploy\n` +
        `     npm run prisma:seed\n`
    );
    await prisma.$disconnect();
    process.exit(0);
  }

  let total = 0;

  total += await updateTable({
    prisma,
    tableName: "Profile",
    idField: "id",
    fields: ["image"],
    mapping,
    getRows: () => prisma.profile.findMany(),
    update: (id, upd) => prisma.profile.update({ where: { id }, data: upd }),
  });

  total += await updateTable({
    prisma,
    tableName: "Project",
    idField: "id",
    fields: ["image", "techStack", "features", "challenges"],
    mapping,
    getRows: () => prisma.project.findMany(),
    update: (id, upd) => prisma.project.update({ where: { id }, data: upd }),
  });

  total += await updateTable({
    prisma,
    tableName: "Service",
    idField: "id",
    fields: ["image"],
    mapping,
    getRows: () => prisma.service.findMany().catch(() => []),
    update: (id, upd) => prisma.service.update({ where: { id }, data: upd }),
  });

  total += await updateTable({
    prisma,
    tableName: "Testimonial",
    idField: "id",
    fields: ["avatar"],
    mapping,
    getRows: () => prisma.testimonial.findMany().catch(() => []),
    update: (id, upd) =>
      prisma.testimonial.update({ where: { id }, data: upd }),
  });

  try {
    const gallRows = await prisma.gallery.findMany();
    let gallCh = 0;
    for (const g of gallRows) {
      const newUrl = mappedReplace(g.url, mapping);
      if (newUrl !== g.url) {
        try {
          await prisma.gallery.update({
            where: { id: g.id },
            data: { url: newUrl },
          });
          gallCh++;
        } catch (e) {
          console.error(`   ❌ Gallery[${g.id}]: ${e.message}`);
        }
      }
    }
    console.log(`   ▶️  Gallery: ${gallRows.length} rows → ${gallCh} updated`);
    total += gallCh;
  } catch (e) {
    console.warn(`   ⚠️  Gallery skipped: ${e.message}`);
  }

  try {
    const tmRows = await prisma.teamMember.findMany();
    let tmCh = 0;
    for (const t of tmRows) {
      if (!t.image) continue;
      const newImg = mappedReplace(t.image, mapping);
      if (newImg !== t.image) {
        try {
          await prisma.teamMember.update({
            where: { id: t.id },
            data: { image: newImg },
          });
          tmCh++;
        } catch (e) {
          console.error(`   ❌ TeamMember[${t.id}]: ${e.message}`);
        }
      }
    }
    console.log(`   ▶️  TeamMember: ${tmRows.length} rows → ${tmCh} updated`);
    total += tmCh;
  } catch (e) {
    console.warn(`   ⚠️  TeamMember skipped: ${e.message}`);
  }

  try {
    const sdRows = await prisma.serviceDetail.findMany();
    let sdCh = 0;
    for (const s of sdRows) {
      if (!s.iconUrl) continue;
      const newIcon = mappedReplace(s.iconUrl, mapping);
      if (newIcon !== s.iconUrl) {
        try {
          await prisma.serviceDetail.update({
            where: { id: s.id },
            data: { iconUrl: newIcon },
          });
          sdCh++;
        } catch (e) {
          console.error(`   ❌ ServiceDetail[${s.id}]: ${e.message}`);
        }
      }
    }
    console.log(
      `   ▶️  ServiceDetail: ${sdRows.length} rows → ${sdCh} updated`
    );
    total += sdCh;
  } catch (e) {
    console.warn(`   ⚠️  ServiceDetail skipped: ${e.message}`);
  }

  console.log(`\n✅ DB migration complete. Total field updates: ${total}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await new PrismaClient().$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
