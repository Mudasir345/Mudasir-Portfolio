import { config, uploader, utils } from "cloudinary";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let envLoaded = false;
try {
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.join(ROOT, ".env") });
  envLoaded = true;
} catch {
  envLoaded = false;
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "[FAIL] Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
  );
  process.exit(1);
}

config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const MAPPING_PATH = path.join(ROOT, "prisma", "cloudinary-migration-map.json");
const CACHE_PATH = path.join(ROOT, "prisma", "format-reprocess-cache.json");
const OUTPUT_MAPPING_PATH = path.join(ROOT, "prisma", "format-reprocess-mapping.json");

if (!existsSync(MAPPING_PATH)) {
  console.error("[FAIL] cloudinary-migration-map.json not found at", MAPPING_PATH);
  process.exit(1);
}

const migrationMap = JSON.parse(readFileSync(MAPPING_PATH, "utf-8"));
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf-8")) : {};

const newUrlMapping = {};

function parseCloudinaryUrl(url) {
  try {
    if (!url.startsWith("https://res.cloudinary.com/")) return null;
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const cnIdx = parts.indexOf(cloudName);
    if (cnIdx === -1) return null;
    const afterCn = parts.slice(cnIdx + 1);
    const rt = afterCn[0] === "video" ? "video" : afterCn[0] === "raw" ? "raw" : "image";
    const afterRt = afterCn[0] === "image" || afterCn[0] === "video" || afterCn[0] === "raw" ? afterCn.slice(1) : afterCn;
    const uploadIdx = afterRt.indexOf("upload");
    if (uploadIdx === -1) return null;
    const afterUpload = afterRt.slice(uploadIdx + 1);
    let i = 0;
    let skipTransforms = [];
    while (i < afterUpload.length) {
      const seg = afterUpload[i];
      if (seg.startsWith("v") && /^v\d+$/.test(seg)) break;
      if (seg.includes("_") || /^(f_|q_|w_|c_|fl_)/.test(seg)) {
        skipTransforms.push(seg);
        i++;
      } else {
        break;
      }
    }
    const versionSeg = afterUpload[i] && afterUpload[i].startsWith("v") && /^v\d+$/.test(afterUpload[i]) ? afterUpload[i] : null;
    const rest = versionSeg ? afterUpload.slice(i + 1) : afterUpload.slice(i);
    const fullPath = rest.join("/");
    const lastDot = fullPath.lastIndexOf(".");
    const publicId = lastDot !== -1 ? fullPath.slice(0, lastDot) : fullPath;
    const folder = publicId.includes("/") ? publicId.slice(0, publicId.lastIndexOf("/")) : "";
    return { resourceType: rt, publicId, folder, path: fullPath };
  } catch {
    return null;
  }
}

function classifyByUrl(oldUrl, absoluteFilePath) {
  const u = oldUrl.toLowerCase();
  const p = (absoluteFilePath || "").toLowerCase();
  const tail = (p || u).split("?")[0];
  if (tail.endsWith(".svg")) return "svg";
  if (tail.endsWith(".gif")) return "gif";
  if (tail.endsWith(".png")) return "png";
  if (tail.endsWith(".jpg") || tail.endsWith(".jpeg")) return "jpg";
  if (u.includes("/raw/")) return "raw";
  return "image";
}

function optsFor(classification) {
  switch (classification) {
    case "svg":
      return { format: undefined, quality: undefined, flags: "svgo" };
    case "gif":
      return { format: "webp", quality: "auto:good", flags: "animated" };
    case "png":
      return { format: "webp" };
    case "jpg":
      return { format: "webp", quality: "auto:good" };
    case "raw":
      return null;
    default:
      return { format: "webp", quality: "auto:good" };
  }
}

const entries = Object.entries(migrationMap.uploadedFiles || {});
let success = 0;
let skip = 0;
let fail = 0;

console.log(`[INFO] Found ${entries.length} entries in migration map.`);

for (const [absPath, info] of entries) {
  const oldSecureUrl = info.url;
  const parsed = parseCloudinaryUrl(oldSecureUrl);
  if (!parsed) {
    console.log(`[SKIP] Cannot parse: ${absPath} → ${oldSecureUrl}`);
    skip++;
    continue;
  }
  const classification = classifyByUrl(oldSecureUrl, absPath);
  if (classification === "raw") {
    console.log(`[SKIP] Raw asset: ${absPath}`);
    skip++;
    continue;
  }
  const cacheKey = `${parsed.publicId}::${classification}`;
  if (cache[cacheKey] && cache[cacheKey].success) {
    newUrlMapping[oldSecureUrl] = cache[cacheKey].newUrl;
    console.log(`[CACHE HIT] ${absPath}`);
    skip++;
    continue;
  }
  const opts = optsFor(classification);
  if (!opts) {
    skip++;
    continue;
  }
  try {
    const uploadOpts = {
      public_id: parsed.publicId,
      folder: parsed.folder || undefined,
      resource_type: parsed.resourceType,
      overwrite: true,
      invalidate: true,
      unique_filename: false,
      use_filename: false,
      type: "upload",
      ...opts,
    };
    console.log(`[PROCESSING ${classification.toUpperCase()}] ${absPath}\n   old: ${oldSecureUrl}`);
    const result = await uploader.upload(oldSecureUrl, uploadOpts);
    const newSecureUrl = result.secure_url;
    cache[cacheKey] = { success: true, newUrl: newSecureUrl };
    newUrlMapping[oldSecureUrl] = newSecureUrl;
    console.log(`   new: ${newSecureUrl}\n   bytes: ${info.bytes || "?"} → ${result.bytes || "?"}`);
    success++;
  } catch (e) {
    console.error(`[FAIL] ${absPath}: ${e.message}`);
    cache[cacheKey] = { success: false, error: e.message };
    fail++;
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  writeFileSync(OUTPUT_MAPPING_PATH, JSON.stringify(newUrlMapping, null, 2));
}

console.log(`\n[DONE] Success=${success}, Skip=${skip}, Fail=${fail}`);
console.log(`[OUTPUT] New URL mapping written to ${OUTPUT_MAPPING_PATH}`);
console.log(`[OUTPUT] Cache written to ${CACHE_PATH}`);

process.exit(fail > 0 && success === 0 ? 1 : 0);
