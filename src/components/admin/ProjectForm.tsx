"use client";

import React, { useState, useEffect } from "react";
import { addProject, updateProject } from "@/actions/admin";
import { ProjectCategory, ProjectData } from "@/lib/db";
import { motion } from "framer-motion";
import { Plus, X, Globe, Github, ImageIcon, Type, FileText, Layers } from "lucide-react";
import MediaUploader from "./MediaUploader";

interface ProjectFormProps {
    onSuccess: () => void;
    initialData?: ProjectData | null;
    onCancel?: () => void;
}

export default function ProjectForm({ onSuccess, initialData, onCancel }: ProjectFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProjectData>({
        title: "",
        description: "",
        image: "",
        mediaType: "image",
        gallery: [],
        category: "Web",
        techStack: [],
        liveUrl: "",
        githubUrl: "",
        showInCv: true,
    });
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: "",
                description: "",
                image: "",
                mediaType: "image",
                gallery: [],
                category: "Web",
                techStack: [],
                liveUrl: "",
                githubUrl: "",
                showInCv: true,
            });
        }
    }, [initialData]);

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setFormData(prev => ({ ...prev, techStack: [...prev.techStack, tagInput.trim()] }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (index: number) => {
        setFormData(prev => ({ ...prev, techStack: prev.techStack.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await updateProject(initialData.title, formData);
            } else {
                await addProject(formData);
            }

            if (!initialData) {
                setFormData({
                    title: "",
                    description: "",
                    image: "",
                    mediaType: "image",
                    gallery: [],
                    category: "Web",
                    techStack: [],
                    liveUrl: "",
                    githubUrl: "",
                    showInCv: true,
                });
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save project", error);
            alert("Failed to save project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Title</label>
                    <div className="relative group">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. E-Commerce Platform"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
                    <div className="relative group">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                            className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
                        >
                            <option value="Web">Web Development</option>
                            <option value="Mobile">Mobile App</option>
                            <option value="Desktop">Desktop App</option>
                            <option value="Automation">Automation Bot</option>
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
                        placeholder="Briefly describe the project..."
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all resize-none focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* URLs Group */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Project Links & Media</h4>

                <div className="space-y-4">
                    {/* Image / Video Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Project Media</label>
                        <MediaUploader
                            folder="projects"
                            currentFile={formData.image}
                            onUploadComplete={(path, type) => setFormData({ ...formData, image: path, mediaType: type })}
                            onRemove={() => setFormData({ ...formData, image: "", mediaType: "image" })}
                        />
                    </div>

                    {/* Gallery Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Gallery (Additional)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {formData.gallery?.map((item, index) => (
                                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                    {item.type === "video" ? (
                                        <video src={item.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newGallery = [...(formData.gallery || [])];
                                            newGallery.splice(index, 1);
                                            setFormData({ ...formData, gallery: newGallery });
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {/* Add New Gallery Item */}
                            <div className="aspect-video relative">
                                <MediaUploader
                                    folder="projects"
                                    onUploadComplete={(path, type) => {
                                        setFormData({
                                            ...formData,
                                            gallery: [...(formData.gallery || []), { url: path, type: type }]
                                        });
                                    }}
                                    onRemove={() => { }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Live URL */}
                        <div className="relative group">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Live Demo URL (Optional)"
                                value={formData.liveUrl || ""}
                                onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-green-500 outline-none transition-all focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                        {/* GitHub URL */}
                        <div className="relative group">
                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-200 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="GitHub Repo URL (Optional)"
                                value={formData.githubUrl || ""}
                                onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Stack Input */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tech Stack</label>
                <div>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Add Tech (e.g. React) and press +"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            className="flex-1 px-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-xl hover:bg-cyan-600/40 active:scale-95 transition-all"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.techStack.map((tech, i) => (
                            <motion.span
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={i}
                                className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-2 text-gray-300 border border-white/5"
                            >
                                {tech}
                                <button type="button" onClick={() => handleRemoveTag(i)} className="hover:text-red-400 ml-1 transition-colors">
                                    <X size={14} />
                                </button>
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Show in CV Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mt-4">
                <div>
                    <h4 className="text-sm font-semibold text-white">Show in CV Download</h4>
                    <p className="text-xs text-gray-400">Include this project in the generated PDF Resume.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, showInCv: !formData.showInCv })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.showInCv ? "bg-cyan-500" : "bg-gray-700"}`}
                >
                    <span className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${formData.showInCv ? "left-7" : "left-1"}`} />
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-95 mt-4"
            >
                {loading ? "Process..." : (initialData ? "Save Changes" : "Create Project")}
            </button>
        </form>
    );
}
