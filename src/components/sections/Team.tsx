"use client";

import React from "react";
import { motion } from "framer-motion";
import { TeamMember } from "@/lib/db";
import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import SectionHeading from "../ui/SectionHeading";

interface TeamProps {
    team: TeamMember[];
}

const Team = ({ team }: TeamProps) => {
    return (
        <section className="relative z-[20] flex flex-col items-center justify-center py-20" id="team">
            <SectionHeading>Meet The Team</SectionHeading>

            <div className="grid w-full max-w-[1200px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 md:px-10 lg:grid-cols-3">
                {team.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="glass-card group mx-auto flex w-full max-w-sm flex-col items-center gap-4 p-6 transition-colors hover:border-cyan-500/50"
                    >
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                            <Image
                                src={member.image || "/profile.jpg"}
                                alt={member.name}
                                width={128}
                                height={128}
                                sizes="128px"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">{member.role}</p>
                        </div>

                        <div className="flex gap-4 mt-2">
                            {member.github && (
                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <Github size={20} />
                                </a>
                            )}
                            {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Team;
