const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const dataFilePath = path.join(process.cwd(), 'src/data/data.json');

async function clearDatabase() {
  console.log('🧹 Purana data delete kiya ja raha hai...');
  // Delete in reverse order of creation due to foreign key constraints
  await prisma.gallery.deleteMany({});
  await prisma.serviceDetail.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.language.deleteMany({});
  await prisma.interest.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.settings.deleteMany({});
  console.log('✅ Purana data delete ho gaya.');
}

async function seedProfile(profile) {
  console.log('👤 Seeding Profile...');
  await prisma.profile.create({
    data: {
      name: profile.name,
      image: profile.image,
      roles: profile.roles.join(','),
      bio: profile.bio,
      aboutText: profile.aboutText,
      experienceYears: profile.stats.experienceYears,
      projectsCompleted: profile.stats.projectsCompleted,
      satisfaction: profile.stats.satisfaction,
      availability: profile.stats.availability,
      email: profile.email,
      github: profile.github,
      linkedin: profile.linkedin,
      whatsapp: profile.whatsapp,
      ...(profile.declaration && { declaration: profile.declaration }),
    },
  });
  console.log('✅ Profile seeded successfully.');
}

async function seedSimpleModels(data) {
  console.log('📄 Seeding simple models (Skills, Experience, etc.)...');
  if (data.skills && data.skills.length > 0) await prisma.skill.createMany({ data: data.skills });
  if (data.experience && data.experience.length > 0) await prisma.experience.createMany({ data: data.experience });
  if (data.education && data.education.length > 0) await prisma.education.createMany({ data: data.education });
  if (data.testimonials && data.testimonials.length > 0) await prisma.testimonial.createMany({ data: data.testimonials });
  if (data.team && data.team.length > 0) await prisma.teamMember.createMany({ data: data.team });
  if (data.certificates && data.certificates.length > 0) await prisma.certificate.createMany({ data: data.certificates });
  if (data.languages && data.languages.length > 0) await prisma.language.createMany({ data: data.languages });
  if (data.interests && data.interests.length > 0) await prisma.interest.createMany({ data: data.interests });
  console.log('✅ Simple models seeded successfully.');
}

async function seedProjects(projects) {
  console.log('🏗️ Seeding Projects and Galleries...');
  for (const project of projects) {
    const { gallery, ...projectData } = project;
    const createdProject = await prisma.project.create({
      data: {
        ...projectData,
        techStack: project.techStack.join(','),
        features: project.features.join(','),
        challenges: project.challenges.join(','),
      },
    });

    if (gallery && gallery.length > 0) {
      for (const item of gallery) {
        await prisma.gallery.create({
          data: { ...item, projectId: createdProject.id },
        });
      }
    }
  }
  console.log('✅ Projects and Galleries seeded successfully.');
}

async function seedServices(services) {
  console.log('🛠️ Seeding Services and Details...');
  for (const service of services) {
    const { details, ...serviceData } = service;
    const createdService = await prisma.service.create({
      data: serviceData,
    });

    if (details && details.length > 0) {
      for (const item of details) {
        await prisma.serviceDetail.create({
          data: { ...item, serviceId: createdService.id },
        });
      }
    }
  }
  console.log('✅ Services and Details seeded successfully.');
}

async function seedSettings(settings) {
    console.log('⚙️ Seeding Settings...');
    await prisma.settings.create({ data: settings });
    console.log('✅ Settings seeded successfully.');
}


async function main() {
  console.log('🚀 Seeding process shuru ho raha hai...');
  
  await clearDatabase();

  console.log('📖 data.json se data parha ja raha hai...');
  const jsonData = await fs.readFile(dataFilePath, 'utf-8');
  const data = JSON.parse(jsonData);
  console.log('✅ Data parh liya gaya.');

  await seedProfile(data.profile);
  await seedSimpleModels(data);
  await seedProjects(data.projects);
  await seedServices(data.services);
  await seedSettings(data.settings);

  console.log('🎉 Seeding process mukammal ho gaya hai!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding ke dauran error aayi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });