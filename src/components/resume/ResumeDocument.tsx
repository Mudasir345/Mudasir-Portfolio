
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData } from '@/lib/db';

// Register Roboto Font
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 'medium' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' }
    ]
});

// Styles - Sidebar Removed, Optimized for Full Width
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Roboto',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#333',
        padding: 30 // Increased overall padding for cleaner "Paper" look
    },
    // Removed Sidebar style
    content: {
        width: '100%',
        flexDirection: 'column'
    },
    // Header Section
    header: {
        marginBottom: 20,
        borderBottomWidth: 2, // Thicker separator for emphasis since sidebar is gone
        borderBottomColor: '#222', // Darker line
        paddingBottom: 15
    },
    name: {
        fontSize: 32, // Larger name for impact
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.2
    },
    role: {
        fontSize: 14,
        color: '#444',
        fontStyle: 'italic',
        marginBottom: 10,
        fontWeight: 'medium'
    },
    contactInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 20, // More space between items
        fontSize: 10,
        color: '#333',
        marginTop: 5
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    link: {
        color: '#333',
        textDecoration: 'none'
    },
    // Section Headers
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        marginBottom: 15,
        marginTop: 15,
        paddingBottom: 4,
        letterSpacing: 1
    },
    // Experience & Education Items
    itemContainer: {
        marginBottom: 15,
    },
    rowSplit: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 2
    },
    leftCol: {
        flex: 1,
        marginRight: 15
    },
    rightCol: {
        alignItems: 'flex-end',
        minWidth: 80
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000'
    },
    roleTitle: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#222',
        marginTop: 1
    },
    dateLocation: {
        fontSize: 10,
        color: '#222', // Darker date for readability
        fontWeight: 'medium',
        textAlign: 'right'
    },
    description: {
        fontSize: 10,
        color: '#444',
        lineHeight: 1.5,
        marginTop: 4,
        textAlign: 'justify'
    },
    // Skills
    skillCategory: {
        marginBottom: 8,
        fontSize: 10,
        flexDirection: 'row',
        lineHeight: 1.5
    },
    skillLabel: {
        fontWeight: 'bold',
        color: '#000000',
        width: 120, // Wider label area
        marginRight: 10
    },
    skillList: {
        flex: 1,
        color: '#333'
    }
});

interface ResumeDocumentProps {
    profile: ProfileData;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    projects: ProjectData[];
}

const ResumeDocument = ({ profile, skills, experience, education, projects }: ResumeDocumentProps) => {

    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill.name);
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Main Content Area - Full Width */}
                <View style={styles.content}>

                    {/* Header - Cleaner, bolder, sidebar-free */}
                    <View style={styles.header}>
                        <Text style={styles.name}>{profile.name}</Text>
                        <Text style={styles.role}>{profile.roles[0] || "Full Stack Developer"}</Text>

                        <View style={styles.contactInfo}>
                            {profile.email && (
                                <View style={styles.contactItem}>
                                    <Text style={{ fontWeight: 'bold', marginRight: 4 }}>Email:</Text>
                                    <Link src={`mailto:${profile.email}`} style={styles.link}>{profile.email}</Link>
                                </View>
                            )}
                            {profile.whatsapp && (
                                <View style={styles.contactItem}>
                                    <Text style={{ fontWeight: 'bold', marginRight: 4 }}>Phone:</Text>
                                    <Text>{profile.whatsapp}</Text>
                                </View>
                            )}
                            <View style={styles.contactItem}>
                                <Text style={{ fontWeight: 'bold', marginRight: 4 }}>Location:</Text>
                                <Text>Pakistan</Text>
                            </View>
                        </View>

                        {/* Links Row */}
                        <View style={styles.contactInfo}>
                            {profile.linkedin && (
                                <View style={styles.contactItem}>
                                    <Text style={{ fontWeight: 'bold', marginRight: 4 }}>LinkedIn:</Text>
                                    <Link src={profile.linkedin} style={styles.link}>linkedin.com/in/{profile.name.split(' ')[0].toLowerCase()}</Link>
                                </View>
                            )}
                            {profile.github && (
                                <View style={styles.contactItem}>
                                    <Text style={{ fontWeight: 'bold', marginRight: 4 }}>GitHub:</Text>
                                    <Link src={profile.github} style={styles.link}>github.com/{profile.name.split(' ')[0].toLowerCase()}</Link>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Experience Section */}
                    {experience.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Professional Experience</Text>
                            {experience.map(exp => (
                                <View key={exp.id} style={styles.itemContainer}>
                                    <View style={styles.rowSplit}>
                                        <View style={styles.leftCol}>
                                            <Text style={styles.companyName}>{exp.company}</Text>
                                            <Text style={styles.roleTitle}>{exp.title}</Text>
                                        </View>
                                        <View style={styles.rightCol}>
                                            <Text style={styles.dateLocation}>{exp.period}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.description}>{exp.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Key Projects Section - Similar Layout to Experience */}
                    {projects.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Key Projects</Text>
                            {projects.slice(0, 4).map((proj, i) => (
                                <View key={i} style={styles.itemContainer}>
                                    <View style={styles.rowSplit}>
                                        <View style={styles.leftCol}>
                                            <Text style={styles.companyName}>{proj.title}</Text>
                                            <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#555', marginTop: 1 }}>
                                                {proj.techStack.join(' • ')}
                                            </Text>
                                        </View>
                                        <View style={styles.rightCol}>
                                            {proj.liveUrl && <Link src={proj.liveUrl} style={{ fontSize: 9, color: '#333', textDecoration: 'none', borderBottomWidth: 1, borderBottomColor: '#333' }}>View Live</Link>}
                                        </View>
                                    </View>
                                    <Text style={styles.description}>{proj.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Education Section */}
                    {education.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Education</Text>
                            {education.map(edu => (
                                <View key={edu.id} style={styles.itemContainer}>
                                    <View style={styles.rowSplit}>
                                        <View style={styles.leftCol}>
                                            <Text style={styles.companyName}>{edu.institution}</Text>
                                            <Text style={styles.roleTitle}>{edu.degree}</Text>
                                        </View>
                                        <View style={styles.rightCol}>
                                            <Text style={styles.dateLocation}>{edu.period}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.description}>{edu.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Skills Section */}
                    <View>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        {Object.entries(skillsByCategory).map(([category, skillList]) => (
                            <View key={category} style={styles.skillCategory}>
                                <Text style={styles.skillLabel}>{category}:</Text>
                                <Text style={styles.skillList}>{skillList.join(', ')}</Text>
                            </View>
                        ))}
                    </View>

                </View>
            </Page>
        </Document>
    );
};

export default ResumeDocument;
