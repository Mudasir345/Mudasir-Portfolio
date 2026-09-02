"use server";

import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import ResumeDocument from '@/components/resume/ResumeDocument';
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData, CertificateData, LanguageData, InterestData } from '@/lib/db';

interface ResumeData {
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

export async function generateResume(data: ResumeData): Promise<ReadableStream<Uint8Array>> {
    // Since we are using JSX, we need to import React.
    const stream = await renderToStream(<ResumeDocument {...data} />);
    
    // This type assertion is necessary because the type from @react-pdf/renderer
    // is not perfectly compatible with the web standard ReadableStream type.
    // Casting to 'unknown' first tells TypeScript that we are intentionally overriding the type.
    return stream as unknown as ReadableStream<Uint8Array>;
}