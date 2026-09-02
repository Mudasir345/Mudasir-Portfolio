"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import type { Points as ThreePoints, Group, Mesh, PointLight } from "three";
import * as random from "maath/random/dist/maath-random.esm";
import { ScrollState } from "@/hooks/use3DScroll";
import * as THREE from "three";

interface Scroll3DObjectsProps {
    count: number;
    interactionScale: number;
    isVisible: boolean;
    scrollState: React.RefObject<ScrollState>;
    isMobile: boolean;
}

export const Scroll3DObjects = ({
    count,
    interactionScale,
    isVisible,
    scrollState,
    isMobile,
}: Scroll3DObjectsProps) => {
    const pointsRef = useRef<ThreePoints | null>(null);
    const geometryGroupRef = useRef<Group | null>(null);
    const shapeMeshRef = useRef<Mesh | null>(null);
    const pointLightRef = useRef<PointLight | null>(null);
    const smoothedProgressRef = useRef(0);

    // Particle Sphere positions
    const [sphere] = useState(() =>
        random.inSphere(new Float32Array(count * 3), { radius: 1.3 })
    );

    // Color gradient keyframes for light transitions across sections
    const colors = [
        new THREE.Color("#7c3aed"), // Purple (Hero)
        new THREE.Color("#0891b2"), // Cyan (About / Skills)
        new THREE.Color("#ec4899"), // Pink (Services / Projects)
        new THREE.Color("#4f46e5"), // Indigo (Experience / Education)
        new THREE.Color("#9333ea"), // Deep Purple (Contact)
    ];

    const lerpColor = new THREE.Color();

    useFrame(({ mouse }, delta) => {
        if (!isVisible || !scrollState.current) return;

        const { targetProgress, velocity } = scrollState.current;

        // Smooth progress interpolation
        smoothedProgressRef.current += (targetProgress - smoothedProgressRef.current) * Math.min(delta * 4, 1);
        const currentProgress = smoothedProgressRef.current;

        // 1. Particle Starfield Movement & Warp effect on scroll speed
        if (pointsRef.current) {
            // Constant base rotation
            pointsRef.current.rotation.x -= delta * 0.08;
            pointsRef.current.rotation.y -= delta * 0.1;

            // Mouse interaction
            pointsRef.current.rotation.x += mouse.y * interactionScale;
            pointsRef.current.rotation.y += mouse.x * interactionScale;

            // Scroll position & velocity reactivity
            pointsRef.current.rotation.z = currentProgress * Math.PI * 1.5;
            
            // Warp speed effect on fast scroll
            const scaleSpeed = 1 + velocity * 0.15;
            pointsRef.current.scale.setScalar(
                THREE.MathUtils.lerp(pointsRef.current.scale.x, scaleSpeed, delta * 3)
            );
        }

        // 2. Floating 3D Geometric Ring / Shape (Only on desktop & tablet for max mobile FPS)
        if (geometryGroupRef.current && shapeMeshRef.current) {
            // Position movement based on scroll progress
            const targetY = (0.5 - currentProgress) * 4.5;
            const targetZ = -0.5 + Math.sin(currentProgress * Math.PI * 2) * 0.4;
            const targetRotX = currentProgress * Math.PI * 4;
            const targetRotY = currentProgress * Math.PI * 3 + mouse.x * 0.5;

            geometryGroupRef.current.position.y += (targetY - geometryGroupRef.current.position.y) * delta * 2.5;
            geometryGroupRef.current.position.z += (targetZ - geometryGroupRef.current.position.z) * delta * 2.5;
            
            shapeMeshRef.current.rotation.x += delta * 0.4 + (targetRotX - shapeMeshRef.current.rotation.x) * delta;
            shapeMeshRef.current.rotation.y += delta * 0.5 + (targetRotY - shapeMeshRef.current.rotation.y) * delta;
        }

        // 3. Dynamic Color Shift on Scroll
        if (pointLightRef.current) {
            const colorIndex = currentProgress * (colors.length - 1);
            const index1 = Math.floor(colorIndex);
            const index2 = Math.min(index1 + 1, colors.length - 1);
            const factor = colorIndex - index1;

            lerpColor.copy(colors[index1]).lerp(colors[index2], factor);
            pointLightRef.current.color.copy(lerpColor);
            
            // Light position shift
            pointLightRef.current.position.x = Math.sin(currentProgress * Math.PI * 2) * 2;
            pointLightRef.current.position.y = Math.cos(currentProgress * Math.PI * 2) * 2;
        }
    });

    return (
        <group>
            {/* Dynamic Light Rig */}
            <ambientLight intensity={0.4} />
            <pointLight ref={pointLightRef} position={[2, 2, 2]} intensity={2.5} distance={10} />

            {/* Particle Starfield */}
            <group rotation={[0, 0, Math.PI / 4]}>
                <Points
                    ref={pointsRef}
                    positions={sphere}
                    stride={3}
                    frustumCulled
                >
                    <PointMaterial
                        transparent
                        color="#ffffff"
                        size={isMobile ? 0.0025 : 0.002}
                        sizeAttenuation
                        depthWrite={false}
                    />
                </Points>
            </group>

            {/* Subtle Floating 3D Geometric Ring Mesh (Interactive Scroll Object) */}
            {!isMobile && (
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <group ref={geometryGroupRef} position={[isMobile ? 0 : 1.8, 0, -0.5]}>
                        <mesh ref={shapeMeshRef}>
                            <torusKnotGeometry args={[0.35, 0.08, 64, 12]} />
                            <meshStandardMaterial
                                wireframe
                                color="#a855f7"
                                transparent
                                opacity={0.35}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </mesh>
                    </group>
                </Float>
            )}
        </group>
    );
};
