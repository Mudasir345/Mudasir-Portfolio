import React from "react";

interface SectionProps {
    id?: string;
    children: React.ReactNode;
    className?: string;
    /** Show ambient purple/cyan gradient blobs behind the content (default: true) */
    ambient?: boolean;
}

/**
 * Unified section shell for the public site — consistent container width,
 * vertical rhythm, and optional ambient background blobs (Testimonials baseline).
 */
const Section = ({ id, children, className = "", ambient = true }: SectionProps) => {
    return (
        <section
            id={id}
            className={`relative z-[20] flex flex-col items-center justify-center py-20 sm:py-24 ${ambient ? "overflow-hidden" : ""} ${className}`}
        >
            {ambient && (
                <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
                    <div className="absolute left-1/2 top-[-6rem] h-[380px] w-[720px] max-w-[110vw] -translate-x-1/2 rounded-full bg-purple-600/12 blur-[120px]" />
                    <div className="absolute bottom-[-4rem] right-[-3rem] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[110px]" />
                </div>
            )}
            <div className="relative z-10 w-full max-w-[1280px] px-4 sm:px-6">
                {children}
            </div>
        </section>
    );
};

export default Section;
