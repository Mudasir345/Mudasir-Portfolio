"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { User, Code2, Sparkles, Brain } from "lucide-react";
import { ProfileData } from "@/lib/db";
import ReactMarkdown from "react-markdown";

interface AboutProps {
    profile: ProfileData;
}

export default function About({ profile }: AboutProps) {
    return (
        <section className="flex flex-col items-center justify-center py-20 relative z-[20]" id="about">
            <SectionHeading>About Me</SectionHeading>

            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-[1200px] px-10 gap-10">
                {/* Left Side: The Story */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 space-y-6"
                >
                    <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <User className="text-cyan-400" />
                            Beyond the Code
                        </h3>
                        <div className="text-gray-300 leading-relaxed space-y-4">
                            <ReactMarkdown
                                components={{
                                    strong: ({ node, ...props }) => <strong className="text-cyan-300 font-bold" {...props} />
                                }}
                            >
                                {profile.aboutText}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6 rounded-xl border border-white/10 flex flex-col items-center text-center hover:border-purple-500/50 transition-colors">
                            <Brain className="text-purple-400 mb-2" size={32} />
                            <h4 className="font-bold text-white">Problem Solver</h4>
                            <p className="text-xs text-gray-400 mt-1">Turning complex logic into simple code.</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl border border-white/10 flex flex-col items-center text-center hover:border-cyan-500/50 transition-colors">
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
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex-1 w-full"
                >
                    <div className="relative w-full h-[400px] glass-card rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-10">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full"></div>

                        <div className="grid grid-cols-2 gap-6 w-full relative z-10">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{profile.stats.experienceYears}</h3>
                                <p className="text-gray-400 text-sm">Years of Experience</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{profile.stats.projectsCompleted}</h3>
                                <p className="text-gray-400 text-sm">Projects Completed</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{profile.stats.satisfaction}</h3>
                                <p className="text-gray-400 text-sm">Client Satisfaction</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{profile.stats.availability}</h3>
                                <p className="text-gray-400 text-sm">Support Availability</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

