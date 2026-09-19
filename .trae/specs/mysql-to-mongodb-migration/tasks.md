# Portfolio Project — MySQL → MongoDB Migration Implementation Tasks

## Task 1: Environment file cleanup — disable MySQL DATABASE_URL, fix duplicate malformed lines
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - .env mein line #4 DATABASE_URL=mysql://root:@127.0.0.1:3306/portfolio_db ko comment kar do ya remove
  - Last line (L46) mein jo bare MONGODB_URI duplicate malformed hai (mongodb+srv://.../?appName=Portfolio bina variable name ke) us ko remove kar do
  - MONGODB_URI variable ko properly ensure karo ke us ki value cluster ke saath sahi hai
  - .env.local.example aur .env.production.example bhi update karo agar un mein MySQL reference ho to un mein bhi MONGODB_URI ko primary banao
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-1.1: .env file read karo, uncommented `DATABASE_URL=` line na ho; sirf MONGODB_URI active ho. Visual inspection.
- **Notes**: Sensitive env vars ko kabhi git mein commit mat karna — .gitignore already check karo.

## Task 2: Unused Prisma/MySQL old scripts delete kar do + package cleanup
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Delete: `prisma/seed.js` (old MySQL seed, broken — requires @prisma/client which may not be installed)
  - Delete: `scripts/apply-cloudinary-to-db.mjs` (old MySQL → Cloudinary migration, PrismaClient require)
  - Package.json check karo: agar `@prisma/client` ya `prisma` devDependencies / dependencies mein list hai → `npm uninstall @prisma/client prisma` chala ke remove kar do
  - Grep se confirm karo ke ab `rg @prisma/client` project mein sirf deleted ke ilawa aur na mile
- **Acceptance Criteria Addressed**: AC-1 (partial)
- **Test Requirements**:
  - `rule` TR-2.1: `rg -n "@prisma|PrismaClient" src/ package.json prisma/ scripts/ (after delete)` → 0 matches (chhor kar agar koi comment type mein ho to acceptable nahi, zero)
  - `rule` TR-2.2: `ls prisma/seed.js scripts/apply-cloudinary-to-db.mjs` → files na hon
- **Notes**: Migration SQL aur mapping files (cloudinary-migration-map.json etc) prisma folder mein reh sakti hain — woh data reference hai, executable nahi.

## Task 3: mongo-seed.js fix — dotenv-flow → dotenv + import-fallback.mjs verify/fix
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - `scripts/mongo-seed.js` L10: `require('dotenv-flow')` → badal do `require('dotenv').config()` → kyun ke package.json mein dotenv installed hai, dotenv-flow nahi.
  - `scripts/mongo-seed.js` L38: `import('./import-fallback.mjs')` — is file ko read karo ke woh exist karta hai ya nahi. Agar exist karta hai to theek, agar nahi to create karo jo `getFallbackPortfolioData` ko `src/lib/fallbackData.ts` se import kare.
  - Alternative: since import-fallback ka kaam sirf fallbackData.ts load karna hai — agar ts-node/tsx available nahi to seed script mein hardcoded minimal defaults hi use ho (jo already fallback? block mein diye hue hain). Lekin agar hum import-fallback.mjs banayein to proper data aaye.
  - Seed script L160-274 projects/services → ensure embedded gallery aur servicedetail arrays sahi shape mein create ho rahe hain (id, projectId/serviceId, url etc fields properly fill ho).
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-3.1: `node scripts/mongo-seed.js` se pehle sirf syntax check via `node --check scripts/mongo-seed.js` → exit 0
  - `rule` TR-3.2: import-fallback.mjs exist karein ya seed built-in defaults se run ho jaye (don't crash on missing ts module)

## Task 4: Seed script end-to-end run + verify collections + indexes
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 1
- **Description**:
  - Terminal mein `npm run seed` run karo
  - Success hone ke baad, mongosh ya direct script se collections count karo: profile 1 doc, skills multiple, settings 1, etc.
  - Index list verify: skills.name unique, testimonials.status, testimonials.projectId, testimonials.createdAt DESC, har col `id` UNIQUE
  - Agar kisi wajah se seed fail ho jaye to error debug + fix + re-run
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-4.1: `npm run seed` exit code 0 aur stdout mein `🎉 SEED COMPLETED SUCCESSFULLY!` string present ho
  - `rule` TR-4.2: Seed ke baad `profile` collection count 1 ho, `settings` count 1 ho, `skills` ≥ 6 ho, `projects` ≥ 2 ho, `services` ≥ 2 ho
  - `rule` TR-4.3: Har collection mein `id` UNIQUE index mojood ho (12 collections → 12 indexes)

## Task 5: lib/db.ts proxy edge-case fixes (agar koi bug hai to) + null safety verify
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - `lib/db.ts` ke proxy buildDbProxy ko read kar ke check karo:
    a. `findMany({ orderBy: { createdAt: "desc" } })` → MongoDB `.sort({ createdAt: -1 })` correctly translate hota hai? "desc" ko -1, "asc" ko +1. (Currently L300 sort as any pass — ensure mapping works)
    b. `create()` mein embedded gallery → createdAt, updatedAt, id, projectId auto-fill ho rahe hain verify karo
    c. `update()` mein agar gallery ya servicedetail replace ho to ids preserve ho (agar old items hain to un ki id retain ho, naye items ke auto-create)
  - Agar koi missing edge case milay to fix karo
  - getPortfolioData() actions/admin.ts line 671-688 mein Promise.all + null guard verify karo
- **Acceptance Criteria Addressed**: AC-3 (partial), FR-3
- **Test Requirements**:
  - `rule` TR-5.1: `findMany({ orderBy: { createdAt: "desc" } })`  descending order mein array return kare (reverse chronological)
  - `rule` TR-5.2: project create karte waqt gallery ke har item mein id, projectId, createdAt/updatedAt fields mojood hon (DB mein doc inspect karo)
  - `rubric` TR-5.3: DB proxy null-safety quality; scale 1-5, anchors 1=crash on empty args, 3=partial guards, 5=every method invalid args pe graceful returns. Threshold >=4.

## Task 6: actions/admin.ts CRUD write actions sab mein `requireAdmin()` guard + revalidatePath verify (review + missing fill)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - Har write action (add*/update*/delete*/save*/approve*/reject*/mark*/submit*) ko scan karo:
    - `requireAdmin()` call honi chahiye (EXCEPT submitTestimonial — public hai)
    - Har success path ke baad `revalidatePath("/")` + `revalidatePath("/admin/dashboard")` honi chahiye
  - Agar koi action missing hai dono mein se to add karo
  - updateSkillList (L238-252): bulk deleteMany + createMany → agar empty array skills bheji jaye to crash na ho (already fine hai probably but confirm)
  - submitTestimonial (L362-437): honeypot + placeholder detection + length limits verify. Success pe revalidatePath("/admin/dashboard") already hai L422 — OK; / public page pe pending testimonial nahi dikhta is liye revalidatePath("/") ki zaroorat nahi — correct behavior.
- **Acceptance Criteria Addressed**: FR-3, AC-5
- **Test Requirements**:
  - `rule` TR-6.1: Sab write actions mein (submitTestimonial ke siwa) pehla statement `await requireAdmin()` ho ya shuruat mein 3 lines ke andar call ho
  - `rule` TR-6.2: Sab write actions ke end pe `revalidatePath("/")` + `revalidatePath("/admin/dashboard")` dono maujood hon (chhor kar submitTestimonial → sirf admin revalidate chahiye)

## Task 7: Dev server start — Home page ISR + sections render test
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4, Task 6
- **Description**:
  - `npm run dev` chalao
  - Browser ya curl se `GET /` hit karo, check: 200 OK, HTML mein sections ke heading strings (About, Skills, Services, Projects, Experience, Education, Contact etc) present hain
  - Server logs mein koi 500 error nahi. ISR active hai (revalidate = 3600 → page.tsx L21 — already set)
  - Agar koi component crash ho (e.g. gallery undefined) to fix karo — profile null guard page.tsx L42-54 already hai
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-7.1: GET / → status 200, response body mein "Mudasir Choudhry" string present ho
  - `rule` TR-7.2: Sections ke minimum presence: "About", "Skills", "Services", "Projects", "Experience", "Education", "Contact" — sab response mein hon
  - `rule` TR-7.3: Terminal dev server logs mein 500 level error na ho (last 50 lines)

## Task 8: Admin auth flow + dashboard full smoke test (login → add project → list → delete)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 7
- **Description**:
  - GET `/admin` — login page render ho, form visible ho
  - POST authenticate action run karo sahi password se → session cookie set ho
  - GET `/admin/dashboard` — redirect na ho, load ho, sidebar tabs 12 hon (profile, skills, ...cv-settings)
  - Projects tab: Add New → form fill (title, description, category Web, image placeholder, techStack comma separated), save → getProjects mein naya project aa jaye → then delete → confirm delete ho jaye
  - Skills tab: ek naya skill add karo (category Test, name MongoDBTest, proficiency Expert), save → skills list mein aa jaye
  - Testimonials moderation: agar pending count hai to Approve → status approved ho
- **Acceptance Criteria Addressed**: AC-5, FR-3
- **Test Requirements**:
  - `rule` TR-8.1: `/admin/dashboard` GET 200 OK, authenticated state mein aaye (no redirect)
  - `rule` TR-8.2: Add project → delete project round trip: list mein count +1 then -1 ho
  - `rule` TR-8.3: Skill add → getSkills array mein new skill name mojood ho

## Task 9: Testimonial public submit flow end-to-end
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 7
- **Description**:
  - Contact page ya Testimonials section pe public submit form fill karo:
    name: "Test User", email: "test@example.com", role: "Client", review: "Amazing work delivered on time, highly recommended.", stars: 5, website honeypot: EMPTY (mat bharo)
  - Success message verify
  - Admin testimonials pending count +1, naya entry pending status mein dikhe
  - Anti-spam test: honeypot "website" field mein "spam.com" bhejo → silently success (but DB mein insert na ho ya pending mein add hi na ho — seed script ke code mein honeypot check L362 submitTestimonial L365-369)
  - Placeholder test: review = "Great work would recommend to everyone" → reject with error message
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-9.1: Valid form submit (honeypot empty) → success response ok=true pending=true, DB mein testimonial count +=1 status=pending
  - `rule` TR-9.2: Honeypot filled → success response but DB count badhna nahi chahiye (silent drop)
  - `rule` TR-9.3: Placeholder review → ok=false, errors.review field present

## Task 10: Upload action smoke test (Cloudinary configured hai to actual upload, warna dry run verify)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8
- **Description**:
  - uploadFile action ko admin auth ke saath call karo: file=small dummy image, folder="misc"
  - Agar Cloudinary configure hai → actual upload, filePath optimized URL return, mediaType=image
  - Agar configure nahi hai → proper "Cloudinary is not configured" error aaye, crash na ho
  - deleteFile same URL pe call → asset deleted ya skipped message safe return
  - buildOptimizedUrl: ek simple cloudinary URL pass karo → transform segment injected (q_auto:eco, w_1600, f_avif etc) verify karo
- **Acceptance Criteria Addressed**: FR-5
- **Test Requirements**:
  - `rule` TR-10.1: uploadFile invalid/unauth → requireAdmin throws (call bina admin session ke)
  - `rule` TR-10.2: buildOptimizedUrl("https://res.cloudinary.com/as4hjbxb/image/upload/v1/portfolio/test.jpg","image") → output mein "q_auto:eco" aur "f_avif" present ho

## Task 11: Graceful MongoDB-down fallback test
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4, Task 7
- **Description**:
  - Temporarily .env mein MONGODB_URI ko galat kar do (e.g. append "-invalid" username mein)
  - `npm run dev` restart karo
  - GET / hit karo: page render ho chahiye, fallback data se, 500 nahi
  - Console mein error hone chahiye (console.error) lekin user-facing crash nahi
  - Sahi URI restore karo baad mein
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rubric` TR-11.1: Resilience score; scale 1-5; anchors 1=500 crash, 3=partial, 5=full fallback render + no runtime errors for user; threshold >=4
  - `rule` TR-11.2: GET / status 200 ho (na ke 5xx), even with broken URI

## Task 12: TypeScript strict type check + Next.js production build
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-11 (all prior tasks)
- **Description**:
  - `npx tsc --noEmit` chalao, agar koi errors aayein to fix karo one by one
  - `npm run build` (next build --webpack) chalao, build pass karo
  - Build warnings normal hain, errors nahi hone chahiye
  - ESLint agar auto run hota hai to us ko bhi pass karo (npm run lint)
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `rule` TR-12.1: `npx tsc --noEmit` → exit 0
  - `rule` TR-12.2: `npm run build` → exit 0, stdout mein "Route (app)" entries hon, no "Failed to compile"

## Task 13: Final grep audit — src/ + package.json mein zero Prisma/MySQL references
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 6
- **Description**:
  - Final pass: `rg -in "prisma|@prisma|mysql://" src/ package.json` (case-insensitive)
  - Koi match nahi chahiye. Agar koi docstring mein "MySQL" likha hua hai (e.g. "MySQL offline" comment) → use "database" replace kar do (admin.ts L670 comment)
  - Grep result zero honi chahiye
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-13.1: Grep command output mein 0 matches aayein (strict: no hits of the pattern in src or package.json)
