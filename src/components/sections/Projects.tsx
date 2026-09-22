"use client";

import React, { useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import Section from "../ui/Section";
import ProjectCard from "../ui/ProjectCard";
import ProjectModal from "../ui/ProjectModal";
import { ProjectCategory, ProjectData } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

const categories: ("All" | ProjectCategory)[] = ["All", "Web", "Mobile", "Desktop", "Automation"];

interface ProjectsProps {
    initialProjects: ProjectData[];
}

const Projects = ({ initialProjects }: ProjectsProps) => {
    const [activeCategory, setActiveCategory] = useState<"All" | ProjectCategory>("All");
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

    const filteredProjects = activeCategory === "All"
        ? initialProjects
        : initialProjects.filter(project => project.category === activeCategory);

    return (
        <Section id="projects" className="scroll-mt-28">
            <SectionHeading eyebrow="Selected Work">My Projects</SectionHeading>

            {/* Category Filter Tabs */}
            <div className="mx-auto mb-10 flex w-fit flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 ${activeCategory === category ? "text-white" : "text-gray-400 hover:text-white"}`}
                    >
                        {activeCategory === category && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-[0_0_20px_rgba(112,66,248,0.5)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {category}
                    </button>
                ))}
            </div>

            {/* Projects Grid */}
            <motion.div
                layout
                className="grid w-full grid-cols-1 justify-items-center gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
            >
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            key={project.id} // Use unique DB id as key
                            className="flex w-full justify-center"
                        >
                            <ProjectCard
                                src={project.image}
                                title={project.title}
                                description={project.description}
                                techStack={project.techStack}
                                onClick={() => setSelectedProject(project)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

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
