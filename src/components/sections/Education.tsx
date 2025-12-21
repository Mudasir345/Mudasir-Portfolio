"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, School } from "lucide-react";
import { EducationData } from "@/lib/db";

interface EducationProps {
    education: EducationData[];
}

const Education = ({ education }: EducationProps) => {

    const getIcon = (type: string) => {
        switch (type) {
            case "GraduationCap": return <GraduationCap size={20} />;
            case "BookOpen": return <BookOpen size={20} />;
            case "School": return <School size={20} />;
            default: return <School size={20} />;
        }
    };

    return (
        <section id="education" className="scroll-mt-28 mb-28 sm:mb-40 relative z-[20]">
            <SectionHeading>My Education</SectionHeading>

            <div className="flex flex-col items-center justify-center w-full px-4 mt-10">
                <div className="relative w-full max-w-4xl">
                    {/* Central Line */}
                    <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent md:-translate-x-1/2 ml-4 md:ml-0 opacity-30"></div>

                    {education.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={`relative flex flex-col md:flex-row gap-8 mb-16 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute left-0 md:left-1/2 w-9 h-9 bg-[#030014] border-2 border-purple-500 rounded-full z-10 flex items-center justify-center md:-translate-x-1/2 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] ml-[2px] md:ml-0">
                                {getIcon(item.iconType)}
                            </div>

                            {/* Content Card */}
                            <div className="w-full md:w-[calc(50%-40px)] ml-12 md:ml-0">
                                <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                                {item.degree}
                                            </h3>
                                            <span className="px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-900/20 border border-purple-500/20 rounded-full">
                                                {item.period}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-medium text-cyan-400 mb-4 flex items-center gap-2">
                                            {item.institution}
                                        </h4>

                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Empty space for the other side (desktop only) */}
                            <div className="hidden md:block w-[calc(50%-40px)]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Education;
