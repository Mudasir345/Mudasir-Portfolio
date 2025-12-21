"use client";

import React, { useEffect, useState } from "react";
import { Github, Linkedin, Mail, Smartphone, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { ProfileData } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
    profile: ProfileData;
}

const Navbar = ({ profile }: NavbarProps) => {
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState("about-me");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (pathname?.startsWith("/admin")) return null;

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['about-me', 'skills', 'experience', 'education', 'projects', 'services', 'contact'];

            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 300 && rect.bottom >= 300;
                }
                return false;
            });

            if (current) {
                setActiveSection(current);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: 'About', href: '#about-me', id: 'about-me' },
        { name: 'Skills', href: '#skills', id: 'skills' },
        { name: 'Services', href: '#services', id: 'services' },
        { name: 'Experience', href: '#experience', id: 'experience' },
        { name: 'Education', href: '#education', id: 'education' },
        { name: 'Projects', href: '#projects', id: 'projects' },
        { name: 'Contact', href: '#contact', id: 'contact' },
    ];

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001417] backdrop-blur-md z-50 px-5 md:px-10 border-b border-[#7042f861] transition-all duration-300">
            <div className="w-full h-full flex flex-row items-center justify-between m-auto px-[10px]">
                <a
                    href="#about-me"
                    className="h-auto w-auto flex flex-row items-center cursor-pointer group"
                >
                    <span className="font-bold ml-[10px] block text-gray-300 group-hover:text-white transition-colors duration-300 transform group-hover:scale-105">
                        {profile.name}
                    </span>
                </a>

                {/* Desktop Menu */}
                <div className="w-full h-full hidden md:flex flex-row items-center justify-center">
                    <div className="flex items-center justify-between w-auto border border-[#7042f861] bg-[#0300145e] px-[20px] py-[10px] rounded-full text-gray-200 backdrop-blur-sm gap-8">
                        {navLinks.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveSection(item.id)}
                                className={`cursor-pointer transition-all duration-300 hover:scale-110 relative group text-sm font-medium ${activeSection === item.id ? "text-cyan-400 scale-110" : "hover:text-cyan-400"}`}
                            >
                                {item.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-400 transition-all duration-300 ${activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center">
                    <button
                        onClick={toggleMenu}
                        className="text-gray-300 hover:text-white transition-colors p-2"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden absolute top-[65px] left-0 w-full bg-[#030014]/95 backdrop-blur-xl border-b border-[#7042f861] overflow-hidden shadow-2xl"
                    >
                        <div className="flex flex-col items-center py-8 gap-6">
                            {navLinks.map((item, idx) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`text-lg font-medium transition-colors ${activeSection === item.id ? "text-cyan-400" : "text-gray-300 hover:text-white"}`}
                                >
                                    {item.name}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;
