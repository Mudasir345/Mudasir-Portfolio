"use client";

import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { ProfileData } from "@/lib/db";

interface NavbarProps {
    profile: ProfileData;
}

const Navbar = ({ profile }: NavbarProps) => {
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
                        {profile.name}
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


            </div>
        </div>
    );
};

export default Navbar;
