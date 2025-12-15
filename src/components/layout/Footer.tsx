import React from "react";
import { Github, Linkedin, Mail, Smartphone } from "lucide-react";

const Footer = () => {
    return (
        <div className="w-full bg-[#030014] text-gray-300 py-10 border-t border-[#2A0E61] z-[20] relative">
            <div className="flex flex-col items-center justify-center gap-5">

                <div className="flex flex-row gap-8 items-center justify-center mb-5">
                    <a href="https://github.com/Mudasir345" target="_blank" rel="noopener noreferrer">
                        <Github className="text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110" />
                    </a>
                    <a href="https://www.linkedin.com/in/mudasir345/" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110" />
                    </a>
                    <a href="mailto:mudasirchoudhry345@gmail.com">
                        <Mail className="text-gray-400 cursor-pointer hover:text-white transition-colors hover:scale-110" />
                    </a>
                    <a href="https://wa.me/923047045345" target="_blank" rel="noopener noreferrer">
                        <Smartphone className="text-gray-400 cursor-pointer hover:text-green-400 transition-colors hover:scale-110" />
                    </a>
                </div>

                <div className="text-center text-[15px]">
                    &copy; {new Date().getFullYear()} Mudasir Choudhry. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Footer;
