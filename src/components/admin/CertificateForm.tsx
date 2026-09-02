"use client";

import React, { useState, useEffect } from "react";
import { saveCertificate } from "@/actions/admin";
import { CertificateData } from "@/lib/db";
import { Award, Building, Calendar, Link as LinkIcon, Type } from "lucide-react";

interface CertificateFormProps {
    initialData?: CertificateData | null;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function CertificateForm({ initialData, onSuccess, onCancel }: CertificateFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CertificateData>({
        id: "",
        title: "",
        issuer: "",
        date: "",
        link: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: `cert_${Date.now()}`,
                title: "",
                issuer: "",
                date: "",
                link: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await saveCertificate(formData);
            onSuccess();
        } catch (error) {
            console.error("Failed to save certificate", error);
            alert("Failed to save certificate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Certificate Title */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Certificate Title</label>
                    <div className="relative group">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. AWS Certified Solutions Architect"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Issuer */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Issuing Organization</label>
                    <div className="relative group">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. Amazon Web Services"
                            value={formData.issuer}
                            onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date/Year</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. August 2023"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-green-500 outline-none transition-all focus:ring-1 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Link */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credential URL (Optional)</label>
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                        <input
                            type="url"
                            placeholder="https://..."
                            value={formData.link || ""}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none transition-all focus:ring-1 focus:ring-yellow-500"
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
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    {loading ? "Saving..." : (initialData ? "Update Certificate" : "Add Certificate")}
                </button>
            </div>
        </form>
    );
}
