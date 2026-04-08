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
            className="w-full flex justify-center items-center"
        >
            <h2 className="px-4 py-10 text-center text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 sm:text-4xl md:text-[40px]">
                {children}
            </h2>
        </motion.div>
    );
};

export default SectionHeading;
