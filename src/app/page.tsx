import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Team from "@/components/sections/Team";
import { getProjects, getServices, getProfile, getSkills, getExperience, getEducation, getTestimonials, getTeam, getSettings } from "@/actions/admin";

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const [projects, services, profile, skills, experience, education, testimonials, team, settings] = await Promise.all([
    getProjects(),
    getServices(),
    getProfile(),
    getSkills(),
    getExperience(),
    getEducation(),
    getTestimonials(),
    getTeam(),
    getSettings()
  ]);

  return (
    <main className="h-full w-full">
      <div className="flex flex-col gap-20">
        <Hero
          profile={profile}
          skills={skills}
          experience={experience}
          education={education}
          projects={projects}
        />

        <ScrollReveal width="100%">
          <About profile={profile} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Skills skills={skills} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Services initialServices={services} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Process />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Experience experience={experience} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Education education={education} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Projects initialProjects={projects} />
        </ScrollReveal>

        {settings.showTeam && (
          <ScrollReveal width="100%">
            <Team team={team} />
          </ScrollReveal>
        )}

        <ScrollReveal width="100%">
          <Testimonials testimonials={testimonials} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Contact email={profile.email} />
        </ScrollReveal>

        <Footer profile={profile} />
      </div>
    </main>
  );
}
