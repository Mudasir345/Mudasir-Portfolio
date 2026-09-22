"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { CertificateData } from "@/lib/db";
import SectionHeading from "@/components/ui/SectionHeading";
import Section from "@/components/ui/Section";
import { fadeUp } from "@/lib/motionVariants";

interface CertificationsProps {
    certificates: CertificateData[];
}

export default function Certifications({ certificates }: CertificationsProps) {
    if (!certificates || certificates.length === 0) return null;

    return (
        <Section id="certifications" className="scroll-mt-28">
            <SectionHeading eyebrow="Verified Credentials" subtitle="Verifiable accomplishments and professional credentials">
                Certifications
            </SectionHeading>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert, index) => (
                    <motion.div
                        key={cert.id}
                        {...fadeUp(index)}
                        whileHover={{ y: -6 }}
                        className="card-premium card-premium-hover p-6 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <span className="card-accent-line" aria-hidden="true" />
                        <span className="card-spotlight" aria-hidden="true" />

                        <div className="relative z-10 flex gap-4">
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

                        <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4 mt-6 text-xs text-gray-500">
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
                    </motion.div>
                ))}
            </div>
        </Section>
    );
}
