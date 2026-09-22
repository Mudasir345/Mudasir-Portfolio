"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Native CSS scroll-snap carousel — one horizontal rail, swipe on touch,
 * arrow keys on focus. No JS animation, so it stays cheap on mobile GPUs and
 * degrades to plain scrolling under prefers-reduced-motion.
 */
interface SnapRailProps {
    /** One slide per child. */
    children: ReactNode;
    /** Keep smaller than the container so the next slide peeks in. */
    slideWidth?: string;
    gap?: string;
    ariaLabel: string;
    showDots?: boolean;
    showCounter?: boolean;
    showProgress?: boolean;
    onActiveIndexChange?: (index: number) => void;
    className?: string;
}

const SnapRail = ({
    children,
    slideWidth = "82vw",
    gap = "1rem",
    ariaLabel,
    showDots = false,
    showCounter = false,
    showProgress = true,
    onActiveIndexChange,
    className = "",
}: SnapRailProps) => {
    const slides = useMemo(() => React.Children.toArray(children), [children]);
    const count = slides.length;

    const railRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const frameRef = useRef<number | null>(null);
    const [active, setActive] = useState(0);

    const measure = useCallback(() => {
        const rail = railRef.current;
        if (!rail) return;
        const max = rail.scrollWidth - rail.clientWidth;
        if (barRef.current) {
            barRef.current.style.transform = `scaleX(${max > 0 ? rail.scrollLeft / max : 0})`;
        }
        const padding = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
        const edge = rail.getBoundingClientRect().left + padding;
        let best = 0;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < rail.children.length; i++) {
            const distance = Math.abs(rail.children[i].getBoundingClientRect().left - edge);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = i;
            }
        }
        setActive(prev => (prev === best ? prev : best));
    }, []);

    const handleScroll = useCallback(() => {
        if (frameRef.current !== null) return;
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            measure();
        });
    }, [measure]);

    const goTo = useCallback((index: number) => {
        const rail = railRef.current;
        if (!rail || rail.children.length === 0) return;
        const target = Math.min(Math.max(index, 0), rail.children.length - 1);
        const padding = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
        const delta = rail.children[target].getBoundingClientRect().left
            - rail.getBoundingClientRect().left
            - padding;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        rail.scrollTo({ left: rail.scrollLeft + delta, behavior: reduced ? "auto" : "smooth" });
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== railRef.current) return;
        if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
        else if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
        else if (event.key === "Home") { event.preventDefault(); goTo(0); }
        else if (event.key === "End") { event.preventDefault(); goTo(count - 1); }
    };

    // Ref keeps the parent's inline callback out of the effect deps — otherwise
    // a new closure every render would re-notify on every render.
    const changeRef = useRef(onActiveIndexChange);
    useEffect(() => { changeRef.current = onActiveIndexChange; });
    useEffect(() => { changeRef.current?.(active); }, [active]);

    const [resetFrom, setResetFrom] = useState(count);
    if (resetFrom !== count) {
        setResetFrom(count);
        setActive(0);
    }

    useEffect(() => {
        railRef.current?.scrollTo({ left: 0, behavior: "auto" });
        if (barRef.current) barRef.current.style.transform = "scaleX(0)";
    }, [count]);

    useEffect(() => {
        const rail = railRef.current;
        if (!rail || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(measure);
        observer.observe(rail);
        return () => observer.disconnect();
    }, [measure]);

    useEffect(() => () => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    }, []);

    if (count === 0) return null;
    const scrollable = count > 1;

    return (
        <div className={`w-full ${className}`}>
            <div
                ref={railRef}
                role="group"
                aria-roledescription="carousel"
                aria-label={ariaLabel}
                tabIndex={0}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                className="no-scrollbar flex rounded-3xl overflow-x-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400/60"
                style={{
                    gap,
                    scrollSnapType: "x mandatory",
                    overscrollBehaviorX: "contain",
                    WebkitOverflowScrolling: "touch",
                    // overflow-x:auto forces overflow-y to auto, so hover lift and
                    // card shadows need real room inside the padding box or they clip.
                    paddingTop: "24px",
                    paddingBottom: "24px",
                    marginTop: "-24px",
                    marginBottom: "-24px",
                }}
            >
                {slides.map((child, index) => (
                    <div
                        key={index}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${count}`}
                        className="shrink-0"
                        style={{ width: slideWidth, scrollSnapAlign: "start" }}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {scrollable && showProgress && (
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                    <span
                        ref={barRef}
                        className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        style={{ transform: "scaleX(0)" }}
                    />
                </div>
            )}

            {scrollable && showDots && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`Go to slide ${index + 1} of ${count}`}
                                aria-current={index === active}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === active
                                        ? "w-6 bg-gradient-to-r from-purple-400 to-cyan-400"
                                        : "w-2 bg-white/25 hover:bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                    {showCounter && (
                        <span className="text-[11px] font-semibold tabular-nums text-gray-500" aria-hidden="true">
                            {active + 1} of {count}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SnapRail;
