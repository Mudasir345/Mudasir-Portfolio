"use client";

import React, { useRef, useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import { Send, CheckCircle, Smartphone, User, Mail, Loader2 } from "lucide-react";
import { sendEmail } from "@/actions/sendEmail";

const Contact = () => {
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
        <section
            id="contact"
            className="mb-20 sm:mb-28 w-[min(100%,38rem)] text-center mx-auto px-4 relative z-[20]"
        >
            <SectionHeading>Contact Me</SectionHeading>

            <motion.p
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-gray-300 -mt-6 mb-10"
            >
                Please contact me directly at{" "}
                <a className="underline text-cyan-400 font-bold" href="mailto:mudasirchoudhry345@gmail.com">
                    mudasirchoudhry345@gmail.com
                </a>{" "}
                or through this form.
            </motion.p>

            <motion.form
                ref={formRef}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-col dark:text-black gap-3"
                action={handleSubmit}
            >
                <div className="relative">
                    <User className="absolute left-3 top-4 text-gray-400" size={20} />
                    <input
                        className="h-14 px-4 pl-10 rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:outline-none transition-all placeholder-gray-400 w-full"
                        name="name"
                        type="text"
                        required
                        maxLength={100}
                        placeholder="Your Name"
                    />
                </div>

                <div className="relative">
                    <Smartphone className="absolute left-3 top-4 text-gray-400" size={20} />
                    <input
                        className="h-14 px-4 pl-10 rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:outline-none transition-all placeholder-gray-400 w-full"
                        name="phone"
                        type="tel"
                        required
                        maxLength={20}
                        placeholder="Your Phone Number"
                    />
                </div>

                <div className="relative">
                    <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
                    <input
                        className="h-14 px-4 pl-10 rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:outline-none transition-all placeholder-gray-400 w-full"
                        name="senderEmail"
                        type="email"
                        required
                        maxLength={500}
                        placeholder="Your Email"
                    />
                </div>

                <textarea
                    className="h-52 my-3 rounded-lg border border-white/10 bg-white/10 text-white backdrop-blur-sm p-4 focus:bg-white/20 focus:outline-none transition-all placeholder-gray-400"
                    name="message"
                    placeholder="Your message"
                    required
                    maxLength={5000}
                />

                {message && (
                    <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={pending}
                        className="group flex items-center justify-center gap-2 h-[3rem] w-[10rem] bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full outline-none transition-all focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 disabled:scale-100 disabled:opacity-65 shadow-lg shadow-purple-500/30 font-semibold"
                    >
                        {pending ? (
                            <>
                                Sending... <Loader2 className="animate-spin" />
                            </>
                        ) : (
                            <>
                                Submit <Send className="text-white opacity-70 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </section>
    );
};

export default Contact;
