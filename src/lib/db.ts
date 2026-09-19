import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { optimizeAllMediaInObject } from '@/lib/mediaOptimizer';

// ─── MongoDB Client Caching (Next.js dev hot-reload ke liye) ─────────────────
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let cachedDb: Db | null = null;
let cachedClient: MongoClient | null = null;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI environment variable is not set. Add it to .env.local (see .env.local.example).',
    );
  }
  return uri;
}

// Kuch Windows networks par Node ka c-ares resolver ek loopback DNS server
// (127.0.0.1) par set hota hai jo queries refuse karta hai — is se mongodb+srv
// ka SRV lookup fail hota hai aur app chup-chaap fallback data par chali jati hai.
// Sirf tab public DNS par switch karein jab saare resolvers loopback hon
// (production/Vercel par trigger nahi hoga, wahan DNS theek hota hai).
let dnsPatched = false;
async function ensureDnsResolvers(): Promise<void> {
  if (dnsPatched) return;
  dnsPatched = true;
  try {
    const dns = await import('node:dns');
    const servers = dns.getServers();
    const allLoopback =
      servers.length > 0 && servers.every((s) => s.startsWith('127.') || s === '::1');
    if (allLoopback) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.warn(
        `[db] Loopback DNS resolver ${JSON.stringify(servers)} refused SRV lookups → switched to public DNS (8.8.8.8, 1.1.1.1).`,
      );
    }
  } catch {
    // DNS patching is best-effort; ignore and let the driver use its defaults.
  }
}

export async function getMongoClient(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  await ensureDnsResolvers();

  const uri = getMongoUri();
  const client =
    global._mongoClient ||
    new MongoClient(uri, {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4, // Force IPv4 — avoids Node c-ares SRV + IPv6 lookup bugs on some Windows networks
    });

  if (process.env.NODE_ENV !== 'production') {
    global._mongoClient = client;
  }

  await client.connect();
  const db = client.db();
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// ─── createCuid — Prisma cuid() ka clone (same format, 25 chars, 'c' prefix) ─
const CUID_BASE = 'abcdefghijklmnopqrstuvwxyz0123456789';
function randFromBase(len: number): string {
  let s = '';
  const max = CUID_BASE.length;
  for (let i = 0; i < len; i++) {
    s += CUID_BASE[Math.floor(Math.random() * max)];
  }
  return s;
}
export function createCuid(): string {
  // Same format as Prisma @default(cuid()) — starts with 'c' + 24 random chars
  const timePart = Date.now().toString(36).slice(0, 8);
  const randPart = randFromBase(24 - timePart.length);
  return `c${timePart}${randPart}`;
}

// ─── Raw Entity Types — EXACT same field names as old Prisma types ──────────
// Note: Gallery embedded inside project, ServiceDetail inside service.

export interface profile {
  id: string;
  name: string;
  image: string | null;
  roles: string; // CSV (preserved for compatibility)
  bio: string;
  aboutText: string;
  experienceYears: string;
  projectsCompleted: string;
  satisfaction: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  whatsapp: string;
  declaration: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface skill {
  id: string;
  name: string;
  category: string;
  proficiency: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface experience {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  period: string;
  description: string;
  iconType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  iconType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface gallery {
  id: string;
  url: string;
  type: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface project {
  id: string;
  title: string;
  description: string;
  longDescription: string | null;
  features: string; // CSV (compatibility)
  challenges: string; // CSV
  techStack: string; // CSV
  image: string;
  mediaType: string | null;
  category: string;
  link: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  showInCv: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Embedded gallery (no separate collection anymore — same field names, array)
  gallery: gallery[];
  testimonials?: testimonial[]; // relation only (rarely loaded together)
}

export interface servicedetail {
  id: string;
  name: string;
  iconUrl: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface service {
  id: string;
  title: string;
  iconType: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  // Embedded service details
  servicedetail: servicedetail[];
}

export interface testimonial {
  id: string;
  name: string;
  email: string | null;
  role: string;
  image: string | null;
  review: string;
  stars: number;
  status: string; // "pending" | "approved" | "rejected" | "spam"
  isVerified: boolean;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Note: project relation fetched separately when needed
  project?: project | null;
}

export interface teammember {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string | null;
  github: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface language {
  id: string;
  name: string;
  proficiency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface interest {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface settings {
  id: string;
  showTeam: boolean;
  available: boolean | null;
  cvShowCertificates: boolean | null;
  cvShowLanguages: boolean | null;
  cvShowInterests: boolean | null;
  cvShowDeclaration: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Typed Collections Helper (builds on demand) ────────────────────────────
export interface TypedDb {
  profile: Collection<profile>;
  skill: Collection<skill>;
  experience: Collection<experience>;
  education: Collection<education>;
  project: Collection<project>;
  service: Collection<service>;
  testimonial: Collection<testimonial>;
  teammember: Collection<teammember>;
  certificate: Collection<certificate>;
  language: Collection<language>;
  interest: Collection<interest>;
  settings: Collection<settings>;
}

let typedDb: TypedDb | null = null;
async function getCollections(): Promise<TypedDb> {
  if (typedDb) return typedDb;
  const { db } = await getMongoClient();
  typedDb = {
    profile: db.collection<profile>('profile'),
    skill: db.collection<skill>('skills'),
    experience: db.collection<experience>('experience'),
    education: db.collection<education>('education'),
    project: db.collection<project>('projects'),
    service: db.collection<service>('services'),
    testimonial: db.collection<testimonial>('testimonials'),
    teammember: db.collection<teammember>('team'),
    certificate: db.collection<certificate>('certificates'),
    language: db.collection<language>('languages'),
    interest: db.collection<interest>('interests'),
    settings: db.collection<settings>('settings'),
  };
  return typedDb;
}

/**
 * Mongo docs ek BSON `_id` (ObjectId) le kar aate hain jiska `toJSON` method
 * React Server Component → Client Component prop serialization tod deta hai
 * ("Only plain objects can be passed to Client Components"). `_id` hata kar
 * plain shallow copy return karein taake ObjectId kabhi RSC boundary cross na kare.
 */
function toPlain<T>(doc: unknown): T | null {
  if (!doc || typeof doc !== 'object') return (doc as T) ?? null;
  const copy = { ...(doc as Record<string, unknown>) };
  delete copy._id;
  return copy as T;
}

/**
 * Proxy `db` object — old admin.ts code ke liye compatibility.
 * Usage: db.profile.findFirst()    (returns Promise<profile | null>)
 *        db.projects.findMany()    (returns Promise<project[]>)
 * All async methods — callers use await.
 */
function buildDbProxy(): TypedDb {
  const handler: ProxyHandler<unknown> = {
    get(_target, prop) {
      const colName = prop as keyof TypedDb;
      // Build chainable query runner for this collection
      const runner: Record<string, (...args: unknown[]) => Promise<unknown>> = {
        // ──── READ ─────────────────────────────────────────────────────
        async findOne(arg: unknown = {}, opts: unknown = {}) {
          const cols = await getCollections();
          // Unwrap Prisma-style { where: ... } arg; fall back to raw arg as Mongo filter
          const filter = typeof arg === 'object' && arg !== null && 'where' in (arg as object)
            ? (arg as { where: object }).where
            : (arg as object);
          return toPlain(await cols[colName].findOne(filter as object, opts as object));
        },
        async findFirst(arg: unknown = {}, opts: unknown = {}) {
          // Alias for findOne — Prisma users expect findFirst()
          const cols = await getCollections();
          const filter = typeof arg === 'object' && arg !== null && 'where' in (arg as object)
            ? (arg as { where: object }).where
            : (arg as object);
          return toPlain(await cols[colName].findOne(filter as object, opts as object));
        },
        async findMany(params: { where?: object; orderBy?: Record<string, 'asc' | 'desc' | 1 | -1>; include?: object; skip?: number; take?: number } = {}) {
          const cols = await getCollections();
          const filter = params.where || {};
          // Translate Prisma-style orderBy {"field":"asc"} → MongoDB {field: 1} / {field: -1}
          const rawOrderBy = params.orderBy || {};
          const sort: Record<string, 1 | -1> = {};
          for (const key of Object.keys(rawOrderBy)) {
            const v = rawOrderBy[key];
            if (typeof v === 'number') {
              sort[key] = v >= 0 ? 1 : -1;
            } else if (typeof v === 'string') {
              const lower = v.toLowerCase();
              sort[key] = (lower === 'desc' || lower === '-1' || lower === 'dsc') ? -1 : 1;
            } else {
              sort[key] = 1;
            }
          }
          const cursor = cols[colName].find(filter);
          if (Object.keys(sort).length) cursor.sort(sort);
          if (typeof params.skip === 'number') cursor.skip(params.skip);
          if (typeof params.take === 'number') cursor.limit(params.take);
          const rows = await cursor.toArray();
          return rows.map((d) => toPlain(d));
        },
        async count(arg: object = {}) {
          const cols = await getCollections();
          // Unwrap Prisma-style { where: ... } arg
          const where = typeof arg === 'object' && arg !== null && 'where' in arg
            ? (arg as { where: object }).where
            : arg;
          return cols[colName].countDocuments(where as object);
        },
        async aggregate(pipeline: unknown[] = []) {
          const cols = await getCollections();
          const rows = await cols[colName].aggregate(pipeline).toArray();
          return rows.map((d) => toPlain(d));
        },
        // ──── WRITE ────────────────────────────────────────────────────
        async create(params: { data: Record<string, unknown> }) {
          const cols = await getCollections();
          const now = new Date();
          const data = {
            id: createCuid(),
            ...params.data,
            createdAt: params.data.createdAt ?? now,
            updatedAt: params.data.updatedAt ?? now,
          };
          // Project / Service embedded subdocs auto-create child ids
          if (colName === 'project' && Array.isArray((data as unknown as project).gallery)) {
            (data as unknown as project).gallery = (data as unknown as project).gallery.map((g) => ({
              createdAt: now,
              updatedAt: now,
              id: createCuid(),
              ...g,
              projectId: data.id,
            }));
          }
          if (colName === 'service' && Array.isArray((data as unknown as service).servicedetail)) {
            (data as unknown as service).servicedetail = (data as unknown as service).servicedetail.map((sd) => ({
              createdAt: now,
              updatedAt: now,
              id: createCuid(),
              ...sd,
              serviceId: data.id,
            }));
          }
          const result = await cols[colName].insertOne(data as any);
          // Return inserted doc (Prisma returns full row)
          const inserted = await cols[colName].findOne({ _id: result.insertedId });
          return toPlain(inserted) ?? data;
        },
        async createMany(params: { data: Record<string, unknown>[] }) {
          const cols = await getCollections();
          const now = new Date();
          const docs = params.data.map((d) => ({
            id: createCuid(),
            ...d,
            createdAt: d.createdAt ?? now,
            updatedAt: d.updatedAt ?? now,
          }));
          const res = await cols[colName].insertMany(docs as any, { ordered: false });
          return { count: res.insertedCount, insertedIds: res.insertedIds };
        },
        async update(params: { where: { id?: string }; data: Record<string, unknown> }) {
          const cols = await getCollections();
          const { id } = params.where || {};
          if (!id) throw new Error('update() requires where.id');
          const now = new Date();
          const setData = {
            ...params.data,
            updatedAt: params.data.updatedAt ?? now,
          };
          // Handle embedded arrays (full replace)
          const $set: Record<string, unknown> = {};
          const extras: Record<string, unknown[]> = {};
          for (const key of Object.keys(setData)) {
            const val = setData[key];
            if (key === 'gallery' && Array.isArray(val)) {
              extras.gallery = (val as Partial<gallery>[]).map((g) => ({
                id: g.id || createCuid(),
                createdAt: g.createdAt ?? now,
                updatedAt: now,
                projectId: id,
                ...g,
              })) as gallery[];
            } else if (key === 'servicedetail' && Array.isArray(val)) {
              extras.servicedetail = (val as Partial<servicedetail>[]).map((sd) => ({
                id: sd.id || createCuid(),
                createdAt: sd.createdAt ?? now,
                updatedAt: now,
                serviceId: id,
                ...sd,
              })) as servicedetail[];
            } else if (key !== 'id' && key !== '_id') {
              $set[key] = val;
            }
          }
          if (Object.keys(extras).length) Object.assign($set, extras);
          await cols[colName].updateOne({ id }, { $set });
          return toPlain(await cols[colName].findOne({ id }));
        },
        async delete(params: { where: { id?: string } }) {
          const cols = await getCollections();
          const { id } = params.where || {};
          if (!id) throw new Error('delete() requires where.id');
          const before = await cols[colName].findOne({ id });
          await cols[colName].deleteOne({ id });
          return toPlain(before);
        },
        async deleteMany(params: { where?: object } = {}) {
          const cols = await getCollections();
          const filter = params.where || {};
          const res = await cols[colName].deleteMany(filter);
          return { count: res.deletedCount };
        },
      };
      return runner;
    },
  };
  return new Proxy({}, handler as ProxyHandler<TypedDb>) as TypedDb;
}

export const db = buildDbProxy();

// ─── Enriched Frontend Types (components ke liye) ────────────────────────────
export type ProfileData = Omit<profile, 'roles' | 'experienceYears' | 'projectsCompleted' | 'satisfaction' | 'availability'> & {
  roles: string[];
  stats: {
    experienceYears: string;
    projectsCompleted: string;
    satisfaction: string;
    availability: string;
  };
};

export type SkillData = skill;
export type ExperienceData = experience;
export type EducationData = education;
export type GalleryData = gallery;

export type ProjectData = Omit<project, 'techStack' | 'features' | 'challenges'> & {
  techStack: string[];
  features: string[];
  challenges: string[];
  gallery: GalleryData[];
};

export type ServiceDetailData = Pick<servicedetail, 'name' | 'iconUrl'>;
export type ServiceData = Omit<service, never> & {
  details: ServiceDetailData[];
};

export type TestimonialStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export type TestimonialData = testimonial;
export type TeamMember = teammember;
export type CertificateData = certificate;
export type LanguageData = language;
export type InterestData = interest;
export type SettingsData = settings;
export type ProjectCategory = 'Web' | 'Mobile' | 'Desktop' | 'Automation';

// ─── DB → Frontend Transformers ───────────────────────────────────────────────

export function transformProfile(raw: profile): ProfileData {
  const data: ProfileData = {
    ...raw,
    roles: raw.roles ? raw.roles.split(',').map((r) => r.trim()).filter(Boolean) : [],
    stats: {
      experienceYears: raw.experienceYears,
      projectsCompleted: raw.projectsCompleted,
      satisfaction: raw.satisfaction,
      availability: raw.availability,
    },
  };
  return optimizeAllMediaInObject(data) as ProfileData;
}

export function transformProject(raw: project & { gallery: gallery[] }): ProjectData {
  const data: ProjectData = {
    ...raw,
    techStack: raw.techStack ? raw.techStack.split(',').map((t) => t.trim()).filter(Boolean) : [],
    features: raw.features ? raw.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
    challenges: raw.challenges ? raw.challenges.split(',').map((c) => c.trim()).filter(Boolean) : [],
    gallery: raw.gallery ?? [],
  };
  return optimizeAllMediaInObject(data) as ProjectData;
}

// Silence unused ObjectId warning (kept imported for future direct use)
export type { ObjectId };
