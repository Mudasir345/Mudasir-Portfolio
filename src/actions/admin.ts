"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { transformProfile, transformProject } from "@/lib/db";
import { getFallbackPortfolioData } from "@/lib/fallbackData";
import { clearAdminSession, createAdminSession, requireAdmin } from "@/lib/adminAuth";
import type {
    project as Project,
    service as Service,
    profile as Profile,
    skill as Skill,
    experience as Experience,
    education as Education,
    testimonial as Testimonial,
    teammember as TeamMember,
    certificate as Certificate,
    language as Language,
    interest as Interest,
    settings as Settings,
    servicedetail as ServiceDetail,
    gallery as Gallery,
} from "@prisma/client";

// --- Authentication ---
export async function authenticate(password: string) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password.length !== adminPassword.length) return false;

    const isValid = password === adminPassword;
    if (isValid) await createAdminSession();
    return isValid;
}

export async function logout() {
    await clearAdminSession();
}

// --- Projects ---
export async function getProjects() {
    const rows = await db.project.findMany({
        include: { gallery: true },
    });
    return rows.map(transformProject);
}

export async function addProject(project: import("@/lib/db").ProjectData) {
    await requireAdmin();
    const { gallery, ...projectData } = project;
    const createdProject = await db.project.create({
        data: {
            title: projectData.title,
            description: projectData.description,
            longDescription: projectData.longDescription ?? null,
            image: projectData.image,
            mediaType: projectData.mediaType ?? null,
            category: projectData.category,
            link: projectData.link ?? null,
            liveUrl: projectData.liveUrl ?? null,
            githubUrl: projectData.githubUrl ?? null,
            showInCv: projectData.showInCv ?? false,
            features: Array.isArray(projectData.features) ? projectData.features.join(',') : String(projectData.features ?? ''),
            challenges: Array.isArray(projectData.challenges) ? projectData.challenges.join(',') : String(projectData.challenges ?? ''),
            techStack: Array.isArray(projectData.techStack) ? projectData.techStack.join(',') : String(projectData.techStack ?? ''),
        } as any,
    });

    if (gallery && gallery.length > 0) {
        await db.gallery.createMany({
            data: gallery.map((item) => ({ url: item.url, type: item.type, projectId: createdProject.id })) as any,
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateProject(id: string, project: import("@/lib/db").ProjectData) {
    await requireAdmin();
    const { gallery, ...projectData } = project;

    await db.project.update({
        where: { id },
        data: {
            title: projectData.title,
            description: projectData.description,
            longDescription: projectData.longDescription ?? null,
            image: projectData.image,
            mediaType: projectData.mediaType ?? null,
            category: projectData.category,
            link: projectData.link ?? null,
            liveUrl: projectData.liveUrl ?? null,
            githubUrl: projectData.githubUrl ?? null,
            showInCv: projectData.showInCv ?? false,
            features: Array.isArray(projectData.features) ? projectData.features.join(',') : String(projectData.features ?? ''),
            challenges: Array.isArray(projectData.challenges) ? projectData.challenges.join(',') : String(projectData.challenges ?? ''),
            techStack: Array.isArray(projectData.techStack) ? projectData.techStack.join(',') : String(projectData.techStack ?? ''),
        } as any,
    });

    // Replace gallery images
    await db.gallery.deleteMany({ where: { projectId: id } });
    if (gallery && gallery.length > 0) {
        await db.gallery.createMany({
            data: gallery.map((item) => ({ url: item.url, type: item.type, projectId: id })) as any,
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteProject(id: string) {
    await requireAdmin();
    await db.project.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Services ---
export async function getServices() {
    const rows = await db.service.findMany({
        include: { servicedetail: true },
    });
    return rows.map((s) => ({
        ...s,
        details: s.servicedetail.map((d) => ({ name: d.name, iconUrl: d.iconUrl })),
    }));
}

export async function addService(service: import("@/lib/db").ServiceData) {
    await requireAdmin();
    const { details, ...serviceData } = service;
    const createdService = await db.service.create({
        data: {
            title: serviceData.title,
            iconType: serviceData.iconType,
            description: serviceData.description,
        } as any,
    });

    if (details && details.length > 0) {
        await db.servicedetail.createMany({
            data: details.map((item) => ({ name: item.name, iconUrl: item.iconUrl, serviceId: createdService.id })) as any,
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateService(id: string, service: import("@/lib/db").ServiceData) {
    await requireAdmin();
    const { details, ...serviceData } = service;
    await db.service.update({
        where: { id },
        data: {
            title: serviceData.title,
            iconType: serviceData.iconType,
            description: serviceData.description,
        } as any,
    });

    // Replace details
    await db.servicedetail.deleteMany({ where: { serviceId: id } });
    if (details && details.length > 0) {
        await db.servicedetail.createMany({
            data: details.map((item) => ({ name: item.name, iconUrl: item.iconUrl, serviceId: id })) as any,
        });
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteService(id: string) {
    await requireAdmin();
    await db.service.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Profile ---
export async function getProfile() {
    try {
        const raw = await db.profile.findFirst();
        if (!raw) return null;
        return transformProfile(raw);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

export async function updateProfile(data: import("@/lib/db").ProfileData) {
    await requireAdmin();
    const dbData = {
        name: data.name,
        image: data.image,
        bio: data.bio,
        aboutText: data.aboutText,
        declaration: data.declaration,
        email: data.email,
        github: data.github,
        linkedin: data.linkedin,
        whatsapp: data.whatsapp,
        roles: Array.isArray(data.roles) ? data.roles.join(',') : data.roles,
        experienceYears: data.stats?.experienceYears ?? '',
        projectsCompleted: data.stats?.projectsCompleted ?? '',
        satisfaction: data.stats?.satisfaction ?? '',
        availability: data.stats?.availability ?? '',
        updatedAt: new Date(),
    };

    const existingProfile = await db.profile.findFirst();
    if (existingProfile) {
        await db.profile.update({
            where: { id: existingProfile.id },
            data: dbData as any,
        });
    } else {
        await db.profile.create({ data: { ...dbData, createdAt: new Date() } as any });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Skills ---
export async function getSkills() {
    return await db.skill.findMany();
}

export async function updateSkillList(skills: Array<{ name: string; category: string; proficiency?: string | null }>) {
    await requireAdmin();
    // This is a bulk update. We clear all skills and add the new list.
    await db.skill.deleteMany({});
    await db.skill.createMany({
        data: skills.map((s) => ({
            name: s.name,
            category: s.category,
            proficiency: s.proficiency ?? null,
        })) as any,
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Experience ---
export async function getExperience() {
    return await db.experience.findMany();
}

export async function saveExperience(experience: Partial<Experience> & { title: string; company: string; period: string; description: string; iconType: string }) {
    await requireAdmin();
    const { id, ...data } = experience;
    if (id) {
        await db.experience.update({ where: { id }, data: data as any });
    } else {
        await db.experience.create({ data: data as any });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteExperience(id: string) {
    await requireAdmin();
    await db.experience.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Education ---
export async function getEducation() {
    return await db.education.findMany();
}

export async function saveEducation(education: Partial<Education> & { degree: string; institution: string; period: string; description: string; iconType: string }) {
    await requireAdmin();
    const { id, ...data } = education;
    if (id) {
        await db.education.update({ where: { id }, data: data as any });
    } else {
        await db.education.create({ data: data as any });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteEducation(id: string) {
    await requireAdmin();
    await db.education.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Testimonials ---
export async function getTestimonials() {
    await requireAdmin();
    return await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });
}

/** Sirf approved + 4+ star testimonials — public home page ke liye */
export async function getApprovedTestimonials() {
    return await db.testimonial.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
    });
}

/** Sirf pending testimonials — admin dashboard queue ke liye */
export async function getPendingTestimonials() {
    await requireAdmin();
    return await db.testimonial.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "asc" },
    });
}

/** Counts by status — admin sidebar badge ke liye */
export async function getTestimonialCounts() {
    await requireAdmin();
    const [pending, approved, rejected, spam, total] = await Promise.all([
        db.testimonial.count({ where: { status: "pending" } }),
        db.testimonial.count({ where: { status: "approved" } }),
        db.testimonial.count({ where: { status: "rejected" } }),
        db.testimonial.count({ where: { status: "spam" } }),
        db.testimonial.count(),
    ]);
    return { pending, approved, rejected, spam, total };
}

/**
 * PUBLIC Server Action — koi bhi visitor yahan se apna review submit kar sakta hai.
 * Hamesha status="pending" save hoga — admin approval zaroori.
 * Anti-spam: honeypot field, rate-limit-ish IP check, max length limits.
 */
export async function submitTestimonial(formData: FormData) {
    try {
        // 1. Honeypot (spam bots fill hidden fields)
        const website = String(formData.get("website") ?? "").trim();
        if (website.length > 0) {
            // Silent success — bots ko pata nahi chalna chahiye ke unhone fail kiya
            return { ok: true, pending: true, message: "✅ Thank you! Your review has been submitted for approval. It will appear on the site within 24 hours once verified." };
        }

        // 2. Extract + sanitize inputs
        const name = String(formData.get("name") ?? "").trim().slice(0, 100);
        const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
        const role = String(formData.get("role") ?? "").trim().slice(0, 100);
        const reviewRaw = String(formData.get("review") ?? "").trim();
        const review = reviewRaw.slice(0, 2000);
        const starsRaw = Number(formData.get("stars") ?? 0);
        const stars = Number.isFinite(starsRaw) ? Math.max(1, Math.min(5, Math.round(starsRaw))) : 5;
        const projectIdRaw = String(formData.get("projectId") ?? "").trim();
        const projectId = projectIdRaw.length >= 5 ? projectIdRaw.slice(0, 50) : null;

        // 3. Validation
        const errors: Record<string, string> = {};
        if (name.length < 2) errors.name = "Please enter your full name (at least 2 characters).";
        if (role.length < 2) errors.role = "Please enter your role or company name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
        if (review.length < 10) errors.review = "Please write a detailed review (at least 10 characters).";
        if (review.length > 2000) errors.review = "Review is too long (max 2000 characters).";
        if (stars < 1 || stars > 5) errors.stars = "Please select a valid star rating.";

        if (Object.keys(errors).length > 0) {
            return { ok: false, pending: false, message: "Please fix the highlighted fields.", errors };
        }

        // 4. Anti-spam: placeholder text detect
        const PLACEHOLDER_PATTERN = /(lorem ipsum|sample review|placeholder|test review|fake review|example review|great work|amazing work 10 out of 10|would recommend to everyone)/i;
        if (PLACEHOLDER_PATTERN.test(review) || PLACEHOLDER_PATTERN.test(name)) {
            return {
                ok: false,
                pending: false,
                message: "Please write a genuine, personal review. Generic or placeholder text is not accepted.",
                errors: { review: "Your review looks like generic placeholder text. Please share your real experience." },
            };
        }

        // 5. Save with STATUS PENDING (admin ko manually approve karna parega)
        await db.testimonial.create({
            data: {
                name,
                email,
                role,
                review,
                stars,
                projectId,
                status: "pending",
                isVerified: false,
                image: null,
            } as any,
        });

        // 6. Revalidate admin taaki queue naya dikh jaye
        revalidatePath("/admin/dashboard");

        return {
            ok: true,
            pending: true,
            message: `✅ Thank you, ${name.split(" ")[0] || "friend"}! Your review has been submitted for approval. I personally verify every submission and yours will appear on the site within 24 hours.`,
        };
    } catch (error) {
        console.error("submitTestimonial error:", error);
        return {
            ok: false,
            pending: false,
            message: "Something went wrong on our end. Please try again in a few moments or email me directly.",
        };
    }
}

/** Admin action — pending ko approved mein change kare, aur optionally verified bhi mark kare */
export async function approveTestimonial(id: string, markVerified: boolean = true) {
    await requireAdmin();
    const data: any = { status: "approved" as const };
    if (markVerified) data.isVerified = true;
    await db.testimonial.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

/** Admin action — review reject kare (user site pe nahi dikhega, DB mein rahega record) */
export async function rejectTestimonial(id: string) {
    await requireAdmin();
    await db.testimonial.update({ where: { id }, data: { status: "rejected" as const } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

/** Admin action — mark as spam (future spam filter training ke liye) */
export async function markTestimonialSpam(id: string) {
    await requireAdmin();
    await db.testimonial.update({ where: { id }, data: { status: "spam" as const } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

/** Admin action — status toggle between pending / approved / rejected / spam */
export async function updateTestimonialStatus(id: string, status: string) {
    await requireAdmin();
    const validStatuses = ["pending", "approved", "rejected", "spam"];
    if (!validStatuses.includes(status)) return { success: false, error: "Invalid status" };
    await db.testimonial.update({ where: { id }, data: { status: status as any } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function saveTestimonial(testimonial: Partial<Testimonial> & { name: string; role: string; review: string; stars: number }) {
    await requireAdmin();
    const { id, ...data } = testimonial;
    // Ensure status always has a default
    const safeData: any = {
        ...data,
        status: data.status || "approved",
        isVerified: typeof data.isVerified === "boolean" ? data.isVerified : true,
    };
    if (id && !id.startsWith("test_")) {
        await db.testimonial.update({ where: { id }, data: safeData });
    } else {
        await db.testimonial.create({ data: safeData });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteTestimonial(id: string) {
    await requireAdmin();
    await db.testimonial.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Team ---
export async function getTeam() {
    return await db.teammember.findMany();
}

export async function addTeamMember(member: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) {
    await requireAdmin();
    await db.teammember.create({ data: member as any });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateTeamMember(id: string, updatedMember: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) {
    await requireAdmin();
    await db.teammember.update({ where: { id }, data: updatedMember as any });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteTeamMember(id: string) {
    await requireAdmin();
    await db.teammember.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Certificates ---
export async function getCertificates() {
    return await db.certificate.findMany();
}

export async function saveCertificate(cert: Partial<Certificate> & { title: string; issuer: string; date: string }) {
    await requireAdmin();
    const { id, ...data } = cert;
    if (id) {
        await db.certificate.update({ where: { id }, data: data as any });
    } else {
        await db.certificate.create({ data: data as any });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteCertificate(id: string) {
    await requireAdmin();
    await db.certificate.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Languages ---
export async function getLanguages() {
    return await db.language.findMany();
}

export async function saveLanguage(lang: Partial<Language> & { name: string; proficiency: string }) {
    await requireAdmin();
    const { id, ...data } = lang;
    if (id) {
        await db.language.update({ where: { id }, data: data as any });
    } else {
        await db.language.create({ data: data as any });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteLanguage(id: string) {
    await requireAdmin();
    await db.language.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Interests ---
export async function getInterests() {
    return await db.interest.findMany();
}

export async function saveInterest(interest: Partial<Interest> & { name: string }) {
    await requireAdmin();
    const { id, ...data } = interest;
    if (id) {
        await db.interest.update({ where: { id }, data: data as any });
    } else {
        await db.interest.create({ data: data as any });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteInterest(id: string) {
    await requireAdmin();
    await db.interest.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Settings ---
export async function getSettings() {
    try {
        // There's only one settings object, so we find the first one.
        return await db.settings.findFirst();
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
}

export async function updateSettings(data: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>) {
    await requireAdmin();
    const existingSettings = await db.settings.findFirst();
    if (existingSettings) {
        await db.settings.update({
            where: { id: existingSettings.id },
            data: data as any,
        });
    } else {
        await db.settings.create({
            data: {
                showTeam: false,
                available: true,
                cvShowCertificates: true,
                cvShowLanguages: true,
                cvShowInterests: true,
                cvShowDeclaration: true,
                ...data,
            } as any,
        });
    }
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

/** Fetch public portfolio content in one place and keep the visitor-facing site available if MySQL is offline. */
export async function getPortfolioData() {
    try {
        const [projects, services, profile, skills, experience, education, testimonials, team, settings, certificates, languages, interests] = await Promise.all([
            getProjects(), getServices(), getProfile(), getSkills(), getExperience(), getEducation(),
            getApprovedTestimonials(), getTeam(), getSettings(), getCertificates(), getLanguages(), getInterests(),
        ]);

        if (!profile || !settings) {
            console.log("Portfolio database has not been seeded yet, will use fallback data");
            return null; // Return null instead of throwing error
        }

        return { projects, services, profile, skills, experience, education, testimonials, team, settings, certificates, languages, interests, usingFallback: false };
    } catch (error) {
        console.error("Portfolio database is unavailable; serving read-only fallback content.", error);
        return { ...getFallbackPortfolioData(), usingFallback: true };
    }
}
