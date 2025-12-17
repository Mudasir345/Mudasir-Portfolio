"use client";

import React, { useState, useEffect } from "react";
import { updateSkillList } from "@/actions/admin";
import { SkillData } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Code, Server, Database, Wrench, Save } from "lucide-react";

type SkillCategory = "Frontend" | "Backend" | "Database" | "Tools";

interface SkillsManagerProps {
    initialSkills: SkillData[];
    onSuccess: () => void;
}

const categoryConfig: Record<SkillCategory, { icon: React.ReactNode; color: string; bg: string }> = {
    Frontend: { icon: <Code size={12} />, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
    Backend: { icon: <Server size={12} />, color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
    Database: { icon: <Database size={12} />, color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30" },
    Tools: { icon: <Wrench size={12} />, color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/30" },
};

export default function SkillsManager({ initialSkills, onSuccess }: SkillsManagerProps) {
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState<SkillData[]>(initialSkills);
    const [skillName, setSkillName] = useState("");
    const [skillCategory, setSkillCategory] = useState<SkillCategory>("Frontend");
    const [filterCategory, setFilterCategory] = useState<SkillCategory | "All">("All");
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setSkills(initialSkills);
        setHasChanges(false);
    }, [initialSkills]);

    const handleAddSkill = () => {
        if (skillName.trim()) {
            const exists = skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
            if (exists) {
                alert("Skill already exists!");
                return;
            }
            setSkills(prev => [...prev, { name: skillName.trim(), category: skillCategory }]);
            setSkillName("");
            setHasChanges(true);
        }
    };

    const handleRemoveSkill = (index: number) => {
        setSkills(prev => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateSkillList(skills);
            setHasChanges(false);
            onSuccess();
        } catch (error) {
            console.error("Failed to save skills", error);
            alert("Failed to save skills");
        } finally {
            setLoading(false);
        }
    };

    const filteredSkills = filterCategory === "All" 
        ? skills 
        : skills.filter(s => s.category === filterCategory);

    const skillCounts = {
        All: skills.length,
        Frontend: skills.filter(s => s.category === "Frontend").length,
        Backend: skills.filter(s => s.category === "Backend").length,
        Database: skills.filter(s => s.category === "Database").length,
        Tools: skills.filter(s => s.category === "Tools").length,
    };

    return (
        <div className="space-y-6">

            {/* Add New Skill */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Add New Skill</h4>
                
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Skill Name (e.g. React.js)"
                        value={skillName}
                        onChange={e => setSkillName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        className="flex-1 px-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all"
                    />
                    
                    <select
                        value={skillCategory}
                        onChange={e => setSkillCategory(e.target.value as SkillCategory)}
                        className="px-4 py-3 bg-[#030014] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none transition-all cursor-pointer"
                    >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="Tools">Tools</option>
                    </select>
                    
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-6 py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-xl hover:bg-cyan-600/40 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Add
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {(["All", "Frontend", "Backend", "Database", "Tools"] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                            filterCategory === cat
                                ? "bg-purple-600 text-white border-purple-500"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        {cat} <span className="ml-1 text-xs opacity-70">({skillCounts[cat]})</span>
                    </button>
                ))}
            </div>

            {/* Skills Grid */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 min-h-[200px]">
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                        {filteredSkills.map((skill, index) => {
                            const config = categoryConfig[skill.category];
                            const originalIndex = skills.findIndex(s => s.name === skill.name);
                            
                            return (
                                <motion.div
                                    key={skill.name}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 border ${config.bg}`}
                                >
                                    <span className={config.color}>{config.icon}</span>
                                    <span className="text-white">{skill.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(originalIndex)}
                                        className="ml-1 hover:text-red-400 transition-colors text-gray-400"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {filteredSkills.length === 0 && (
                        <p className="text-gray-500 text-sm w-full text-center py-10">
                            No skills in this category
                        </p>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <button
                type="button"
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className={`w-full py-4 font-bold text-lg rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    hasChanges
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-purple-500/20"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
            >
                <Save size={20} />
                {loading ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
            </button>
        </div>
    );
}
