"use client";

import { useEffect, useRef } from "react";

export interface ScrollState {
    progress: number;     // 0.0 to 1.0
    velocity: number;     // Scroll speed
    scrollY: number;      // Pixel scroll Y
    targetProgress: number;
}

export function use3DScroll() {
    const scrollState = useRef<ScrollState>({
        progress: 0,
        velocity: 0,
        scrollY: 0,
        targetProgress: 0,
    });

    const lastScrollY = useRef(0);
    const lastTime = useRef(0);

    useEffect(() => {
        lastTime.current = Date.now();

        const updateScroll = () => {
            const currentY = window.scrollY;
            const now = Date.now();
            const dt = Math.max((now - lastTime.current) / 1000, 0.016);
            
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const targetProg = totalHeight > 0 ? Math.min(Math.max(currentY / totalHeight, 0), 1) : 0;
            
            const rawVelocity = Math.abs(currentY - lastScrollY.current) / dt;
            // Smooth velocity spike cap
            const vel = Math.min(rawVelocity / 1000, 3.0);

            scrollState.current.scrollY = currentY;
            scrollState.current.targetProgress = targetProg;
            scrollState.current.velocity = vel;

            lastScrollY.current = currentY;
            lastTime.current = now;
        };

        const onScroll = () => {
            updateScroll();
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        updateScroll();

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return scrollState;
}
