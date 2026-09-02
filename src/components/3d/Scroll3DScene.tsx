"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Scroll3DObjects } from "./Scroll3DObjects";
import { use3DScroll } from "@/hooks/use3DScroll";

export const Scroll3DScene = () => {
    const scrollState = use3DScroll();
    
    const [settings, setSettings] = useState({
        count: 3200,
        dpr: 1.2,
        interactionScale: 0.0007,
        isMobile: false,
    });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 768px)");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        const updateSettings = () => {
            if (reducedMotion.matches) {
                setSettings({
                    count: 1000,
                    dpr: 1,
                    interactionScale: 0.0002,
                    isMobile: true,
                });
                return;
            }

            if (media.matches) {
                setSettings({
                    count: 1600,
                    dpr: 1,
                    interactionScale: 0.0004,
                    isMobile: true,
                });
                return;
            }

            setSettings({
                count: 3200,
                dpr: 1.25,
                interactionScale: 0.0007,
                isMobile: false,
            });
        };

        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === "visible");
        };

        updateSettings();
        handleVisibilityChange();

        media.addEventListener("change", updateSettings);
        reducedMotion.addEventListener("change", updateSettings);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            media.removeEventListener("change", updateSettings);
            reducedMotion.removeEventListener("change", updateSettings);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 h-full w-full"
            aria-hidden="true"
        >
            <Canvas
                camera={{ position: [0, 0, 1], fov: 75 }}
                dpr={[1, settings.dpr]}
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: "high-performance",
                    precision: "mediump",
                }}
            >
                <Suspense fallback={null}>
                    <Scroll3DObjects
                        count={settings.count}
                        interactionScale={settings.interactionScale}
                        isVisible={isVisible}
                        scrollState={scrollState}
                        isMobile={settings.isMobile}
                    />
                </Suspense>
                <Preload all />
            </Canvas>
        </div>
    );
};

export default Scroll3DScene;
