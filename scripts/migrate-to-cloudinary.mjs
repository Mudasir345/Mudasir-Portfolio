#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const DIR_SOURCES = [
  {
    publicDir: path.join(PROJECT_ROOT, "public", "projects"),
    urlPrefix: "/projects/",
    cloudinaryFolder: "portfolio/projects",
  },
  {
    publicDir: path.join(PROJECT_ROOT, "public", "uploads", "projects"),
    urlPrefix: "/uploads/projects/",
    cloudinaryFolder: "portfolio/projects",
  },
  {
    publicDir: path.join(PROJECT_ROOT, "public", "uploads", "profile"),
    urlPrefix: "/uploads/profile/",
    cloudinaryFolder: "portfolio/profile",
  },
];

const EXTRA_FILES = [
  {
    filePath: path.join(PROJECT_ROOT, "public", "profile.png"),
    logicalPaths: ["/profile.png"],
    cloudinaryFolder: "portfolio/profile",
  },
  {
    filePath: path.join(PROJECT_ROOT, "public", "profile.jpg"),
    logicalPaths: ["/profile.jpg"],
    cloudinaryFolder: "portfolio/profile",
  },
  {
    filePath: path.join(PROJECT_ROOT, "public", "og-image.png"),
    logicalPaths: ["/og-image.png"],
    cloudinaryFolder: "portfolio/misc",
  },
  {
    filePath: path.join(PROJECT_ROOT, "public", "og-image.jpg"),
    logicalPaths: ["/og-image.jpg"],
    cloudinaryFolder: "portfolio/misc",
  },
];

const MAPPING_FILE = path.join(
  PROJECT_ROOT,
  "prisma",
  "cloudinary-migration-map.json"
);

dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

function fail(reason) {
  console.error("\n❌ FAILED:", reason);
  process.exit(1);
}

if (!cloudName || !apiKey || !apiSecret) {
  fail(
    "Cloudinary env vars missing. Ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set in .env"
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

function loadExistingMap() {
  if (!fs.existsSync(MAPPING_FILE)) return { mapping: {}, uploadedFiles: {} };
  try {
    const raw = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
    return {
      mapping: raw.mapping || {},
      uploadedFiles: raw.uploadedFiles || {},
    };
  } catch {
    return { mapping: {}, uploadedFiles: {} };
  }
}

function saveMap(state) {
  fs.mkdirSync(path.dirname(MAPPING_FILE), { recursive: true });
  fs.writeFileSync(
    MAPPING_FILE,
    JSON.stringify(state, null, 2) + "\n",
    "utf-8"
  );
}

function guessResourceType(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const videoExts = new Set([
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "wmv",
    "flv",
    "m4v",
  ]);
  const imageExts = new Set([
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "ico",
    "bmp",
    "avif",
  ]);
  if (videoExts.has(ext)) return "video";
  if (imageExts.has(ext)) return "image";
  return "auto";
}

function fileShaCache(filePath) {
  const stat = fs.statSync(filePath);
  return `${stat.size}-${Math.floor(stat.mtimeMs)}`;
}

async function uploadOne(filePath, cloudinaryFolder, logicalPaths, state) {
  const existing = state.uploadedFiles[filePath];
  const currentCache = fileShaCache(filePath);

  if (existing && existing.cacheKey === currentCache) {
    for (const lp of logicalPaths) state.mapping[lp] = existing.url;
    return { skipped: true, url: existing.url };
  }

  const basename = path.basename(filePath);
  const ext = path.extname(basename);
  const stem = basename.slice(0, basename.length - ext.length);
  const safeStem = stem.replace(/[^a-zA-Z0-9_-]/g, "_");
  const publicId = `${safeStem}-${Date.now()}`;
  const resourceType = guessResourceType(filePath);

  const result = await cloudinary.uploader.upload(filePath, {
    folder: cloudinaryFolder,
    public_id: publicId,
    resource_type: resourceType,
    use_filename: false,
    unique_filename: true,
    overwrite: false,
  });

  state.uploadedFiles[filePath] = {
    url: result.secure_url,
    cacheKey: currentCache,
    resourceType: result.resource_type || resourceType,
  };
  for (const lp of logicalPaths) state.mapping[lp] = result.secure_url;

  return { skipped: false, url: result.secure_url };
}

function walkDir(dir, output = []) {
  if (!fs.existsSync(dir)) return output;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, output);
    else if (e.isFile() && !e.name.startsWith(".")) output.push(full);
  }
  return output;
}

async function main() {
  const state = loadExistingMap();
  const startCount = Object.keys(state.mapping).length;

  console.log(`🚀 Cloudinary migration starting (cloud_name: ${cloudName})`);
  console.log(`   Mapping file: ${MAPPING_FILE}`);
  console.log(`   Previously migrated: ${startCount} URLs\n`);

  let totalTodo = 0;
  let totalDone = 0;
  let totalSkipped = 0;
  const errors = [];

  for (const src of DIR_SOURCES) {
    const files = walkDir(src.publicDir);
    totalTodo += files.length;

    for (const file of files) {
      const rel = path.relative(src.publicDir, file).split(path.sep).join("/");
      const logicalPath = src.urlPrefix + rel;
      try {
        const res = await uploadOne(
          file,
          src.cloudinaryFolder,
          [logicalPath],
          state
        );
        if (res.skipped) totalSkipped++;
        else totalDone++;
        const kind = res.skipped ? "⏭  cached" : "✅ uploaded";
        console.log(`   ${kind}  ${logicalPath}`);
      } catch (e) {
        errors.push({ file, err: e.message });
        console.error(`   ❌ error   ${logicalPath}: ${e.message}`);
      }
      saveMap(state);
    }
  }

  totalTodo += EXTRA_FILES.length;
  for (const extra of EXTRA_FILES) {
    if (!fs.existsSync(extra.filePath)) {
      console.log(`   ⏭  missing  ${extra.filePath}`);
      totalSkipped++;
      continue;
    }
    try {
      const res = await uploadOne(
        extra.filePath,
        extra.cloudinaryFolder,
        extra.logicalPaths,
        state
      );
      if (res.skipped) totalSkipped++;
      else totalDone++;
      const kind = res.skipped ? "⏭  cached" : "✅ uploaded";
      console.log(
        `   ${kind}  ${extra.logicalPaths.join(" | ")} (${path.basename(
          extra.filePath
        )})`
      );
    } catch (e) {
      errors.push({ file: extra.filePath, err: e.message });
      console.error(
        `   ❌ error   ${extra.logicalPaths.join(" | ")}: ${e.message}`
      );
    }
    saveMap(state);
  }

  console.log("\n📊 Upload summary:");
  console.log(`   New uploads:  ${totalDone}`);
  console.log(`   Cache hits:   ${totalSkipped}`);
  console.log(`   Total mapped: ${Object.keys(state.mapping).length}`);

  if (errors.length) {
    console.log(`\n⚠️  Errors (${errors.length}):`);
    for (const e of errors) console.log(`   - ${e.file}: ${e.err}`);
  }

  console.log(
    `\n💾 Mapping saved to: prisma/cloudinary-migration-map.json (${
      Object.keys(state.mapping).length
    } entries)`
  );
  console.log("   You can now run step-2 (apply-mapping-to-files.mjs) to update data.json / fallbackData.ts.");

  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
