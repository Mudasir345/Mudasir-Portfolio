"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import { motion } from "framer-motion";
import { User, Sparkles, Brain } from "lucide-react";
import { ProfileData } from "@/lib/db";
import ReactMarkdown from "react-markdown";
import CountUp from "../ui/CountUp";

interface AboutProps {
    profile: ProfileData;
}

export default function About({ profile }: AboutProps) {
    return (
        <Section id="about" className="scroll-mt-28">
            <SectionHeading eyebrow="Who I Am">About Me</SectionHeading>

            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-[1200px] mx-auto gap-10">
                {/* Left Side: The Story */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true, margin: "-60px" }}
                    className="flex-1 space-y-6 w-full"
                >
                    <div className="card-premium card-premium-hover p-6 md:p-8 overflow-hidden group">
                        <span className="card-accent-line" aria-hidden="true" />
                        <span className="card-spotlight" aria-hidden="true" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <User className="text-cyan-400" />
                            Beyond the Code
                        </h3>
                        <div className="text-gray-300 leading-relaxed space-y-4 relative">
                            <ReactMarkdown
                                components={{
                                    strong: ({ node, ...props }) => <strong className="text-cyan-300 font-bold" {...props} />
                                }}
                            >
                                {profile.aboutText}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="card-premium card-premium-hover p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                            <Brain className="text-purple-400 mb-2" size={32} />
                            <h4 className="font-bold text-white">Problem Solver</h4>
                            <p className="text-xs text-gray-400 mt-1">Turning complex logic into simple code.</p>
                        </div>
                        <div className="card-premium card-premium-hover p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                            <Sparkles className="text-cyan-400 mb-2" size={32} />
                            <h4 className="font-bold text-white">Creative Mind</h4>
                            <p className="text-xs text-gray-400 mt-1">Designing intuitive and beautiful UIs.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Visual Stats / Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true, margin: "-60px" }}
                    className="flex-1 w-full"
                >
                    <div className="card-premium card-premium-hover relative w-full min-h-[400px] overflow-hidden flex items-center justify-center p-8 sm:p-10">
                        <span className="card-accent-line" aria-hidden="true" />
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full"></div>

                        <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                            {[
                                { value: profile.stats.experienceYears, label: "Years of Experience" },
                                { value: profile.stats.projectsCompleted, label: "Projects Completed" },
                                { value: profile.stats.satisfaction, label: "Client Satisfaction" },
                                { value: profile.stats.availability, label: "Support Availability" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center transition-colors duration-300 hover:border-cyan-400/30"
                                >
                                    <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                        <CountUp value={stat.value} />
                                    </h3>
                                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </Section>
    );
}

