"use client";

import React, { useRef, useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Send, Smartphone, User, Mail, Loader2, MapPin, Github, Linkedin } from "lucide-react";
import { sendEmail } from "@/actions/sendEmail";
import { ProfileData } from "@/lib/db";

interface ContactProps {
    profile: ProfileData;
}

const Contact = ({ profile }: ContactProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setPending(true);
        setMessage(null);

        const result = await sendEmail(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Email sent successfully! I will get back to you soon." });
            formRef.current?.reset();
        }
        setPending(false);
    };

    return (
        <section id="contact" className="py-20 relative z-[20]">
            <SectionHeading>Contact Me</SectionHeading>

            <div className="max-w-6xl mx-auto px-5 w-full mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">

                    {/* Left Column: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-8"
                    >
                        <div>
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-4">
                                Let's Connect
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                I'm currently looking for new opportunities, my inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!
                            </p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors group">
                                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/30 group-hover:to-cyan-500/30 text-cyan-400">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-gray-400 text-sm">Email</h4>
                                    <a href={`mailto:${profile.email}`} className="text-white font-medium hover:text-cyan-400 transition-colors">
                                        {profile.email}
                                    </a>
                                </div>
                            </div>

                            {/* Placeholder for Phone/Location if needed, or just social links */}
                            <div className="flex gap-4">
                                {profile.github && (
                                    <a
                                        href={profile.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-105"
                                    >
                                        <Github size={24} />
                                    </a>
                                )}
                                {profile.linkedin && (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-gray-400 hover:text-[#0077b5] transition-all hover:scale-105"
                                    >
                                        <Linkedin size={24} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
                    >
                        <form
                            ref={formRef}
                            action={handleSubmit}
                            className="flex flex-col gap-5"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                        <input
                                            className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/10 bg-black/20 text-white focus:border-cyan-500/50 focus:bg-black/40 focus:outline-none transition-all placeholder:text-gray-600"
                                            name="name"
                                            type="text"
                                            required
                                            maxLength={100}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Phone</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                        <input
                                            className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/10 bg-black/20 text-white focus:border-cyan-500/50 focus:bg-black/40 focus:outline-none transition-all placeholder:text-gray-600"
                                            name="phone"
                                            type="tel"
                                            required
                                            maxLength={20}
                                            placeholder="+1 234..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input
                                        className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/10 bg-black/20 text-white focus:border-cyan-500/50 focus:bg-black/40 focus:outline-none transition-all placeholder:text-gray-600"
                                        name="senderEmail"
                                        type="email"
                                        required
                                        maxLength={500}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Message</label>
                                <textarea
                                    className="w-full h-32 p-4 rounded-lg border border-white/10 bg-black/20 text-white focus:border-cyan-500/50 focus:bg-black/40 focus:outline-none transition-all placeholder:text-gray-600 resize-none"
                                    name="message"
                                    placeholder="Your message..."
                                    required
                                    maxLength={5000}
                                />
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-lg text-sm text-center font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={pending}
                                className="mt-2 group flex items-center justify-center gap-2 h-12 w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:scale-100 shadow-lg shadow-purple-500/25"
                            >
                                {pending ? (
                                    <>
                                        Sending... <Loader2 className="animate-spin" size={18} />
                                    </>
                                ) : (
                                    <>
                                        Send Message <Send className="opacity-70 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
