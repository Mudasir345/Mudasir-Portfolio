#!/usr/bin/env node
/**
 * MySQL (Aiven) → MongoDB migration for the Portfolio app.
 *
 * Source of truth : live MySQL DB referenced by DATABASE_URL (14 tables).
 * Cross-check     : src/data/data.json (local real snapshot).
 * Target          : MongoDB referenced by MONGODB_URI (12 collections).
 *
 * SAFETY: runs in DRY-RUN by default (read-only). Nothing is written to Mongo
 * unless you pass --write. In write mode collections are replaced
 * (deleteMany + insertMany), matching scripts/mongo-seed.js behaviour.
 *
 * Usage:
 *   node scripts/migrate-mysql-to-mongo.mjs            # dry-run (read-only report)
 *   node scripts/migrate-mysql-to-mongo.mjs --write     # actually migrate
 *   node scripts/migrate-mysql-to-mongo.mjs --verify    # verify Mongo vs data.json only
 *
 * Requires: mysql2  (npm i -D mysql2)  and  mongodb (already installed).
 */
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const WRITE = process.argv.includes("--write");
const VERIFY_ONLY = process.argv.includes("--verify");

// ─── Env loading ─────────────────────────────────────────────────────────────
// DATABASE_URL lives in .env.production / production.env, MONGODB_URI in .env.local.
// Load them in priority order WITHOUT overriding already-set process env.
for (const f of [".env.local", ".env", ".env.production", "production.env"]) {
  const p = path.join(PROJECT_ROOT, f);
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false });
}

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_URL = process.env.DATABASE_URL;

// ─── DNS workaround ──────────────────────────────────────────────────────────
// Some Windows networks point Node's c-ares resolver at a loopback DNS server
// (127.0.0.1) that refuses queries, breaking mongodb+srv SRV lookups. If every
// configured server is loopback, fall back to public resolvers.
function ensureDns() {
  const servers = dns.getServers();
  const allLoopback = servers.length > 0 && servers.every((s) => s.startsWith("127.") || s === "::1" || s === "localhost");
  if (allLoopback) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log(`🌐 DNS: loopback resolver ${JSON.stringify(servers)} refused → switched to public DNS (8.8.8.8, 1.1.1.1)`);
  }
}

// ─── MySQL connection config (Aiven needs SSL) ───────────────────────────────
function buildMysqlConfig(uri) {
  const u = new URL(uri);
  const needsSsl = /ssl-mode=REQUIRED/i.test(uri) || /aivencloud\.com/i.test(u.hostname);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "defaultdb",
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    connectionLimit: 5,
    connectTimeout: 30000,
    dateStrings: false,
  };
}

// ─── Collection name mapping (must match src/lib/db.ts getCollections) ───────
const COLLECTION = {
  profile: "profile",
  skill: "skills",
  experience: "experience",
  education: "education",
  project: "projects",
  service: "services",
  testimonial: "testimonials",
  teammember: "team",
  certificate: "certificates",
  language: "languages",
  interest: "interests",
  settings: "settings",
};

const asDate = (v) => (v ? new Date(v) : new Date());
const asBool = (v) => (v === null || v === undefined ? v : Boolean(Number(v)));

// ─── Row → Mongo document transformers (raw Mongo shape, NOT enriched) ───────
const nowFallback = new Date();

function txProfile(r) {
  return {
    id: r.id, name: r.name, image: r.image ?? null, roles: r.roles ?? "",
    bio: r.bio ?? "", aboutText: r.aboutText ?? "",
    experienceYears: r.experienceYears ?? "", projectsCompleted: r.projectsCompleted ?? "",
    satisfaction: r.satisfaction ?? "", availability: r.availability ?? "",
    email: r.email ?? "", github: r.github ?? "", linkedin: r.linkedin ?? "", whatsapp: r.whatsapp ?? "",
    declaration: r.declaration ?? null,
    createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt),
  };
}
function txSkill(r) {
  return { id: r.id, name: r.name, category: r.category, proficiency: r.proficiency ?? null, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txExperience(r) {
  return { id: r.id, title: r.title, company: r.company, period: r.period, description: r.description, iconType: r.iconType, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txEducation(r) {
  return { id: r.id, degree: r.degree, institution: r.institution, period: r.period, description: r.description, iconType: r.iconType, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txProject(r, galleryRows) {
  return {
    id: r.id, title: r.title, description: r.description, longDescription: r.longDescription ?? null,
    features: r.features ?? "", challenges: r.challenges ?? "", techStack: r.techStack ?? "",
    image: r.image, mediaType: r.mediaType ?? null, category: r.category,
    link: r.link ?? null, liveUrl: r.liveUrl ?? null, githubUrl: r.githubUrl ?? null,
    showInCv: asBool(r.showInCv) ?? false,
    gallery: (galleryRows || []).map((g) => ({ id: g.id, url: g.url, type: g.type, projectId: r.id, createdAt: asDate(g.createdAt), updatedAt: asDate(g.updatedAt) })),
    createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt),
  };
}
function txService(r, detailRows) {
  return {
    id: r.id, title: r.title, iconType: r.iconType, description: r.description,
    servicedetail: (detailRows || []).map((d) => ({ id: d.id, name: d.name, iconUrl: d.iconUrl, serviceId: r.id, createdAt: asDate(d.createdAt), updatedAt: asDate(d.updatedAt) })),
    createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt),
  };
}
function txTestimonial(r) {
  return {
    id: r.id, name: r.name, email: r.email ?? null, role: r.role, image: r.image ?? null,
    review: r.review, stars: Number(r.stars), status: r.status ?? "pending",
    isVerified: asBool(r.isVerified) ?? false, projectId: r.projectId ?? null,
    createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt),
  };
}
function txTeam(r) {
  return { id: r.id, name: r.name, role: r.role, image: r.image, linkedin: r.linkedin ?? null, github: r.github ?? null, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txCertificate(r) {
  return { id: r.id, title: r.title, issuer: r.issuer, date: r.date, link: r.link ?? null, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txLanguage(r) {
  return { id: r.id, name: r.name, proficiency: r.proficiency, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txInterest(r) {
  return { id: r.id, name: r.name, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) };
}
function txSettings(r) {
  return {
    id: r.id, showTeam: asBool(r.showTeam) ?? false, available: asBool(r.available),
    cvShowCertificates: asBool(r.cvShowCertificates), cvShowLanguages: asBool(r.cvShowLanguages),
    cvShowInterests: asBool(r.cvShowInterests), cvShowDeclaration: asBool(r.cvShowDeclaration),
    createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt),
  };
}

// ─── Indexes (mirror scripts/mongo-seed.js) ──────────────────────────────────
async function createIndexes(db) {
  await db.collection("skills").createIndex({ name: 1 }, { unique: true, name: "skills_name_unique" });
  await db.collection("skills").createIndex({ category: 1 }, { name: "skills_category_idx" });
  await db.collection("projects").createIndex({ category: 1 }, { name: "projects_category_idx" });
  await db.collection("testimonials").createIndex({ status: 1 }, { name: "testimonials_status_idx" });
  await db.collection("testimonials").createIndex({ projectId: 1 }, { name: "testimonials_projectId_idx" });
  await db.collection("testimonials").createIndex({ createdAt: -1 }, { name: "testimonials_createdAt_desc_idx" });
  for (const col of Object.values(COLLECTION)) {
    try { await db.collection(col).createIndex({ id: 1 }, { unique: true, name: `${col}_id_unique` }); } catch { /* exists */ }
  }
}

// ─── data.json cross-check ───────────────────────────────────────────────────
function loadSnapshot() {
  const p = path.join(PROJECT_ROOT, "src", "data", "data.json");
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; }
}

function pad(s, n) { s = String(s); return s.length >= n ? s : s + " ".repeat(n - s.length); }

async function main() {
  ensureDns();
  console.log("═".repeat(64));
  console.log(`  MySQL → MongoDB migration   [MODE: ${WRITE ? "WRITE ⚠️" : VERIFY_ONLY ? "VERIFY-ONLY" : "DRY-RUN (read-only)"}]`);
  console.log("═".repeat(64));

  if (!MONGODB_URI) throw new Error("MONGODB_URI not set (checked .env.local/.env). Cannot continue.");
  if (!VERIFY_ONLY && !DATABASE_URL) {
    throw new Error("DATABASE_URL (MySQL) not set. It lives in .env.production / production.env. Add it to your env to migrate from MySQL.");
  }

  const snapshot = loadSnapshot();

  // ── Read MySQL ──────────────────────────────────────────────────────────────
  let migrated = null; // { collectionName: docs[] }
  if (!VERIFY_ONLY) {
    const mysql = await import("mysql2/promise").catch(() => {
      throw new Error("mysql2 not installed. Run: npm i -D mysql2");
    });
    const cfg = buildMysqlConfig(DATABASE_URL);
    console.log(`\n🔌 Connecting MySQL: ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database} (ssl=${cfg.ssl ? "on" : "off"})`);
    const conn = await mysql.createConnection(cfg);

    const [profile] = await conn.query("SELECT * FROM profile LIMIT 1");
    const [skills] = await conn.query("SELECT * FROM skill");
    const [experience] = await conn.query("SELECT * FROM experience");
    const [education] = await conn.query("SELECT * FROM education");
    const [projects] = await conn.query("SELECT * FROM project");
    const [gallery] = await conn.query("SELECT * FROM gallery");
    const [services] = await conn.query("SELECT * FROM service");
    const [servicedetail] = await conn.query("SELECT * FROM servicedetail");
    const [testimonials] = await conn.query("SELECT * FROM testimonial");
    const [team] = await conn.query("SELECT * FROM teammember");
    const [certificates] = await conn.query("SELECT * FROM certificate");
    const [languages] = await conn.query("SELECT * FROM language");
    const [interests] = await conn.query("SELECT * FROM interest");
    const [settings] = await conn.query("SELECT * FROM settings LIMIT 1");
    await conn.end();
    console.log("✅ MySQL read complete.");

    const galByProject = {};
    for (const g of gallery) (galByProject[g.projectId] ||= []).push(g);
    const detByService = {};
    for (const d of servicedetail) (detByService[d.serviceId] ||= []).push(d);

    migrated = {
      [COLLECTION.profile]: profile.length ? [txProfile(profile[0])] : [],
      [COLLECTION.skill]: skills.map(txSkill),
      [COLLECTION.experience]: experience.map(txExperience),
      [COLLECTION.education]: education.map(txEducation),
      [COLLECTION.project]: projects.map((p) => txProject(p, galByProject[p.id])),
      [COLLECTION.service]: services.map((s) => txService(s, detByService[s.id])),
      [COLLECTION.testimonial]: testimonials.map(txTestimonial),
      [COLLECTION.teammember]: team.map(txTeam),
      [COLLECTION.certificate]: certificates.map(txCertificate),
      [COLLECTION.language]: languages.map(txLanguage),
      [COLLECTION.interest]: interests.map(txInterest),
      [COLLECTION.settings]: settings.length ? [txSettings(settings[0])] : [],
    };
  }

  // ── Mongo: read counts (always) + write (only with --write) ──────────────────
  const client = new MongoClient(MONGODB_URI, { connectTimeoutMS: 30000, serverSelectionTimeoutMS: 30000, family: 4 });
  await client.connect();
  const db = client.db();
  console.log(`🍃 Connected MongoDB: ${db.databaseName}`);

  const beforeCounts = {};
  for (const col of Object.values(COLLECTION)) beforeCounts[col] = await db.collection(col).countDocuments();

  if (WRITE && migrated) {
    console.log("\n✍️  Writing (direct replace per collection)...");
    for (const [col, docs] of Object.entries(migrated)) {
      await db.collection(col).deleteMany({});
      if (docs.length) await db.collection(col).insertMany(docs);
      console.log(`   ${pad(col, 14)} → ${docs.length} docs`);
    }
    console.log("\n📈 Recreating indexes...");
    await createIndexes(db);
    console.log("✅ Indexes done.");
  }

  // ── Verification report ───────────────────────────────────────────────────────
  const afterCounts = {};
  for (const col of Object.values(COLLECTION)) afterCounts[col] = await db.collection(col).countDocuments();

  console.log("\n" + "═".repeat(64));
  console.log("  VERIFICATION REPORT");
  console.log("═".repeat(64));
  console.log(`  ${pad("collection", 14)} ${pad("mysql", 8)} ${pad("mongo(before)", 15)} ${pad("mongo(after)", 14)} ${pad("data.json", 10)} status`);
  console.log("  " + "-".repeat(72));

  const snapMap = {
    profile: snapshot?.profile ? 1 : 0,
    skills: snapshot?.skills?.length ?? "–",
    experience: snapshot?.experience?.length ?? "–",
    education: snapshot?.education?.length ?? "–",
    projects: snapshot?.projects?.length ?? "–",
    services: snapshot?.services?.length ?? "–",
    testimonials: snapshot?.testimonials?.length ?? "–",
    team: "–", certificates: "–", languages: "–", interests: "–", settings: snapshot?.settings ? 1 : 0,
  };

  let issues = 0;
  for (const col of Object.values(COLLECTION)) {
    const mysqlCount = migrated ? (migrated[col]?.length ?? 0) : "–";
    const after = afterCounts[col];
    const snap = snapMap[col] ?? "–";
    let status = "ok";
    if (WRITE && migrated) {
      if (after !== (migrated[col]?.length ?? 0)) { status = "⚠️ MISMATCH"; issues++; }
    } else if (migrated && after === 0 && (migrated[col]?.length ?? 0) > 0) {
      status = "dry (not written)";
    }
    // cross-check snapshot only when both numeric and non-zero
    if (typeof snap === "number" && typeof mysqlCount === "number" && snap > 0 && mysqlCount !== snap) {
      status += " | snapshot≠mysql";
      if (col === "projects" || col === "skills") issues++;
    }
    console.log(`  ${pad(col, 14)} ${pad(mysqlCount, 8)} ${pad(beforeCounts[col], 15)} ${pad(after, 14)} ${pad(snap, 10)} ${status}`);
  }

  console.log("═".repeat(64));
  if (!WRITE && migrated) {
    console.log("  ℹ️  DRY-RUN: Mongo was NOT modified. Re-run with --write to migrate.");
  }
  if (issues > 0) {
    console.log(`  🚨 ${issues} potential issue(s) flagged above — review before --write.`);
  } else {
    console.log("  ✅ No blocking mismatches detected.");
  }
  console.log("═".repeat(64));

  await client.close();
}

main().catch((e) => { console.error("\n❌ MIGRATION FAILED:\n", e); process.exit(1); });
