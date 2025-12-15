"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects, getServices, deleteProject, deleteService } from "@/actions/admin";
import { ProjectData, ServiceData } from "@/lib/db";
import ProjectForm from "@/components/admin/ProjectForm";
import ServiceForm from "@/components/admin/ServiceForm";
import Modal from "@/components/ui/Modal";
import { Trash2, LogOut, LayoutDashboard, Layers, Edit2, Plus, Briefcase, Zap, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [services, setServices] = useState<ServiceData[]>([]);
    const [activeTab, setActiveTab] = useState<"projects" | "services">("projects");
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
    const [editingService, setEditingService] = useState<ServiceData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = localStorage.getItem("isAdminAuthenticated");
            if (!isAuthenticated) {
                router.push("/admin");
            } else {
                fetchData();
            }
        };
        checkAuth();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        const [pData, sData] = await Promise.all([getProjects(), getServices()]);
        setProjects(pData);
        setServices(sData);
        setLoading(false);
    };

    const handleOpenAdd = () => {
        setEditingProject(null);
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (p: ProjectData) => {
        setEditingProject(p);
        setIsModalOpen(true);
    };

    const handleEditService = (s: ServiceData) => {
        setEditingService(s);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (title: string) => {
        if (confirm(`Delete project "${title}"?`)) {
            await deleteProject(title);
            fetchData();
        }
    };

    const handleDeleteService = async (title: string) => {
        if (confirm(`Delete service "${title}"?`)) {
            await deleteService(title);
            fetchData();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAdminAuthenticated");
        router.push("/admin");
    };

    const onFormSuccess = () => {
        setIsModalOpen(false);
        fetchData();
    };

    // Filter Logic
    const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredServices = services.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-[#030014]">Loading CMS...</div>;

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 md:p-10 relative">
            {/* Top Navigation Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 max-w-7xl mx-auto border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
                        <p className="text-xs text-gray-400">Manage your digital empire</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setActiveTab("projects")}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "projects" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <Briefcase size={16} /> Projects
                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] ml-1">{projects.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "services" ? "bg-cyan-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <Zap size={16} /> Services
                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] ml-1">{services.length}</span>
                    </button>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/20 text-sm transition-colors"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* Action Toolbar */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-500"
                    />
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    <Plus size={20} /> Add New {activeTab === "projects" ? "Project" : "Service"}
                </button>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {activeTab === "projects" ? (
                        filteredProjects.map((project, i) => (
                            <motion.div
                                layout
                                key={project.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                className="bg-[#0f0728] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group flex flex-col h-full"
                            >
                                <div className="h-48 bg-gray-800 relative overflow-hidden">
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs border border-white/20">
                                        {project.category}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1" title={project.title}>{project.title}</h3>
                                    <p className="text-gray-400 text-xs mb-4 line-clamp-2 flex-1">{project.description}</p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex -space-x-2">
                                            {project.techStack.slice(0, 3).map((t, idx) => (
                                                <div key={idx} className="w-6 h-6 rounded-full bg-gray-700 border border-[#0f0728] flex items-center justify-center text-[8px] text-gray-300" title={t}>
                                                    {t[0]}
                                                </div>
                                            ))}
                                            {project.techStack.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-800 border border-[#0f0728] flex items-center justify-center text-[8px] text-gray-400">
                                                    +{project.techStack.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditProject(project)}
                                                className="p-2 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.title)}
                                                className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        filteredServices.map((service, i) => (
                            <motion.div
                                layout
                                key={service.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                className="bg-[#0f0728] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors group flex flex-col h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Zap size={100} />
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
                                    <Zap size={24} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                                <p className="text-gray-400 text-xs mb-6 flex-1">{service.description}</p>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {service.details.slice(0, 4).map((d, idx) => (
                                            <span key={idx} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300 border border-white/5">
                                                {d.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleEditService(service)}
                                            className="p-2 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service.title)}
                                            className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {activeTab === "projects" && filteredProjects.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-400">No projects found matching "{searchTerm}"</p>
                    </div>
                )}
                {activeTab === "services" && filteredServices.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-400">No services found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {/* Reusable Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    activeTab === "projects"
                        ? (editingProject ? "Edit Project" : "New Project")
                        : (editingService ? "Edit Service" : "New Service")
                }
            >
                {activeTab === "projects" ? (
                    <ProjectForm
                        onSuccess={onFormSuccess}
                        initialData={editingProject}
                        onCancel={() => setIsModalOpen(false)}
                    />
                ) : (
                    <ServiceForm
                        onSuccess={onFormSuccess}
                        initialData={editingService}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}
