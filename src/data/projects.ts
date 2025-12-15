export type ProjectCategory = "Web" | "Mobile" | "Desktop" | "Automation";

export interface ProjectData {
    title: string;
    description: string;
    techStack: string[];
    image: string;
    category: ProjectCategory;
    link?: string;
}

export const ALL_PROJECTS: ProjectData[] = [
    // Web Development
    {
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with real-time inventory, Stripe payments, and admin dashboard.",
        techStack: ["Next.js", "TypeScript", "Stripe", "Prisma"],
        image: "/projects/web1.png",
        category: "Web",
    },
    {
        title: "SaaS Analytics Dashboard",
        description: "Real-time analytics platform for SaaS businesses featuring data visualization and user management.",
        techStack: ["React.js", "Tailwind CSS", "Recharts", "Node.js"],
        image: "/projects/web2.png",
        category: "Web",
    },
    {
        title: "Corporate Portal",
        description: "Enterprise-grade portal with role-based access control and document management system.",
        techStack: ["Laravel", "PHP", "MySQL", "Bootstrap"],
        image: "/projects/web3.png",
        category: "Web",
    },

    // Mobile App Development
    {
        title: "Fitness Tracker Pro",
        description: "Cross-platform mobile app for tracking workouts and nutrition with social features.",
        techStack: ["React Native", "Expo", "Firebase", "Redux"],
        image: "/projects/mob1.png",
        category: "Mobile",
    },
    {
        title: "Food Delivery App",
        description: "On-demand food delivery application with live GPS tracking and payment integration.",
        techStack: ["Flutter", "Dart", "Google Maps API", "Stripe"],
        image: "/projects/mob2.png",
        category: "Mobile",
    },

    // Desktop Applications
    {
        title: "Modern File Explorer",
        description: "A beautiful, highly customizable file explorer replacement for Windows with tabbed browsing.",
        techStack: ["Electron.js", "React", "Node.js", "SCSS"],
        image: "/projects/desk1.png",
        category: "Desktop",
    },
    {
        title: "POS System (Point of Sale)",
        description: "Offline-first retail management system for high-volume stores with inventory syncing.",
        techStack: ["C#", ".NET Core", "WPF", "SQL Server"],
        image: "/projects/desk2.png",
        category: "Desktop",
    },

    // Automation Bots
    {
        title: "Crypto Trading Bot",
        description: "Automated trading bot executing high-frequency strategies on Binance and Coinbase via API.",
        techStack: ["Python", "Pandas", "CCXT", "Docker"],
        image: "/projects/bot1.png",
        category: "Automation",
    },
    {
        title: "LinkedIn Lead Scraper",
        description: "High-performance scraper to aggregate professional profiles and export to CSV/CRM.",
        techStack: ["Puppeteer", "Node.js", "MongoDB", "Express"],
        image: "/projects/bot2.png",
        category: "Automation",
    },
];
