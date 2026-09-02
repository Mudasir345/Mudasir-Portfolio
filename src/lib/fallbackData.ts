import type {
  ProfileData,
  SettingsData,
  ProjectData,
  ServiceData,
  SkillData,
  ExperienceData,
  EducationData,
  TestimonialData,
  TeamMember,
  CertificateData,
  LanguageData,
  InterestData,
  GalleryData,
} from "@/lib/db";
import { optimizeAllMediaInObject } from "@/lib/mediaOptimizer";

const fallbackDate = new Date("2025-01-01T00:00:00.000Z");

const CLOUD = "https://res.cloudinary.com/as4hjbxb/image/upload";

const fallbackProfile: ProfileData = {
  id: "fallback-profile",
  name: "Mudasir Choudhry",
  image: "https://res.cloudinary.com/as4hjbxb/image/upload/v1787486515/portfolio/profile/profile-1787486512620.png",
  roles: ["Full Stack Developer", "Automation Engineer"],
  bio: "Creative developer building performant web experiences using modern full-stack tooling.",
  aboutText:
    "I build production-ready websites, dashboards, and automation tools with Next.js, TypeScript, and modern web technologies.",
  stats: {
    experienceYears: "5",
    projectsCompleted: "12",
    satisfaction: "98%",
    availability: "Available",
  },
  email: "mudasirchoudhry345@gmail.com",
  github: "https://github.com/Mudasir345",
  linkedin: "https://www.linkedin.com/in/mudasir345/",
  whatsapp: "https://wa.me/923000000000",
  declaration: "I am passionate about writing clean, scalable, and maintainable code for the web.",
  createdAt: fallbackDate,
  updatedAt: fallbackDate,
};

const fallbackSettings: SettingsData = {
  id: "fallback-settings",
  showTeam: true,
  available: true,
  cvShowCertificates: true,
  cvShowLanguages: true,
  cvShowInterests: true,
  cvShowDeclaration: true,
  createdAt: fallbackDate,
  updatedAt: fallbackDate,
};

const fallbackProjects: ProjectData[] = [
  {
    id: "fallback-project-1",
    title: "Portfolio Website",
    description: "A personal portfolio website showcasing skills, services, and projects.",
    longDescription:
      "A modern web portfolio built with Next.js, TypeScript, and Tailwind CSS, designed to highlight product work and technical experience.",
    features: ["Responsive design", "Interactive UI", "SEO-friendly"],
    challenges: ["Loading performance", "Accessible interactions", "Responsive layouts"],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    image: `${CLOUD}/v1787486502/portfolio/projects/portfolio-1787486499443.png`,
    mediaType: "image",
    category: "Web",
    link: "",
    liveUrl: "https://mudasirch.netlify.app",
    githubUrl: "https://github.com/Mudasir345/portfolio",
    showInCv: true,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
    gallery: [],
  },
  {
    id: "fallback-project-2",
    title: "Automation Dashboard",
    description: "A dashboard for monitoring automated workflows and task execution.",
    longDescription:
      "Built to display automated system metrics, job status, and quick action controls for workflow management.",
    features: ["Real-time updates", "Task scheduling", "Audit logging"],
    challenges: ["State synchronization", "API reliability", "User notifications"],
    techStack: ["React", "Node.js", "Prisma", "Tailwind CSS"],
    image: `${CLOUD}/v1787486485/portfolio/projects/fb_scraper_safe-1787486482734.svg`,
    mediaType: "image",
    category: "Automation",
    link: "",
    liveUrl: "",
    githubUrl: "https://github.com/Mudasir345/automation-dashboard",
    showInCv: false,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
    gallery: [],
  },
];

const fallbackServices: ServiceData[] = [
  {
    id: "fallback-service-1",
    title: "Web Development",
    iconType: "code",
    description: "Building fast, accessible, and responsive websites with modern front-end and back-end stacks.",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
    details: [
      {
        name: "Next.js",
        iconUrl:
          "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
      },
      {
        name: "React",
        iconUrl:
          "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      },
    ],
  },
  {
    id: "fallback-service-2",
    title: "Automation",
    iconType: "sparkles",
    description: "Creating automated workflows and tooling to reduce manual effort and increase reliability.",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
    details: [
      {
        name: "Node.js",
        iconUrl:
          "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      },
      {
        name: "Prisma",
        iconUrl:
          "https://cdn.simpleicons.org/prisma/2D3748",
      },
    ],
  },
];

const fallbackSkills: SkillData[] = [
  {
    id: "fallback-skill-1",
    name: "TypeScript",
    category: "Frontend",
    proficiency: "Expert",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: "fallback-skill-2",
    name: "Next.js",
    category: "Frontend",
    proficiency: "Advanced",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: "fallback-skill-3",
    name: "Prisma",
    category: "Database",
    proficiency: "Advanced",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackExperience: ExperienceData[] = [
  {
    id: "fallback-exp-1",
    title: "Full Stack Developer",
    company: "Freelance",
    period: "2021 - Present",
    description: "Delivering custom web applications, dashboards, and automation tools for small businesses.",
    iconType: "briefcase",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackEducation: EducationData[] = [
  {
    id: "fallback-edu-1",
    degree: "Bachelor of Science in Computer Science",
    institution: "Bahauddin Zakariya University",
    period: "2019 - 2023",
    description: "Focused on software engineering, algorithms, and web development.",
    iconType: "academic-cap",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackTestimonials: TestimonialData[] = [
  {
    id: "fallback-testimonial-1",
    name: "Jane Doe",
    email: null,
    role: "Product Manager",
    image: null,
    review: "Delivered a polished product quickly and communicated clearly throughout the project.",
    stars: 5,
    status: "approved",
    isVerified: true,
    projectId: null,
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackTeam: TeamMember[] = [
  {
    id: "fallback-team-1",
    name: "Mudasir Choudhry",
    role: "Founder",
    image: "https://res.cloudinary.com/as4hjbxb/image/upload/v1787486515/portfolio/profile/profile-1787486512620.png",
    linkedin: "https://www.linkedin.com/in/mudasir345/",
    github: "https://github.com/Mudasir345",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackCertificates: CertificateData[] = [
  {
    id: "fallback-cert-1",
    title: "Web Development Certification",
    issuer: "Online Training",
    date: "2024",
    link: "",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackLanguages: LanguageData[] = [
  {
    id: "fallback-lang-1",
    name: "English",
    proficiency: "Fluent",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

const fallbackInterests: InterestData[] = [
  {
    id: "fallback-interest-1",
    name: "Open Source",
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
];

export function getFallbackPortfolioData() {
  return optimizeAllMediaInObject({
    profile: fallbackProfile,
    settings: fallbackSettings,
    projects: fallbackProjects,
    services: fallbackServices,
    skills: fallbackSkills,
    experience: fallbackExperience,
    education: fallbackEducation,
    testimonials: fallbackTestimonials,
    team: fallbackTeam,
    certificates: fallbackCertificates,
    languages: fallbackLanguages,
    interests: fallbackInterests,
  });
}
