"use client";

import React from "react";
import { Award, ExternalLink } from "lucide-react";
import { CertificateData } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";

interface CertificationsProps {
    certificates: CertificateData[];
}

export default function Certifications({ certificates }: CertificationsProps) {
    if (!certificates || certificates.length === 0) return null;

    return (
        <section id="certifications" className="py-20 relative overflow-hidden px-5">
            {/* Ambient glows */}
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col items-center justify-center mb-10 gap-2">
                    <SectionHeading>Certifications</SectionHeading>
                    <p className="text-gray-400 text-center max-w-2xl">Verifiable accomplishments and professional credentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {certificates.map((cert) => (
                        <div 
                            key={cert.id} 
                            className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-white/5 shadow-lg"
                        >
                            {/* Glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className="flex gap-4">
                                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl h-fit border border-purple-500/20 group-hover:scale-110 transition-transform">
                                    <Award size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                                        {cert.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium">
                                        {cert.issuer}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 text-xs text-gray-500">
                                <span>{cert.date}</span>
                                {cert.link && (
                                    <a
                                        href={cert.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-cyan-400 hover:text-white transition-colors font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 hover:border-cyan-500/30"
                                    >
                                        Verify <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
