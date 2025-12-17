import React from "react";
import { Github, Linkedin, Mail, Smartphone } from "lucide-react";
import { ProfileData } from "@/lib/db";

interface FooterProps {
    profile: ProfileData;
}

const Footer = ({ profile }: FooterProps) => {
    return (
        <div className="w-full bg-[#030014] text-gray-300 py-10 border-t border-[#2A0E61] z-[20] relative">
            <div className="flex flex-col items-center justify-center gap-5">

                <div className="flex flex-row gap-8 items-center justify-center mb-5">
                    {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                            <Github className="text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110" />
                        </a>
                    )}
                    {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110" />
                        </a>
                    )}
                    {profile.email && (
                        <a href={`mailto:${profile.email}`}>
                            <Mail className="text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110" />
                        </a>
                    )}
                    {profile.whatsapp && (
                        <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer">
                            <Smartphone className="text-gray-400 cursor-pointer hover:text-green-400 transition-colors hover:scale-110" />
                        </a>
                    )}
                </div>

                <div className="text-center text-[15px]">
                    &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Footer;
