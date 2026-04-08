"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import type { Points as ThreePoints } from "three";
import * as random from "maath/random/dist/maath-random.esm";

interface StarBackgroundProps {
    count: number;
    interactionScale: number;
    isVisible: boolean;
}

const StarBackground = ({ count, interactionScale, isVisible }: StarBackgroundProps) => {
    const ref = useRef<ThreePoints | null>(null);
    const [sphere] = useState(() =>
        random.inSphere(new Float32Array(count * 3), { radius: 1.2 })
    );

    useFrame(({ mouse }, delta) => {
        if (!ref.current || !isVisible) return;

        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;

        ref.current.rotation.x += mouse.y * interactionScale;
        ref.current.rotation.y += mouse.x * interactionScale;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points
                ref={ref}
                positions={sphere}
                stride={3}
                frustumCulled
            >
                <PointMaterial
                    transparent
                    color="#ffffff"
                    size={0.002}
                    sizeAttenuation
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

const ParticleBackground = () => {
    const [settings, setSettings] = useState({
        count: 3200,
        dpr: 1.2,
        interactionScale: 0.0007,
    });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 768px)");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        const updateSettings = () => {
            if (reducedMotion.matches) {
                setSettings({
                    count: 1200,
                    dpr: 1,
                    interactionScale: 0.00025,
                });
                return;
            }

            if (media.matches) {
                setSettings({
                    count: 1800,
                    dpr: 1,
                    interactionScale: 0.00045,
                });
                return;
            }

            setSettings({
                count: 3200,
                dpr: 1.2,
                interactionScale: 0.0007,
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
        <div className="pointer-events-none fixed inset-0 z-[1] h-auto w-full" aria-hidden="true">
            <Canvas
                camera={{ position: [0, 0, 1] }}
                dpr={[1, settings.dpr]}
                gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            >
                <Suspense fallback={null}>
                    <StarBackground
                        count={settings.count}
                        interactionScale={settings.interactionScale}
                        isVisible={isVisible}
                    />
                </Suspense>
                <Preload all />
            </Canvas>
        </div>
    );
};

export default ParticleBackground;
