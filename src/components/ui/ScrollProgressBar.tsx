"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

function calcScrollProgress(): number {
  if (typeof document === "undefined" || typeof window === "undefined") return 0;
  const d = document.documentElement;
  const totalHeight = d.scrollHeight - window.innerHeight;
  if (!isFinite(totalHeight) || totalHeight <= 0) return 0;
  const scrolled = window.scrollY || d.scrollTop || 0;
  const raw = (scrolled / totalHeight) * 100;
  if (!isFinite(raw)) return 0;
  return clamp(raw, 0, 100);
}

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafIdRef = useRef<number | null>(null);
  const tickingRef = useRef<boolean>(false);

  const updateProgress = useCallback(() => {
    tickingRef.current = false;
    setScrollProgress(calcScrollProgress());
  }, []);

  const requestTick = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    rafIdRef.current = window.requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    requestTick();

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
    window.addEventListener("orientationchange", requestTick, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
      window.removeEventListener("orientationchange", requestTick);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [requestTick]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none"
      aria-hidden="true"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(scrollProgress)}
    >
      <div
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-[0_0_10px_rgba(112,66,248,0.5)] will-change-transform"
        style={{
          width: `${scrollProgress}%`,
          transform: "translateZ(0)",
          transition: "width 75ms ease-out",
        }}
      />
    </div>
  );
}
