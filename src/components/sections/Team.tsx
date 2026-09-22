"use client";

import React from "react";
import { motion } from "framer-motion";
import { TeamMember } from "@/lib/db";
import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import { fadeUp } from "@/lib/motionVariants";

interface TeamProps {
    team: TeamMember[];
}

const Team = ({ team }: TeamProps) => {
    return (
        <Section id="team" className="scroll-mt-28">
            <SectionHeading eyebrow="The People">Meet The Team</SectionHeading>

            <div className="mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {team.map((member, index) => (
                    <motion.div
                        key={member.id}
                        {...fadeUp(index)}
                        whileHover={{ y: -6 }}
                        className="card-premium card-premium-hover group relative mx-auto flex w-full max-w-sm flex-col items-center gap-4 overflow-hidden p-6"
                    >
                        <span className="card-accent-line" aria-hidden="true" />
                        <span className="card-spotlight" aria-hidden="true" />

                        <div className="relative rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px] shadow-lg shadow-purple-500/20">
                            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background">
                                <Image
                                    src={member.image || "/profile.jpg"}
                                    alt={member.name}
                                    width={128}
                                    height={128}
                                    sizes="128px"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        <div className="relative z-10 text-center">
                            <h3 className="mb-1 text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{member.name}</h3>
                            <p className="text-sm uppercase tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{member.role}</p>
                        </div>

                        <div className="relative z-10 mt-2 flex gap-4">
                            {member.github && (
                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 text-gray-400 hover:text-white transition-colors">
                                    <Github size={20} />
                                </a>
                            )}
                            {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 text-gray-400 hover:text-cyan-400 transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
};

export default Team;
