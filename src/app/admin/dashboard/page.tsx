"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getSkills, getExperience, getEducation, getProjects, getServices, getTestimonials, getTeam, deleteProject, deleteExperience, deleteEducation } from "@/actions/admin";

import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData, ServiceData, TestimonialData, TeamMember } from "@/lib/db";
import { LogOut, User, Code2, Briefcase, GraduationCap, FolderKanban, Layers, MessageSquare, Search, Plus, Users, Trash2, Edit2 } from "lucide-react";

import ProfileForm from "@/components/admin/ProfileForm";
import SkillsManager from "@/components/admin/SkillsManager";
import ExperienceForm from "@/components/admin/ExperienceForm";
import EducationForm from "@/components/admin/EducationForm";
import ProjectForm from "@/components/admin/ProjectForm";
import ServiceForm from "@/components/admin/ServiceForm";
import TestimonialForm from "@/components/admin/TestimonialForm";
import TeamManager from "@/components/admin/TeamManager";

type TabType = "profile" | "skills" | "experience" | "education" | "projects" | "services" | "testimonials" | "team";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [searchTerm, setSearchTerm] = useState("");

    // Data States
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [skills, setSkills] = useState<SkillData[]>([]);
    const [experience, setExperience] = useState<ExperienceData[]>([]);
    const [education, setEducation] = useState<EducationData[]>([]);
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [services, setServices] = useState<ServiceData[]>([]);
    const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);

    // Modal States for Add/Edit
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

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
        try {
            const [profileData, skillsData, expData, eduData, projData, servData, testData, teamData] = await Promise.all([
                getProfile(), getSkills(), getExperience(), getEducation(), getProjects(), getServices(), getTestimonials(), getTeam()
            ]);
            setProfile(profileData);
            setSkills(skillsData);
            setExperience(expData);
            setEducation(eduData);
            setProjects(projData);
            setServices(servData);
            setTestimonials(testData);
            setTeam(teamData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAdminAuthenticated");
        router.push("/admin");
    };

    // Generic Add/Edit Handlers
    const handleAddNew = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchData();
    };

    const handleDeleteProject = async (title: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        setLoading(true);
        try {
            await deleteProject(title);
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to delete project: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExperience = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deleteExperience(id);
        fetchData();
    };

    const handleDeleteEducation = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deleteEducation(id);
        fetchData();
    };

    // Filter projects/services based on search
    const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredServices = services.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredExperience = experience.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredEducation = education.filter(e => e.degree.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTestimonials = testimonials.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white">Loading Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-[#030014] text-white font-sans flex flex-col md:flex-row">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col h-auto md:h-screen fixed z-50">
                <div className="p-6 border-b border-white/10 flex items-center justify-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        {[
                            { id: "profile", label: "Profile", icon: User },
                            { id: "skills", label: "Skills", icon: Code2 },
                            { id: "experience", label: "Experience", icon: Briefcase },
                            { id: "education", label: "Education", icon: GraduationCap },
                            { id: "projects", label: "Projects", icon: FolderKanban },
                            { id: "services", label: "Services", icon: Layers },
                            { id: "testimonials", label: "Testimonials", icon: MessageSquare },
                            { id: "team", label: "Team", icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? "bg-purple-600 shadow-lg shadow-purple-500/20 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                            >
                                <tab.icon size={20} /> {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 md:p-10 ml-0 mt-16 md:mt-0">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
                        <p className="text-gray-400 text-sm">Manage your {activeTab} section</p>
                    </div>

                    {(activeTab === "projects" || activeTab === "services" || activeTab === "experience" || activeTab === "education" || activeTab === "testimonials") && (
                        <div className="flex gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none text-sm w-full md:w-64"
                                />
                            </div>
                            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20">
                                <Plus size={18} /> Add New
                            </button>
                        </div>
                    )}
                </header>

                <div className="max-w-6xl mx-auto">
                    {/* Content Logic */}
                    {activeTab === "profile" && profile && (
                        <ProfileForm initialData={profile} onSuccess={fetchData} />
                    )}

                    {activeTab === "skills" && (
                        <SkillsManager initialSkills={skills} onSuccess={fetchData} />
                    )}

                    {activeTab === "team" && (
                        <TeamManager initialTeam={team} />
                    )}

                    {activeTab === "projects" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project, i) => (
                                <div key={i} className="glass-card p-4 group relative bg-white/5 rounded-xl border border-white/10">
                                    <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden">
                                        {project.image ? (
                                            project.image.includes("video") ? (
                                                <video src={project.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                            )
                                        ) : <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                                    <div className="flex items-center gap-2 mt-4">
                                        <button onClick={() => handleEdit(project)} className="text-cyan-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"><Edit2 size={16} /> Edit</button>
                                        <button onClick={() => handleDeleteProject(project.title)} className="text-red-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"><Trash2 size={16} /> Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "experience" && (
                        <div className="space-y-4">
                            {filteredExperience.map((exp) => (
                                <div key={exp.id} className="glass-card p-4 flex justify-between items-center bg-white/5 rounded-xl border border-white/10">
                                    <div>
                                        <h4 className="font-bold">{exp.title}</h4>
                                        <p className="text-gray-400">{exp.company}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(exp)} className="p-2 text-cyan-400 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteExperience(exp.id)} className="p-2 text-red-400 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "education" && (
                        <div className="space-y-4">
                            {filteredEducation.map((edu) => (
                                <div key={edu.id} className="glass-card p-4 flex justify-between items-center bg-white/5 rounded-xl border border-white/10">
                                    <div>
                                        <h4 className="font-bold">{edu.degree}</h4>
                                        <p className="text-gray-400">{edu.institution}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(edu)} className="p-2 text-cyan-400 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteEducation(edu.id)} className="p-2 text-red-400 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "services" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {filteredServices.map((service, i) => (
                                <div key={i} className="glass-card p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h3 className="font-bold mb-2">{service.title}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleEdit(service)} className="text-cyan-400 text-sm flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "testimonials" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredTestimonials.map((t, i) => (
                                <div key={i} className="glass-card p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="italic text-gray-400 mb-2">"{t.review}"</p>
                                    <h4 className="font-bold">{t.name}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleEdit(t)} className="text-cyan-400 text-sm flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0b0518] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <LogOut size={24} className="rotate-180" />
                        </button>

                        <div className="mt-2">
                            {activeTab === "projects" && (
                                <ProjectForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />
                            )}
                            {activeTab === "experience" && (
                                <ExperienceForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />
                            )}
                            {activeTab === "education" && (
                                <EducationForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />
                            )}
                            {activeTab === "services" && (
                                <ServiceForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />
                            )}
                            {activeTab === "testimonials" && (
                                <TestimonialForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
