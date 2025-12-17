"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData } from '@/lib/db';
import { FileDown, Loader2 } from 'lucide-react';

// Dynamically import PDFDownloadLink to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <button className="px-6 py-3 rounded-full bg-white/10 text-white flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Loading PDF...</button>,
    }
);

import ResumeDocument from './ResumeDocument';

interface ResumeDownloadBtnProps {
    profile: ProfileData;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    projects: ProjectData[];
}

const ResumeDownloadBtn = (props: ResumeDownloadBtnProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <PDFDownloadLink
            document={<ResumeDocument {...props} />}
            fileName={`${props.profile.name.replace(/\s+/g, '_')}_Resume.pdf`}
            className="group px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer z-[50]"
        >
            {({ blob, url, loading, error }) => (
                <>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <FileDown size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />}
                    {loading ? "Generating..." : "Download CV"}
                </>
            )}
        </PDFDownloadLink>
    );
};

export default ResumeDownloadBtn;
