"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ProfileData } from "@/lib/db";

interface FloatingContactBtnProps {
    profile: ProfileData;
}

export default function FloatingContactBtn({ profile }: FloatingContactBtnProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && profile.whatsapp && (
                <motion.a
                    key="floating-whatsapp"
                    href={profile.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 24, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-600/90 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-colors duration-300 hover:bg-emerald-500 group"
                    title="Chat on WhatsApp"
                    aria-label="Chat on WhatsApp"
                >
                    {/* Pulsing Outer Ring */}
                    <span className="absolute inset-0 rounded-full border border-emerald-400/50 animate-ping opacity-75 pointer-events-none" />

                    <MessageCircle size={26} className="group-hover:rotate-12 transition-transform duration-300" />
                </motion.a>
            )}
        </AnimatePresence>
    );
}
