"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motionVariants";
import { Briefcase, Code, MapPin } from "lucide-react";
import { ExperienceData } from "@/lib/db";
import ReactMarkdown from "react-markdown";

interface ExperienceProps {
    experience: ExperienceData[];
}

const Experience = ({ experience }: ExperienceProps) => {

    const getIcon = (type: string) => {
        switch (type) {
            case "Briefcase": return <Briefcase size={20} />;
            case "Code": return <Code size={20} />;
            default: return <Briefcase size={20} />;
        }
    };

    return (
        <Section id="experience" className="scroll-mt-28">
            <SectionHeading eyebrow="Career Path">Work Experience</SectionHeading>

            <div className="flex flex-col items-center justify-center w-full mt-10">
                <div className="relative w-full max-w-4xl">
                    {/* Central Line */}
                    <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500 via-cyan-500 to-transparent md:-translate-x-1/2 ml-4 md:ml-0 opacity-30"></div>

                    {experience.map((item, index) => (
                        <motion.div
                            key={index}
                            {...fadeUp(index)}
                            className={`relative flex flex-col md:flex-row gap-8 mb-16 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute left-0 md:left-1/2 w-9 h-9 bg-background border-2 border-cyan-500 rounded-full z-10 flex items-center justify-center md:-translate-x-1/2 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] ml-[2px] md:ml-0">
                                {getIcon(item.iconType)}
                            </div>

                            {/* Content Card */}
                            <div className="w-full md:w-[calc(50%-40px)] ml-12 md:ml-0">
                                <div className="card-premium card-premium-hover p-6 relative group overflow-hidden">
                                    <span className="card-accent-line" aria-hidden="true" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <span className="px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                                {item.period}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-lg font-medium text-purple-400 flex items-center gap-2">
                                                @{item.company}
                                            </h4>
                                            {item.location && (
                                                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-cyan-400 shrink-0" />
                                                    {item.location}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-gray-300 text-sm leading-relaxed space-y-2 prose prose-invert max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    strong: ({ node, ...props }) => <strong className="text-cyan-300 font-bold" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                }}
                                            >
                                                {item.description}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Empty space for the other side (desktop only) */}
                            <div className="hidden md:block w-[calc(50%-40px)]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default Experience;

