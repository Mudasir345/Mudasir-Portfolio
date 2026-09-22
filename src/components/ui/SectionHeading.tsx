"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionHeadingProps {
    children: React.ReactNode;
    /** Layout direction (default: center) */
    align?: "center" | "left";
    /** Skip outer vertical padding/margin */
    noMargin?: boolean;
    /** Optional small uppercase label above the heading */
    eyebrow?: string;
    /** Optional supporting line under the heading */
    subtitle?: string;
}

const SectionHeading = ({ children, align = "center", noMargin = false, eyebrow, subtitle }: SectionHeadingProps) => {
    const alignClasses =
        align === "left"
            ? "justify-start items-start text-left"
            : "justify-center items-center text-center";

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className={`w-full flex flex-col ${alignClasses} ${noMargin ? "" : "py-6"}`}
        >
            {eyebrow && (
                <span className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {eyebrow}
                </span>
            )}
            <h2 className={`px-4 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 sm:text-4xl md:text-[40px] tracking-tight ${align === "left" ? "px-0" : ""}`}>
                {children}
            </h2>
            <div className={`w-16 h-1 mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.5)] ${align === "left" ? "ml-1" : ""}`} />
            {subtitle && (
                <p className={`mt-3 max-w-xl text-sm leading-relaxed text-gray-400 ${align === "left" ? "px-0" : "px-4"}`}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
};

export default SectionHeading;
