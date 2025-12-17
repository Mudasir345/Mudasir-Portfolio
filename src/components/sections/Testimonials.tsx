"use client";

import React from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { TestimonialData } from "@/lib/db";

interface TestimonialsProps {
    testimonials: TestimonialData[];
}

const Testimonials = ({ testimonials }: TestimonialsProps) => {
    if (testimonials.length === 0) return null;

    return (
        <section id="reviews" className="flex flex-col items-center justify-center py-20 relative z-[20]">
            <SectionHeading>Client Reviews</SectionHeading>

            <div className="flex flex-wrap justify-center gap-6 px-4 max-w-[1200px] w-full">
                {testimonials.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="flex flex-col p-6 glass-card rounded-xl border border-[#7042f861] w-full md:w-[45%] lg:w-[40%] relative"
                    >
                        <Quote className="absolute top-4 right-4 text-[#7042f8] opacity-50" size={40} />

                        <div className="flex flex-row gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={20}
                                    className={i < item.stars ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}
                                />
                            ))}
                        </div>

                        <p className="text-gray-300 mb-6 italic min-h-[80px]">"{item.review}"</p>

                        <div className="mt-auto flex flex-col">
                            <h4 className="text-xl font-bold text-white">{item.name}</h4>
                            <span className="text-sm text-gray-400">{item.role}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
