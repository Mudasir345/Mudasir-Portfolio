"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Search, PenTool, Code, Rocket } from "lucide-react";

const steps = [
    {
        id: 1,
        title: "Discovery",
        description: "Understanding your detailed requirements, goals, and target audience.",
        icon: <Search size={24} />,
        color: "text-blue-400",
        border: "group-hover:border-blue-500/50"
    },
    {
        id: 2,
        title: "Architecture",
        description: "Designing the system structure, database schema, and UI/UX wireframes.",
        icon: <PenTool size={24} />,
        color: "text-purple-400",
        border: "group-hover:border-purple-500/50"
    },
    {
        id: 3,
        title: "Development",
        description: "Writing clean, scalable code and building the solution with modern tech.",
        icon: <Code size={24} />,
        color: "text-cyan-400",
        border: "group-hover:border-cyan-500/50"
    },
    {
        id: 4,
        title: "Launch",
        description: "Testing, optimization, deployment, and final handover with documentation.",
        icon: <Rocket size={24} />,
        color: "text-green-400",
        border: "group-hover:border-green-500/50"
    }
];

export default function Process() {
    return (
        <section className="flex flex-col items-center justify-center py-20 relative z-[20] w-full" id="process">
            <SectionHeading>My Process</SectionHeading>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-10 max-w-[1400px] w-full relative">
                {/* Connecting Line (Only visible on large screens) */}
                <div className="hidden lg:block absolute top-[40%] left-10 right-10 h-[2px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-green-500/30 -z-10" />

                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className={`glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center relative group transition-all duration-300 ${step.border} hover:-translate-y-2`}
                    >
                        {/* Step Number Badge */}
                        <div className="absolute -top-4 bg-[#030014] border border-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg z-20">
                            {step.id}
                        </div>

                        <div className={`p-4 rounded-full bg-white/5 mb-4 ${step.color} border border-white/5 group-hover:bg-white/10 transition-colors`}>
                            {step.icon}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
