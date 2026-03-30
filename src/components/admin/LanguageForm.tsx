"use client";

import React, { useState, useEffect } from "react";
import { saveLanguage } from "@/actions/admin";
import { LanguageData } from "@/lib/db";
import { Languages, Type } from "lucide-react";

interface LanguageFormProps {
    initialData?: LanguageData | null;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function LanguageForm({ initialData, onSuccess, onCancel }: LanguageFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<LanguageData>({
        id: "",
        name: "",
        proficiency: "Fluent",
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: `lang_${Date.now()}`,
                name: "",
                proficiency: "Fluent",
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await saveLanguage(formData);
            onSuccess();
        } catch (error) {
            console.error("Failed to save language", error);
            alert("Failed to save language");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Name */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Language</label>
                    <div className="relative group">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. English, Urdu"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Proficiency */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proficiency Level</label>
                    <div className="relative group">
                        <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <select
                            value={formData.proficiency}
                            onChange={e => setFormData({ ...formData, proficiency: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="Native">Native</option>
                            <option value="Bilingual">Bilingual</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Conversational">Conversational</option>
                            <option value="Beginner">Beginner</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
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
                    {loading ? "Saving..." : (initialData ? "Update Language" : "Add Language")}
                </button>
            </div>
        </form>
    );
}
