"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectData } from "@/lib/db";
import { X, ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ProjectModalProps {
    project: ProjectData | null;
    onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"overview" | "features" | "challenges">("overview");

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!project) return null;

    // Combine main image with gallery for a complete slideshow
    const galleryImages = [
        { url: project.image, type: project.mediaType || "image" },
        ...(project.gallery || [])
    ];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <AnimatePresence>
            {project && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto sm:overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
                        className="relative w-full max-w-7xl bg-[#0d0426]/95 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(112,66,248,0.15)] flex flex-col lg:flex-row max-h-[92vh] lg:h-[90vh] min-h-[600px] z-[110]"
                    >
                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 z-[60] p-2 bg-black/40 text-white rounded-full hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-md"
                        >
                            <X size={20} />
                        </motion.button>

                        {/* Left Side: Media Gallery */}
                        <div className="w-full lg:w-[55%] h-[250px] sm:h-[300px] lg:h-full relative bg-black flex items-center justify-center group overflow-hidden shrink-0">

                            {/* Gradient Overlay for Cinematic Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative w-full h-full"
                                >
                                    {galleryImages[currentImageIndex].type === "video" ? (
                                        <video
                                            src={galleryImages[currentImageIndex].url}
                                            className="w-full h-full object-contain bg-black"
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                        />
                                    ) : (
                                        <Image
                                            src={galleryImages[currentImageIndex].url}
                                            alt={project.title}
                                            fill
                                            className="object-cover lg:object-contain"
                                            priority
                                            unoptimized
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {galleryImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 z-20"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 z-20"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Dots Indicator */}
                            {galleryImages.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
                                    {galleryImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-gradient-to-r from-purple-500 to-cyan-500 w-8 shadow-glow' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Content & Details */}
                        <div className="w-full lg:w-[45%] flex flex-col bg-[#0d0426]/50 lg:border-l border-white/10 relative">
                            {/* Content Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5 pointer-events-none" />

                            {/* Header */}
                            <div className="p-5 md:px-8 md:py-6 pb-3 border-b border-white/5 relative z-10 shrink-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3 mb-4"
                                >
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 uppercase tracking-wider shadow-sm shadow-cyan-900/20">
                                        {project.category}
                                    </span>
                                    {project.mediaType === "video" && (
                                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 uppercase tracking-wider shadow-sm shadow-purple-900/20">
                                            Video Demo
                                        </span>
                                    )}
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                                >
                                    {project.title}
                                </motion.h2>
                            </div>

                            {/* Tabs */}
                            <div className="flex px-5 md:px-8 border-b border-white/5 gap-4 md:gap-8 relative z-10 shrink-0 overflow-x-auto no-scrollbar">
                                {(["overview", "features", "challenges"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-3 text-sm font-medium capitalize relative transition-colors whitespace-nowrap ${activeTab === tab ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeModalTab"
                                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar relative z-10">
                                <AnimatePresence mode="wait">
                                    {activeTab === "overview" && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="text-gray-300 leading-relaxed text-base lg:text-lg font-light whitespace-pre-wrap">
                                                {project.description}
                                            </div>

                                            <div>
                                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400">
                                                    Tech Stack
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.techStack.map((tech, idx) => (
                                                        <motion.span
                                                            key={tech}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            whileHover={{ scale: 1.05, borderColor: "rgba(34, 211, 238, 0.5)", backgroundColor: "rgba(34, 211, 238, 0.1)" }}
                                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 font-medium cursor-default transition-colors duration-300"
                                                        >
                                                            {tech}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "features" && (
                                        <motion.div
                                            key="features"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-4"
                                        >
                                            {project.features?.map((feature, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-colors group"
                                                >
                                                    <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                                    </div>
                                                    <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                                                </motion.div>
                                            )) || <p className="text-gray-500 italic">No specific features listed.</p>}
                                        </motion.div>
                                    )}

                                    {activeTab === "challenges" && (
                                        <motion.div
                                            key="challenges"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-4"
                                        >
                                            {project.challenges?.map((challenge, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-colors group"
                                                >
                                                    <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                                    </div>
                                                    <span className="text-gray-300 text-sm leading-relaxed">{challenge}</span>
                                                </motion.div>
                                            )) || <p className="text-gray-500 italic">No specific challenges listed.</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-5 md:px-8 md:py-6 border-t border-white/5 bg-[#0d0426]/80 backdrop-blur-md z-10 flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0">
                                {project.liveUrl && (
                                    <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(112,66,248,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 group"
                                    >
                                        <ExternalLink size={20} className="group-hover:rotate-45 transition-transform" />
                                        Live Demo
                                    </a>
                                )}
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 md:py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all transform hover:-translate-y-1 active:scale-95 group"
                                    >
                                        <Github size={20} className="group-hover:scale-110 transition-transform" />
                                        Source Code
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProjectModal;
