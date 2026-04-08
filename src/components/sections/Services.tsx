"use client";

import React, { useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import {
    Code, Smartphone, Bot, Server, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceData } from "@/lib/db";

// Helper to map string icon names to components
const IconMap: Record<string, typeof Code> = {
    Code, Smartphone, Bot, Server, Monitor
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as 'spring', stiffness: 100 } },
};

interface ServicesProps {
    initialServices: ServiceData[];
}

const Services = ({ initialServices }: ServicesProps) => {
    const [activeindex, setActiveIndex] = useState<number | null>(null);

    const toggleService = (index: number) => {
        setActiveIndex(activeindex === index ? null : index);
    };

    return (
        <section
            className="flex flex-col items-center justify-center py-20 relative z-[20]"
            id="services"
        >
            <SectionHeading>My Services</SectionHeading>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-10 grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 md:px-10 xl:grid-cols-3"
            >
                {initialServices.map((service, index) => {
                    const IconComponent = IconMap[service.iconType] || Code;

                    return (
                        <motion.div
                            key={index}
                            layout
                            variants={itemVariants}
                            onClick={() => toggleService(index)}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={`glass-card group relative flex h-full w-full cursor-pointer flex-col items-center overflow-hidden rounded-2xl border p-6 shadow-2xl transition-all duration-500 sm:p-8 ${activeindex === index ? "border-cyan-500 bg-[#0d0426]/80 shadow-cyan-500/20" : "border-white/10 hover:border-purple-500/50 hover:shadow-purple-500/20"}`}
                        >
                            {/* Holographic Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${activeindex === index ? "opacity-100" : ""}`} />

                            {/* Glowing Orb Effect */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] group-hover:bg-purple-500/40 transition-colors duration-500"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] group-hover:bg-cyan-500/40 transition-colors duration-500"></div>

                            <motion.div layout className="mb-6 z-10 p-4 rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-colors duration-300">
                                <IconComponent size={32} className="text-gray-300 group-hover:text-cyan-400 transition-colors duration-300" />
                            </motion.div>

                            <motion.h3 layout className="text-2xl font-bold text-white mb-3 z-10 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                                {service.title}
                            </motion.h3>

                            <motion.p layout className="text-gray-400 text-center z-10 text-sm mb-6 leading-relaxed group-hover:text-gray-300 transition-colors">
                                {service.description}
                            </motion.p>

                            {/* Expandable Details Section */}
                            <AnimatePresence>
                                {activeindex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="w-full z-10 overflow-hidden"
                                    >
                                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-4"></div>
                                        <div className="grid w-full grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                                            {service.details.map((detail, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex items-center gap-2 text-gray-300 bg-black/40 p-2.5 rounded-lg border border-white/5 hover:border-cyan-500/50 transition-colors"
                                                >
                                                    <span className="flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 text-[10px] font-bold uppercase text-cyan-200">
                                                        {detail.name.slice(0, 2)}
                                                    </span>
                                                    <span className="text-xs font-medium truncate">{detail.name}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Click Hint */}
                            {!activeindex && activeindex !== index && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute bottom-4 flex flex-col items-center gap-1"
                                >
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold group-hover:text-cyan-400 transition-colors">Explore</span>
                                    <motion.div
                                        animate={{ y: [0, 3, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="w-1 h-1 bg-cyan-500 rounded-full"
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
};

export default Services;
