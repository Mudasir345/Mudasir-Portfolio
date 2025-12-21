import React from "react";
import { Github, Linkedin, Mail, Smartphone } from "lucide-react";
import { ProfileData } from "@/lib/db";

interface FooterProps {
    profile: ProfileData;
}

const Footer = ({ profile }: FooterProps) => {
    return (
        <footer className="w-full bg-[#030014] text-gray-300 pt-20 pb-10 border-t border-[#2A0E61] z-[20] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 relative z-10">
                {/* Brand Column */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
                        {profile.name}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Building digital experiences that merge creativity with technology. Let's create something extraordinary together.
                    </p>
                    <div className="flex gap-4 mt-2">
                        {profile.github && (
                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                        )}
                        {profile.linkedin && (
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-[#0077b5] transition-colors">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {profile.email && (
                            <a href={`mailto:${profile.email}`} className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-colors">
                                <Mail size={20} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-white font-semibold text-lg">Quick Links</h3>
                    <div className="flex flex-col gap-2 text-sm text-gray-400">
                        <a href="#about-me" className="hover:text-cyan-400 transition-colors w-fit">About Me</a>
                        <a href="#projects" className="hover:text-cyan-400 transition-colors w-fit">Projects</a>
                        <a href="#services" className="hover:text-cyan-400 transition-colors w-fit">Services</a>
                        <a href="#contact" className="hover:text-cyan-400 transition-colors w-fit">Contact</a>
                    </div>
                </div>

                {/* Newsletter / Contact */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-white font-semibold text-lg">Stay Updated</h3>
                    <p className="text-gray-400 text-sm">
                        Interested in collaboration? Drop me a line directly.
                    </p>
                    <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-cyan-500/30 transition-all text-sm font-medium text-white"
                    >
                        <Mail size={16} />
                        {profile.email}
                    </a>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                <div>
                    &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
                </div>
                <div className="flex gap-6">
                    <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
