"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Briefcase, Code } from "lucide-react";
import { ExperienceData } from "@/lib/db";

interface ExperienceProps {
    experience: ExperienceData[];
}

const Experience = ({ experience }: ExperienceProps) => {

    const getIcon = (type: string) => {
        switch (type) {
            case "Briefcase": return <Briefcase />;
            case "Code": return <Code />;
            default: return <Briefcase />;
        }
    };

    return (
        <section id="experience" className="scroll-mt-28 mb-28 sm:mb-40 relative z-[20]">
            <SectionHeading>Work Experience</SectionHeading>

            <div className="flex flex-col items-center justify-center w-full px-4">
                <div className="relative border-l border-gray-700 ml-3 md:ml-0 space-y-10 max-w-[800px]">
                    {experience.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="mb-10 ml-6 relative group"
                        >
                            <span className="absolute flex items-center justify-center w-10 h-10 bg-[#1a0b3b] rounded-full -left-[44px] border border-[#7042f8] text-white group-hover:scale-110 transition-transform duration-300">
                                {getIcon(item.iconType)}
                            </span>
                            <div className="p-6 glass-card rounded-lg border border-[#7042f861] hover:bg-[#1a0b3b]/50 transition-all duration-300">
                                <h3 className="flex items-center mb-1 text-xl font-semibold text-white">
                                    {item.title}
                                    <span className="bg-blue-900 text-blue-300 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                                        {item.period}
                                    </span>
                                </h3>
                                <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                                    {item.company}
                                </time>
                                <p className="mb-4 text-base font-normal text-gray-300">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;

