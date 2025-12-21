"use client";

import React from "react";
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
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-300 border border-white/5 hover:border-cyan-500/50 cursor-default shadow-lg hover:shadow-cyan-500/20 relative overflow-hidden group/skill"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover/skill:opacity-100 transition-opacity duration-300" />
                                        <span className="relative z-10">{skill.name}</span>
                                    </motion.div>
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

