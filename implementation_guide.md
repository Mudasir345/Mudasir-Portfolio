# Implementation Guide — Trust & Metadata Fixes

## Objective
This guide covers the three credibility-critical fixes that must be implemented safely and in order:
1. Remove fake/generic testimonials and keep only real, verified review content.
2. Replace the current AI-style profile image reference with a clean production image path.
3. Fix OG metadata and canonical URL handling so social previews and SEO are correct.

## Scope
This guide is intentionally limited to the current trust and SEO layer of the project.
It does not introduce unrelated redesign work.

---

## Current Verified Code Paths

### 1) Testimonials data source
- [src/data/data.json](src/data/data.json)
- [src/components/sections/Testimonials.tsx](src/components/sections/Testimonials.tsx)
- [src/components/admin/TestimonialForm.tsx](src/components/admin/TestimonialForm.tsx)
- [src/actions/admin.ts](src/actions/admin.ts)

### 2) Profile image usage
- [src/data/data.json](src/data/data.json)
- [src/components/sections/Hero.tsx](src/components/sections/Hero.tsx)
- [public/uploads/profile](public/uploads/profile)

### 3) Metadata / canonical / OG
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/app/sitemap.ts](src/app/sitemap.ts)
- [src/app/robots.ts](src/app/robots.ts)

---

## Safety Rules
Before making any change, follow these rules:
- Do not fabricate testimonials, company names, or client quotes.
- Do not leave placeholder content in production.
- Keep the same production domain everywhere in metadata.
- Preserve existing functionality while changing only the trust/SEO layer.
- Verify the project still builds after each phase.

---

## Phase 1 — Baseline Verification

### Goal
Confirm the current app state before touching trust or metadata.

### Steps
1. Run the build:
   - `npm run build`
2. Confirm the current testimonial data path and profile image path in the JSON source.
3. Confirm the current metadata source in [src/app/layout.tsx](src/app/layout.tsx).
4. Record the current domain values used in metadata and sitemap.

### Exit criteria
- Build succeeds.
- Current references are clearly identified.
- No hidden dependency is left unexplained.

---

## Phase 2 — Remove Fake Testimonials

### Goal
Remove placeholder credibility-killers from the public homepage.

### Steps
1. Open [src/data/data.json](src/data/data.json).
2. Remove the current generic testimonial entries.
3. Keep the testimonials section safe:
   - If real reviews exist, render them.
   - If no real reviews exist yet, hide the section or show a clean neutral empty-state.
4. Update the admin review form in [src/components/admin/TestimonialForm.tsx](src/components/admin/TestimonialForm.tsx) so future entries are entered in a clean, professional format.
5. Ensure the section in [src/components/sections/Testimonials.tsx](src/components/sections/Testimonials.tsx) does not render fake names or unverified text.

### Important rule
Do not replace fake testimonials with more fake content.
Only real verified reviews should appear.

### Exit criteria
- No placeholder client names remain on the site.
- The testimonial section is either real or safely hidden.

---

## Phase 3 — Profile Image Cleanup

### Goal
Replace random/generated profile image naming with a clean production image path.

### Steps
1. Locate the current profile image reference in [src/data/data.json](src/data/data.json).
2. Rename the image file under [public/uploads/profile](public/uploads/profile) to a simple stable asset name such as:
   - `mudasir-profile.jpg`
   - or `mudasir-profile.webp`
3. Update the JSON image path to match the renamed file.
4. Verify the hero image in [src/components/sections/Hero.tsx](src/components/sections/Hero.tsx) still loads correctly.
5. Keep the fallback path intact in case the real image is missing.

### Important rule
Avoid random auto-generated filenames in production content.
Use one consistent, clean file name.

### Exit criteria
- The profile image renders correctly.
- The image path is stable and production-safe.

---

## Phase 4 — Fix Metadata and Canonical URL

### Goal
Ensure OG metadata, canonical URL, and site domain are all aligned.

### Steps
1. Open [src/app/layout.tsx](src/app/layout.tsx).
2. Confirm `metadataBase` uses the real deployed URL from `NEXT_PUBLIC_SITE_URL`.
3. Update `openGraph.url` to the real production domain.
4. Ensure `alternates.canonical` matches the same domain.
5. Confirm `twitter` metadata uses the same domain.
6. Review [src/app/sitemap.ts](src/app/sitemap.ts) and [src/app/robots.ts](src/app/robots.ts) to ensure they are also using the same site URL.

### Important rule
All metadata must point to one verified production domain.
No placeholder or mismatched URL is allowed.

### Exit criteria
- OG URL and canonical URL are consistent.
- The site uses one verified production domain across metadata and SEO files.

---

## Phase 5 — Validation and Regression Check

### Goal
Confirm that the fix is safe and production-ready.

### Validation checklist
1. Run:
   - `npm run build`
2. Run lint if available:
   - `npm run lint`
3. Open the homepage and confirm:
   - no fake testimonials appear
   - profile image loads correctly
   - metadata values are correct in the page source / browser preview
4. Confirm that the project still renders without runtime errors.

### Final acceptance criteria
The implementation is complete only when:
- fake/generic testimonials are removed
- profile image path is clean and stable
- metadata and canonical URL are correct
- project still builds successfully
- no new UI or runtime issue was introduced

---

## Recommended Execution Order
1. Baseline verification
2. Remove fake testimonials
3. Rename profile image and update its path
4. Fix OG/canonical metadata
5. Validate with build and preview

This order keeps the trust and SEO fixes stable, safe, and easy to verify.
