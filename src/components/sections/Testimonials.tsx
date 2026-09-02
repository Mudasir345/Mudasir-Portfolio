"use client";

import React, { useState, useTransition } from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Star,
    Quote,
    Check,
    MessageCirclePlus,
    X,
    Send,
    User,
    Briefcase,
    Mail,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { TestimonialData } from "@/lib/db";
import { submitTestimonial } from "@/actions/admin";

interface TestimonialsProps {
    testimonials: TestimonialData[];
}

const colors = [
    "from-purple-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
];

const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

/** ─── Star Rating Picker (reusable) ──────────────────────────── */
function StarPicker({
    value,
    onChange,
    size = 20,
    readOnly = false,
}: {
    value: number;
    onChange?: (n: number) => void;
    size?: number;
    readOnly?: boolean;
}) {
    const [hover, setHover] = useState<number | null>(null);
    const shown = hover ?? value;
    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
            {[1, 2, 3, 4, 5].map(n => {
                const filled = n <= shown;
                return (
                    <button
                        key={n}
                        type={readOnly ? "button" : "button"}
                        disabled={readOnly}
                        onMouseEnter={() => !readOnly && onChange && setHover(n)}
                        onClick={() => !readOnly && onChange?.(n)}
                        className={
                            readOnly
                                ? "cursor-default pointer-events-none"
                                : "transition-transform hover:scale-110 active:scale-95"
                        }
                        aria-label={readOnly ? `${value} out of 5 stars` : `Rate ${n} out of 5`}
                    >
                        <Star
                            size={size}
                            className={
                                filled
                                    ? "fill-yellow-400 text-yellow-400 drop-shadow"
                                    : "text-gray-600"
                            }
                        />
                    </button>
                );
            })}
        </div>
    );
}

/** ─── Individual Review Card ──────────────────────────── */
function TestimonialCard({ item, index }: { item: TestimonialData; index: number }) {
    const avatar =
        item.image && item.image.trim().length > 0 ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                />
            </div>
        ) : (
            <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                    item.name
                )} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}
            >
                {getInitials(item.name)}
            </div>
        );

    return (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="flex flex-col p-6 sm:p-7 glass-card rounded-2xl border border-[#7042f861] w-full md:w-[47%] lg:w-[31%] relative transition-shadow hover:shadow-purple-500/10 hover:shadow-2xl"
        >
            <Quote
                className="absolute top-4 right-4 text-[#7042f8] opacity-20"
                size={36}
            />

            <div className="flex flex-row items-center justify-between mb-4 pr-10">
                <StarPicker value={item.stars} size={16} readOnly />
                {item.stars === 5 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 font-bold uppercase tracking-wide">
                        Top Rated
                    </span>
                )}
            </div>

            <p className="text-gray-300 mb-6 italic text-sm sm:text-[15px] leading-relaxed line-clamp-6">
                &ldquo;{item.review}&rdquo;
            </p>

            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/5">
                {avatar}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white leading-tight truncate">
                            {item.name}
                        </h4>
                        {item.isVerified ? (
                            <span
                                className="inline-flex items-center justify-center w-4 h-4 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30 shrink-0"
                                title="Verified Review — confirmed by Mudasir to be from a real client"
                            >
                                <Check size={9} strokeWidth={3} />
                            </span>
                        ) : (
                            <span
                                className="inline-flex items-center justify-center px-1.5 h-4 text-[9px] font-bold bg-gray-500/10 text-gray-400 rounded-full border border-gray-500/20 shrink-0 uppercase tracking-wide"
                                title="Public submission — not yet verified"
                            >
                                Unverified
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] text-cyan-400 font-medium truncate">
                        {item.role}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/** ─── Public Review Submission Form ──────────────────────────── */
function SubmitReviewForm({ onClose }: { onClose?: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [review, setReview] = useState("");
    const [stars, setStars] = useState(5);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resultMsg, setResultMsg] = useState<{
        ok: boolean;
        text: string;
    } | null>(null);

    const reset = () => {
        setName("");
        setEmail("");
        setRole("");
        setReview("");
        setStars(5);
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        startTransition(async () => {
            const res = (await submitTestimonial(fd)) as any;
            if (res?.errors) {
                setErrors(res.errors);
            } else {
                setErrors({});
            }
            if (res?.ok) {
                setResultMsg({ ok: true, text: res.message });
                reset();
                if (onClose) {
                    setTimeout(() => onClose(), 4500);
                }
            } else {
                setResultMsg({ ok: false, text: res?.message || "Submission failed. Please try again." });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* HONEYPOT — hidden from real users, bots will fill it */}
            <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
                style={{
                    position: "absolute",
                    left: "-10000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                }}
                aria-hidden="true"
            />

            {resultMsg && (
                <div
                    className={`rounded-xl p-4 border flex items-start gap-3 ${
                        resultMsg.ok
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                            : "bg-red-500/10 border-red-500/30 text-red-200"
                    }`}
                >
                    {resultMsg.ok ? (
                        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
                    ) : (
                        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
                    )}
                    <p className="text-sm leading-relaxed">{resultMsg.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Your Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Smith"
                        className={`w-full px-4 py-3 bg-[#030014]/60 border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none focus:ring-1 ${
                            errors.name
                                ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                                : "border-white/10 focus:border-purple-500 focus:ring-purple-500/30"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-400 pl-1">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={12} /> Email *
                        <span className="text-[10px] text-gray-500 normal-case tracking-normal font-medium">
                            (not shown publicly)
                        </span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 bg-[#030014]/60 border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none focus:ring-1 ${
                            errors.email
                                ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                                : "border-white/10 focus:border-cyan-500 focus:ring-cyan-500/30"
                        }`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-400 pl-1">{errors.email}</p>
                    )}
                </div>

                {/* Role / Company */}
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} /> Role or Company Name *
                    </label>
                    <input
                        type="text"
                        name="role"
                        required
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="e.g. CEO at TechCorp or Freelance Designer"
                        className={`w-full px-4 py-3 bg-[#030014]/60 border rounded-xl text-white placeholder-gray-600 transition-all focus:outline-none focus:ring-1 ${
                            errors.role
                                ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                                : "border-white/10 focus:border-purple-500 focus:ring-purple-500/30"
                        }`}
                    />
                    {errors.role && (
                        <p className="text-xs text-red-400 pl-1">{errors.role}</p>
                    )}
                </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Your Rating *
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                    <StarPicker
                        value={stars}
                        onChange={setStars}
                        size={26}
                    />
                    <input type="hidden" name="stars" value={stars} />
                    <span className="text-sm text-gray-400 font-medium">
                        {stars === 1 && "Poor"}
                        {stars === 2 && "Fair"}
                        {stars === 3 && "Good"}
                        {stars === 4 && "Great"}
                        {stars === 5 && "⭐ Excellent"}
                    </span>
                </div>
            </div>

            {/* Review Text */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Your Review *
                </label>
                <textarea
                    name="review"
                    required
                    rows={5}
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Share your real experience. What did Mudasir do well? How was the communication and delivery? How did the final product meet your expectations?"
                    className={`w-full px-4 py-3 bg-[#030014]/60 border rounded-xl text-white placeholder-gray-600 transition-all resize-none focus:outline-none focus:ring-1 ${
                        errors.review
                            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                            : "border-white/10 focus:border-purple-500 focus:ring-purple-500/30"
                    }`}
                />
                <div className="flex items-center justify-between">
                    {errors.review ? (
                        <p className="text-xs text-red-400 pl-1">{errors.review}</p>
                    ) : (
                        <span className="text-[10px] text-gray-500 pl-1">
                            Share your real, personal experience. Generic or placeholder text is not approved.
                        </span>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono">
                        {review.length} / 2000
                    </span>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/10 text-[11px] text-gray-500 leading-relaxed flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-cyan-500 shrink-0" />
                <div>
                    <strong className="text-gray-400">Before you submit:</strong> Your email is
                    never shown publicly and is only used to verify your identity. Every review is
                    manually read and approved before appearing on this page (usually within 24
                    hours). Spam, generic text, or fake reviews are deleted automatically.
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-1">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/5 text-gray-400 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-[2] py-3 px-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="opacity-25"
                                />
                                <path
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    className="opacity-75"
                                />
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={16} /> Submit Review for Approval
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

/** ─── Main Testimonials Section ──────────────────────────── */
const Testimonials = ({ testimonials }: TestimonialsProps) => {
    const [showForm, setShowForm] = useState(false);

    const verifiedTestimonials = testimonials.filter(item => {
        const hasName = typeof item.name === "string" && item.name.trim().length > 0;
        const hasReview = typeof item.review === "string" && item.review.trim().length > 0;
        return hasName && hasReview && item.stars >= 4 && item.status === "approved";
    });

    return (
        <section
            id="reviews"
            className="flex flex-col items-center justify-center py-20 relative z-[20]"
        >
            <div className="w-full max-w-[1280px] px-4 sm:px-6">
                {/* Heading Row + Write a Review CTA */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
                    <div>
                        <SectionHeading align="left" noMargin>
                            Client Reviews
                        </SectionHeading>
                        <p className="mt-3 text-gray-400 text-sm max-w-xl leading-relaxed">
                            Real feedback from real clients. Every review is manually read and
                            verified. Want to share your own experience?{" "}
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold inline-flex items-center gap-1"
                            >
                                Write a review <MessageCirclePlus size={14} />
                            </button>
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/40 text-white rounded-xl hover:from-purple-600/30 hover:to-cyan-600/30 hover:scale-[1.02] transition-all font-semibold text-sm shadow-lg shadow-purple-500/10"
                    >
                        <MessageCirclePlus size={18} /> Share Your Feedback
                    </button>
                </div>

                {/* ─── Expanded Inline Submission Form ─────────── */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mb-12 overflow-hidden"
                    >
                        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-md shadow-2xl shadow-purple-500/10 p-6 sm:p-8">
                            <div className="flex items-start justify-between mb-6 gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <MessageCirclePlus className="text-cyan-400" size={22} />{" "}
                                        Share Your Review
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1.5">
                                        Your feedback matters! Every submission is personally reviewed by Mudasir before going live.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                                    aria-label="Close review form"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <SubmitReviewForm onClose={() => setShowForm(false)} />
                        </div>
                    </motion.div>
                )}

                {/* ─── Reviews Grid ─────────── */}
                {verifiedTestimonials.length === 0 ? (
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center shadow-lg shadow-black/20">
                        <div className="mx-auto w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-5">
                            <Quote size={24} className="text-purple-400 opacity-60" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No verified reviews yet
                        </h3>
                        <p className="text-gray-400 max-w-lg mx-auto leading-relaxed mb-6">
                            Verified client reviews will appear here once real feedback is added.
                            If you worked with Mudasir, be the first to share your story!
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                            >
                                <MessageCirclePlus size={18} /> Be the First to Review
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-5 sm:gap-6 w-full">
                        {verifiedTestimonials.map((item, index) => (
                            <TestimonialCard
                                key={item.id}
                                item={item}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* ─── Social Proof Footer Row ─────────── */}
                {verifiedTestimonials.length > 0 && (
                    <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
                        <div>
                            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                {verifiedTestimonials.length}
                            </div>
                            <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">
                                Happy Clients
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-white/10" />
                        <div>
                            <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 flex items-center justify-center gap-1">
                                {(
                                    verifiedTestimonials.reduce(
                                        (sum, t) => sum + (t.stars || 0),
                                        0
                                    ) / verifiedTestimonials.length
                                ).toFixed(1)}
                                <Star
                                    size={24}
                                    className="fill-yellow-400 translate-y-[-2px]"
                                />
                            </div>
                            <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">
                                Average Rating
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-white/10" />
                        <div>
                            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                {
                                    verifiedTestimonials.filter(t => t.isVerified).length
                                }
                            </div>
                            <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">
                                Verified Reviews
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;
