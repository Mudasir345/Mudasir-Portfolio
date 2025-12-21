"use client";

import React from "react";
import ParticleBackground from "../3d/ParticleBackground";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Smartphone, ChevronsDown } from "lucide-react";
import ResumeDownloadBtn from "../resume/ResumeDownloadBtn";
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData } from '@/lib/db';

interface HeroProps {
    profile: ProfileData;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    projects: ProjectData[];
}

const Hero = ({ profile, skills, experience, education, projects }: HeroProps) => {
    // Generate sequence for TypeAnimation from roles array
    const rolesSequence = profile.roles.flatMap(role => [role, 1000]);

    return (
        <div className="relative flex flex-col h-screen w-full items-center justify-center overflow-hidden" id="about-me">
            <ParticleBackground />

            {/* Cosmic Glow Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] z-0 animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px] z-0 animate-pulse-slow pointer-events-none delay-1000" />

            {/* Container */}
            <div className="z-[20] flex flex-col md:flex-row items-center justify-center md:justify-between w-full max-w-[1200px] gap-8 md:gap-16 px-6 pt-24 pb-12 md:py-0">

                {/* Profile Image (Left on Desktop) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full md:w-1/2 flex flex-col items-center md:items-start order-1 md:order-1 relative mt-32 md:mt-0"
                >
                    {/* Profile Image Container with Glow */}
                    <div className="relative w-[240px] h-[240px] md:w-[400px] md:h-[400px] group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative w-full h-full rounded-full p-[4px] bg-[#0c051f] shadow-2xl shadow-purple-900/40">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                                <Image
                                    src={profile.image || "/profile.png"} // Fallback to default
                                    alt={profile.name}
                                    width={400}
                                    height={400}
                                    className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700 ease-in-out"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Icons - Redesigned */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex flex-wrap gap-4 items-center mt-8 justify-center md:justify-start"
                    >
                        {profile.github && (
                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all hover:scale-110 group" aria-label="GitHub">
                                <Github className="text-gray-400 group-hover:text-white transition-colors" size={24} />
                            </a>
                        )}
                        {profile.linkedin && (
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all hover:scale-110 group" aria-label="LinkedIn">
                                <Linkedin className="text-gray-400 group-hover:text-[#0077b5] transition-colors" size={24} />
                            </a>
                        )}
                        {profile.email && (
                            <a href={`mailto:${profile.email}`} className="p-3 bg-white/5 rounded-full hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all hover:scale-110 group" aria-label="Email">
                                <Mail className="text-gray-400 group-hover:text-cyan-400 transition-colors" size={24} />
                            </a>
                        )}
                        {profile.whatsapp && (
                            <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all hover:scale-110 group relative" aria-label="WhatsApp">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Smartphone className="text-gray-400 group-hover:text-green-400 transition-colors relative z-10" size={24} />
                            </a>
                        )}
                    </motion.div>
                </motion.div>

                {/* Text Content (Right on Desktop) */}
                <div className="md:w-1/2 flex flex-col items-center md:items-start justify-center text-center md:text-left order-2 md:order-2">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
                            Hi, I'm <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 animate-gradient-x bg-[length:200%_auto]">
                                {profile.name}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-200 pb-2 h-[60px] md:h-[auto] flex items-center md:items-start justify-center md:justify-start"
                    >
                        <TypeAnimation
                            sequence={rolesSequence}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
                        />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="text-base md:text-lg text-gray-400 my-6 max-w-[600px] leading-relaxed font-light"
                    >
                        {profile.bio}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="flex flex-wrap gap-4 justify-center md:justify-start"
                    >
                        <a
                            href="#contact"
                            className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-cyan-500/40 transition-all hover:-translate-y-1 overflow-hidden"
                        >
                            <span className="relative z-10">Contact Me</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </a>

                        <div className="z-10">
                            <ResumeDownloadBtn
                                profile={profile}
                                skills={skills}
                                experience={experience}
                                education={education}
                                projects={projects}
                            />
                        </div>

                        <a
                            href="#projects"
                            className="px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/40 transition-all hover:-translate-y-1 backdrop-blur-sm"
                        >
                            View Work
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-2 z-[20] flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            >
                <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll Down</span>
                <ChevronsDown className="text-cyan-400" size={24} />
            </motion.div>
        </div>
    );
};

export default Hero;

