"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Globe, Github } from "lucide-react";

interface ProjectCardProps {
    src: string;
    title: string;
    description: string;
    techStack?: string[];
    liveUrl?: string;
    githubUrl?: string;
}

const ProjectCard = ({ src, title, description, techStack, liveUrl, githubUrl }: ProjectCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg shadow-lg border border-[#2A0E61] w-full max-w-[350px] glass-card flex flex-col h-full"
        >
            <div className="relative p-4 flex-grow">
                <div className="w-full h-[200px] bg-gray-800 rounded-md mb-4 flex items-center justify-center overflow-hidden group">
                    {src ? (
                        <Image
                            src={src}
                            alt={title}
                            width={1000}
                            height={1000}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="text-gray-500">No Image</div>
                    )}
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">{title}</h1>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    {techStack && (
                        <div className="flex flex-wrap gap-2">
                            {techStack.slice(0, 3).map((tech, i) => (
                                <span key={i} className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-cyan-300 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
                                    {tech}
                                </span>
                            ))}
                            {techStack.length > 3 && (
                                <span className="px-2 py-1 text-[10px] font-semibold text-gray-400 bg-gray-800/50 border border-white/10 rounded-full">
                                    +{techStack.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        {githubUrl && (
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="View Code">
                                <Github size={18} />
                            </a>
                        )}
                        {liveUrl && (
                            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full hover:border-purple-500/60 text-cyan-300 hover:text-white transition-all shadow-lg shadow-purple-500/10" title="Live Demo">
                                <Globe size={18} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};



export default ProjectCard;
