"use client";

import React from "react";
import { Clock, Layers3, Mail, MessageCircle, Rocket, ShieldCheck, Zap } from "lucide-react";
import { ProfileData, SettingsData } from "@/lib/db";
import { gmailComposeUrl } from "@/lib/contact";

interface HireMeProps {
    profile: ProfileData;
    settings?: SettingsData | null;
}

export default function HireMe({ profile, settings }: HireMeProps) {
    if (settings?.available === false) return null;

    const valuePoints = [
        {
            icon: Layers3,
            title: "Web, Mobile & Automation",
            text: "Next.js, React Native, Flutter, Laravel, AI, and bots",
            color: "text-cyan-400",
        },
        {
            icon: ShieldCheck,
            title: "Clean Delivery",
            text: "Milestones, clear scope, maintainable production code",
            color: "text-purple-400",
        },
        {
            icon: Zap,
            title: "Performance First",
            text: "Speed, SEO, responsive UX, and reliable integrations",
            color: "text-pink-400",
        },
    ];

    return (
        <section id="hire-me" className="relative overflow-hidden px-5 py-20">
            <div className="mx-auto max-w-5xl">
                <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8 md:p-12">
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

                    <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl text-center lg:text-left">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Available for New Opportunities
                            </div>

                            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                                Ready to turn your idea into a polished{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                                    digital product?
                                </span>
                            </h2>

                            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
                                I build production-ready web apps, mobile apps, dashboards, AI integrations, and automation systems with modern engineering, clean UI, and practical delivery planning.
                            </p>

                            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold text-gray-300 lg:justify-start">
                                {["Next.js", "React Native", "Flutter", "Laravel", "AI", "Automation"].map((item) => (
                                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex min-w-[240px] flex-col gap-3">
                            <a
                                href="#contact"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(112,66,248,0.45)] active:scale-[0.98]"
                            >
                                <Rocket size={17} />
                                Start a Project
                            </a>
                            <a
                                href={gmailComposeUrl("Project Inquiry")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
                            >
                                <Mail size={16} />
                                Send an Email
                            </a>
                            {profile.whatsapp && (
                                <a
                                    href={profile.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-7 py-4 text-sm font-semibold text-emerald-300 transition-all hover:scale-[1.02] hover:bg-emerald-500/15 active:scale-[0.98]"
                                >
                                    <MessageCircle size={16} />
                                    WhatsApp
                                </a>
                            )}
                            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500 lg:justify-start">
                                <Clock size={14} className="text-cyan-400" />
                                Usually replies within 24 hours
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/5 pt-8 md:grid-cols-3">
                        {valuePoints.map((point) => (
                            <div key={point.title} className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                    <point.icon className={point.color} size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{point.title}</h3>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{point.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col gap-2 rounded-xl border border-white/5 bg-black/20 p-4 text-center text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-center sm:text-left">
                        <ShieldCheck size={15} className="mx-auto text-emerald-400 sm:mx-0" />
                        <span>
                            Best fit for MVPs, portfolio-grade products, admin dashboards, mobile apps, and workflow automation.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
