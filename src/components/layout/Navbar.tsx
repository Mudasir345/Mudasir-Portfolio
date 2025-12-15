"use client";

import React, { useEffect, useState } from "react";
import { Github, Linkedin, Mail, Smartphone } from "lucide-react";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState("about-me");

    if (pathname?.startsWith("/admin")) return null;

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['about-me', 'skills', 'experience', 'education', 'projects', 'services'];

            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Active if top of section is within the top third of viewport
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
    ];

    return (
        <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001417] backdrop-blur-md z-50 px-5 md:px-10 border-b border-[#7042f861]">
            <div className="w-full h-full flex flex-row items-center justify-between m-auto px-[10px]">
                <a
                    href="#about-me"
                    className="h-auto w-auto flex flex-row items-center cursor-pointer group"
                >
                    <span className="font-bold ml-[10px] hidden md:block text-gray-300 group-hover:text-white transition-colors duration-300 transform group-hover:scale-105">
                        Mudasir Choudhry
                    </span>
                </a>

                <div className="w-[600px] h-full flex flex-row items-center justify-between md:mr-20 hidden md:flex">
                    <div className="flex items-center justify-between w-full h-auto border border-[#7042f861] bg-[#0300145e] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200 backdrop-blur-sm">
                        {navLinks.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setActiveSection(item.id)}
                                className={`cursor-pointer transition-all duration-300 hover:scale-110 relative group ${activeSection === item.id ? "text-cyan-400 scale-110" : "hover:text-cyan-400"}`}
                            >
                                {item.name}
                                {/* Active Indicator Line */}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-400 transition-all duration-300 ${activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row gap-5 items-center">
                    <a href="https://github.com/Mudasir345" target="_blank" rel="noopener noreferrer" className="hover:-translate-y-1 transition-transform duration-300">
                        <Github className="text-white cursor-pointer hover:text-[#7042f8] transition-colors" />
                    </a>
                    <a href="https://www.linkedin.com/in/mudasir345/" target="_blank" rel="noopener noreferrer" className="hover:-translate-y-1 transition-transform duration-300">
                        <Linkedin className="text-white cursor-pointer hover:text-[#0077b5] transition-colors" />
                    </a>
                    <a href="mailto:mudasirchoudhry345@gmail.com" className="hover:-translate-y-1 transition-transform duration-300">
                        <Mail className="text-white cursor-pointer hover:text-cyan-400 transition-colors" />
                    </a>
                    <a href="https://wa.me/923047045345" target="_blank" rel="noopener noreferrer" className="group relative hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                        <Smartphone className="relative text-white cursor-pointer hover:text-green-400 transition-colors" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
