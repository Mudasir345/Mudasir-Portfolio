"use client";

import React from "react";
import { Mail, Clock, ShieldCheck, Zap } from "lucide-react";
import { ProfileData } from "@/lib/db";

interface HireMeProps {
    profile: ProfileData;
    settings?: any;
}

export default function HireMe({ profile, settings }: HireMeProps) {
    if (settings?.available === false) return null;

    return (
        <section id="hire-me" className="py-20 relative overflow-hidden px-5">
            {/* Background glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="glass-card p-8 md:p-14 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-8">
                    {/* Pulsing indicator tag */}
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Available for New Opportunities
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                            Let's build something{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                                extraordinary
                            </span>{" "}
                            together
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            I am currently open to new contract, freelance, or full-time roles. If you have a project that needs exceptional development skills, modern engineering, and clean design, let's start today!
                        </p>
                    </div>

                    {/* Features Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl border-t border-b border-white/5 py-8 my-2">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <Clock className="text-cyan-400" size={24} />
                            <span className="text-xs font-semibold text-gray-300">Fast Response</span>
                            <span className="text-[10px] text-gray-500">Reply within 24 hours</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <ShieldCheck className="text-purple-400" size={24} />
                            <span className="text-xs font-semibold text-gray-300">Secure Contracts</span>
                            <span className="text-[10px] text-gray-500">Milestone-based delivery</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center col-span-2 md:col-span-1">
                            <Zap className="text-pink-400" size={24} />
                            <span className="text-xs font-semibold text-gray-300">High Performance</span>
                            <span className="text-[10px] text-gray-500">SEO & Speed optimized</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <a
                            href="#contact"
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-[0_0_25px_rgba(112,66,248,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                            Get In Touch
                        </a>
                        <a
                            href={`mailto:${profile.email}`}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                            <Mail size={16} />
                            Send an Email
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
