"use client";

import { useState } from "react";
import { Star, User, Briefcase, Mail, Image, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { TestimonialData, ProjectData } from "@/lib/db";
import { saveTestimonial } from "@/actions/admin";
import MediaUploader from "./MediaUploader";

interface TestimonialFormProps {
    initialData?: Partial<TestimonialData>;
    projects?: ProjectData[];
    onClose: () => void;
    onSaved: () => void;
}

const PLACEHOLDER_HINTS = [
    "lorem ipsum",
    "sample review",
    "placeholder",
    "test review",
    "fake review",
    "example review",
];

const STATUSES: { value: TestimonialData["status"]; label: string; icon: any; color: string }[] = [
    { value: "pending", label: "Pending Approval", icon: AlertTriangle, color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" },
    { value: "approved", label: "Approved (Live)", icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
    { value: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400 border-red-500/40 bg-red-500/10" },
    { value: "spam", label: "Marked as Spam", icon: XCircle, color: "text-gray-500 border-gray-500/30 bg-gray-500/10" },
];

function StarPicker({ value, onChange, size = 22 }: { value: number; onChange: (n: number) => void; size?: number }) {
    const [hover, setHover] = useState<number | null>(null);
    const shown = hover ?? value;
    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
            {[1, 2, 3, 4, 5].map(n => {
                const filled = n <= shown;
                return (
                    <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHover(n)}
                        onClick={() => onChange(n)}
                        className="transition-transform hover:scale-110 active:scale-95"
                    >
                        <Star
                            size={size}
                            className={filled ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export default function TestimonialForm({ initialData, projects = [], onClose, onSaved }: TestimonialFormProps) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [email, setEmail] = useState(initialData?.email ?? "");
    const [role, setRole] = useState(initialData?.role ?? "");
    const [image, setImage] = useState(initialData?.image ?? "");
    const [review, setReview] = useState(initialData?.review ?? "");
    const [stars, setStars] = useState(initialData?.stars ?? 5);
    const [status, setStatus] = useState<TestimonialData["status"]>((initialData?.status as any) ?? "approved");
    const [isVerified, setIsVerified] = useState<boolean>(initialData?.isVerified ?? false);
    const [projectId, setProjectId] = useState<string | null>(initialData?.projectId ?? null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPlaceholder = (text: string) => {
        const lower = text.toLowerCase();
        return PLACEHOLDER_HINTS.some(p => lower.includes(p));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !role.trim() || !review.trim()) {
            setError("Please fill in Name, Role/Company, and Review text.");
            return;
        }
        if (stars < 1 || stars > 5) {
            setError("Please select a valid star rating (1-5).");
            return;
        }
        if (isPlaceholder(review) || isPlaceholder(name)) {
            const ok = window.confirm(
                "This text looks like placeholder/example content. Do you REALLY want to save it? (Generic reviews are never shown publicly)"
            );
            if (!ok) return;
        }

        setSaving(true);
        try {
            const payload: Partial<TestimonialData> & { name: string; role: string; review: string; stars: number } = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                name: name.trim(),
                email: email.trim() || undefined,
                role: role.trim(),
                image: image || undefined,
                review: review.trim(),
                stars,
                status: status as any,
                isVerified,
                projectId: projectId || undefined,
            };
            const result = await saveTestimonial(payload);
            if (!(result as any)?.success) {
                throw new Error("Failed to save testimonial");
            }
            onSaved();
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Something went wrong saving the testimonial.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[82vh] overflow-y-auto pr-2 custom-scroll">
            {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 p-3 text-sm flex items-start gap-2">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            {/* Status + Verified Badge Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {STATUSES.map(s => {
                            const Icon = s.icon;
                            const active = status === s.value;
                            return (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setStatus(s.value as any)}
                                    className={`px-3 py-2.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 justify-center transition-all ${
                                        active
                                            ? `${s.color} shadow-inner`
                                            : "text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300 bg-white/[0.02]"
                                    }`}
                                >
                                    <Icon size={12} />
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Verification
                    </label>
                    <div className="h-[calc(100%-1.5rem)] rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            {isVerified ? (
                                <span className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={18} />
                                </span>
                            ) : (
                                <span className="w-9 h-9 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={18} />
                                </span>
                            )}
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-white">
                                    {isVerified ? "Verified Client" : "Unverified Submission"}
                                </div>
                                <div className="text-[11px] text-gray-500 truncate">
                                    {isVerified
                                        ? "Shows green 'Verified' badge on public reviews"
                                        : "Shows 'Unverified' label — use after confirming identity"}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsVerified(v => !v)}
                            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                                isVerified ? "bg-emerald-500" : "bg-gray-600"
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                    isVerified ? "translate-x-6" : "translate-x-0.5"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Client Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="e.g. Sarah Johnson"
                        className="w-full px-3.5 py-2.5 bg-[#030014]/70 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={12} /> Email
                        <span className="text-[10px] normal-case text-gray-500 font-medium">(private)</span>
                    </label>
                    <input
                        type="email"
                        value={email ?? ""}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="sarah@company.com"
                        className="w-full px-3.5 py-2.5 bg-[#030014]/70 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    />
                </div>
            </div>

            {/* Role + Related Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} /> Role / Company *
                    </label>
                    <input
                        type="text"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        required
                        placeholder="e.g. CEO at TechCorp"
                        className="w-full px-3.5 py-2.5 bg-[#030014]/70 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} /> Related Project
                        <span className="text-[10px] normal-case text-gray-500 font-medium">(optional)</span>
                    </label>
                    <select
                        value={projectId ?? ""}
                        onChange={e => setProjectId(e.target.value || null)}
                        className="w-full px-3.5 py-2.5 bg-[#030014]/70 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                    >
                        <option value="" className="bg-[#030014]">— Not linked to a specific project —</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#030014]">
                                {p.title} [{p.category}]
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Profile Image Uploader */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Image size={12} /> Client Profile Image
                    <span className="text-[10px] normal-case text-gray-500 font-medium">(optional)</span>
                </label>
                <MediaUploader
                    folder="misc"
                    currentFile={image ?? ""}
                    onUploadComplete={(path) => setImage(path)}
                    onRemove={() => setImage("")}
                />
            </div>

            {/* Stars + Review textarea */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Star Rating *
                    </label>
                    <StarPicker value={stars} onChange={setStars} />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Review Text *
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">
                        {review.length} / 3000
                    </span>
                </div>
                <textarea
                    value={review}
                    onChange={e => setReview(e.target.value.slice(0, 3000))}
                    rows={6}
                    required
                    placeholder="Genuine, specific feedback about the client experience. What went well? Results delivered? Quality of communication? Tip: Include project context (redesign, mobile app, bug fixes etc.)"
                    className="w-full px-3.5 py-3 bg-[#030014]/70 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 resize-none"
                />
                {isPlaceholder(review) && (
                    <div className="text-[11px] text-yellow-400/80 flex items-start gap-1.5">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        Review looks like generic placeholder text — it will trigger an extra confirmation step on save.
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-semibold"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            {initialData?.id ? "Update Testimonial" : "Add Testimonial"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
