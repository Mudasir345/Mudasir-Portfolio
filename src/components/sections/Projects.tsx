"use client";

import React, { useState } from "react";
import SectionHeading from "../ui/SectionHeading";
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
        <section className="flex flex-col items-center justify-center py-20 z-[20] min-h-screen" id="projects">
            <SectionHeading>My Projects</SectionHeading>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 px-5">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10 ${activeCategory === category ? "text-white" : "text-gray-400 hover:text-white"}`}
                    >
                        {activeCategory === category && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full -z-10 shadow-[0_0_20px_rgba(112,66,248,0.5)]"
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-10 max-w-[1400px] w-full"
            >
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            key={project.title} // Use title as unique key for proper animation
                            className="flex justify-center"
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
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    );
};

export default Projects;
