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
    return (
        <section className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden pb-20 py-20" id="skills">
            <SectionHeading>My Tech Stack</SectionHeading>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-row justify-center flex-wrap mt-4 gap-5 items-center px-10 max-w-[1200px]"
            >
                {skills.map((skill, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(112, 66, 248, 0.2)" }}
                        className="px-6 py-3 glass-card rounded-full text-white text-lg font-medium transition-all duration-300 cursor-default border border-[#7042f861]"
                    >
                        {skill.name}
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default Skills;

