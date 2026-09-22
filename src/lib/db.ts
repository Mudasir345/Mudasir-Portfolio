import { MongoClient, Db, Collection, ObjectId, type Document, type MongoClientOptions } from 'mongodb';
import { promises as dnsPromises } from 'node:dns';
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

// `mongodb+srv://` ka seed-list driver khud SRV query karke banata hai, aur kuch
// environments (Windows ka local DNS proxy, Next build workers) par woh query
// ECONNREFUSED kha jati hai — natija: connection fail aur app chup-chaap
// `fallbackData.ts` ka nakli content dikha deti hai. Is liye SRV records hum khud
// resolve karte hain (pehle system resolver, phir public DNS) aur driver ko direct
// `mongodb://seed1,seed2,seed3/...?tls=true` URI dete hain. Dono fail hon to
// purani driver-wali path par wapas lot jaate hain, koi naya failure nahi.
const PUBLIC_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

type PublicResolver = InstanceType<typeof dnsPromises.Resolver>;

interface SrvUriParts {
  host: string;
  /** `user:pass@` jaisa userinfo, bilkul as-is (already percent-encoded) */
  userinfo: string;
  /** `/dbname` hisse ka path, khali ho to '' */
  dbname: string;
  /** `?` ke baad ka query string (without `?`) */
  search: string;
}

function parseSrvUri(srvUri: string): SrvUriParts | null {
  const match = /^mongodb\+srv:\/\/([^/]+)(\/[^?]*)?(.*)$/.exec(srvUri);
  if (!match) return null;

  const [, authority, dbname = '', tail = ''] = match;
  const atIndex = authority.lastIndexOf('@');
  const host = (atIndex >= 0 ? authority.slice(atIndex + 1) : authority).replace(/:\d+$/, '');
  if (!host) return null;

  return {
    host,
    userinfo: atIndex >= 0 ? authority.slice(0, atIndex + 1) : '',
    dbname,
    search: tail.startsWith('?') ? tail.slice(1) : '',
  };
}

function createPublicResolver(): PublicResolver {
  const resolver = new dnsPromises.Resolver();
  resolver.setServers(PUBLIC_DNS_SERVERS);
  return resolver;
}

// Driver ke `checkParentDomainMatch` ka equivalent: SRV reply ka domain (pehla
// label hata kar) SRV host ke domain (wohi label hata kar) se match karna chahiye.
// Atlas ka `portfolio.5izw2hs.mongodb.net` in ka *sibling* hai, parent nahi — is
// liye plain endsWith(srvHost) har record reject kar deta.
function sharesParentDomain(address: string, srvHost: string): boolean {
  const stripFirstLabel = (host: string) => host.replace(/^.*?\./, '');
  const normalizedAddress = address.replace(/\.$/, '');
  const normalizedSrvHost = srvHost.replace(/\.$/, '');
  const addressDomain = `.${stripFirstLabel(normalizedAddress)}`;
  const srvIsShort = normalizedSrvHost.split('.').length < 3;
  let srvHostDomain = srvIsShort ? normalizedSrvHost : `.${stripFirstLabel(normalizedSrvHost)}`;
  if (!srvHostDomain.startsWith('.')) srvHostDomain = `.${srvHostDomain}`;
  return addressDomain.endsWith(srvHostDomain);
}

// SRV records se direct replica-set URI banate hain. Credentials/dbname as-is
// pass hote hain aur URI kabhi log nahi hoti — secret leak na ho.
async function buildDirectUriFromSrv(resolver: PublicResolver, parts: SrvUriParts): Promise<string | null> {
  const { host: srvHost, userinfo, dbname, search } = parts;

  const records = await resolver.resolveSrv(`_mongodb._tcp.${srvHost}`);
  const seeds = records
    .filter((record) => sharesParentDomain(record.name, srvHost))
    .map((record) => `${record.name.replace(/\.$/, '')}:${record.port || 27017}`);
  if (seeds.length === 0) return null;

  const params = new URLSearchParams(search);
  try {
    // TXT record sirf authSource/replicaSet de sakta hai (driver bhi yahi karta
    // hai) aur jo pehle se URI mein hai us par override nahi hota.
    const txt = await resolver.resolveTxt(srvHost);
    const txtParams = new URLSearchParams((txt[0] ?? []).join(''));
    for (const key of ['authSource', 'replicaSet'] as const) {
      const value = txtParams.get(key);
      if (value && !params.has(key)) params.set(key, value);
    }
  } catch {
    // TXT records optional hain; na milne par bhi multiple seeds se driver
    // topology khud discover kar leta hai.
  }
  // Direct mongodb:// par TLS default false hota hai — Atlas ke liye lazmi hai.
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');

  const query = params.toString();
  return `mongodb://${userinfo}${seeds.join(',')}${dbname}${query ? `?${query}` : ''}`;
}

// Driver ke host lookups bhi public DNS se karate hain, warna wahi ECONNREFUSED
// shard hosts par dobara aa sakta hai.
type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  addresses?: string | Array<{ address: string; family: number }> | number | null,
  family?: number,
) => void;

function createPublicLookup(resolver: PublicResolver) {
  return (hostname: string, options: object, callback: LookupCallback): void => {
    const opts = (options ?? {}) as { all?: boolean; family?: number };
    resolver
      .resolve4(hostname)
      .then((addresses) => {
        if (opts.all) {
          callback(null, addresses.map((address) => ({ address, family: 4 })));
          return;
        }
        if (addresses.length === 0) {
          callback(Object.assign(new Error(`ENODATA ${hostname}`), { code: 'ENODATA' }));
          return;
        }
        callback(null, addresses[0], 4);
      })
      .catch((error: NodeJS.ErrnoException | null) => {
        // Public DNS fail ho to system resolver par wapas chale jayein.
        dnsPromises
          .lookup(hostname, { all: true, family: 4 })
          .then((addresses) =>
            opts.all
              ? callback(null, addresses)
              : callback(null, addresses[0]?.address ?? null, addresses[0]?.family)
          )
          .catch(() => callback(error ?? new Error(`DNS lookup failed for ${hostname}`)));
      });
  };
}

let connectionConfigPromise: Promise<{ uri: string; options: MongoClientOptions }> | null = null;

function getConnectionConfig(): Promise<{ uri: string; options: MongoClientOptions }> {
  if (!connectionConfigPromise) {
    connectionConfigPromise = buildConnectionConfig().catch((error) => {
      connectionConfigPromise = null;
      throw error;
    });
  }
  return connectionConfigPromise;
}

async function buildConnectionConfig(): Promise<{ uri: string; options: MongoClientOptions }> {
  const baseUri = getMongoUri();
  const options: MongoClientOptions = {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    family: 4, // Force IPv4 — avoids Node c-ares SRV + IPv6 lookup bugs on some Windows networks
  };

  const parts = baseUri.startsWith('mongodb+srv://') ? parseSrvUri(baseUri) : null;
  if (!parts) return { uri: baseUri, options };

  // Driver ko kabhi SRV query karne na dein — kuch environments (Windows DNS
  // proxy, build workers) par woh ECONNREFUSED kha jata hai aur app chup-chaap
  // fallback data par chali jati hai. Pehle system resolver se try karte hain,
  // phir public DNS; dono fail hon to purani (driver-wali) path par wapas.
  const attempts: Array<{ label: string; resolver: PublicResolver }> = [
    { label: 'system DNS', resolver: new dnsPromises.Resolver() },
    { label: 'public DNS', resolver: createPublicResolver() },
  ];

  for (const { label, resolver } of attempts) {
    try {
      const uri = await buildDirectUriFromSrv(resolver, parts);
      if (!uri) continue;
      const seedCount = uri.slice('mongodb://'.length).split('/')[0].split(',').length;
      console.log(`[db] SRV resolved via ${label} → ${seedCount} replica-set seed host(s) for ${parts.host}.`);
      const config: { uri: string; options: MongoClientOptions } = { uri, options };
      if (label !== 'system DNS') {
        // System DNS is broken yahan; shard host lookups bhi public DNS se karein.
        config.options = { ...options, lookup: createPublicLookup(resolver) as unknown as MongoClientOptions['lookup'] };
      }
      return config;
    } catch (error) {
      console.warn(
        `[db] SRV lookup via ${label} failed (${error instanceof Error ? error.message : error}); trying next resolver.`,
      );
    }
  }

  console.warn('[db] Could not pre-resolve SRV records; falling back to the driver SRV lookup.');
  return { uri: baseUri, options };
}

let connectingPromise: Promise<{ client: MongoClient; db: Db }> | null = null;

export function getMongoClient(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return Promise.resolve({ client: cachedClient, db: cachedDb });
  }
  // Ek hi in-flight connect: 15 concurrent section fetches driver ko hammer na karein.
  if (!connectingPromise) {
    connectingPromise = connect().finally(() => {
      connectingPromise = null;
    });
  }
  return connectingPromise;
}

async function connect(): Promise<{ client: MongoClient; db: Db }> {
  const { uri, options } = await getConnectionConfig();
  const client = global._mongoClient || new MongoClient(uri, options);

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

// ─── Model ↔ Mongo collection mapping (single source of truth) ──────────────
const COLLECTION_NAMES = {
  profile: 'profile',
  skill: 'skills',
  experience: 'experience',
  education: 'education',
  project: 'projects',
  service: 'services',
  testimonial: 'testimonials',
  teammember: 'team',
  certificate: 'certificates',
  language: 'languages',
  interest: 'interests',
  settings: 'settings',
} as const;

export type ModelName = keyof typeof COLLECTION_NAMES;

interface ModelDocMap {
  profile: profile;
  skill: skill;
  experience: experience;
  education: education;
  project: project;
  service: service;
  testimonial: testimonial;
  teammember: teammember;
  certificate: certificate;
  language: language;
  interest: interest;
  settings: settings;
}

// ─── Prisma-style delegate surface ───────────────────────────────────────────
// `db.<model>` ek Prisma-compatible shim hai (purana admin.ts code isi surface
// par likha tha) — ye raw Mongo Collection ke methods nahi chalata, is liye
// types bhi yehi delegate batate hain jo runtime par sach mein maujood hai.
export interface QueryParams {
  where?: Document;
  orderBy?: Document;
  include?: Document;
  skip?: number;
  take?: number;
}

export interface ModelDelegate<T> {
  findMany(params?: QueryParams): Promise<T[]>;
  findFirst(params?: QueryParams): Promise<T | null>;
  findOne(params?: QueryParams): Promise<T | null>;
  count(params?: QueryParams): Promise<number>;
  aggregate(pipeline?: Document[]): Promise<Document[]>;
  create(params: { data: Document }): Promise<T>;
  createMany(params: { data: Document[] }): Promise<{ count: number; insertedIds: Record<number, ObjectId> }>;
  update(params: { where: Document; data: Document }): Promise<T | null>;
  delete(params: { where: Document }): Promise<T | null>;
  deleteMany(params?: QueryParams): Promise<{ count: number }>;
}

export type TypedDb = { [K in ModelName]: ModelDelegate<ModelDocMap[K]> };

type TypedCollections = { [K in ModelName]: Collection<Document> };

let collections: TypedCollections | null = null;
async function getCollections(): Promise<TypedCollections> {
  if (collections) return collections;
  const { db } = await getMongoClient();
  const built = {} as TypedCollections;
  for (const name of Object.keys(COLLECTION_NAMES) as ModelName[]) {
    built[name] = db.collection<Document>(COLLECTION_NAMES[name]);
  }
  collections = built;
  return collections;
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
  const handler: ProxyHandler<TypedDb> = {
    get(_target, prop) {
      const colName = prop as ModelName;
      // Is model ke liye Prisma-jaisa query runner — methods ka set delegate
      // (ModelDelegate) se match karta hai jo TypedDb declare karta hai.
      const runner = {
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
        async aggregate(pipeline: Document[] = []) {
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
              ...g,
              id: g.id || createCuid(),
              createdAt: g.createdAt ?? now,
              updatedAt: g.updatedAt ?? now,
              projectId: data.id,
            }));
          }
          if (colName === 'service' && Array.isArray((data as unknown as service).servicedetail)) {
            (data as unknown as service).servicedetail = (data as unknown as service).servicedetail.map((sd) => ({
              ...sd,
              id: sd.id || createCuid(),
              createdAt: sd.createdAt ?? now,
              updatedAt: sd.updatedAt ?? now,
              serviceId: data.id,
            }));
          }
          const result = await cols[colName].insertOne(data as Document);
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
          const res = await cols[colName].insertMany(docs as Document[], { ordered: false });
          return { count: res.insertedCount, insertedIds: res.insertedIds };
        },
        async update(params: { where: { id?: string }; data: Record<string, unknown> }) {
          const cols = await getCollections();
          const { id } = params.where || {};
          if (!id) throw new Error('update() requires where.id');
          const now = new Date();
          const setData: Record<string, unknown> = {
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
  return new Proxy({} as TypedDb, handler);
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
// Enriched frontend shape: embedded `servicedetail` is replaced by `details`
// (the DB document itself keeps the embedded array — see db.service writes).
export type ServiceData = Omit<service, 'servicedetail'> & {
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
