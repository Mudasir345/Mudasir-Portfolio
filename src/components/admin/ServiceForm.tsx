"use client";

import React, { useState, useEffect } from "react";
import { addService, updateService } from "@/actions/admin";
import { ServiceData, ServiceDetail } from "@/lib/db";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

interface ServiceFormProps {
    onSuccess: () => void;
    initialData?: ServiceData | null;
    onCancel?: () => void;
}

export default function ServiceForm({ onSuccess, initialData, onCancel }: ServiceFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ServiceData>({
        title: "",
        iconType: "Code",
        description: "",
        details: [],
    });

    // Detail Input State
    const [detailName, setDetailName] = useState("");
    const [detailIcon, setDetailIcon] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: "",
                iconType: "Code",
                description: "",
                details: [],
            });
        }
    }, [initialData]);

    const handleAddDetail = () => {
        if (detailName.trim() && detailIcon.trim()) {
            setFormData(prev => ({
                ...prev,
                details: [...prev.details, { name: detailName.trim(), iconUrl: detailIcon.trim() }]
            }));
            setDetailName("");
            setDetailIcon("");
        } else {
            alert("Please provide both name and icon URL");
        }
    };

    const handleRemoveDetail = (index: number) => {
        setFormData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await updateService(initialData.title, formData);
            } else {
                await addService(formData);
            }
            if (!initialData) {
                setFormData({
                    title: "",
                    iconType: "Code",
                    description: "",
                    details: [],
                });
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save service", error);
            alert("Failed to save service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                    {initialData ? "Edit Service" : "Add New Service"}
                </h3>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-white">
                        Cancel
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    required
                    placeholder="Service Title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-[#030014] border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none"
                />

                <select
                    value={formData.iconType}
                    onChange={e => setFormData({ ...formData, iconType: e.target.value })}
                    className="w-full px-4 py-2 bg-[#030014] border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none"
                    title="Select Icon"
                >
                    <option value="Code">Code (Web)</option>
                    <option value="Smartphone">Smartphone (Mobile)</option>
                    <option value="Monitor">Monitor (Desktop)</option>
                    <option value="Server">Server (Backend)</option>
                    <option value="Bot">Bot (Automation)</option>
                </select>
            </div>

            <textarea
                required
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#030014] border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none resize-none"
            />

            {/* Tech Details Input */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">Tech Stack Details (Name + Icon URL)</label>
                <div className="flex flex-col md:flex-row gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="Tech Name (e.g. React)"
                        value={detailName}
                        onChange={e => setDetailName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-[#030014] border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Icon URL (SVG/PNG)"
                        value={detailIcon}
                        onChange={e => setDetailIcon(e.target.value)}
                        className="flex-1 px-4 py-2 bg-[#030014] border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleAddDetail}
                        className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/40"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {formData.details.map((detail, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-2 text-gray-300 border border-white/5">
                            <img src={detail.iconUrl} alt="icon" className="w-4 h-4 object-contain invert" />
                            {detail.name}
                            <button type="button" onClick={() => handleRemoveDetail(i)} className="hover:text-red-400 ml-1">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
                {loading ? "Saving..." : (initialData ? "Update Service" : "Create Service")}
            </button>
        </form>
    );
}
