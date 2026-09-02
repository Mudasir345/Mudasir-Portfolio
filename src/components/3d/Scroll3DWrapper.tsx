"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const Scroll3DScene = dynamic(() => import("./Scroll3DScene"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 w-full h-full bg-[#030014] z-0 pointer-events-none" />,
});

export default function Scroll3DWrapper() {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Use requestIdleCallback if supported, falling back to 250ms delay
        // This ensures the main thread finishes 100% of LCP DOM rendering, image paint, and font layout
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            const idleHandle = window.requestIdleCallback(
                () => {
                    setShouldRender(true);
                },
                { timeout: 300 }
            );
            return () => window.cancelIdleCallback(idleHandle);
        } else {
            const timer = setTimeout(() => {
                setShouldRender(true);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!shouldRender) {
        return <div className="fixed inset-0 w-full h-full bg-[#030014] z-0 pointer-events-none" />;
    }

    return <Scroll3DScene />;
}
