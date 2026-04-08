"use client";

import React from "react";
import ParticleBackground from "../3d/ParticleBackground";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Smartphone } from "lucide-react";
import ResumeDownloadBtn from "../resume/ResumeDownloadBtn";
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData, CertificateData, LanguageData, InterestData, DBData } from '@/lib/db';

interface HeroProps {
    profile: ProfileData;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    projects: ProjectData[];
    certificates: CertificateData[];
    languages: LanguageData[];
    interests: InterestData[];
    settings: DBData["settings"];
}

const Hero = ({ profile, skills, experience, education, projects, certificates, languages, interests, settings }: HeroProps) => {
    // Generate sequence for TypeAnimation from roles array
    const rolesSequence = profile.roles.flatMap(role => [role, 1000]);

    return (
        <div className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden" id="about-me">
            <ParticleBackground />

            {/* Cosmic Glow Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] z-0 animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px] z-0 animate-pulse-slow pointer-events-none delay-1000" />

            {/* Container */}
            <div className="z-[20] flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 px-5 pb-12 pt-32 sm:px-6 md:flex-row md:justify-between md:gap-16 md:px-8 md:pt-40">

                {/* Profile Image (Left on Desktop) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative order-1 mt-16 flex w-full flex-col items-center md:mt-0 md:w-1/2 md:items-start"
                >
                    {/* Profile Image Container with Glow */}
                    <div className="group relative h-[220px] w-[220px] sm:h-[260px] sm:w-[260px] md:h-[400px] md:w-[400px]">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative w-full h-full rounded-full p-[4px] bg-[#0c051f] shadow-2xl shadow-purple-900/40">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                                <Image
                                    src={profile.image || "/profile.jpg"} // Fallback to default
                                    alt={profile.name}
                                    width={400}
                                    height={400}
                                    sizes="(max-width: 768px) 260px, 400px"
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
                <div className="order-2 flex flex-col items-center justify-center text-center md:w-1/2 md:items-start md:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                            Hi, I&apos;m <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 animate-gradient-x bg-[length:200%_auto]">
                                {profile.name}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex h-[72px] items-center justify-center pb-2 text-2xl font-bold text-gray-200 sm:h-[84px] sm:text-3xl md:h-auto md:items-start md:justify-start lg:text-4xl"
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
                        className="my-6 max-w-[600px] text-base font-light leading-relaxed text-gray-400 md:text-lg"
                    >
                        {profile.bio}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="flex w-full flex-wrap justify-center gap-3 sm:gap-4 md:justify-start"
                    >
                        <a
                            href="#contact"
                            className="group relative px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-cyan-500/40 transition-all hover:-translate-y-1 overflow-hidden whitespace-nowrap text-sm sm:text-base"
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
                                certificates={certificates}
                                languages={languages}
                                interests={interests}
                                settings={settings}
                            />
                        </div>

                        <a
                            href="#projects"
                            className="px-6 sm:px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/40 transition-all hover:-translate-y-1 backdrop-blur-sm whitespace-nowrap text-sm sm:text-base"
                        >
                            View Work
                        </a>
                    </motion.div>
                </div>
            </div>


            {/* Seamless Transition Gradient Mask */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030014] to-transparent z-[15] pointer-events-none" />

        </div>
    );
};

export default Hero;

