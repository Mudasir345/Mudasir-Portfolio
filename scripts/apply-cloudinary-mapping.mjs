#!/usr/bin/env node
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

const TARGETS = [
  {
    kind: "json",
    path: path.join(PROJECT_ROOT, "src", "data", "data.json"),
    name: "data.json (Prisma seed source)",
  },
  {
    kind: "ts",
    path: path.join(PROJECT_ROOT, "src", "lib", "fallbackData.ts"),
    name: "fallbackData.ts (DB fallback)",
  },
  {
    kind: "ts",
    path: path.join(PROJECT_ROOT, "src", "data", "projects.ts"),
    name: "projects.ts (extra project helper)",
  },
];

function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function applyToString(content, mapping, fileName) {
  let newContent = content;
  let changes = 0;
  const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
  for (const oldPath of sortedKeys) {
    const newUrl = mapping[oldPath];
    if (!newUrl) continue;
    const re = new RegExp(escapeRegex(oldPath), "g");
    if (re.test(newContent)) {
      let before = newContent;
      newContent = newContent.replace(re, newUrl);
      if (before !== newContent) {
        const count = (before.match(re) || []).length;
        changes += count;
        console.log(`   🔁  ${oldPath}  (×${count})  →  ${newUrl}`);
      }
    }
  }
  if (changes === 0) {
    console.log(`   ⏭  no replacements`);
  } else {
    console.log(`   📝 total replacements in ${fileName}: ${changes}`);
  }
  return { content: newContent, changes };
}

function validJSONString(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error(
      "❌ Mapping file not found. Run scripts/migrate-to-cloudinary.mjs first."
    );
    process.exit(1);
  }
  const { mapping } = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
  if (!mapping || Object.keys(mapping).length === 0) {
    console.error("❌ Mapping is empty. Nothing to apply.");
    process.exit(1);
  }

  console.log(
    `🎯 Applying ${Object.keys(mapping).length} Cloudinary URL replacements\n`
  );

  let totalChanges = 0;

  for (const tgt of TARGETS) {
    if (!fs.existsSync(tgt.path)) {
      console.log(`⏭  ${tgt.name} — file missing, skipping`);
      continue;
    }
    console.log(`\n▶️  ${tgt.name}`);
    const original = fs.readFileSync(tgt.path, "utf-8");
    const { content: newContent, changes } = applyToString(
      original,
      mapping,
      path.basename(tgt.path)
    );
    if (changes > 0) {
      if (tgt.kind === "json") {
        if (!validJSONString(newContent)) {
          console.error(
            `   ❌ Produced invalid JSON after replacement. Writing ABORTED for ${tgt.name}.`
          );
          process.exit(1);
        }
      }
      fs.writeFileSync(tgt.path, newContent, "utf-8");
      console.log(`   💾 Saved`);
      totalChanges += changes;
    }
  }

  console.log(`\n✅ Done. Total replacements across all files: ${totalChanges}`);
  if (totalChanges === 0) {
    console.log(
      "\n💡 Tip: If data.json etc. still have local URLs, double-check that the mapping covers them. Run the migration step again for any missing uploads."
    );
  }
}

main();
