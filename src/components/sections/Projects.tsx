"use client";

import React, { useMemo, useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import ProjectCard from "../ui/ProjectCard";
import ProjectModal from "../ui/ProjectModal";
import SnapRail from "../ui/SnapRail";
import { ProjectCategory, ProjectData } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ChevronDown, ChevronUp } from "lucide-react";

const categories: ("All" | ProjectCategory)[] = ["All", "Web", "Mobile", "Desktop", "Automation"];

// Phones get one screenful of projects in a swipeable rail instead of a
// 9,500px column; desktop keeps the grid and reveals the rest on demand.
const MOBILE_INITIAL = 6;
const DESKTOP_INITIAL = 9;

interface ProjectsProps {
    initialProjects: ProjectData[];
}

const Projects = ({ initialProjects }: ProjectsProps) => {
    const [activeCategory, setActiveCategory] = useState<"All" | ProjectCategory>("All");
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [showAll, setShowAll] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const counts = useMemo(() => {
        const map: Record<string, number> = { All: initialProjects.length };
        for (const project of initialProjects) {
            map[project.category] = (map[project.category] ?? 0) + 1;
        }
        return map;
    }, [initialProjects]);

    const filteredProjects = activeCategory === "All"
        ? initialProjects
        : initialProjects.filter(project => project.category === activeCategory);

    const limit = isDesktop ? DESKTOP_INITIAL : MOBILE_INITIAL;
    const hiddenCount = filteredProjects.length - limit;
    const visibleProjects = hiddenCount > 0 && !showAll
        ? filteredProjects.slice(0, limit)
        : filteredProjects;

    const renderCard = (project: ProjectData) => (
        <ProjectCard
            key={project.id}
            src={project.image}
            title={project.title}
            description={project.description}
            techStack={project.techStack}
            onClick={() => setSelectedProject(project)}
        />
    );

    const selectCategory = (category: "All" | ProjectCategory) => {
        setActiveCategory(category);
        setShowAll(false);
    };

    return (
        <Section id="projects" className="scroll-mt-28">
            <SectionHeading eyebrow="Selected Work">My Projects</SectionHeading>

            {/* Category Filter Tabs */}
            <div className="mx-auto mb-10 flex w-fit flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => selectCategory(category)}
                        aria-pressed={activeCategory === category}
                        className={`relative px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 ${activeCategory === category ? "text-white" : "text-gray-400 hover:text-white"}`}
                    >
                        {activeCategory === category && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-[0_0_20px_rgba(112,66,248,0.5)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {category}
                        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${activeCategory === category ? "bg-white/25 text-white" : "bg-white/[0.06] text-gray-500"}`}>
                            {counts[category] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {filteredProjects.length === 0 ? (
                <p className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-gray-400">
                    No projects in this category yet — check back soon.
                </p>
            ) : isDesktop ? (
                /* Desktop: animated multi-column grid */
                <motion.div
                    layout
                    className="grid w-full grid-cols-1 justify-items-center gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
                >
                    <AnimatePresence mode="popLayout">
                        {visibleProjects.map(renderCard)}
                    </AnimatePresence>
                </motion.div>
            ) : (
                /* Phone: one horizontal snap rail — no vertical wall of cards */
                <SnapRail
                    ariaLabel={`${visibleProjects.length} project${visibleProjects.length === 1 ? "" : "s"} in ${activeCategory}. Swipe or use arrow keys.`}
                    slideWidth="min(calc(100% - 3rem), 400px)"
                    gap="1rem"
                >
                    {visibleProjects.map(renderCard)}
                </SnapRail>
            )}

            {hiddenCount > 0 && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setShowAll(value => !value)}
                        aria-expanded={showAll}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-purple-500/40 bg-white/[0.03] text-sm font-semibold text-gray-200 hover:border-purple-400/70 hover:text-white transition-colors backdrop-blur-md"
                    >
                        {showAll ? (
                            <>Show less <ChevronUp size={16} /></>
                        ) : (
                            <>Show all {filteredProjects.length} projects <ChevronDown size={16} /></>
                        )}
                    </button>
                </div>
            )}

            {/* Project Details Modal */}
            <ProjectModal
                key={selectedProject?.title ?? "project-modal"}
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </Section>
    );
};

export default Projects;
