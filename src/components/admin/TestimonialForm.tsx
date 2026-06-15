"use client";

import React, { useState, useEffect } from "react";
import { saveTestimonial } from "@/actions/admin";
import { TestimonialData } from "@/lib/db";
import { User, Briefcase, MessageSquare, Star } from "lucide-react";

interface TestimonialFormProps {
    initialData?: TestimonialData | null;
    onSuccess: () => void;
    onCancel?: () => void;
}

const PLACEHOLDER_REVIEW_PATTERN = /(lorem ipsum|sample review|placeholder|test review|fake review|example review|client review)/i;

export default function TestimonialForm({ initialData, onSuccess, onCancel }: TestimonialFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TestimonialData>({
        id: "",
        name: "",
        role: "",
        review: "",
        stars: 5,
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: `test_${Date.now()}`,
                name: "",
                role: "",
                review: "",
                stars: 5,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const name = formData.name.trim();
        const role = formData.role.trim();
        const review = formData.review.trim();

        if (!name || !role || !review) {
            alert("Please complete all testimonial fields before saving.");
            return;
        }

        if (PLACEHOLDER_REVIEW_PATTERN.test(review) || PLACEHOLDER_REVIEW_PATTERN.test(name) || PLACEHOLDER_REVIEW_PATTERN.test(role)) {
            alert("Only real, approved client testimonials are allowed. Please remove placeholder or generic text.");
            return;
        }

        setLoading(true);

        try {
            await saveTestimonial({ ...formData, name, role, review });
            onSuccess();
        } catch (error) {
            console.error("Failed to save testimonial", error);
            alert("Failed to save testimonial");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Name */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Name</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. John Smith"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Role/Company */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role / Company</label>
                    <div className="relative group">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. CEO at TechCorp"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, stars: star })}
                            className={`p-2 rounded-lg transition-all ${
                                star <= formData.stars
                                    ? "text-yellow-400 bg-yellow-500/20"
                                    : "text-gray-600 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            <Star size={24} className={star <= formData.stars ? "fill-yellow-400" : ""} />
                        </button>
                    ))}
                    <span className="ml-2 text-gray-400 self-center">{formData.stars} Stars</span>
                </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Review</label>
                <div className="relative group">
                    <MessageSquare className="absolute left-3 top-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <textarea
                        required
                        placeholder="What did the client say about your work..."
                        rows={4}
                        value={formData.review}
                        onChange={e => setFormData({ ...formData, review: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all resize-none focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 bg-white/5 text-gray-400 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
                >
                    {loading ? "Saving..." : (initialData ? "Update Review" : "Add Review")}
                </button>
            </div>
        </form>
    );
}
