"use client";

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion() {
  const isClient = typeof window !== 'undefined';
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    isClient ? window.matchMedia(QUERY).matches : false
  );

  useEffect(() => {
    if (!isClient) return;
    const mediaQueryList = window.matchMedia(QUERY);
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [isClient]);

  return prefersReducedMotion;
}