"use client";

import React, { useEffect, useState } from "react";

export default function ScrollProgressBar() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                setScrollProgress(progress);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none">
            <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(112,66,248,0.5)]"
                style={{ width: `${scrollProgress}%` }}
            />
        </div>
    );
}
