import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/data.json");

export type ProjectCategory = "Web" | "Mobile" | "Desktop" | "Automation";

export interface ProjectData {
    title: string;
    description: string;
    techStack: string[];
    image: string;
    category: ProjectCategory;
    link?: string;
    liveUrl?: string;
    githubUrl?: string;
}

export interface ServiceDetail {
    name: string;
    iconUrl: string;
}

export interface ServiceData {
    title: string;
    iconType: string;
    description: string;
    details: ServiceDetail[];
}

// --- CMS v4.0 New Interfaces ---

export interface ProfileData {
    name: string;
    roles: string[]; // For TypeAnimation
    bio: string; // Short bio for Hero
    aboutText: string; // Longer text for About section
    stats: {
        experienceYears: string;
        projectsCompleted: string;
        satisfaction: string;
        availability: string;
    };
    email: string;
    github: string;
    linkedin: string;
    whatsapp: string;
}

export interface SkillData {
    name: string;
    category: "Frontend" | "Backend" | "Database" | "Tools";
}

export interface ExperienceData {
    id: string; // Unique ID for keying/editing
    title: string;
    company: string;
    period: string;
    description: string;
    iconType: "Briefcase" | "Code";
}

export interface EducationData {
    id: string;
    degree: string;
    institution: string;
    period: string;
    description: string;
    iconType: "GraduationCap" | "BookOpen" | "School";
}

export interface DBData {
    profile: ProfileData;
    projects: ProjectData[];
    services: ServiceData[];
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
}

export async function getDB(): Promise<DBData> {
    try {
        const data = await fs.readFile(dataFilePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        // Return default empty structure if file read fails - THIS MUST BE ROBUST
        return {
            profile: {
                name: "Mudasir Choudhry",
                roles: ["Developer"],
                bio: "",
                aboutText: "",
                stats: { experienceYears: "0", projectsCompleted: "0", satisfaction: "100%", availability: "24/7" },
                email: "",
                github: "",
                linkedin: "",
                whatsapp: ""
            },
            projects: [],
            services: [],
            skills: [],
            experience: [],
            education: []
        };
    }
}

export async function saveDB(data: DBData): Promise<void> {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing database:", error);
        throw new Error("Failed to save data");
    }
}
