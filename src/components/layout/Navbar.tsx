"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { ProfileData } from "@/lib/db";

interface NavbarProps {
    profile: ProfileData | null;
    settings?: any;
}

const SECTIONS = ['about-me', 'skills', 'experience', 'education', 'projects', 'services'] as const;
type SectionId = typeof SECTIONS[number];

const Navbar = ({ profile, settings }: NavbarProps) => {
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState<SectionId>("about-me");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const rafIdRef = useRef<number | null>(null);
    const tickingRef = useRef<boolean>(false);

    const findActiveSection = useCallback((): SectionId | null => {
        if (typeof document === "undefined") return null;
        const threshold = Math.max(200, Math.min(window.innerHeight * 0.35, 350));
        let best: SectionId | null = null;
        let bestDistance = Infinity;

        for (const section of SECTIONS) {
            const element = document.getElementById(section);
            if (!element) continue;
            const rect = element.getBoundingClientRect();
            const top = rect.top;
            const bottom = rect.bottom;
            const inView = top <= threshold && bottom >= threshold;
            if (inView) return section;
            const center = top + (bottom - top) / 2 - threshold;
            const distance = Math.abs(center);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = section;
            }
        }
        return best;
    }, []);

    const updateActive = useCallback(() => {
        tickingRef.current = false;
        const current = findActiveSection();
        if (current) setActiveSection(current);
    }, [findActiveSection]);

    const requestTick = useCallback(() => {
        if (tickingRef.current) return;
        tickingRef.current = true;
        rafIdRef.current = window.requestAnimationFrame(updateActive);
    }, [updateActive]);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        requestTick();
        window.addEventListener("scroll", requestTick, { passive: true });
        window.addEventListener("resize", requestTick, { passive: true });
        window.addEventListener("orientationchange", requestTick, { passive: true });

        return () => {
            window.removeEventListener("scroll", requestTick);
            window.removeEventListener("resize", requestTick);
            window.removeEventListener("orientationchange", requestTick);
            if (rafIdRef.current !== null) {
                window.cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [requestTick]);

    const navLinks: Array<{ name: string; href: string; id: SectionId }> = [
        { name: 'About', href: '#about-me', id: 'about-me' },
        { name: 'Skills', href: '#skills', id: 'skills' },
        { name: 'Services', href: '#services', id: 'services' },
        { name: 'Experience', href: '#experience', id: 'experience' },
        { name: 'Education', href: '#education', id: 'education' },
        { name: 'Projects', href: '#projects', id: 'projects' },
    ];

    if (pathname?.startsWith("/admin")) return null;

    return (
        <div className="w-full fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001417] backdrop-blur-md z-50 px-5 md:px-10 border-b border-[#7042f861]">
            <div className="w-full h-[65px] flex flex-row items-center justify-between m-auto px-[10px]">
                <a
                    href="#about-me"
                    className="h-auto w-auto flex flex-row items-center cursor-pointer group"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <span className="font-bold ml-[10px] text-gray-300 group-hover:text-white transition-colors duration-300 transform group-hover:scale-105 flex items-center gap-2">
                        {profile?.name ?? "Portfolio"}
                        {settings?.available !== false && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] relative">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Available
                            </span>
                        )}
                    </span>
                </a>

                <div className="w-[600px] h-full flex flex-row items-center justify-center md:mr-0 hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-between w-full h-auto border border-[#7042f861] bg-[#0300145e] px-[20px] py-[10px] rounded-full text-gray-200 backdrop-blur-sm">
                        {navLinks.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveSection(item.id)}
                                className={`cursor-pointer transition-all duration-300 hover:scale-110 relative group ${activeSection === item.id ? "text-cyan-400 scale-110" : "hover:text-cyan-400"}`}
                            >
                                {item.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-400 transition-all duration-300 ${activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                            </a>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-navigation"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden pb-4">
                    <div className="rounded-2xl border border-[#7042f861] bg-[#030014f2] backdrop-blur-xl px-4 py-4 shadow-2xl shadow-[#2A0E61]/40">
                        <nav
                            id="mobile-navigation"
                            className="flex flex-col gap-2"
                        >
                            {navLinks.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                        activeSection === item.id
                                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                            : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                                    }`}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
