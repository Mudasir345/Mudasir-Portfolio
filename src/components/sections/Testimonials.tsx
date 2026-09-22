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
import SnapRail from "../ui/SnapRail";
import { useMediaQuery } from "@/lib/useMediaQuery";

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
function TestimonialCard({ item, index, rail = false }: {
    item: TestimonialData;
    index: number;
    rail?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [clipped, setClipped] = useState(false);

    // Refs attach after layout, which is the earliest reliable moment to know
    // whether the clamp actually swallowed text — short reviews get no toggle.
    const measureReview = (el: HTMLParagraphElement | null) => {
        if (el && !expanded) setClipped(el.scrollHeight - el.clientHeight > 2);
    };

    const avatarColor = getAvatarColor(item.name);
    const avatarInner =
        item.image && item.image.trim().length > 0 ? (
            <Image
                src={item.image}
                alt={item.name}
                width={44}
                height={44}
                className="h-full w-full object-cover"
            />
        ) : (
            <span className="text-sm font-extrabold tracking-wide text-white">
                {getInitials(item.name)}
            </span>
        );
    const avatar = (
        <div className="relative shrink-0">
            <span
                className={`absolute -inset-[2px] rounded-full bg-gradient-to-br ${avatarColor} opacity-60 blur-[3px] transition-opacity duration-300 group-hover:opacity-100`}
                aria-hidden="true"
            />
            <div
                className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${avatarColor} ring-2 ring-white/15`}
            >
                {avatarInner}
            </div>
        </div>
    );

    return (
        <motion.article
            key={item.id}
            initial={{ opacity: 0, y: rail ? 16 : 24 }}
            animate={rail ? { opacity: 1, y: 0 } : undefined}
            whileInView={rail ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: rail ? 0.45 : 0.55, delay: rail ? Math.min(index, 5) * 0.05 : Math.min(index * 0.06, 0.36), ease: [0.22, 1, 0.36, 1] }}
            viewport={rail ? undefined : { once: true, margin: "-60px" }}
            whileHover={rail ? undefined : { y: -8 }}
            className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-white/[0.01] shadow-[0_10px_40px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:border-purple-400/40 hover:shadow-[0_24px_70px_-20px_rgba(112,66,248,0.5)] ${rail ? "p-5" : "p-6 sm:p-7"}`}
        >
            {/* top accent line */}
            <span
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent"
                aria-hidden="true"
            />
            {/* hover spotlight */}
            <span
                className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-purple-500/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
            />
            {/* quote watermark */}
            <Quote
                className="pointer-events-none absolute -bottom-3 -left-2 h-28 w-28 text-white/[0.035] transition-colors duration-500 group-hover:text-purple-400/10"
                strokeWidth={1.25}
                aria-hidden="true"
            />

            {/* rating row */}
            <div className="relative mb-5 flex items-center justify-between gap-3">
                <StarPicker value={item.stars} size={17} readOnly />
                {item.stars === 5 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                        <Star size={10} className="fill-yellow-300 text-yellow-300" />
                        Top Rated
                    </span>
                )}
            </div>

            {/* review */}
            <p
                ref={measureReview}
                className={`relative mb-6 text-[15px] leading-relaxed text-gray-200/90 ${rail && !expanded ? "line-clamp-9" : ""}`}
            >
                <span className="mr-0.5 font-serif text-xl leading-none text-purple-300/70">&ldquo;</span>
                {item.review}
                <span className="ml-0.5 font-serif text-xl leading-none text-purple-300/70">&rdquo;</span>
            </p>

            {rail && clipped && (
                <button
                    type="button"
                    onClick={() => setExpanded(value => !value)}
                    aria-expanded={expanded}
                    className="relative -mt-4 mb-6 self-start text-xs font-semibold text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
                >
                    {expanded ? "Show less" : "Read full review"}
                </button>
            )}

            {/* footer */}
            <div className="relative mt-auto flex items-center gap-3 border-t border-white/[0.07] pt-5">
                {avatar}
                <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-1.5">
                        <h4 className="truncate text-sm font-bold leading-tight text-white">
                            {item.name}
                        </h4>
                        {item.isVerified ? (
                            <span
                                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                                title="Verified Review — confirmed by Mudasir to be from a real client"
                            >
                                <Check size={9} strokeWidth={3} />
                            </span>
                        ) : (
                            <span
                                className="inline-flex h-4 shrink-0 items-center justify-center rounded-full border border-gray-500/20 bg-gray-500/10 px-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400"
                                title="Public submission — not yet verified"
                            >
                                Unverified
                            </span>
                        )}
                    </div>
                    <span className="truncate text-[11px] font-medium text-cyan-300/90">
                        {item.role}
                    </span>
                </div>
            </div>
        </motion.article>
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
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const verifiedTestimonials = testimonials.filter(item => {
        const hasName = typeof item.name === "string" && item.name.trim().length > 0;
        const hasReview = typeof item.review === "string" && item.review.trim().length > 0;
        return hasName && hasReview && item.stars >= 4 && item.status === "approved";
    });

    return (
        <section
            id="reviews"
            className="relative z-[20] flex flex-col items-center justify-center overflow-hidden py-20 sm:py-24"
        >
            {/* ambient background */}
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
                <div className="absolute left-1/2 top-[-6rem] h-[380px] w-[720px] max-w-[110vw] -translate-x-1/2 rounded-full bg-purple-600/12 blur-[120px]" />
                <div className="absolute bottom-[-4rem] right-[-3rem] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[110px]" />
            </div>
            <div className="relative z-10 w-full max-w-[1280px] px-4 sm:px-6">
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
                ) : isDesktop ? (
                    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {verifiedTestimonials.map((item, index) => (
                            <TestimonialCard
                                key={item.id}
                                item={item}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <SnapRail
                        ariaLabel={`Client reviews, ${verifiedTestimonials.length} reviews`}
                        slideWidth="min(calc(100% - 2.5rem), 420px)"
                        gap="1rem"
                        showDots
                        showCounter
                        showProgress={false}
                    >
                        {verifiedTestimonials.map((item, index) => (
                            <TestimonialCard
                                key={item.id}
                                item={item}
                                index={index}
                                rail
                            />
                        ))}
                    </SnapRail>
                )}

                {/* ─── Social Proof Footer Row ─────────── */}
                {verifiedTestimonials.length > 0 && (
                    <div className="mt-10 grid w-full grid-cols-3 gap-2 sm:mt-14 sm:gap-5">
                        {[
                            {
                                value: String(verifiedTestimonials.length),
                                label: "Happy Clients",
                                valueClass:
                                    "bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent",
                                icon: <User size={13} className="h-[13px] w-[13px] text-purple-300 sm:h-4 sm:w-4" />,
                            },
                            {
                                value: (
                                    verifiedTestimonials.reduce(
                                        (sum, t) => sum + (t.stars || 0),
                                        0
                                    ) / verifiedTestimonials.length
                                ).toFixed(1),
                                label: "Average Rating",
                                valueClass: "text-yellow-400",
                                icon: <Star size={13} className="h-[13px] w-[13px] fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />,
                            },
                            {
                                value: String(
                                    verifiedTestimonials.filter(t => t.isVerified).length
                                ),
                                label: "Verified Reviews",
                                valueClass:
                                    "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent",
                                icon: <CheckCircle2 size={13} className="h-[13px] w-[13px] text-emerald-400 sm:h-4 sm:w-4" />,
                            },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -4 }}
                                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] px-1.5 py-4 text-center shadow-[0_10px_36px_-18px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-colors duration-300 hover:border-cyan-400/30 sm:rounded-2xl sm:px-6 sm:py-7"
                            >
                                <span
                                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent sm:inset-x-10"
                                    aria-hidden="true"
                                />
                                <div className="mb-1.5 flex items-center justify-center gap-1 sm:mb-3 sm:gap-2">
                                    {stat.icon}
                                    <span className="text-[8px] font-semibold uppercase leading-tight tracking-normal text-gray-400 sm:text-[11px] sm:tracking-widest">
                                        {stat.label}
                                    </span>
                                </div>
                                <div
                                    className={`flex items-center justify-center gap-0.5 text-xl font-extrabold sm:gap-1 sm:text-4xl md:text-5xl ${stat.valueClass}`}
                                >
                                    {stat.value}
                                    {stat.label === "Average Rating" && (
                                        <Star size={13} className="h-[13px] w-[13px] -translate-y-[1px] fill-yellow-400 sm:h-[26px] sm:w-[26px] sm:-translate-y-[3px]" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;
