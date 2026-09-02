import { PrismaClient } from '@prisma/client';
import { optimizeAllMediaInObject } from '@/lib/mediaOptimizer';
import type {
  profile,
  skill,
  experience,
  education,
  project,
  gallery,
  service,
  servicedetail,
  testimonial,
  teammember,
  certificate,
  language,
  interest,
  settings,
} from '@prisma/client';

// PrismaClient ko global object par declare karein (development ke liye)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Next.js mein hot-reloading ki wajah se multiple PrismaClient instances banne se rokein
export const db =
  global.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

// ─── Raw DB Types (admin.ts server actions ke liye) ───────────────────────────
export type { profile, skill, experience, education, project, gallery, service, servicedetail, testimonial, teammember, certificate, language, interest, settings };

// ─── Enriched Frontend Types (components ke liye) ────────────────────────────

/**
 * ProfileData — DB profile row + transformed fields
 * - roles: string[] (DB mein comma-separated string hai)
 * - stats: nested object (DB mein flat fields hain)
 */
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

/**
 * ProjectData — project row + gallery + parsed arrays
 * - techStack, features, challenges are string[] (DB mein comma-separated)
 */
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

export type TestimonialStatus = "pending" | "approved" | "rejected" | "spam";

export type TestimonialData = testimonial;

export type TeamMember = teammember;

export type CertificateData = certificate;

export type LanguageData = language;

export type InterestData = interest;

export type SettingsData = settings;

// Project category type
export type ProjectCategory = 'Web' | 'Mobile' | 'Desktop' | 'Automation';

// ─── DB → Frontend Transformers ───────────────────────────────────────────────

/** Transform raw DB profile to ProfileData */
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
  return optimizeAllMediaInObject(data);
}

/** Transform raw DB project to ProjectData */
export function transformProject(raw: project & { gallery: gallery[] }): ProjectData {
  const data: ProjectData = {
    ...raw,
    techStack: raw.techStack ? raw.techStack.split(',').map((t) => t.trim()).filter(Boolean) : [],
    features: raw.features ? raw.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
    challenges: raw.challenges ? raw.challenges.split(',').map((c) => c.trim()).filter(Boolean) : [],
    gallery: raw.gallery,
  };
  return optimizeAllMediaInObject(data);
}
