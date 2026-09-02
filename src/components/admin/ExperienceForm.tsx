"use client";

import React, { useState, useEffect } from "react";
import { saveExperience } from "@/actions/admin";
import { ExperienceData } from "@/lib/db";
import { Briefcase, Code, Building, Calendar, FileText, Type } from "lucide-react";

interface ExperienceFormProps {
    initialData?: ExperienceData | null;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function ExperienceForm({ initialData, onSuccess, onCancel }: ExperienceFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ExperienceData>({
        id: "",
        title: "",
        company: "",
        period: "",
        description: "",
        iconType: "Briefcase",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: `exp_${Date.now()}`,
                title: "",
                company: "",
                period: "",
                description: "",
                iconType: "Briefcase",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await saveExperience(formData);
            onSuccess();
        } catch (error) {
            console.error("Failed to save experience", error);
            alert("Failed to save experience");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Title */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</label>
                    <div className="relative group">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. Full Stack Developer"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</label>
                    <div className="relative group">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. Tech Solutions Inc."
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Period */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Period</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. 2022 - Present"
                            value={formData.period}
                            onChange={e => setFormData({ ...formData, period: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-green-500 outline-none transition-all focus:ring-1 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Icon Type */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Icon Type</label>
                    <div className="relative group">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                        <select
                            value={formData.iconType}
                            onChange={e => setFormData({ ...formData, iconType: e.target.value as "Briefcase" | "Code" })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="Briefcase">💼 Briefcase (Management)</option>
                            <option value="Code">💻 Code (Technical)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <div className="relative group">
                    <FileText className="absolute left-3 top-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <textarea
                        required
                        placeholder="Describe your role and achievements..."
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    {loading ? "Saving..." : (initialData ? "Update Experience" : "Add Experience")}
                </button>
            </div>
        </form>
    );
}
