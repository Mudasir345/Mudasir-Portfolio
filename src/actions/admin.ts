"use server";

import { revalidatePath } from "next/cache";
import { getDB, saveDB, ProjectData, ServiceData, ProfileData, SkillData, ExperienceData, EducationData, TestimonialData, TeamMember, CertificateData, LanguageData, InterestData, DBData } from "@/lib/db";

// --- Authentication ---
export async function authenticate(password: string) {
    // Simple password check - In production, use proper authentication
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    return password === ADMIN_PASSWORD;
}

// --- Projects ---
export async function getProjects() {
    const db = await getDB();
    return db.projects;
}

export async function addProject(project: ProjectData) {
    const db = await getDB();
    db.projects.push(project);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateProject(originalTitle: string, updatedProject: ProjectData) {
    const db = await getDB();
    const index = db.projects.findIndex((p) => p.title === originalTitle);

    if (index !== -1) {
        db.projects[index] = updatedProject;
        await saveDB(db);
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: true };
    }
    return { success: false, error: "Project not found" };
}

export async function deleteProject(title: string) {
    const db = await getDB();
    db.projects = db.projects.filter((p) => p.title !== title);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Services ---
export async function getServices() {
    const db = await getDB();
    return db.services;
}

export async function addService(newService: ServiceData) {
    const db = await getDB();
    db.services.push(newService);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateService(originalTitle: string, updatedService: ServiceData) {
    const db = await getDB();
    const index = db.services.findIndex((s) => s.title === originalTitle);

    if (index !== -1) {
        db.services[index] = updatedService;
        await saveDB(db);
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: true };
    }
    return { success: false, error: "Service not found" };
}

export async function deleteService(title: string) {
    const db = await getDB();
    db.services = db.services.filter((s) => s.title !== title);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- CMS v4.0 New Actions ---

// 1. Profile
export async function getProfile() {
    const db = await getDB();
    return db.profile;
}

export async function updateProfile(data: ProfileData) {
    const db = await getDB();
    db.profile = data;
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// 2. Skills
export async function getSkills() {
    const db = await getDB();
    return db.skills;
}

export async function updateSkillList(skills: SkillData[]) {
    // This allows complete re-ordering/bulk update of skills
    const db = await getDB();
    db.skills = skills;
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}


// 3. Experience
export async function getExperience() {
    const db = await getDB();
    return db.experience;
}

export async function saveExperience(experience: ExperienceData) {
    const db = await getDB();
    const index = db.experience.findIndex(e => e.id === experience.id);

    if (index !== -1) {
        // Update
        db.experience[index] = experience;
    } else {
        // Add
        db.experience.push(experience);
    }
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteExperience(id: string) {
    const db = await getDB();
    db.experience = db.experience.filter(e => e.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// 4. Education
export async function getEducation() {
    const db = await getDB();
    return db.education;
}

export async function saveEducation(education: EducationData) {
    const db = await getDB();
    const index = db.education.findIndex(e => e.id === education.id);

    if (index !== -1) {
        // Update
        db.education[index] = education;
    } else {
        // Add
        db.education.push(education);
    }
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteEducation(id: string) {
    const db = await getDB();
    db.education = db.education.filter(e => e.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}


// 5. Testimonials
export async function getTestimonials() {
    const db = await getDB();
    return db.testimonials || [];
}

export async function saveTestimonial(testimonial: TestimonialData) {
    const db = await getDB();
    if (!db.testimonials) db.testimonials = [];

    const index = db.testimonials.findIndex(t => t.id === testimonial.id);

    if (index !== -1) {
        db.testimonials[index] = testimonial;
    } else {
        db.testimonials.push(testimonial);
    }
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteTestimonial(id: string) {
    const db = await getDB();
    db.testimonials = (db.testimonials || []).filter(t => t.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Team & Settings ---

export async function getTeam() {
    const db = await getDB();
    return db.team || [];
}

export async function addTeamMember(member: TeamMember) {
    const db = await getDB();
    if (!db.team) db.team = [];
    db.team.push(member);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function updateTeamMember(id: string, updatedMember: TeamMember) {
    const db = await getDB();
    if (!db.team) return { success: false, error: "No team found" };

    const index = db.team.findIndex(t => t.id === id);
    if (index !== -1) {
        db.team[index] = updatedMember;
        await saveDB(db);
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: true };
    }
    return { success: false, error: "Member not found" };
}

export async function deleteTeamMember(id: string) {
    const db = await getDB();
    if (!db.team) return { success: true };

    db.team = db.team.filter(t => t.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function getSettings() {
    const db = await getDB();
    return db.settings || { showTeam: false };
}

export async function toggleTeamSection(show: boolean) {
    const db = await getDB();
    if (!db.settings) db.settings = { showTeam: false };
    db.settings.showTeam = show;
    await saveDB(db);
    revalidatePath("/");
    return { success: true };
}

// --- Certificates ---
export async function getCertificates() {
    const db = await getDB();
    return db.certificates || [];
}

export async function saveCertificate(cert: CertificateData) {
    const db = await getDB();
    if (!db.certificates) db.certificates = [];
    const index = db.certificates.findIndex(c => c.id === cert.id);
    if (index !== -1) db.certificates[index] = cert;
    else db.certificates.push(cert);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteCertificate(id: string) {
    const db = await getDB();
    db.certificates = (db.certificates || []).filter(c => c.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Languages ---
export async function getLanguages() {
    const db = await getDB();
    return db.languages || [];
}

export async function saveLanguage(lang: LanguageData) {
    const db = await getDB();
    if (!db.languages) db.languages = [];
    const index = db.languages.findIndex(l => l.id === lang.id);
    if (index !== -1) db.languages[index] = lang;
    else db.languages.push(lang);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteLanguage(id: string) {
    const db = await getDB();
    db.languages = (db.languages || []).filter(l => l.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- Interests ---
export async function getInterests() {
    const db = await getDB();
    return db.interests || [];
}

export async function saveInterest(interest: InterestData) {
    const db = await getDB();
    if (!db.interests) db.interests = [];
    const index = db.interests.findIndex(i => i.id === interest.id);
    if (index !== -1) db.interests[index] = interest;
    else db.interests.push(interest);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

export async function deleteInterest(id: string) {
    const db = await getDB();
    db.interests = (db.interests || []).filter(i => i.id !== id);
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// --- CV Settings ---
export async function updateCvSettings(newSettings: Partial<DBData["settings"]>) {
    const db = await getDB();
    db.settings = { ...db.settings, ...newSettings };
    await saveDB(db);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}
