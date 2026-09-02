"use client";

import React, { useState, useTransition } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { generateResume } from '@/actions/resume';
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData, CertificateData, LanguageData, InterestData } from '@/lib/db';

interface ResumeDownloadBtnProps {
    profile: ProfileData;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    projects: ProjectData[];
    certificates: CertificateData[];
    languages: LanguageData[];
    interests: InterestData[];
    settings: any;
}

const ResumeDownloadBtn = (props: ResumeDownloadBtnProps) => {
    const [isPending, startTransition] = useTransition();

    const handleDownload = async () => {
        startTransition(async () => {
            try {
                const stream = await generateResume(props);
                
                // Create a new response from the stream
                const response = new Response(stream);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                // Create a temporary link to trigger the download
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${props.profile.name.replace(/\s+/g, '_')}_Resume.pdf`);
                document.body.appendChild(link);
                link.click();

                // Clean up the temporary link and URL
                if(link.parentNode) {
                    link.parentNode.removeChild(link);
                }
                window.URL.revokeObjectURL(url);

            } catch (error) {
                console.error("Failed to generate or download resume:", error);
                alert("Sorry, there was an error generating the resume. Please try again.");
            }
        });
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isPending}
            className="group px-5 sm:px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer z-[50] whitespace-nowrap text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <FileDown size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>Download CV</span>
                </>
            )}
        </button>
    );
};

export default ResumeDownloadBtn;
