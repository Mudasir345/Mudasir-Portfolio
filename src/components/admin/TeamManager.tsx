"use client";

import React, { useState, useEffect } from "react";
import { TeamMember } from "@/lib/db";
import { addTeamMember, deleteTeamMember, updateTeamMember, toggleTeamSection, getSettings } from "@/actions/admin";
import MediaUploader from "./MediaUploader";
import { Plus, Trash2, Edit2, Github, Linkedin, Users, ToggleLeft, ToggleRight, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamManagerProps {
    initialTeam: TeamMember[];
}

export default function TeamManager({ initialTeam }: TeamManagerProps) {
    const [team, setTeam] = useState<TeamMember[]>(initialTeam);
    const [showTeamSection, setShowTeamSection] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<TeamMember>({
        id: "",
        name: "",
        role: "",
        image: "",
        linkedin: "",
        github: ""
    });

    useEffect(() => {
        // Fetch specific settings on mount
        const loadSettings = async () => {
            const settings = await getSettings();
            setShowTeamSection(settings.showTeam);
        };
        loadSettings();
    }, []);

    const resetForm = () => {
        setFormData({
            id: "",
            name: "",
            role: "",
            image: "",
            linkedin: "",
            github: ""
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEdit = (member: TeamMember) => {
        setFormData(member);
        setEditingId(member.id);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deleteTeamMember(id);
        setTeam(team.filter(t => t.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                // Update
                const updated = { ...formData };
                await updateTeamMember(editingId, updated);
                setTeam(team.map(t => t.id === editingId ? updated : t));
            } else {
                // Add
                const newMember = { ...formData, id: Date.now().toString() };
                await addTeamMember(newMember);
                setTeam([...team, newMember]);
            }
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        const newValue = !showTeamSection;
        setShowTeamSection(newValue);
        await toggleTeamSection(newValue);
    };

    return (
        <div className="space-y-8">
            {/* Header & Toggle */}
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-purple-400" /> Team Management
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage your team members and section visibility.</p>
                </div>

                <button
                    onClick={handleToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${showTeamSection
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                >
                    {showTeamSection ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    {showTeamSection ? "Visible on Site" : "Hidden from Site"}
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            {isEditing ? <Edit2 size={18} className="text-cyan-400" /> : <Plus size={18} className="text-green-400" />}
                            {isEditing ? "Edit Member" : "Add New Member"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div className="flex justify-center mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-black/20 border border-white/10">
                                    <MediaUploader
                                        folder="team"
                                        currentFile={formData.image}
                                        onUploadComplete={(path) => setFormData({ ...formData, image: path })}
                                        onRemove={() => setFormData({ ...formData, image: "" })}
                                    />
                                </div>
                            </div>

                            <input
                                required
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none"
                            />

                            <input
                                required
                                placeholder="Role (e.g. Designer)"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none"
                            />

                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Github size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        placeholder="GitHub URL"
                                        value={formData.github || ""}
                                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                                        className="w-full pl-9 pr-3 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-white/30 outline-none text-sm"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <Linkedin size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        placeholder="LinkedIn URL"
                                        value={formData.linkedin || ""}
                                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                        className="w-full pl-9 pr-3 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                                >
                                    {loading ? "Saving..." : (isEditing ? "Update Member" : "Add Member")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {team.map((member) => (
                            <motion.div
                                key={member.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card p-4 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10">
                                        {member.image ? (
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
                                                <Users size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-lg">{member.name}</h4>
                                        <p className="text-cyan-400 text-sm">{member.role}</p>
                                        <div className="flex gap-2 mt-1">
                                            {member.github && <Github size={14} className="text-gray-500" />}
                                            {member.linkedin && <Linkedin size={14} className="text-gray-500" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="p-2 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {team.length === 0 && (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            <Users size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No team members yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
