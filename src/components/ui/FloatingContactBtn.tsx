"use client";

import React, { useEffect, useState } from "react";
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

    if (!isVisible || !profile.whatsapp) return null;

    return (
        <a
            href={profile.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-600/90 text-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-500/30 hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all duration-300 group"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
        >
            {/* Pulsing Outer Ring */}
            <span className="absolute inset-0 rounded-full border border-emerald-400/50 animate-ping opacity-75 pointer-events-none" />

            <MessageCircle size={26} className="group-hover:rotate-12 transition-transform duration-300" />
        </a>
    );
}
