"use client";

import React, { useState } from "react";
import Image from "next/image";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
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

function SkillBadge({ skill }: { skill: SkillData }) {
    const [imgSrc, setImgSrc] = useState(() => {
        if (skill.name.toLowerCase() === 'rest api') {
            return null;
        }
        const slug = getSimpleIconSlug(skill.name);
        return `https://cdn.simpleicons.org/${slug}`;
    });

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
                        onError={() => setImgSrc(null)}
                        loading="lazy"
                        sizes="16px"
                    />
                </div>
            )}
            
            <span className="relative z-10">{skill.name}</span>

            {skill.proficiency && (
                <span className={`relative z-10 text-[9px] font-extrabold tracking-wide uppercase px-1.5 py-0.5 rounded-md border ${
                    skill.proficiency === "Expert" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    skill.proficiency === "Advanced" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    skill.proficiency === "Intermediate" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
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
        <section className="flex flex-col items-center justify-center gap-10 h-full relative overflow-hidden py-20 z-[20]" id="skills">
            <SectionHeading>My Tech Stack</SectionHeading>

            <div className="flex flex-wrap justify-center gap-8 px-5 max-w-[1400px] w-full mt-10">
                {categories.map((category, catIndex) => {
                    const categorySkills = groupedSkills[category];
                    if (!categorySkills?.length) return null;

                    return (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: catIndex * 0.1, duration: 0.5 }}
                            className="flex flex-col gap-6 bg-[#0d0426]/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md w-full md:w-[45%] lg:w-[40%] relative group hover:border-cyan-500/30 transition-colors duration-500"
                        >
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
        </section>
    );
};

export default Skills;