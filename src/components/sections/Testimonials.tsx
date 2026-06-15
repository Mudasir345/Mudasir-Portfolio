"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Star, Quote, Check } from "lucide-react";
import { TestimonialData } from "@/lib/db";

interface TestimonialsProps {
    testimonials: TestimonialData[];
}

const colors = [
    "from-purple-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
];

const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const Testimonials = ({ testimonials }: TestimonialsProps) => {
    const verifiedTestimonials = testimonials.filter((item) => {
        const hasName = typeof item.name === "string" && item.name.trim().length > 0;
        const hasReview = typeof item.review === "string" && item.review.trim().length > 0;
        return hasName && hasReview && item.stars >= 4;
    });

    if (verifiedTestimonials.length === 0) {
        return (
            <section id="reviews" className="flex flex-col items-center justify-center py-20 relative z-[20]">
                <SectionHeading>Client Reviews</SectionHeading>
                <div className="mt-10 w-full max-w-[720px] rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center text-gray-300 shadow-lg shadow-black/20">
                    Verified client reviews will appear here once real feedback is added to the portfolio.
                </div>
            </section>
        );
    }

    return (
        <section id="reviews" className="flex flex-col items-center justify-center py-20 relative z-[20]">
            <SectionHeading>Client Reviews</SectionHeading>

            <div className="flex flex-wrap justify-center gap-6 px-4 max-w-[1200px] w-full mt-10">
                {verifiedTestimonials.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="flex flex-col p-6 sm:p-8 glass-card rounded-2xl border border-[#7042f861] w-full md:w-[45%] lg:w-[40%] relative"
                    >
                        <Quote className="absolute top-4 right-4 text-[#7042f8] opacity-20" size={40} />

                        <div className="flex flex-row gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={i < item.stars ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}
                                />
                            ))}
                        </div>

                        <p className="text-gray-300 mb-6 italic text-sm sm:text-base leading-relaxed">"{item.review}"</p>

                        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/5">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(item.name)} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                                {getInitials(item.name)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1">
                                    <h4 className="text-sm font-bold text-white leading-tight truncate">{item.name}</h4>
                                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 shrink-0" title="Verified Review">
                                        <Check size={8} strokeWidth={3} />
                                    </span>
                                </div>
                                <span className="text-[11px] text-cyan-400 font-medium truncate">{item.role}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
