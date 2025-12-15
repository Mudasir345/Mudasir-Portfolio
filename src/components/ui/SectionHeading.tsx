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
            <h2 className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-10 text-center">
                {children}
            </h2>
        </motion.div>
    );
};

export default SectionHeading;
