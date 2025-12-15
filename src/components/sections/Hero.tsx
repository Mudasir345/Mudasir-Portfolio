"use client";

import React from "react";
import ParticleBackground from "../3d/ParticleBackground";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { ProfileData } from "@/lib/db";

interface HeroProps {
    profile: ProfileData;
}

const Hero = ({ profile }: HeroProps) => {
    // Generate sequence for TypeAnimation from roles array
    const rolesSequence = profile.roles.flatMap(role => [role, 1000]);

    return (
        <div className="relative flex flex-col h-screen w-full items-center justify-center" id="about-me">
            <ParticleBackground />

            {/* Container: Stacked on Mobile, Row on Desktop */}
            <div className="z-[20] flex flex-col md:flex-row items-center justify-center md:justify-between w-full max-w-[1200px] gap-10 px-5 mt-20 md:mt-0">

                {/* Profile Image (Left on Desktop) */}
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, -20, 0] // Floating effect
                    }}
                    transition={{
                        duration: 0.8,
                        y: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    className="md:w-1/2 flex justify-center md:justify-start order-1 md:order-1"
                >
                    <div className="relative w-[220px] h-[220px] md:w-[350px] md:h-[350px] rounded-full p-[4px] bg-gradient-to-r from-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/50">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                            <Image
                                src="/profile.png"
                                alt={profile.name}
                                width={350}
                                height={350}
                                className="w-full h-full object-cover object-[50%_20%] hover:scale-110 transition-transform duration-500"
                                priority
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Text Content (Right on Desktop) */}
                <div className="md:w-1/2 flex flex-col items-center md:items-start justify-center text-center md:text-left order-2 md:order-2">
                    <motion.h1
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                    >
                        Hi, I'm <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
                            {profile.name}
                        </span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-2xl md:text-4xl font-bold text-gray-200 pb-2 h-[60px] md:h-[auto]"
                    >
                        <TypeAnimation
                            sequence={rolesSequence}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                        />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-base md:text-xl text-gray-400 my-5 max-w-[600px] leading-relaxed"
                    >
                        {profile.bio}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="flex gap-5"
                    >
                        <a
                            href={`mailto:${profile.email}`}
                            className="py-3 px-8 button-primary text-center text-white cursor-pointer rounded-full border border-[#7042f88b] bg-[#0c051f] hover:bg-gradient-to-r hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-purple-500/20"
                        >
                            Contact Me
                        </a>
                        <a
                            href="#projects"
                            className="py-3 px-8 text-center text-white cursor-pointer rounded-full border border-white/20 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        >
                            View Work
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

