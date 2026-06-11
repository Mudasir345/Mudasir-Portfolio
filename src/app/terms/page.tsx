import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for Mudasir Choudhry Portfolio — the conditions governing your use of this website.",
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
            {/* Background glow */}
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-5 py-20">
                {/* Back button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-10 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Portfolio
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <FileText className="text-purple-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                        <p className="text-gray-400 text-sm mt-1">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using the portfolio website of <strong className="text-purple-400">Mudasir Choudhry</strong> ("the Website"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use this Website.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">2. Intellectual Property</h2>
                        <p>
                            All content on this Website — including but not limited to text, images, project screenshots, code samples, design elements, and branding — is the intellectual property of Mudasir Choudhry unless otherwise stated.
                        </p>
                        <p>You may <strong className="text-white">not</strong>:</p>
                        <ul className="list-none space-y-2 mt-2">
                            {[
                                "Copy or reproduce any content without explicit written permission",
                                "Use project work or design assets for commercial purposes",
                                "Claim any content on this site as your own",
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">3. Use of the Website</h2>
                        <p>This Website is intended for:</p>
                        <ul className="list-none space-y-2 mt-2">
                            {[
                                "Viewing portfolio projects and professional background",
                                "Contacting Mudasir Choudhry for freelance or employment inquiries",
                                "Downloading the provided CV/Resume for professional evaluation",
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3">
                            You agree not to use this Website for any unlawful purpose or in any way that could damage, disable, or impair the Website.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">4. Disclaimer of Warranties</h2>
                        <p>
                            This Website is provided "as is" without warranties of any kind, express or implied. While I strive to keep information accurate and up to date, I make no guarantees regarding the completeness, accuracy, or availability of the content at any given time.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, Mudasir Choudhry shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, this Website.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">6. External Links</h2>
                        <p>
                            This Website may link to external sites (e.g., GitHub, LinkedIn, live project demos). I am not responsible for the content or practices of those external websites. Use them at your own discretion.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">7. Changes to These Terms</h2>
                        <p>
                            I reserve the right to update or modify these Terms of Service at any time without prior notice. Continued use of the Website after any changes constitutes your acceptance of the revised terms.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">8. Contact</h2>
                        <p>
                            For any questions regarding these Terms, please reach out via the{" "}
                            <Link href="/#contact" className="text-purple-400 hover:underline">
                                contact form
                            </Link>{" "}
                            on this website.
                        </p>
                    </section>
                </div>

                {/* Back to portfolio CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
                    >
                        Back to Portfolio
                    </Link>
                </div>
            </div>
        </div>
    );
}
