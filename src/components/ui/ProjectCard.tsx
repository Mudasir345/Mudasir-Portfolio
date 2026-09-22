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
    onClick?: () => void;
}

const ProjectCard = ({ src, title, description, techStack, liveUrl, githubUrl, onClick }: ProjectCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="card-premium card-premium-hover relative w-full max-w-[400px] md:max-w-[350px] flex flex-col h-full group z-10"
        >
            <span className="card-accent-line" aria-hidden="true" />
            <span className="card-spotlight" aria-hidden="true" />

            {/* Main Clickable Area */}
            <div
                onClick={onClick}
                className="absolute inset-0 z-0 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`View details for ${title}`}
            />

            <div className="relative p-4 flex-grow flex flex-col h-full z-10 pointer-events-none">
                {/* Image Area */}
                <div className="w-full h-[180px] sm:h-[200px] bg-white/5 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative pointer-events-auto border border-white/5">
                    {src ? (
                        src.endsWith(".mp4") || src.endsWith(".webm") || (src.includes("/uploads/") && src.includes("video")) ? (
                            <div className="w-full h-full relative" onClick={onClick}>
                                <video
                                    src={src}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    muted
                                    playsInline
                                    preload="none"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full relative" onClick={onClick}>
                                <Image
                                    src={src}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        )
                    ) : (
                        <div className="text-gray-500 text-sm">No Preview</div>
                    )}

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Details
                        </span>
                    </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-4 leading-relaxed line-clamp-3">{description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    {techStack && (
                        <div className="flex flex-wrap gap-2">
                            {techStack.slice(0, 3).map((tech, i) => (
                                <span key={i} className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                    {tech}
                                </span>
                            ))}
                            {techStack.length > 3 && (
                                <span className="px-2 py-1 text-[10px] font-semibold text-gray-400 bg-white/5 border border-white/10 rounded-full">
                                    +{techStack.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Social links allowed to be interactive */}
                    <div className="flex gap-3 pointer-events-auto z-20">
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
