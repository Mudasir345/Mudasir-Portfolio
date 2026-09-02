"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getProfile, getSkills, getExperience, getEducation, getProjects,
  getServices, getTestimonials, getPendingTestimonials, getTeam,
  getCertificates, getLanguages, getInterests, getSettings,
  getTestimonialCounts, approveTestimonial, rejectTestimonial,
  markTestimonialSpam, updateTestimonialStatus, updateSettings,
  updateProject, deleteProject, deleteExperience, deleteEducation,
  deleteCertificate, deleteLanguage, deleteInterest, deleteService,
  deleteTestimonial, logout,
} from "@/actions/admin";

import {
  ProfileData, SkillData, ExperienceData, EducationData, ProjectData,
  ServiceData, TestimonialData, TeamMember, CertificateData,
  LanguageData, InterestData, TestimonialStatus,
} from "@/lib/db";

import {
  LogOut, User, Code2, Briefcase, GraduationCap, FolderKanban,
  Layers, MessageSquare, Search, Plus, Users, Trash2, Edit2, Award,
  Globe, Heart, Settings as SettingsIcon, Star, CheckCircle2,
  XCircle, AlertTriangle, Clock, Flame, Filter,
} from "lucide-react";

import ProfileForm from "@/components/admin/ProfileForm";
import SkillsManager from "@/components/admin/SkillsManager";
import ExperienceForm from "@/components/admin/ExperienceForm";
import EducationForm from "@/components/admin/EducationForm";
import ProjectForm from "@/components/admin/ProjectForm";
import ServiceForm from "@/components/admin/ServiceForm";
import TestimonialForm from "@/components/admin/TestimonialForm";
import TeamManager from "@/components/admin/TeamManager";
import CertificateForm from "@/components/admin/CertificateForm";
import LanguageForm from "@/components/admin/LanguageForm";
import InterestForm from "@/components/admin/InterestForm";

type TabType = "profile" | "skills" | "experience" | "education" | "projects"
  | "services" | "testimonials" | "team" | "certificates"
  | "languages" | "interests" | "cv-settings";

const TESTIMONIAL_STATUS_META: Record<
  string,
  { label: string; badge: string; icon: any; dot: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    icon: Clock,
    dot: "bg-yellow-400",
  },
  approved: {
    label: "Approved",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    icon: CheckCircle2,
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-500/10 border-red-500/30 text-red-300",
    icon: XCircle,
    dot: "bg-red-400",
  },
  spam: {
    label: "Spam",
    badge: "bg-gray-500/10 border-gray-500/30 text-gray-400",
    icon: Flame,
    dot: "bg-gray-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const meta = TESTIMONIAL_STATUS_META[status] || TESTIMONIAL_STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border rounded-full ${meta.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [searchTerm, setSearchTerm] = useState("");
  const [testimonialStatusFilter, setTestimonialStatusFilter] = useState<
    "all" | TestimonialStatus
  >("all");
  const [testimonialCounts, setTestimonialCounts] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
    total: number;
  }>({ pending: 0, approved: 0, rejected: 0, spam: 0, total: 0 });

  // Data States
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [experience, setExperience] = useState<ExperienceData[]>([]);
  const [education, setEducation] = useState<EducationData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<TestimonialData[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [interests, setInterests] = useState<InterestData[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [quickActionBusy, setQuickActionBusy] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileData, skillsData, expData, eduData, projData, servData,
        testData, pendingData, countsData, teamData, certData,
        langData, intData, cvSettingsData] = await Promise.all([
          getProfile(), getSkills(), getExperience(), getEducation(),
          getProjects(), getServices(), getTestimonials(),
          getPendingTestimonials(), getTestimonialCounts(), getTeam(),
          getCertificates(), getLanguages(), getInterests(), getSettings(),
        ]);
      setProfile(profileData);
      setSkills(skillsData);
      setExperience(expData);
      setEducation(eduData);
      setProjects(projData);
      setServices(servData);
      setTestimonials(testData);
      setPendingTestimonials(pendingData);
      if (countsData) setTestimonialCounts(countsData as any);
      setTeam(teamData);
      setCertificates(certData);
      setLanguages(langData);
      setInterests(intData);
      setSettings(cvSettingsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  const handleAddNew = () => { setEditingItem(null); setShowModal(true); };
  const handleEdit = (item: any) => { setEditingItem(item); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditingItem(null); };
  const handleSuccess = () => { handleCloseModal(); fetchData(); };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    try { await deleteProject(id); fetchData(); }
    catch (e) { console.error(e); alert("Failed: " + e); }
    finally { setLoading(false); }
  };
  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteExperience(id); fetchData();
  };
  const handleDeleteEducation = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteEducation(id); fetchData();
  };
  const handleDeleteCertificate = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteCertificate(id); fetchData();
  };
  const handleDeleteLanguage = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteLanguage(id); fetchData();
  };
  const handleDeleteInterest = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteInterest(id); fetchData();
  };
  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setLoading(true);
    try { await deleteService(id); fetchData(); }
    catch (e) { console.error(e); alert("Failed: " + e); }
    finally { setLoading(false); }
  };
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Permanently DELETE this testimonial? (Use Reject/Spam instead to keep a record.)")) return;
    setLoading(true);
    try { await deleteTestimonial(id); fetchData(); }
    catch (e) { console.error(e); alert("Failed: " + e); }
    finally { setLoading(false); }
  };

  // Quick Testimonial actions
  const quickApprove = async (t: TestimonialData) => {
    if (quickActionBusy) return;
    setQuickActionBusy(t.id);
    try { await approveTestimonial(t.id, true); fetchData(); }
    finally { setTimeout(() => setQuickActionBusy(null), 250); }
  };
  const quickReject = async (t: TestimonialData) => {
    if (quickActionBusy) return;
    if (!confirm(`Reject "${t.name}" review?`)) return;
    setQuickActionBusy(t.id);
    try { await rejectTestimonial(t.id); fetchData(); }
    finally { setTimeout(() => setQuickActionBusy(null), 250); }
  };
  const quickSpam = async (t: TestimonialData) => {
    if (quickActionBusy) return;
    if (!confirm(`Mark "${t.name}" review as SPAM?`)) return;
    setQuickActionBusy(t.id);
    try { await markTestimonialSpam(t.id); fetchData(); }
    finally { setTimeout(() => setQuickActionBusy(null), 250); }
  };
  const quickMovePending = async (t: TestimonialData) => {
    if (quickActionBusy) return;
    setQuickActionBusy(t.id);
    try { await updateTestimonialStatus(t.id, "pending"); fetchData(); }
    finally { setTimeout(() => setQuickActionBusy(null), 250); }
  };

  const handleToggleProjectCv = async (project: ProjectData) => {
    setLoading(true);
    try {
      await updateProject(project.id, { ...project, showInCv: !project.showInCv });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to update project CV visibility.");
    } finally { setLoading(false); }
  };

  const handleToggleCvSetting = async (key: string, value: boolean) => {
    setLoading(true);
    try { await updateSettings({ [key]: value }); fetchData(); }
    catch (error) { console.error(error); alert("Failed to update CV settings."); }
    finally { setLoading(false); }
  };

  // Filters
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExperience = experience.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEducation = education.filter(e =>
    e.degree.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCertificates = certificates.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredInterests = interests.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredTestimonials = (() => {
    const q = searchTerm.toLowerCase().trim();
    const statusF = testimonialStatusFilter;
    let list = testimonials.slice();
    if (statusF !== "all") list = list.filter(t => t.status === statusF);
    if (q) list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.role || "").toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      t.review.toLowerCase().includes(q));
    list.sort((a, b) => {
      const rank = (s: string) => s === "pending" ? 0 : s === "approved" ? 1 : s === "rejected" ? 2 : 3;
      if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
      return +new Date(b.createdAt as any) - +new Date(a.createdAt as any);
    });
    return list;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans flex flex-col md:flex-row">

      {/* Sidebar */}
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
            { id: "certificates", label: "Certificates", icon: Award },
            { id: "languages", label: "Languages", icon: Globe },
            { id: "interests", label: "Interests", icon: Heart },
            { id: "projects", label: "Projects", icon: FolderKanban },
            { id: "services", label: "Services", icon: Layers },
            { id: "testimonials", label: "Testimonials", icon: MessageSquare },
            { id: "team", label: "Team", icon: Users },
            { id: "cv-settings", label: "CV Settings", icon: SettingsIcon },
            ].map((tab) => {
              const badge = tab.id === "testimonials" && testimonialCounts.pending > 0
                ? testimonialCounts.pending : null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${activeTab === tab.id ? "bg-purple-600 shadow-lg shadow-purple-500/20 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <tab.icon size={20} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {badge !== null && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black border animate-pulse ${activeTab === tab.id ? "bg-white text-purple-700 border-white" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"}`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 ml-0 mt-16 md:mt-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
            <p className="text-gray-400 text-sm">Manage your {activeTab}
              {activeTab === "testimonials" && (
                <>
                  {" • "}<span className="text-yellow-400 font-semibold">{testimonialCounts.pending}</span> pending · <span className="text-emerald-400 font-semibold">{testimonialCounts.approved}</span> approved · <span className="text-red-400 font-semibold">{testimonialCounts.rejected}</span> rejected · <span className="text-gray-500 font-semibold">{testimonialCounts.spam}</span> spam
                </>
              )}
            </p>
          </div>

          {(activeTab === "projects" || activeTab === "services" || activeTab === "experience"
            || activeTab === "education" || activeTab === "testimonials" || activeTab === "certificates"
            || activeTab === "languages" || activeTab === "interests") && (
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder={activeTab === "testimonials" ? "Search name, email, review..." : "Search..."}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none text-sm w-full md:w-72"
                  />
                </div>
                {activeTab === "testimonials" && (
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    <select
                      value={testimonialStatusFilter}
                      onChange={e => setTestimonialStatusFilter(e.target.value as any)}
                      className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none text-sm appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <option value="all" className="bg-[#030014]">All Statuses ({testimonialCounts.total || testimonials.length})</option>
                      <option value="pending" className="bg-[#030014]">Pending ({testimonialCounts.pending})</option>
                      <option value="approved" className="bg-[#030014]">Approved ({testimonialCounts.approved})</option>
                      <option value="rejected" className="bg-[#030014]">Rejected ({testimonialCounts.rejected})</option>
                      <option value="spam" className="bg-[#030014]">Spam ({testimonialCounts.spam})</option>
                    </select>
                  </div>
                )}
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20">
                  <Plus size={18} /> Add New
                </button>
              </div>
            )}
        </header>

        {activeTab === "testimonials" && pendingTestimonials.length > 0 && (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/5 p-5 shadow-lg shadow-yellow-500/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-yellow-200 mb-1">
                  {pendingTestimonials.length} review{pendingTestimonials.length === 1 ? "" : "s"} pending approval
                </h3>
                <p className="text-sm text-yellow-300/80 leading-relaxed">
                  ✓ <b>Approve</b> to publish and mark verified. ✗ <b>Reject</b> to keep hidden. 🔥 <b>Spam</b> to train filters.
                </p>
              </div>
              <button
                onClick={() => setTestimonialStatusFilter("pending")}
                className="self-center shrink-0 text-xs font-bold px-4 py-2 rounded-xl bg-yellow-500 text-yellow-950 hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
              >
                Review Pending
              </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {activeTab === "profile" && profile && (
            <ProfileForm initialData={profile} onSuccess={fetchData} />
          )}

          {activeTab === "skills" && (
            <SkillsManager initialSkills={skills} onSuccess={fetchData} />
          )}

          {activeTab === "team" && <TeamManager initialTeam={team} />}

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
                    <button onClick={() => handleEdit(project)} className="text-cyan-400 hover:text-white text-sm font-medium flex items-center gap-1"><Edit2 size={16} /> Edit</button>
                    <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-white text-sm font-medium flex items-center gap-1"><Trash2 size={16} /> Delete</button>
                    <div className="ml-auto flex items-center gap-2" title="Show in CV">
                      <span className="text-xs font-semibold text-gray-400">CV</span>
                      <button
                        onClick={() => handleToggleProjectCv(project)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${project.showInCv !== false ? "bg-cyan-500" : "bg-gray-700"}`}
                      >
                        <span className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all`} style={{ left: project.showInCv !== false ? '18px' : '2px' }} />
                      </button>
                    </div>
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
                    <button onClick={() => handleDeleteService(service.id)} className="text-red-400 text-sm flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="space-y-5">
              {filteredTestimonials.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center">
                  <MessageSquare size={40} className="mx-auto text-purple-400/40 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {testimonialStatusFilter === "all" ? "No testimonials yet" : `No "${testimonialStatusFilter}" reviews`}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Add testimonials automatically when people submit reviews from your public site.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredTestimonials.map((t) => {
                const isPending = t.status === "pending";
                const stars = t.stars ?? 0;
                const busy = quickActionBusy === t.id;
                return (
                  <div
                    key={t.id}
                    className={`glass-card p-5 rounded-2xl border relative transition-all overflow-hidden ${busy ? "opacity-60 pointer-events-none" : ""} ${isPending ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/[0.06] via-white/[0.02] to-transparent" : "bg-white/5 border-white/10"}`}
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${t.status === "pending" ? "bg-yellow-400" : t.status === "approved" ? "bg-emerald-400" : t.status === "rejected" ? "bg-red-400" : "bg-gray-500"}`} />
                    <div className="flex items-start justify-between gap-3 mb-3 pl-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white leading-tight truncate">{t.name}</h4>
                          {t.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 h-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"><CheckCircle2 size={9} /> VERIFIED</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs text-cyan-400 font-medium truncate max-w-[60%]">{t.role}</span>
                          {t.email && <span className="text-[10px] text-gray-500 font-mono truncate max-w-[60%]">{t.email}</span>}
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <StatusBadge status={t.status || "pending"} />
                        <div className="flex items-center gap-0.5 pr-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={12} className={n <= stars ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pl-3 mb-4">
                      <p className="italic text-sm text-gray-300 leading-relaxed line-clamp-6">&ldquo;{t.review}&rdquo;</p>
                    </div>
                    <div className="pl-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                      {isPending && (
                        <button onClick={() => quickApprove(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-bold">
                          <CheckCircle2 size={14} /> Approve + Publish
                        </button>
                      )}
                      {isPending && (
                        <button onClick={() => quickReject(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 text-xs font-bold">
                          <XCircle size={14} /> Reject
                        </button>
                      )}
                      {isPending && (
                        <button onClick={() => quickSpam(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/30 hover:bg-gray-500/20 text-xs font-bold">
                          <Flame size={14} /> Spam
                        </button>
                      )}
                      {!isPending && (
                        <button onClick={() => quickMovePending(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/20 text-xs font-bold">
                          <Clock size={14} /> Move to Pending
                        </button>
                      )}
                      {t.status === "approved" && !t.isVerified && (
                        <button onClick={() => quickApprove(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-bold">
                          <CheckCircle2 size={14} /> Mark Verified
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-1.5">
                        <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-cyan-400 hover:bg-white/10 hover:text-white" title="Edit"><Edit2 size={15} /></button>
                        <button onClick={() => handleDeleteTestimonial(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-white/10 hover:text-white" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              )}
            </div>
          )}

          {activeTab === "certificates" && (
            <div className="space-y-4">
              {filteredCertificates.map((cert) => (
                <div key={cert.id} className="glass-card p-4 flex justify-between items-center bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h4 className="font-bold">{cert.title}</h4>
                    <p className="text-gray-400">{cert.issuer} - {cert.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cert)} className="p-2 text-cyan-400 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteCertificate(cert.id)} className="p-2 text-red-400 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "languages" && (
            <div className="space-y-4">
              {filteredLanguages.map((lang) => (
                <div key={lang.id} className="glass-card p-4 flex justify-between items-center bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h4 className="font-bold">{lang.name}</h4>
                    <p className="text-gray-400">{lang.proficiency}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(lang)} className="p-2 text-cyan-400 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteLanguage(lang.id)} className="p-2 text-red-400 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "interests" && (
            <div className="space-y-4">
              {filteredInterests.map((interest) => (
                <div key={interest.id} className="glass-card p-4 flex justify-between items-center bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-bold">{interest.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(interest)} className="p-2 text-cyan-400 hover:bg-white/10 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteInterest(interest.id)} className="p-2 text-red-400 hover:bg-white/10 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "cv-settings" && settings && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2"><SettingsIcon className="text-purple-400" /> CV Export Settings</h3>
                  <p className="text-sm text-gray-400">Select which optional sections appear on your generated PDF Resume.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "available", label: "Available for Work" },
                    { key: "cvShowCertificates", label: "Certificates Section" },
                    { key: "cvShowLanguages", label: "Languages Section" },
                    { key: "cvShowInterests", label: "Interests Section" },
                    { key: "cvShowDeclaration", label: "Declaration Text" },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center justify-between p-4 bg-[#030014] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <span className="font-medium text-gray-300">{opt.label}</span>
                      <button
                        onClick={() => handleToggleCvSetting(opt.key, settings[opt.key] !== false ? false : true)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings[opt.key] !== false ? "bg-cyan-500" : "bg-gray-700"}`}
                      >
                        <span className="absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all" style={{ left: settings[opt.key] !== false ? '26px' : '4px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0518] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <LogOut size={24} className="rotate-180" />
            </button>
            <div className="mt-2">
              {activeTab === "projects" && <ProjectForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
              {activeTab === "experience" && <ExperienceForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
              {activeTab === "education" && <EducationForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
              {activeTab === "services" && <ServiceForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
              {activeTab === "testimonials" && <TestimonialForm projects={projects} initialData={editingItem} onSaved={handleSuccess} onClose={handleCloseModal} />}
              {activeTab === "certificates" && <CertificateForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
              {activeTab === "languages" && <LanguageForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
              {activeTab === "interests" && <InterestForm onSuccess={handleSuccess} initialData={editingItem} onCancel={handleCloseModal} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
