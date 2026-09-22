"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query. The server and the first client paint both render
 * `defaultValue`, and the effect corrects it immediately after mount — so
 * switching the markup never causes a hydration mismatch.
 */
export function useMediaQuery(query: string, defaultValue = true): boolean {
    const [matches, setMatches] = useState(defaultValue);

    useEffect(() => {
        const list = window.matchMedia(query);
        const onChange = () => setMatches(list.matches);
        onChange();
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
    }, [query]);

    return matches;
}
