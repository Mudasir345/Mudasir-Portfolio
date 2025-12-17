"use client";

import React, { useState, useEffect } from "react";
import { updateProfile } from "@/actions/admin";
import { ProfileData } from "@/lib/db";
import { motion } from "framer-motion";
import { Plus, X, User, Mail, Github, Linkedin, Phone, FileText, Briefcase, Award, Clock, CheckCircle, FolderKanban } from "lucide-react";
import MediaUploader from "./MediaUploader";

interface ProfileFormProps {
    initialData: ProfileData;
    onSuccess: () => void;
}

export default function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProfileData>(initialData);
    const [roleInput, setRoleInput] = useState("");

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleAddRole = () => {
        if (roleInput.trim() && !formData.roles.includes(roleInput.trim())) {
            setFormData(prev => ({ ...prev, roles: [...prev.roles, roleInput.trim()] }));
            setRoleInput("");
        }
    };

    const handleRemoveRole = (index: number) => {
        setFormData(prev => ({ ...prev, roles: prev.roles.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProfile(formData);
            onSuccess();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Image & Personal Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Profile Photo</label>
                        <div className="rounded-full overflow-hidden w-32 h-32 mx-auto bg-black border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors shadow-lg shadow-purple-500/10 group relative">
                            <MediaUploader
                                folder="profile"
                                currentFile={formData.image || "/profile.png"}
                                onUploadComplete={(path) => setFormData({ ...formData, image: path })}
                                onRemove={() => setFormData({ ...formData, image: "" })}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Click to upload or drag & drop</p>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 pb-2 border-b border-white/5">
                            <User size={16} className="text-purple-400" /> Identity
                        </h4>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Typewriter Roles</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add Role..."
                                    value={roleInput}
                                    onChange={e => setRoleInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                                    className="flex-1 px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddRole}
                                    className="px-3 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {formData.roles.map((role, i) => (
                                    <motion.span
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={i}
                                        className="px-2 py-1 bg-purple-500/10 rounded-md text-[11px] flex items-center gap-1.5 text-purple-300 border border-purple-500/20"
                                    >
                                        {role}
                                        <button type="button" onClick={() => handleRemoveRole(i)} className="hover:text-red-400 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio, Stats, Social */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Bio */}
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Hero Bio</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all resize-none text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">About Me (Markdown)</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.aboutText}
                                    onChange={e => setFormData({ ...formData, aboutText: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all resize-none text-sm font-mono leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats & Social Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Stats */}
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 h-full">
                            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 pb-2 border-b border-white/5">
                                <Award size={16} className="text-yellow-400" /> Key Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Exp. Years", icon: Briefcase, field: "experienceYears", ph: "5+" },
                                    { label: "Projects", icon: FolderKanban, field: "projectsCompleted", ph: "50+" },
                                    { label: "Satisfaction", icon: CheckCircle, field: "satisfaction", ph: "100%" },
                                    { label: "Availability", icon: Clock, field: "availability", ph: "On Call" },
                                ].map((stat, i) => (
                                    <div key={i} className="relative group">
                                        <stat.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={stat.ph}
                                            value={formData.stats[stat.field as keyof typeof formData.stats]}
                                            onChange={e => setFormData({ ...formData, stats: { ...formData.stats, [stat.field]: e.target.value } })}
                                            className="w-full pl-9 pr-2 py-2.5 bg-[#030014] border border-white/10 rounded-lg text-white text-sm focus:border-yellow-500/50 outline-none transition-all placeholder-gray-600"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social */}
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 h-full">
                            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 pb-2 border-b border-white/5">
                                <Mail size={16} className="text-green-400" /> Connect
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { icon: Mail, field: "email", ph: "Email", color: "text-green-500", border: "focus:border-green-500/50" },
                                    { icon: Github, field: "github", ph: "GitHub URL", color: "text-white", border: "focus:border-white/30" },
                                    { icon: Linkedin, field: "linkedin", ph: "LinkedIn URL", color: "text-blue-500", border: "focus:border-blue-500/50" },
                                    { icon: Phone, field: "whatsapp", ph: "WhatsApp Link", color: "text-green-400", border: "focus:border-green-400/50" },
                                ].map((social, i) => (
                                    <div key={i} className="relative group">
                                        <social.icon size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:${social.color} transition-colors`} />
                                        <input
                                            type="text"
                                            placeholder={social.ph}
                                            value={formData[social.field as keyof typeof formData] as string}
                                            onChange={e => setFormData({ ...formData, [social.field]: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-[#030014] border border-white/10 rounded-lg text-white text-sm ${social.border} outline-none transition-all`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Clock className="animate-spin" /> : <CheckCircle />}
                        {loading ? "Saving Changes..." : "Update Profile Information"}
                    </button>

                </div>
            </div>
        </form>
    );
}
