"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motionVariants";
import { Search, PenTool, Code, Rocket } from "lucide-react";

const steps = [
    {
        id: 1,
        title: "Discovery",
        description: "Understanding your detailed requirements, goals, and target audience.",
        icon: <Search size={24} />,
        color: "text-purple-400"
    },
    {
        id: 2,
        title: "Architecture",
        description: "Designing the system structure, database schema, and UI/UX wireframes.",
        icon: <PenTool size={24} />,
        color: "text-cyan-400"
    },
    {
        id: 3,
        title: "Development",
        description: "Writing clean, scalable code and building the solution with modern tech.",
        icon: <Code size={24} />,
        color: "text-purple-400"
    },
    {
        id: 4,
        title: "Launch",
        description: "Testing, optimization, deployment, and final handover with documentation.",
        icon: <Rocket size={24} />,
        color: "text-cyan-400"
    }
];

export default function Process() {
    return (
        <Section id="process" className="scroll-mt-28">
            <SectionHeading eyebrow="How I Work">My Process</SectionHeading>

            <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {/* Connecting Line (Only visible on large screens) */}
                <div className="hidden lg:block absolute top-[40%] left-10 right-10 h-[2px] bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 -z-10" />

                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        {...fadeUp(index)}
                        className="card-premium card-premium-hover group relative flex flex-col items-center text-center p-6 hover:-translate-y-2 transition-transform duration-300"
                    >
                        <span className="card-accent-line" aria-hidden="true" />
                        {/* Step Number Badge */}
                        <div className={`absolute -top-4 bg-background border border-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold ${step.color} shadow-lg z-20`}>
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
        </Section>
    );
}
