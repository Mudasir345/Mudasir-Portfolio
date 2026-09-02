import { optimizeAllMediaInObject } from "@/lib/mediaOptimizer";

export type ProjectCategory = "Web" | "Mobile" | "Desktop" | "Automation";

export interface ProjectData {
    title: string;
    description: string;
    techStack: string[];
    image: string;
    category: ProjectCategory;
    link?: string;
}

const CLOUD = "https://res.cloudinary.com/as4hjbxb/image/upload";

const _ALL_PROJECTS: ProjectData[] = [
    // Web Development
    {
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with real-time inventory, Stripe payments, and admin dashboard.",
        techStack: ["Next.js", "TypeScript", "Stripe", "Prisma"],
        image: `${CLOUD}/v1787486499/portfolio/projects/peplexity_clone-1787486496799.png`,
        category: "Web",
    },
    {
        title: "SaaS Analytics Dashboard",
        description: "Real-time analytics platform for SaaS businesses featuring data visualization and user management.",
        techStack: ["React.js", "Tailwind CSS", "Recharts", "Node.js"],
        image: `${CLOUD}/v1787486509/portfolio/projects/tutorial_comp-1787486506281.jpg`,
        category: "Web",
    },
    {
        title: "Corporate Portal",
        description: "Enterprise-grade portal with role-based access control and document management system.",
        techStack: ["Laravel", "PHP", "MySQL", "Bootstrap"],
        image: `${CLOUD}/v1787486472/portfolio/projects/angular_component-1787486469167.png`,
        category: "Web",
    },

    // Mobile App Development
    {
        title: "Fitness Tracker Pro",
        description: "Cross-platform mobile app for tracking workouts and nutrition with social features.",
        techStack: ["React Native", "Expo", "Firebase", "Redux"],
        image: `${CLOUD}/v1787486495/portfolio/projects/notepad_mockup-1787486492179.jpg`,
        category: "Mobile",
    },
    {
        title: "Food Delivery App",
        description: "On-demand food delivery application with live GPS tracking and payment integration.",
        techStack: ["Flutter", "Dart", "Google Maps API", "Stripe"],
        image: `${CLOUD}/v1787486487/portfolio/projects/food_recipe_mockup-1787486484350.jpg`,
        category: "Mobile",
    },

    // Desktop Applications
    {
        title: "Modern File Explorer",
        description: "A beautiful, highly customizable file explorer replacement for Windows with tabbed browsing.",
        techStack: ["Electron.js", "React", "Node.js", "SCSS"],
        image: `${CLOUD}/v1787486497/portfolio/projects/payroll_mockup-1787486494614.jpg`,
        category: "Desktop",
    },
    {
        title: "POS System (Point of Sale)",
        description: "Offline-first retail management system for high-volume stores with inventory syncing.",
        techStack: ["C#", ".NET Core", "WPF", "SQL Server"],
        image: `${CLOUD}/v1787486479/portfolio/projects/boardnbarrel_mockup-1787486476154.jpg`,
        category: "Desktop",
    },

    // Automation Bots
    {
        title: "Crypto Trading Bot",
        description: "Automated trading bot executing high-frequency strategies on Binance and Coinbase via API.",
        techStack: ["Python", "Pandas", "CCXT", "Docker"],
        image: `${CLOUD}/v1787486490/portfolio/projects/google_review_bot-1787486487087.svg`,
        category: "Automation",
    },
    {
        title: "LinkedIn Lead Scraper",
        description: "High-performance scraper to aggregate professional profiles and export to CSV/CRM.",
        techStack: ["Puppeteer", "Node.js", "MongoDB", "Express"],
        image: `${CLOUD}/v1787486485/portfolio/projects/fb_scraper_safe-1787486482734.svg`,
        category: "Automation",
    },
];

export const ALL_PROJECTS = optimizeAllMediaInObject(_ALL_PROJECTS);
