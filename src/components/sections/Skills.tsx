"use client";

import React, { useState } from "react";
import Image from "next/image";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motionVariants";
import { SkillData } from "@/lib/db";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

interface SkillsProps {
    skills: SkillData[];
}

const getSimpleIconSlug = (name: string): string => {
    const mapping: Record<string, string> = {
        "react": "react",
        "react.js": "react",
        "reactjs": "react",
        "next.js": "nextdotjs",
        "nextjs": "nextdotjs",
        "node.js": "nodedotjs",
        "nodejs": "nodedotjs",
        "express.js": "express",
        "expressjs": "express",
        "express": "express",
        "mongodb": "mongodb",
        "mongo": "mongodb",
        "postgresql": "postgresql",
        "postgres": "postgresql",
        "mysql": "mysql",
        "sqlite": "sqlite",
        "typescript": "typescript",
        "javascript": "javascript",
        "html": "html5",
        "css": "css3",
        "tailwind css": "tailwindcss",
        "tailwindcss": "tailwindcss",
        "bootstrap": "bootstrap",
        "git": "git",
        "github": "github",
        "docker": "docker",
        "aws": "amazonaws",
        "python": "python",
        "django": "django",
        "flask": "flask",
        "fastapi": "fastapi",
        "firebase": "firebase",
        "prisma": "prisma",
        "graphql": "graphql",
        "graph api": "graphql",
        "apollo": "apollographql",
        "redux": "redux",
        "sass": "sass",
        "figma": "figma",
        "postman": "postman",
        "npm": "npm",
        "yarn": "yarn",
        "pnpm": "pnpm",
        "vite": "vite",
        "webpack": "webpack",
        "jest": "jest",
        "cypress": "cypress",
        "redis": "redis",
        "supabase": "supabase",
        "linux": "linux",
        "ubuntu": "ubuntu",
        "nginx": "nginx",
        "vercel": "vercel",
        "netlify": "netlify",
        "heroku": "heroku",
        "wordpress": "wordpress",
        "flutter": "flutter",
        "react native": "react",
        "dart": "dart",
        "swift": "swift",
        "kotlin": "kotlin",
        "java": "openjdk",
        "c++": "cplusplus",
        "c#": "csharp",
        "go": "go",
        "golang": "go",
        "rust": "rust",
        "php": "php",
        "laravel": "laravel",
        "angular": "angular",
        "kubernetes": "kubernetes",
        "terraform": "terraform",
        "jira": "jira",
        "ci/cd": "githubactions"
    };
    
    const key = name.toLowerCase().trim();
    if (mapping[key]) return mapping[key];
    
    return key.replace(/\s+/g, "").replace(/\.js/g, "dotjs").replace(/\./g, "");
};

// Jin tech ka koi brand icon mojood nahi, unke badge bina icon ke rahenge.
const ICONLESS_SKILLS = new Set(["rest api"]);

// Icons `public/icons/tech/` se self-hosted hote hain. Pehle seedha CDN use hota tha,
// jis par hosting ka image optimizer atka rehta hai (Vercel cdn.simpleicons.org ke
// har cache-miss par 502 deta hai), is liye production me icons gayab ho jate the.
function getSkillIconSources(name: string): string[] {
    if (ICONLESS_SKILLS.has(name.toLowerCase().trim())) return [];
    const slug = getSimpleIconSlug(name);
    return [`/icons/tech/${slug}.svg`, `https://cdn.simpleicons.org/${slug}`];
}

function SkillBadge({ skill }: { skill: SkillData }) {
    const sources = getSkillIconSources(skill.name);
    const [sourceIndex, setSourceIndex] = useState(0);
    const imgSrc = sources[sourceIndex] ?? null;

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 border border-white/5 hover:border-cyan-500/50 cursor-default shadow-lg hover:shadow-cyan-500/10 relative overflow-hidden group/skill"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover/skill:opacity-100 transition-opacity duration-300" />
            
            {imgSrc && (
                <div className="relative w-4 h-4 shrink-0">
                    <Image
                        src={imgSrc}
                        alt=""
                        fill
                        className="object-contain transition-transform duration-300 group-hover/skill:scale-110"
                        onError={() => setSourceIndex((i) => i + 1)}
                        loading="lazy"
                        sizes="16px"
                        unoptimized={sourceIndex > 0}
                    />
                </div>
            )}
            
            <span className="relative z-10">{skill.name}</span>

            {skill.proficiency && (
                <span className={`relative z-10 text-[9px] font-extrabold tracking-wide uppercase px-1.5 py-0.5 rounded-md border ${
                    skill.proficiency === "Expert" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    skill.proficiency === "Advanced" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    skill.proficiency === "Intermediate" ? "bg-purple-400/10 text-purple-300 border-purple-400/20" :
                    "bg-white/5 text-gray-300 border-white/10"
                }`}>
                    {skill.proficiency}
                </span>
            )}
        </motion.div>
    );
}

const Skills = ({ skills }: SkillsProps) => {
    // Group skills by category
    const categories = ["Frontend", "Backend", "Database", "Tools"];
    const groupedSkills = categories.reduce((acc, category) => {
        acc[category] = skills.filter(skill => skill.category === category);
        return acc;
    }, {} as Record<string, SkillData[]>);

    return (
        <Section id="skills" className="scroll-mt-28">
            <SectionHeading eyebrow="What I Use">My Tech Stack</SectionHeading>

            <div className="grid w-full max-w-[1200px] mx-auto grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-10">
                {categories.map((category, catIndex) => {
                    const categorySkills = groupedSkills[category];
                    if (!categorySkills?.length) return null;

                    return (
                        <motion.div
                            key={category}
                            {...fadeUp(catIndex)}
                            whileHover={{ y: -6 }}
                            className="card-premium card-premium-hover flex flex-col gap-6 p-8 relative group overflow-hidden"
                        >
                            <span className="card-accent-line" aria-hidden="true" />
                            <span className="card-spotlight" aria-hidden="true" />
                            {/* Category Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 border-b border-white/10 pb-4 z-10">
                                {category}
                            </h3>

                            <div className="flex flex-wrap gap-3 z-10">
                                {categorySkills.map((skill, index) => (
                                    <SkillBadge skill={skill} key={index} />
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </Section>
    );
};

export default Skills;