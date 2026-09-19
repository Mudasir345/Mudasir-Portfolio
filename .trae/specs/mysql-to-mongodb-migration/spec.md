# Portfolio Project — MySQL → MongoDB Atlas Complete Migration

## Overview
- **Summary**: Portfolio project ke database layer ko puri tarah MySQL (Prisma ORM) se MongoDB Atlas Free Tier par migrate karna. Har component, server action, aur script ko verify karna ke woh sirf MongoDB hi use kar raha hai, koi leftover ya broken dependency nahi bachi ho. Seed script fix + DB connection test + CRUD flow verification sab include.
- **Purpose**: Vercel free tier par MySQL ka free reliable option nahi hota (Aiven free tier limits hotay hain), MongoDB Atlas M0 cluster 512MB storage free deta hai — is se long-term production deployment stable rahega. Embedded documents pattern (project.gallery, service.servicedetail) se joins ki zaroorat nahi padti — performance bhi better.
- **Target Users**: Mudassir Choudhry (site owner / admin panel user) + portfolio visitors (public pages).

## Goals
- [ ] Production code mein koi bhi `@prisma/client` ya direct MySQL reference nahi bachna chahiye
- [ ] Sab server actions (CRUD) `lib/db.ts` ke MongoDB proxy ke zariye hi chalain
- [ ] `npm run seed` command properly chal kar MongoDB Atlas mein default data + indexes create kare
- [ ] Home page ISR, admin dashboard force-dynamic — sab public/private flows 100% working
- [ ] Contact form, testimonial submit, Cloudinary upload sab production-ready
- [ ] Environment vars properly configure (MySQL DATABASE_URL ko disable/comment, MongoDB URI active)
- [ ] TypeScript build (`npx tsc --noEmit`) + Next.js build (`npm run build`) dono zero errors pe pass karein

## Non-Goals
- [ ] Old MySQL database se actual production data ka ETL transfer nahi (agar later zaroorat ho to separate task banaiga; ab default seed data hi use hoga)
- [ ] Prisma package ko `package.json` se force-uninstall nahi kar rahe (sirf unused reference clean karenge; agar dev ne abhi bhi rakha hai to koi issue nahi)
- [ ] New feature add nahi karna — sirf migration + stability

## Background & Context
Codebase audit key findings:
1. `src/` ka poora production code ALREADY MongoDB use kar raha hai. `lib/db.ts` mein native MongoDB driver + Prisma-style proxy hai.
2. Leftovers sirf 3 jagah hain:
   - `prisma/seed.js` → Old MySQL seed script (PrismaClient use karta hai), useless
   - `scripts/apply-cloudinary-to-db.mjs` → Old MySQL migration script (PrismaClient), useless
   - `.env` line #4 `DATABASE_URL=mysql://...` → abhi bhi active hai, confusion deta hai
3. `scripts/mongo-seed.js` L10 mein `require('dotenv-flow')` likha hai — lekin `package.json` mein sirf `dotenv` installed hai, `dotenv-flow` nahi → seed command fail hoga.
4. `scripts/mongo-seed.js` L38 → `import('./import-fallback.mjs')` ko import kar raha hai; is script ko verify karna hai ke woh exist karta hai.
5. Admin auth, testimonials moderation, Cloudinary upload — sab flows already MongoDB proxy ko target karte hain, sirf verify karna hai.

## Functional Requirements

**FR-1: Production code zero Prisma / zero MySQL references**
- `src/**/*.{ts,tsx}`, `src/actions/**`, `src/lib/**`, `src/components/**`, `src/app/**` mein kahin bhi `@prisma/client` ya `PrismaClient` ya `prisma.` ya `mysql://` literal nahi hona chahiye.

**FR-2: Seed script reliably works**
- `npm run seed` chal kar:
  a. MongoDB Atlas se connect ho jaye
  b. Saari 12 collections drop + repopulate karein (profile, skills, experience, education, certificates, languages, interests, projects, services, team, testimonials, settings)
  c. Indexes create karein: `skills.name` UNIQUE, `skills.category`, `projects.category`, `testimonials.status`, `testimonials.projectId`, `testimonials.createdAt DESC`, aur har collection ke `id` field pe UNIQUE index.
  d. Console pe "SEED COMPLETED SUCCESSFULLY!" ka message print ho.

**FR-3: Server actions CRUD full integration**
- Sab GET actions: `getPortfolioData`, `getProfile`, `getProjects`, `getServices`, `getSkills`, `getExperience`, `getEducation`, `getCertificates`, `getLanguages`, `getInterests`, `getTeam`, `getTestimonials`, `getApprovedTestimonials`, `getPendingTestimonials`, `getTestimonialCounts`, `getSettings` → sab empty DB mein bhi fallback ke saath safe chalain (crash nahi).
- Sab WRITE actions: `updateProfile`, `updateSkillList`, `saveExperience/Delete`, `saveEducation/Delete`, `saveCertificate/Delete`, `saveLanguage/Delete`, `saveInterest/Delete`, `addProject/Update/Delete`, `addService/Update/Delete`, `addTeamMember/Update/DeleteTeamMember`, `saveTestimonial/DeleteTestimonial`, `approveTestimonial`, `rejectTestimonial`, `markTestimonialSpam`, `updateTestimonialStatus`, `updateSettings`, `submitTestimonial` → sab `requireAdmin()` guard + `revalidatePath("/")` + `revalidatePath("/admin/dashboard")` ke saath execute karein.

**FR-4: Public-facing pages work with seeded/fallback data**
- Home page `/` load kare, 14 sections render karein (Hero → Footer), koi React runtime error na ho.
- `/privacy` aur `/terms` pages render karein.
- `/admin` pe login page aaye, `/admin/dashboard` tab-switch, search, filter, CRUD modal sab UI level pe load karein.
- Testimonial public submit hone ke baad status PENDING ho, admin side pe counts update ho.

**FR-5: Upload pipeline is end-to-end connected**
- `uploadFile()` action Cloudinary pe upload karein (projects/profile/misc/team folders), DB mein optimized URL save ho.
- `deleteFile()` Cloudinary se bhi asset remove karein.
- `optimizeAllMediaInObject()` har DB object pe chal ke URLs ko optimized transforms ke saath return karein.

## Non-Functional Requirements

**NFR-1: Zero type errors**
- `npx tsc --noEmit` exit code 0 pe complete kare.

**NFR-2: Zero build errors**
- `npm run build` (next build --webpack) exit code 0 pe complete kare.

**NFR-3: Database connection resilience**
- Agar MongoDB connect nahi hota to: Home page fallback data se render ho (crash na ho), Admin panel pe actions proper `console.error` + user-friendly error return karein.

**NFR-4: No console.log spam in production**
- Production env mein sirf warn/error log, dev mein verbose allowed.

**NFR-5: Runtime safety**
- Koi bhi action `undefined.map()` ya null-property-access error na de; profile null hone pe setup screen dikhe.

## Constraints
- **Technical**: Node.js >=18.17, MongoDB Atlas M0 free tier (512MB max), Cloudinary free tier, Vercel free tier ISR + force-dynamic rules.
- **Business**: Existing portfolio features / UI ko break nahi karna; sirf DB layer change + cleanup.
- **Dependencies**: `mongodb` driver already installed; @prisma/client ko uninstall karne ki zaroorat nahi (agar present ho to), but us ke references ko hata dena.
- **Env vars**: `MONGODB_URI` already .env mein set hai (user ne di hui); is ko hi use karna.

## Assumptions
1. User ke paas existing MySQL production data nahi hai jo transfer karna ho — seed script ka default + fallback data initial load ke liye sufficient hai. (Agar baad mein zaroorat ho to manual ETL script banaiga.)
2. `MONGODB_URI` .env mein given correct hai, Atlas cluster IP whitelist mein 0.0.0.0/0 ya user ke IP allow hai.
3. Cloudinary env vars already set hain (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) — upload test un ke saath chalega.
4. Admin password .env mein ADMIN_PASSWORD ke zariye set hai; test ke liye hum dummy auth flow verify kar sakte hain.

## Acceptance Criteria

### AC-1: Production source mein koi Prisma/MySQL reference nahi
- **Type**: `rule`
- **Given**: `src/` folder, package.json dependencies (production bundle)
- **When**: `rg -i "@prisma/client|prisma\.|mysql://" src/ package.json` grep chalain
- **Then**: 0 matches aayein (sirf comments / seed scripts mein agar bach jayein woh acceptable nahi — seed ko bhi MongoDB banaya hai already is liye seed mein bhi Prisma nahi chahiye)
- **Pass Condition**: grep src/ aur package.json par zero matches. Scripts/ aur prisma/ ke old files ko hum delete/rename karenge taaki woh bundle ka hissa na banein.
- **Evidence**: Grep command output.

### AC-2: `npm run seed` successful
- **Type**: `rule`
- **Given**: .env mein MONGODB_URI set hai, internet hai
- **When**: `npm run seed` terminal mein chalain
- **Then**: Exit code 0 + last line `🎉 SEED COMPLETED SUCCESSFULLY!` print ho
- **Pass Condition**: Exit code 0 AND success string console output mein present ho
- **Evidence**: Terminal capture (stdout+stderr)

### AC-3: 12 Collections + Indexes MongoDB mein create hue
- **Type**: `rule`
- **Given**: Seed success ke baad
- **When**: MongoDB shell ya Atlas UI se collections list karein + indexes check karein
- **Then**: profile, skills, experience, education, certificates, languages, interests, projects, services, team, testimonials, settings — 12 collections hon. Indexes: skills.name UNIQUE present, testimonials.status present, har collection mein `id` UNIQUE present.
- **Pass Condition**: Saare collections + key indexes exist karein
- **Evidence**: ListCollections + ListIndexes command output

### AC-4: Home page renders with ISR + all sections
- **Type**: `rule`
- **Given**: Dev server running (`npm run dev`)
- **When**: Browser mein `/` open karein, scroll end tak karein
- **Then**: 14 sections (Hero, About, Skills, Services, Process, Experience, Education, Certifications, Projects, [conditionally Team], Testimonials, HireMe, Contact, Footer) render hote hain, koi red error overlay nahi. Next.js terminal mein 500 error nahi.
- **Pass Condition**: No runtime errors; all sections visible
- **Evidence**: Browser screenshot + server terminal output last 50 lines

### AC-5: Admin dashboard login → full CRUD smoke test
- **Type**: `rule`
- **Given**: Dev server on, admin password ADMIN_PASSWORD set
- **When**: /admin → login → dashboard → projects tab → Add New → fill form → save → verify project list mein entry → delete → verify gone. Same Skills, Experience, Education, Testimonials moderation (approve pending).
- **Then**: Har CRUD operation success return karein, list refresh ho jaye, koi throw na ho. revalidatePath ke baad home page pe bhi update reflect kare (ISR background revalidation).
- **Pass Condition**: Add→Edit→Delete round trip pass
- **Evidence**: Screenshots + server logs

### AC-6: Testimonial public submit → pending queue flow
- **Type**: `rule`
- **Given**: /contact pe testimonial form visible
- **When**: Valid data (name, email, role, review ≥10 chars, 5 stars) submit karein, honeypot empty rakhain
- **Then**: Success message aaye + admin dashboard testimonials tab pending count +=1 ho, new entry pending status mein dikhe
- **Pass Condition**: Pending count increases + entry shows in list
- **Evidence**: Screenshot + getPendingTestimonials server output

### AC-7: TypeScript strict pass
- **Type**: `rule`
- **Given**: Source files
- **When**: `npx tsc --noEmit`
- **Then**: Exit 0, no errors
- **Pass Condition**: Exit code 0
- **Evidence**: Terminal capture

### AC-8: Next.js production build pass
- **Type**: `rule`
- **Given**: Clean state
- **When**: `npm run build`
- **Then**: Exit 0, no chunk errors, no failed builds
- **Pass Condition**: Exit code 0 + Build successful output
- **Evidence**: Terminal capture (full build log tail)

### AC-9: Environment file cleanup
- **Type**: `rule`
- **Given**: .env file
- **When**: .env file read karein
- **Then**: DATABASE_URL=mysql://... line commented ya removed ho; MONGODB_URI active, properly formatted (no duplicate malformed lines)
- **Pass Condition**: No active MySQL DATABASE_URL; only MongoDB URI active for database
- **Evidence**: Snippet of first 50 lines of .env after cleanup

### AC-10: Graceful fallback when MongoDB unreachable
- **Type**: `rubric`
- **Dimension**: Resilience when DB down
- **Scale**: 1-5
- **Anchors**: 1 = home crash (500); 3 = home loads but partial sections crash; 5 = home fully loads from fallbackData, console has clear error, no user-facing exception
- **Pass Threshold**: >= 4
- **Evidence**: Temporarily MONGODB_URI ko galat kar ke dev server chalain, / load karein, result document karain

## Open Questions
- [ ] (Auto-resolve) Kya old prisma/ aur scripts/apply-cloudinary-to-db.mjs ko permanently delete kar dein? — Haan, user ne "khud sy kar dain sab kuch" kaha + woh useless broken files hain, confusion dete hain. Backup folder ya rename nahi — delete.
- [ ] (Auto-resolve) `@prisma/client` uninstall kar dein package.json se? — Haan, agar installed hai to uninstall; production bundle ka size bachayega.
