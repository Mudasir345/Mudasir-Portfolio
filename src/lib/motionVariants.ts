/**
 * Shared entrance-motion config for all public sections.
 * Baseline taken from the Testimonials redesign — keep every section on these
 * values so the whole page animates cohesively.
 */
export const REVEAL_VIEWPORT = { once: true, margin: "-60px" } as const;

export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export const REVEAL_DURATION = 0.55;

/** Staggered delay per item index, capped so long grids don't wait forever. */
export const staggerDelay = (index: number, step = 0.06, cap = 0.36) =>
    Math.min(index * step, cap);

/** Props spread onto a motion element for the standard fade-up reveal. */
export const fadeUp = (index = 0) =>
    ({
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: REVEAL_DURATION, delay: staggerDelay(index), ease: REVEAL_EASE },
        viewport: REVEAL_VIEWPORT,
    }) as const;
