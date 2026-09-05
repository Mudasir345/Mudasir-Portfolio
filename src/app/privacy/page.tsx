import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Mudasir Choudhry Portfolio — how we handle your data when you use the contact form.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
            {/* Background glow */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

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
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Shield className="text-cyan-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                        <p className="text-gray-400 text-sm mt-1">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
                        <p>
                            Welcome to the portfolio website of <strong className="text-cyan-400">Mudasir Choudhry</strong> ("I", "me", or "my"). I am committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information I collect, how I use it, and what rights you have in relation to it.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">2. Information I Collect</h2>
                        <p>When you use the contact form on this website, I collect:</p>
                        <ul className="list-none space-y-2 mt-2">
                            {["Your full name", "Your email address", "Your phone number (optional)", "The message content you submit"].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3">I do <strong className="text-white">not</strong> collect cookies, track your browsing behaviour, or store any information in databases. No analytics tools (e.g., Google Analytics) are used on this website.</p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">3. How I Use Your Information</h2>
                        <p>The information you provide via the contact form is used <strong className="text-white">solely</strong> to:</p>
                        <ul className="list-none space-y-2 mt-2">
                            {[
                                "Respond to your inquiry or message",
                                "Communicate with you regarding potential projects or collaborations",
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3">Your data is not sold, shared with third parties, or used for marketing purposes.</p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">4. Data Retention</h2>
                        <p>
                            Contact form messages are received as emails and are retained only for as long as necessary to respond to your inquiry. I do not maintain any server-side database of contact submissions.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">5. Third-Party Links</h2>
                        <p>
                            This portfolio may contain links to external websites (e.g., GitHub, LinkedIn, live project demos). I am not responsible for the privacy practices of those sites and encourage you to review their privacy policies independently.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-none space-y-2 mt-2">
                            {[
                                "Request access to any personal data I hold about you",
                                "Request deletion of your personal data",
                                "Withdraw consent at any time by contacting me directly",
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <h2 className="text-xl font-semibold text-white">7. Contact</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact me via the{" "}
                            <Link href="/#contact" className="text-cyan-400 hover:underline">
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
