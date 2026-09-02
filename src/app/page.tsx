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
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import FloatingContactBtn from "@/components/ui/FloatingContactBtn";
import HireMe from "@/components/sections/HireMe";
import Certifications from "@/components/sections/Certifications";
import Scroll3DWrapper from "@/components/3d/Scroll3DWrapper";
import { getPortfolioData } from "@/actions/admin";
import type { EducationData, SkillData, ServiceData, ProjectData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mudasirch.netlify.app";
  const absoluteUrl = (path?: string) => (path ? new URL(path, siteUrl).toString() : siteUrl);

  const { projects, services, profile, skills, experience, education, testimonials, team, settings, certificates, languages, interests } = await getPortfolioData();

  // Profile null guard — DB empty hone ki surat mein fallback
  if (!profile || !settings) {
    return (
      <main className="h-screen w-full flex items-center justify-center bg-[#030014] text-white text-center px-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Portfolio Setup Required</h1>
          <p className="text-gray-400 mb-6">No profile data found in the database.</p>
          <a href="/admin" className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
            Go to Admin Panel
          </a>
        </div>
      </main>
    );
  }

  const educationWithInstitutions = education.map((edu: EducationData) => {
    if (edu.degree.toLowerCase().includes('matric')) {
      return { ...edu, institution: 'Govt. Boys high school' };
    }
    if (edu.degree.toLowerCase().includes('intermediate')) {
      return { ...edu, institution: 'Govt. boys graduate college' };
    }
    if (edu.degree.toLowerCase().includes('bachelor')) {
      return { ...edu, institution: 'Bahaudin zakariya university Multan' };
    }
    return edu;
  });

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mudasir Choudhry Portfolio",
    url: siteUrl,
    description: profile.bio,
    inLanguage: "en",
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: siteUrl,
    image: absoluteUrl(profile.image || "/profile.png"),
    description: profile.bio,
    email: profile.email,
    sameAs: [profile.github, profile.linkedin, profile.whatsapp].filter(Boolean),
    knowsAbout: skills.map((skill: SkillData) => skill.name),
    jobTitle: profile.roles[0] || "Full Stack Developer",
  };

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Development Services",
    itemListElement: services.map((service: ServiceData, index: number) => ({
      "@type": "Service",
      position: index + 1,
      name: service.title,
      description: service.description,
      provider: {
        "@type": "Person",
        name: profile.name,
      },
    })),
  };

  const projectsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Projects",
    itemListElement: projects.slice(0, 8).map((project: ProjectData, index: number) => ({
      "@type": "CreativeWork",
      position: index + 1,
      name: project.title,
      description: project.longDescription || project.description,
      image: absoluteUrl(project.image),
      url: absoluteUrl(project.liveUrl || project.githubUrl || `${siteUrl}/#projects`),
    })),
  };

  return (
    <main className="h-full w-full relative">
      <link rel="preload" as="image" href={profile.image || "/profile.jpg"} fetchPriority="high" />
      <Scroll3DWrapper />
      <ScrollProgressBar />
      <FloatingContactBtn profile={profile} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema, personSchema, servicesSchema, projectsSchema]),
        }}
      />
      <div className="flex flex-col gap-0">
        <Hero
          profile={profile}
          skills={skills}
          experience={experience}
          education={education}
          projects={projects}
          certificates={certificates}
          languages={languages}
          interests={interests}
          settings={settings}
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
          <Education education={educationWithInstitutions} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Certifications certificates={certificates} />
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
          <HireMe profile={profile} settings={settings} />
        </ScrollReveal>

        <ScrollReveal width="100%">
          <Contact profile={profile} />
        </ScrollReveal>

        <Footer profile={profile} />
      </div>
    </main>
  );
}
