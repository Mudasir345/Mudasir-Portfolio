
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData } from '@/lib/db';

// Register Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.4,
        padding: 40,
        color: '#1a202c' // Slightly softer black
    },
    // Header
    headerContainer: {
        alignItems: 'center', // Center align for Classic look
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 10
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 6, // More space to avoid overlap
        letterSpacing: 1,
        color: '#000'
    },
    role: {
        fontSize: 12,
        color: '#000',
        marginBottom: 8,
        fontFamily: 'Times-Roman'
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        fontSize: 10,
        color: '#000',
        marginBottom: 2 // Space between rows
    },
    link: {
        textDecoration: 'none',
        color: '#000'
    },
    // Sections
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 8,
        marginTop: 12,
        paddingBottom: 2,
        letterSpacing: 0.5,
        color: '#000'
    },
    // Summary
    summary: {
        fontSize: 10,
        textAlign: 'justify',
        marginBottom: 4,
        lineHeight: 1.4,
        color: '#000'
    },
    // Items
    itemContainer: {
        marginBottom: 6
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 1
    },
    boldText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000'
    },
    italicText: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#000'
    },
    dateText: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#000',
        minWidth: 80,
        textAlign: 'right'
    },
    descriptionList: {
        marginTop: 2,
        paddingLeft: 0
    },
    descriptionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 2
    },
    bullet: {
        width: 10,
        fontSize: 10,
        marginLeft: 5
    },
    descriptionText: {
        flex: 1,
        fontSize: 10,
        lineHeight: 1.4,
        textAlign: 'justify'
    },
    // Skills
    skillRow: {
        flexDirection: 'row',
        marginBottom: 3
    },
    skillLabel: {
        fontWeight: 'bold',
        width: 100,
        fontSize: 10
    },
    skillContent: {
        flex: 1,
        fontSize: 10
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

    // Helper to organize skills
    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill.name);
        return acc;
    }, {} as Record<string, string[]>);

    // Helper to format generic description into bullet points if it contains newlines
    const renderDescription = (desc: string) => {
        const items = desc.split('\n').filter(item => item.trim().length > 0);

        if (items.length <= 1) {
            return <Text style={styles.summary}>{desc}</Text>;
        }

        return (
            <View style={styles.descriptionList}>
                {items.map((item, i) => (
                    <View key={i} style={styles.descriptionItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.descriptionText}>{item.replace(/^[•-]\s*/, '')}</Text>
                    </View>
                ))}
            </View>
        );
    };

    // Helper URLs
    const getCleanUrl = (url: string) => {
        return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.role}>{profile.roles[0] || "Full Stack Developer"}</Text>

                    {/* Row 1: Contact */}
                    <View style={styles.contactRow}>
                        <Text>Pakistan</Text>
                        <Text>•</Text>
                        {profile.email && <Link src={`mailto:${profile.email}`} style={styles.link}>{profile.email}</Link>}
                        {profile.whatsapp && (
                            <>
                                <Text>•</Text>
                                <Text>{profile.whatsapp}</Text>
                            </>
                        )}
                    </View>

                    {/* Row 2: Links */}
                    <View style={styles.contactRow}>
                        {profile.linkedin && (
                            <>
                                <Link src={profile.linkedin} style={styles.link}>{getCleanUrl(profile.linkedin)}</Link>
                            </>
                        )}
                        {profile.github && (
                            <>
                                <Text>•</Text>
                                <Link src={profile.github} style={styles.link}>{getCleanUrl(profile.github)}</Link>
                            </>
                        )}
                    </View>
                </View>

                {/* Summary Section (Currently mapped to bio/about) */}
                {(profile.bio || profile.aboutText) && (
                    <View>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.summary}>
                            {profile.bio}. {profile.aboutText.substring(0, 300)}...
                        </Text>
                    </View>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map(edu => (
                            <View key={edu.id} style={styles.itemContainer}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.boldText}>{edu.institution}</Text>
                                    <Text style={styles.dateText}>{edu.period}</Text>
                                </View>
                                <View style={styles.headerRow}>
                                    <Text style={styles.italicText}>{edu.degree}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {experience.map(exp => (
                            <View key={exp.id} style={styles.itemContainer}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.boldText}>{exp.company}</Text>
                                    <Text style={styles.dateText}>{exp.period}</Text>
                                </View>
                                <View style={{ marginBottom: 2 }}>
                                    <Text style={styles.italicText}>{exp.title}</Text>
                                </View>
                                {renderDescription(exp.description)}
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.slice(0, 5).map((proj, i) => (
                            <View key={i} style={styles.itemContainer}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.boldText}>{proj.title}</Text>
                                    {proj.liveUrl ? (
                                        <Link src={proj.liveUrl} style={styles.link}>View Live</Link>
                                    ) : (
                                        <Text style={styles.dateText}>{proj.category}</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 2 }}>
                                    {proj.techStack.join(', ')}
                                </Text>
                                {renderDescription(proj.description)}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                <View>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    {Object.entries(skillsByCategory).map(([category, skillList]) => (
                        <View key={category} style={styles.skillRow}>
                            <Text style={styles.skillLabel}>{category}:</Text>
                            <Text style={styles.skillContent}>{skillList.join(', ')}</Text>
                        </View>
                    ))}
                </View>

            </Page>
        </Document>
    );
};

export default ResumeDocument;
