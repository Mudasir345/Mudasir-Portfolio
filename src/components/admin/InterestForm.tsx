"use client";

import React, { useState, useEffect } from "react";
import { saveInterest } from "@/actions/admin";
import { InterestData } from "@/lib/db";
import { Heart, Type } from "lucide-react";

interface InterestFormProps {
    initialData?: InterestData | null;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function InterestForm({ initialData, onSuccess, onCancel }: InterestFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<InterestData>({
        id: "",
        name: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: `int_${Date.now()}`,
                name: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await saveInterest(formData);
            onSuccess();
        } catch (error) {
            console.error("Failed to save interest", error);
            alert("Failed to save interest");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
                {/* Interest Name */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Interest / Hobby</label>
                    <div className="relative group">
                        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. Open Source Contributing, Artificial Intelligence, Chess"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-red-500 outline-none transition-all focus:ring-1 focus:ring-red-500"
                        />
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
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                    {loading ? "Saving..." : (initialData ? "Update Interest" : "Add Interest")}
                </button>
            </div>
        </form>
    );
}
