"use client";

import React, { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

interface CountUpProps {
    value: string | number;
    duration?: number;
}

export default function CountUp({ value, duration = 1.5 }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    // Parse the value into number and suffix
    const parseValue = (val: string | number) => {
        const str = String(val);
        const match = str.match(/^(\d+)(.*)$/);
        if (match) {
            return {
                to: parseInt(match[1], 10),
                suffix: match[2]
            };
        }
        return {
            to: typeof val === 'number' ? val : 0,
            suffix: ''
        };
    };

    const { to, suffix } = parseValue(value);

    useEffect(() => {
        if (!inView || !ref.current) return;

        const controls = animate(0, to, {
            duration: duration,
            ease: "easeOut",
            onUpdate: (latest) => {
                if (ref.current) {
                    ref.current.textContent = `${Math.floor(latest)}${suffix}`;
                }
            },
        });

        return () => controls.stop();
    }, [inView, to, suffix, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            0{suffix}
        </span>
    );
}
