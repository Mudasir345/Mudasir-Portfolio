#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const TARGETS = [
  path.join(PROJECT_ROOT, "src", "data", "data.json"),
  path.join(PROJECT_ROOT, "src", "lib", "fallbackData.ts"),
  path.join(PROJECT_ROOT, "src", "data", "projects.ts"),
];

const LOCAL_URL_RE = /["'`]\/(projects|uploads|icons)\/[^"'`\s>)]*["'`]/g;
const CLOUDINARY_URL_RE = /https:\/\/res\.cloudinary\.com\//g;
const CDN_EXTERNAL_URL_RE = /https:\/\/(cdn\.simpleicons\.org|cdn\.jsdelivr\.net|avatars\.githubusercontent\.com)\//g;

const MAPPING_FILE = path.join(
  PROJECT_ROOT,
  "prisma",
  "cloudinary-migration-map.json"
);

let mapping = {};
if (fs.existsSync(MAPPING_FILE)) {
  try {
    mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8")).mapping || {};
  } catch {
    mapping = {};
  }
}
const mappedKeys = new Set(Object.keys(mapping));

console.log("🔎 Auditing migrated/unmigrated media URLs in source files:\n");

let totalLocal = 0;
let totalCloudinary = 0;
let totalExternal = 0;
const unmigrated = [];

for (const file of TARGETS) {
  const rel = path.relative(PROJECT_ROOT, file);
  if (!fs.existsSync(file)) {
    console.log(`⏭  ${rel} — missing`);
    continue;
  }
  const content = fs.readFileSync(file, "utf-8");
  const localMatches = content.match(LOCAL_URL_RE) || [];
  const cloudMatches = content.match(CLOUDINARY_URL_RE) || [];
  const extMatches = content.match(CDN_EXTERNAL_URL_RE) || [];
  totalLocal += localMatches.length;
  totalCloudinary += cloudMatches.length;
  totalExternal += extMatches.length;

  const localUnique = [...new Set(localMatches)].map((s) =>
    s.slice(1, s.length - 1)
  );

  if (localMatches.length) {
    console.log(`⚠️  ${rel}  —  ${localMatches.length} LOCAL URLs remaining`);
    for (const u of localUnique) {
      const inMapping = mappedKeys.has(u)
        ? " (in mapping but unmapped in file)"
        : " (NOT in migration mapping!)";
      unmigrated.push({ file: rel, url: u, inMapping });
      console.log(`     - ${u}${inMapping}`);
    }
  }

  console.log(
    `✅ ${rel} — Cloudinary: ${cloudMatches.length}, External CDN: ${extMatches.length}`
  );
}

console.log("\n══════════════════════════════════════════");
console.log("📊 Audit summary:");
console.log(`   Cloudinary URLs:  ${totalCloudinary}`);
console.log(`   External CDN URLs: ${totalExternal}`);
console.log(`   Local URLs (NOT Cloudinary): ${totalLocal}`);
console.log("══════════════════════════════════════════\n");

if (totalLocal === 0) {
  console.log("🎉 100% MIGRATION COMPLETE — No local URLs left in data sources!");
  process.exit(0);
}

const orphans = unmigrated.filter((u) => !u.inMapping);
if (orphans.length) {
  console.log(
    `🚨 ${orphans.length} local URLs are not even in the migration mapping. These files either don't exist on disk or were skipped.`
  );
} else {
  console.log(
    `ℹ️  All ${totalLocal} local URLs exist in mapping. Run scripts/apply-cloudinary-mapping.mjs to update files.`
  );
}
process.exit(orphans.length ? 2 : totalLocal > 0 ? 1 : 0);
