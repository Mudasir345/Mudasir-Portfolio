"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
    {
        name: "Sarah Johnson",
        role: "CEO at TechStart",
        review: "Mudasir delivered our e-commerce platform ahead of schedule. The 3D animations are stunning and the performance is top-notch. Highly recommended!",
        stars: 5,
    },
    {
        name: "Michael Chen",
        role: "Product Manager",
        review: "Exceptional skills in React and Next.js. He understood our complex requirements for the automation bot and built a robust solution that saves us hours daily.",
        stars: 5,
    },
    {
        name: "David Smith",
        role: "Founder, Creative Agency",
        review: "The mobile app he built for us is seamless. His attention to detail in UI/UX design really sets him apart from other developers I've worked with.",
        stars: 5,
    },
    {
        name: "Emily Davis",
        role: "Marketing Director",
        review: "Professional, responsive, and incredibly talented. The portfolio site he built for our agency has significantly increased our lead conversion.",
        stars: 5,
    },
];

const Testimonials = () => {
    return (
        <section id="reviews" className="flex flex-col items-center justify-center py-20 relative z-[20]">
            <SectionHeading>Client Reviews</SectionHeading>

            <div className="flex flex-wrap justify-center gap-6 px-4 max-w-[1200px] w-full">
                {reviews.map((stats, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="flex flex-col p-6 glass-card rounded-xl border border-[#7042f861] w-full md:w-[45%] lg:w-[40%] relative"
                    >
                        <Quote className="absolute top-4 right-4 text-[#7042f8] opacity-50" size={40} />

                        <div className="flex flex-row gap-1 mb-4">
                            {[...Array(stats.stars)].map((_, i) => (
                                <Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />
                            ))}
                        </div>

                        <p className="text-gray-300 mb-6 italic min-h-[80px]">"{stats.review}"</p>

                        <div className="mt-auto flex flex-col">
                            <h4 className="text-xl font-bold text-white">{stats.name}</h4>
                            <span className="text-sm text-gray-400">{stats.role}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
