"use client";

import React from "react";
import { motion } from "framer-motion";

const SectionHeading = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full flex flex-col justify-center items-center py-6"
        >
            <h2 className="px-4 text-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 sm:text-4xl md:text-[40px] tracking-tight">
                {children}
            </h2>
            <div className="w-16 h-1 mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
        </motion.div>
    );
};

export default SectionHeading;
