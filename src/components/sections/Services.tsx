"use client";

import React, { useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import {
    Code, Smartphone, Bot, Server, Monitor,
    Atom, Zap, FileCode, Database, Cloud, Box,
    Terminal, Cpu, Globe, Layers, Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";
import { ServiceData } from "@/lib/db";

// Helper to map string icon names to components
const IconMap: { [key: string]: any } = {
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
                className="flex flex-wrap justify-center gap-10 px-10 max-w-[1400px]"
            >
                {initialServices.map((service, index) => {
                    const IconComponent = IconMap[service.iconType] || Code;

                    return (
                        <motion.div
                            key={index}
                            layout
                            variants={itemVariants}
                            onClick={() => toggleService(index)}
                            className={`flex flex-col items-center p-8 glass-card rounded-xl border w-full md:w-[45%] lg:w-[28%] transition-colors duration-300 relative group overflow-hidden cursor-pointer ${activeindex === index ? "border-cyan-500 bg-[#0d0426]" : "border-[#7042f861]"}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 transition-opacity duration-300 ${activeindex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />

                            <motion.div layout className="mb-4 z-10">
                                <IconComponent size={40} className="text-secondary" />
                            </motion.div>
                            <motion.h3 layout className="text-2xl font-bold text-white mb-2 z-10 text-center">
                                {service.title}
                            </motion.h3>
                            <motion.p layout className="text-gray-300 text-center z-10 text-sm mb-4">
                                {service.description}
                            </motion.p>

                            {/* Expandable Details Section */}
                            <AnimatePresence>
                                {activeindex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full z-10"
                                    >
                                        <div className="w-full h-[1px] bg-gray-700 my-3"></div>
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            {service.details.map((detail, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5 hover:border-cyan-500/50 transition-colors">
                                                    <div className="relative w-5 h-5">
                                                        <Image
                                                            src={detail.iconUrl}
                                                            alt={detail.name}
                                                            fill
                                                            className={`object-contain ${detail.name === 'Next.js' ? 'invert' : ''}`} // Invert Next.js black logo
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium">{detail.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Click Hint */}
                            {!activeindex && activeindex !== index && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    className="absolute bottom-2 text-[10px] text-gray-500 uppercase tracking-widest mt-2"
                                >
                                    Tap to view stack
                                </motion.span>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
};

export default Services;
