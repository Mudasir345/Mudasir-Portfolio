"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children at the end of <body>.
 *
 * Sections set `content-visibility: auto`, which implies layout/paint
 * containment — that turns the section into the containing block for
 * `position: fixed` descendants and also clips them. Full-screen overlays
 * mounted inside such a section therefore land in the middle of the section
 * instead of the viewport. Portaling sidesteps that without giving up the
 * containment benefit.
 *
 * Client-only by design: a portal has no server-rendered markup, and the
 * content behind it is never visible before hydration.
 */
export default function Portal({ children }: { children: ReactNode }) {
    if (typeof document === "undefined") return null;
    return createPortal(children, document.body);
}
