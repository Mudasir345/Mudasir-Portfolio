/**
 * MongoDB Seed Script — Portfolio default data populate + indexes create
 * Usage: npm run seed
 *
 * Data source: src/lib/fallbackData.ts (read ESM via dynamic import)
 * - Clears existing collection data (drop all docs)
 * - Populates with default fallback data
 * - Creates indexes: skill.name unique, testimonial.status, projects.category, etc.
 */
const fs = require('node:fs');
const path = require('node:path');
// Load env in the same priority as Next.js / the migration script: .env.local
// first (holds the working mongodb+srv URI), then .env — without overriding.
for (const f of ['.env.local', '.env']) {
  const p = path.resolve(process.cwd(), f);
  if (fs.existsSync(p)) require('dotenv').config({ path: p, override: false });
}

const { MongoClient } = require('mongodb');
const dns = require('node:dns');

// Some Windows networks point Node's c-ares resolver at a loopback DNS server
// (127.0.0.1) that refuses queries, breaking mongodb+srv SRV lookups. If every
// configured server is loopback, fall back to public resolvers.
(function ensureDns() {
  const servers = dns.getServers();
  const allLoopback = servers.length > 0 && servers.every((s) => s.startsWith('127.') || s === '::1');
  if (allLoopback) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log(`🌐 DNS: loopback resolver ${JSON.stringify(servers)} refused → switched to public DNS (8.8.8.8, 1.1.1.1)`);
  }
})();

const CUID_BASE = 'abcdefghijklmnopqrstuvwxyz0123456789';
function randFromBase(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += CUID_BASE[Math.floor(Math.random() * CUID_BASE.length)];
  return s;
}
function createCuid() {
  const t = Date.now().toString(36).slice(0, 8);
  return `c${t}${randFromBase(24 - t.length)}`;
}

function toDate(d) {
  if (!d) return new Date('2025-01-01T00:00:00Z');
  return d instanceof Date ? d : new Date(d);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var not set! Check your .env.local file.');

  // Try to import fallback data using dynamic ESM import (file is .ts — use tsx fallback?)
  let fallback = null;
  try {
    // Use path relative to project root
    const { getFallbackPortfolioData } = await import('./import-fallback.mjs');
    fallback = getFallbackPortfolioData();
  } catch (e) {
    console.warn(`Couldn't import fallbackData.ts (need tsx). Using built-in minimal defaults:`, e.message);
  }

  const client = new MongoClient(uri, { connectTimeoutMS: 30000, serverSelectionTimeoutMS: 30000, family: 4 });
  try {
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB Atlas — database:', db.databaseName);

    const now = new Date();

    // ─────────────────────────────────────────────────────────────────────
    // 1) PROFILE (single document)
    // ─────────────────────────────────────────────────────────────────────
    const p = fallback?.profile;
    const profileDoc = p
      ? {
          id: p.id && p.id !== 'fallback-profile' ? p.id : createCuid(),
          name: p.name,
          image: p.image ?? null,
          roles: Array.isArray(p.roles) ? p.roles.join(',') : String(p.roles ?? ''),
          bio: p.bio ?? '',
          aboutText: p.aboutText ?? '',
          experienceYears: p.stats?.experienceYears ?? '5+',
          projectsCompleted: p.stats?.projectsCompleted ?? '25',
          satisfaction: p.stats?.satisfaction ?? '98%',
          availability: p.stats?.availability ?? 'Open to Work',
          email: p.email ?? '',
          github: p.github ?? '',
          linkedin: p.linkedin ?? '',
          whatsapp: p.whatsapp ?? '',
          declaration: p.declaration ?? null,
          createdAt: toDate(p.createdAt ?? now),
          updatedAt: now,
        }
      : {
          id: createCuid(),
          name: 'Mudasir Choudhry',
          image: null,
          roles: 'Full Stack Developer,Automation Engineer',
          bio: 'Creative developer building performant web experiences.',
          aboutText: 'I build production-ready websites with modern tooling.',
          experienceYears: '5+',
          projectsCompleted: '25',
          satisfaction: '98%',
          availability: 'Open to Work',
          email: 'mudasirchoudhry345@gmail.com',
          github: '',
          linkedin: '',
          whatsapp: '',
          declaration: null,
          createdAt: now,
          updatedAt: now,
        };
    await db.collection('profile').deleteMany({});
    await db.collection('profile').insertOne(profileDoc);
    console.log('📝 profile — inserted 1 document, id=', profileDoc.id);

    // ─────────────────────────────────────────────────────────────────────
    // 2) SKILLS
    // ─────────────────────────────────────────────────────────────────────
    const skillsRaw = fallback?.skills ?? [
      { name: 'Next.js', category: 'Frontend', proficiency: 'Expert' },
      { name: 'React', category: 'Frontend', proficiency: 'Expert' },
      { name: 'TypeScript', category: 'Languages', proficiency: 'Expert' },
      { name: 'Node.js', category: 'Backend', proficiency: 'Advanced' },
      { name: 'MongoDB', category: 'Database', proficiency: 'Advanced' },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Expert' },
      { name: 'Three.js', category: '3D', proficiency: 'Intermediate' },
      { name: 'Python', category: 'Automation', proficiency: 'Advanced' },
    ];
    const skills = skillsRaw.map((s) => ({
      id: createCuid(),
      name: s.name,
      category: s.category,
      proficiency: s.proficiency ?? null,
      createdAt: toDate(s.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('skills').deleteMany({});
    await db.collection('skills').insertMany(skills);
    console.log('🎯 skills — inserted', skills.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 3) EXPERIENCE
    // ─────────────────────────────────────────────────────────────────────
    const expRaw = fallback?.experience ?? [
      {
        title: 'Senior Full Stack Developer',
        company: 'Freelance',
        period: '2022 — Present',
        description: 'Building scalable web apps for global clients using Next.js + TypeScript.',
        iconType: 'Briefcase',
      },
      {
        title: 'Automation Engineer',
        company: 'Self-Employed',
        period: '2020 — 2022',
        description: 'Developed Python automation scripts saving 100s of manual hours.',
        iconType: 'Cog',
      },
    ];
    const exp = expRaw.map((e) => ({
      id: createCuid(),
      title: e.title,
      company: e.company,
      period: e.period,
      description: e.description,
      iconType: e.iconType ?? 'Briefcase',
      createdAt: toDate(e.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('experience').deleteMany({});
    await db.collection('experience').insertMany(exp);
    console.log('💼 experience — inserted', exp.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 4) EDUCATION
    // ─────────────────────────────────────────────────────────────────────
    const eduRaw = fallback?.education ?? [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University of Sargodha',
        period: '2017 — 2021',
        description: 'Major in Software Engineering — Graduated with distinction.',
        iconType: 'GraduationCap',
      },
    ];
    const edu = eduRaw.map((e) => ({
      id: createCuid(),
      degree: e.degree,
      institution: e.institution,
      period: e.period,
      description: e.description,
      iconType: e.iconType ?? 'GraduationCap',
      createdAt: toDate(e.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('education').deleteMany({});
    await db.collection('education').insertMany(edu);
    console.log('🎓 education — inserted', edu.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 5) CERTIFICATES
    // ─────────────────────────────────────────────────────────────────────
    const certsRaw = fallback?.certificates ?? [];
    const certs = certsRaw.map((c) => ({
      id: createCuid(),
      title: c.title,
      issuer: c.issuer,
      date: c.date,
      link: c.link ?? null,
      createdAt: toDate(c.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('certificates').deleteMany({});
    if (certs.length) await db.collection('certificates').insertMany(certs);
    console.log('🏆 certificates — inserted', certs.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 6) LANGUAGES
    // ─────────────────────────────────────────────────────────────────────
    const langsRaw = fallback?.languages ?? [
      { name: 'English', proficiency: 'Professional' },
      { name: 'Urdu', proficiency: 'Native' },
      { name: 'Punjabi', proficiency: 'Native' },
    ];
    const langs = langsRaw.map((l) => ({
      id: createCuid(),
      name: l.name,
      proficiency: l.proficiency,
      createdAt: toDate(l.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('languages').deleteMany({});
    await db.collection('languages').insertMany(langs);
    console.log('🗣️ languages — inserted', langs.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 7) INTERESTS
    // ─────────────────────────────────────────────────────────────────────
    const interestsRaw = fallback?.interests ?? [
      { name: 'Open Source' },
      { name: '3D Web' },
      { name: 'AI & Automation' },
      { name: 'Photography' },
    ];
    const ints = interestsRaw.map((i) => ({
      id: createCuid(),
      name: i.name,
      createdAt: toDate(i.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('interests').deleteMany({});
    await db.collection('interests').insertMany(ints);
    console.log('🎯 interests — inserted', ints.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 8) PROJECTS (with embedded gallery)
    // ─────────────────────────────────────────────────────────────────────
    const projectsRaw = fallback?.projects ?? [];
    const pidMap = new Map();
    const projects = projectsRaw.map((p) => {
      const id = p.id && p.id !== 'fallback-project' ? p.id : createCuid();
      pidMap.set(p.id, id);
      const galleryRaw = p.gallery ?? [];
      const gallery = galleryRaw.map((g) => ({
        id: g.id || createCuid(),
        url: g.url,
        type: g.type ?? 'image',
        projectId: id,
        createdAt: now,
        updatedAt: now,
      }));
      return {
        id,
        title: p.title,
        description: p.description,
        longDescription: p.longDescription ?? null,
        features: Array.isArray(p.features) ? p.features.join(',') : String(p.features ?? ''),
        challenges: Array.isArray(p.challenges) ? p.challenges.join(',') : String(p.challenges ?? ''),
        techStack: Array.isArray(p.techStack) ? p.techStack.join(',') : String(p.techStack ?? ''),
        image: p.image,
        mediaType: p.mediaType ?? null,
        category: p.category ?? 'Web',
        link: p.link ?? null,
        liveUrl: p.liveUrl ?? null,
        githubUrl: p.githubUrl ?? null,
        showInCv: Boolean(p.showInCv),
        gallery,
        createdAt: toDate(p.createdAt ?? now),
        updatedAt: now,
      };
    });
    await db.collection('projects').deleteMany({});
    if (projects.length) await db.collection('projects').insertMany(projects);
    console.log('🚀 projects — inserted', projects.length, 'documents (gallery embedded)');

    // ─────────────────────────────────────────────────────────────────────
    // 9) SERVICES (with embedded servicedetail)
    // ─────────────────────────────────────────────────────────────────────
    const servicesRaw = fallback?.services ?? [];
    const services = servicesRaw.map((s) => {
      const id = createCuid();
      const details = (s.details ?? []).map((d) => ({
        id: createCuid(),
        name: d.name,
        iconUrl: d.iconUrl,
        serviceId: id,
        createdAt: now,
        updatedAt: now,
      }));
      return {
        id,
        title: s.title,
        iconType: s.iconType ?? 'Code',
        description: s.description ?? '',
        servicedetail: details,
        createdAt: toDate(s.createdAt ?? now),
        updatedAt: now,
      };
    });
    await db.collection('services').deleteMany({});
    if (services.length) await db.collection('services').insertMany(services);
    console.log('🛠️ services — inserted', services.length, 'documents (details embedded)');

    // ─────────────────────────────────────────────────────────────────────
    // 10) TEAM
    // ─────────────────────────────────────────────────────────────────────
    const teamRaw = fallback?.team ?? [];
    const team = teamRaw.map((m) => ({
      id: createCuid(),
      name: m.name,
      role: m.role,
      image: m.image,
      linkedin: m.linkedin ?? null,
      github: m.github ?? null,
      createdAt: toDate(m.createdAt ?? now),
      updatedAt: now,
    }));
    await db.collection('team').deleteMany({});
    if (team.length) await db.collection('team').insertMany(team);
    console.log('👥 team — inserted', team.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 11) TESTIMONIALS (only approved ones as seed)
    // ─────────────────────────────────────────────────────────────────────
    const testRaw = (fallback?.testimonials ?? []).map((t) => {
      const pid = t.projectId ? pidMap.get(t.projectId) ?? t.projectId : null;
      return {
        id: createCuid(),
        name: t.name,
        email: t.email ?? null,
        role: t.role,
        image: t.image ?? null,
        review: t.review,
        stars: t.stars ?? 5,
        status: t.status ?? 'approved',
        isVerified: Boolean(t.isVerified),
        projectId: pid,
        createdAt: toDate(t.createdAt ?? now),
        updatedAt: now,
      };
    });
    await db.collection('testimonials').deleteMany({});
    if (testRaw.length) await db.collection('testimonials').insertMany(testRaw);
    console.log('⭐ testimonials — inserted', testRaw.length, 'documents');

    // ─────────────────────────────────────────────────────────────────────
    // 12) SETTINGS (single document)
    // ─────────────────────────────────────────────────────────────────────
    const s = fallback?.settings ?? {};
    const settingsDoc = {
      id: createCuid(),
      showTeam: typeof s.showTeam === 'boolean' ? s.showTeam : false,
      available: typeof s.available === 'boolean' ? s.available : true,
      cvShowCertificates: typeof s.cvShowCertificates === 'boolean' ? s.cvShowCertificates : true,
      cvShowLanguages: typeof s.cvShowLanguages === 'boolean' ? s.cvShowLanguages : true,
      cvShowInterests: typeof s.cvShowInterests === 'boolean' ? s.cvShowInterests : true,
      cvShowDeclaration: typeof s.cvShowDeclaration === 'boolean' ? s.cvShowDeclaration : true,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('settings').deleteMany({});
    await db.collection('settings').insertOne(settingsDoc);
    console.log('⚙️ settings — inserted 1 document');

    // ─────────────────────────────────────────────────────────────────────
    // INDEXES (performance + constraints)
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n📈 Creating indexes...');

    await db.collection('skills').createIndex({ name: 1 }, { unique: true, name: 'skills_name_unique' });
    console.log('  ✅ skills.name — UNIQUE index');
    await db.collection('skills').createIndex({ category: 1 }, { name: 'skills_category_idx' });
    console.log('  ✅ skills.category — index');

    await db.collection('projects').createIndex({ category: 1 }, { name: 'projects_category_idx' });
    console.log('  ✅ projects.category — index');

    await db.collection('testimonials').createIndex({ status: 1 }, { name: 'testimonials_status_idx' });
    console.log('  ✅ testimonials.status — index');
    await db.collection('testimonials').createIndex({ projectId: 1 }, { name: 'testimonials_projectId_idx' });
    console.log('  ✅ testimonials.projectId — index');
    await db.collection('testimonials').createIndex({ createdAt: -1 }, { name: 'testimonials_createdAt_desc_idx' });
    console.log('  ✅ testimonials.createdAt (DESC) — index');

    // id fields — lookup index (we use custom `id` string, not ObjectId _id)
    for (const col of [
      'profile',
      'skills',
      'experience',
      'education',
      'certificates',
      'languages',
      'interests',
      'projects',
      'services',
      'testimonials',
      'team',
      'settings',
    ]) {
      try {
        await db.collection(col).createIndex({ id: 1 }, { unique: true, name: `${col}_id_unique` });
      } catch {
        // ignore — already exists
      }
    }
    console.log('  ✅ id field UNIQUE indexes created for ALL collections');

    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('   Default portfolio data inserted + indexes optimized.');
    console.log('   Run `npm run dev` to start your app.');
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error('\n❌ SEED FAILED:');
  console.error(e);
  process.exit(1);
});
