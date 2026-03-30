import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Svg, Path, Circle } from '@react-pdf/renderer';
import { ProfileData, SkillData, ExperienceData, EducationData, ProjectData, CertificateData, LanguageData, InterestData } from '@/lib/db';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000000',
    },
    // Main Content Area
    main: {
        width: '100%',
        paddingTop: 45,
        paddingBottom: 40,
        paddingLeft: 45,
        paddingRight: 45,
    },
    
    // Header Section
    name: {
        fontSize: 26,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Helvetica-Oblique',
        color: '#222222',
        marginBottom: 16,
    },
    
    // Contact Grid
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 25,
        rowGap: 8,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    contactText: {
        fontSize: 9.5,
        marginLeft: 6,
        color: '#000000',
        textDecoration: 'none',
    },

    // Section Headings
    sectionHeading: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        borderBottomWidth: 1.5,
        borderBottomColor: '#000000',
        paddingBottom: 3,
        marginBottom: 10,
        marginTop: 18,
    },

    // Generic Items (Experience, Education)
    itemBlock: {
        marginBottom: 14,
    },
    itemHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemTitleLeft: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: '70%',
    },
    itemTitleMain: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
    },
    itemTitleSub: {
        fontSize: 11,
        fontFamily: 'Helvetica-Oblique',
    },
    itemDateRight: {
        fontSize: 10,
        textAlign: 'right',
        minWidth: '25%',
    },
    itemLocationRight: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 2,
    },
    
    // Description text
    descriptionText: {
        fontSize: 10,
        lineHeight: 1.4,
        marginTop: 4,
        paddingLeft: 4,
        textAlign: 'justify',
    },

    // Skills Layout
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        rowGap: 12,
    },
    skillCategory: {
        width: '50%',
        marginBottom: 4,
    },
    skillCategoryTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        marginBottom: 2,
    },
    skillCategoryText: {
        fontSize: 9.5,
        lineHeight: 1.3,
        paddingRight: 15,
    }
});

// Reusable Icon component
const Icon = ({ path, isCircle = false, viewBox = "0 0 24 24" }: { path: string, isCircle?: boolean, viewBox?: string }) => (
    <Svg viewBox={viewBox} width={10} height={10}>
        {isCircle ? (
            <>
                <Path d={path} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Circle cx="12" cy="10" r="3" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
        ) : (
            <Path d={path} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
    </Svg>
);

const LinkedInIcon = () => (
    <Svg viewBox="0 0 24 24" width={10} height={10}>
        <Path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M2 9h4v12H2z" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="4" cy="4" r="2" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

interface ResumeDocumentProps {
    profile: ProfileData;
    skills: SkillData[];
    experience: ExperienceData[];
    education: EducationData[];
    projects: ProjectData[];
    certificates: CertificateData[];
    languages: LanguageData[];
    interests: InterestData[];
    settings: any;
}

const ResumeDocument = ({ profile, skills, experience, education, projects, certificates, languages, interests, settings }: ResumeDocumentProps) => {

    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill.name);
        return acc;
    }, {} as Record<string, string[]>);

    const renderDescription = (desc: string) => {
        if (!desc) return null;
        const items = desc.split('\n').filter(item => item.trim().length > 0);
        if (items.length <= 1) {
            return <Text style={styles.descriptionText}>{desc}</Text>;
        }
        return (
            <View style={{ marginTop: 4 }}>
                {items.map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <Text style={{ width: 10, fontSize: 10 }}>-</Text>
                        <Text style={{ flex: 1, fontSize: 10, lineHeight: 1.4, textAlign: 'justify' }}>{item.replace(/^[•-]\s*/, '')}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const getCleanUrl = (url: string) => {
        if (!url) return '';
        return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Main Content Area */}
                <View style={styles.main}>
                    
                    {/* Header */}
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.title}>{profile.roles[0] || "Professional Portfolio"}</Text>

                    {/* Contact Info */}
                    <View style={styles.contactRow}>
                        {profile.email && (
                            <View style={styles.contactItem}>
                                <Icon path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />
                                <Link src={`mailto:${profile.email}`} style={styles.contactText}>{profile.email}</Link>
                            </View>
                        )}
                        {profile.whatsapp && (
                            <View style={styles.contactItem}>
                                <Icon path="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                <Text style={styles.contactText}>{profile.whatsapp}</Text>
                            </View>
                        )}
                        <View style={styles.contactItem}>
                            <Icon path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" isCircle={true} />
                            <Text style={styles.contactText}>Location upon Request</Text>
                        </View>
                        {profile.linkedin && (
                            <View style={styles.contactItem}>
                                <LinkedInIcon />
                                <Link src={profile.linkedin} style={styles.contactText}>{getCleanUrl(profile.linkedin)}</Link>
                            </View>
                        )}
                        {profile.github && (
                            <View style={styles.contactItem}>
                                <Icon path="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                                <Link src={profile.github} style={styles.contactText}>{getCleanUrl(profile.github)}</Link>
                            </View>
                        )}
                    </View>

                    {/* Summary */}
                    {(profile.bio || profile.aboutText) && (
                        <View>
                            <Text style={styles.sectionHeading}>Summary</Text>
                            <Text style={styles.descriptionText}>
                                {profile.bio} {profile.aboutText.substring(0, 350)}...
                            </Text>
                        </View>
                    )}

                    {/* Professional Experience */}
                    {experience.length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Professional Experience</Text>
                            {experience.map(exp => (
                                <View key={exp.id} style={styles.itemBlock}>
                                    <View style={styles.itemHeaderRow}>
                                        <View style={styles.itemTitleLeft}>
                                            <Text style={styles.itemTitleMain}>{exp.company}</Text>
                                            <Text style={styles.itemTitleSub}>, {exp.title}</Text>
                                        </View>
                                        <Text style={styles.itemDateRight}>{exp.period}</Text>
                                    </View>
                                    {renderDescription(exp.description)}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Certificates */}
                    {settings?.cvShowCertificates !== false && certificates && certificates.length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Certificates</Text>
                            {certificates.map(cert => (
                                <View key={cert.id} style={styles.itemBlock}>
                                    <View style={styles.itemHeaderRow}>
                                        <View style={styles.itemTitleLeft}>
                                            <Text style={styles.itemTitleMain}>{cert.title}</Text>
                                            <Text style={styles.itemTitleSub}>, {cert.issuer}</Text>
                                        </View>
                                        <Text style={styles.itemDateRight}>{cert.date}</Text>
                                    </View>
                                    {cert.link && <Link src={cert.link} style={{...styles.itemTitleSub, color: '#666', textDecoration: 'none'}}>View Certificate</Link>}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Education</Text>
                            {education.map(edu => (
                                <View key={edu.id} style={styles.itemBlock}>
                                    <View style={styles.itemHeaderRow}>
                                        <View style={styles.itemTitleLeft}>
                                            <Text style={styles.itemTitleMain}>{edu.institution}</Text>
                                            <Text style={styles.itemTitleSub}>, {edu.degree}</Text>
                                        </View>
                                        <Text style={styles.itemDateRight}>{edu.period}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Skills Layout */}
                    {skills.length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Skills</Text>
                            <View style={styles.skillsGrid}>
                                {Object.entries(skillsByCategory).map(([category, skillList]) => (
                                    <View key={category} style={styles.skillCategory}>
                                        <Text style={styles.skillCategoryTitle}>{category}</Text>
                                        <Text style={styles.skillCategoryText}>{skillList.join(', ')}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Projects with toggle filter */}
                    {projects && projects.filter(p => p.showInCv !== false).length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Projects</Text>
                            {projects.filter(p => p.showInCv !== false).slice(0, 4).map((proj, i) => (
                                <View key={i} style={styles.itemBlock}>
                                    <View style={styles.itemHeaderRow}>
                                        <View style={styles.itemTitleLeft}>
                                            <Text style={styles.itemTitleMain}>{proj.title}</Text>
                                            <Text style={styles.itemTitleSub}>, {proj.category} App</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Main Description */}
                                    {renderDescription(proj.description)}

                                    {/* Tech Stack Bullet */}
                                    {proj.techStack && proj.techStack.length > 0 && (
                                        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                            <Text style={{ width: 10, fontSize: 10 }}>-</Text>
                                            <Text style={{ flex: 1, fontSize: 10, lineHeight: 1.4, textAlign: 'justify' }}>
                                                <Text style={{ fontFamily: 'Helvetica' }}>Tools, language & framework: </Text>
                                                {proj.techStack.join(', ')}
                                            </Text>
                                        </View>
                                    )}

                                    {/* App URL Bullet */}
                                    {proj.liveUrl && (
                                        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                            <Text style={{ width: 10, fontSize: 10 }}>-</Text>
                                            <Text style={{ flex: 1, fontSize: 10, lineHeight: 1.4, textAlign: 'justify' }}>
                                                <Text style={{ fontFamily: 'Helvetica' }}>App url: </Text>
                                                <Link src={proj.liveUrl} style={{ textDecoration: 'none', color: '#000' }}>{proj.liveUrl}</Link>
                                            </Text>
                                        </View>
                                    )}

                                </View>
                            ))}
                        </View>
                    )}

                    {/* Languages Layout */}
                    {settings?.cvShowLanguages !== false && languages && languages.length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Languages</Text>
                            <Text style={styles.descriptionText}>
                                {languages.map(l => `${l.name} - ${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)}`).join('  •  ')}
                            </Text>
                        </View>
                    )}

                    {/* Interests */}
                    {settings?.cvShowInterests !== false && interests && interests.length > 0 && (
                        <View>
                            <Text style={styles.sectionHeading}>Interests & Hobbies</Text>
                            <Text style={styles.descriptionText}>
                                {interests.map(i => i.name).join(' • ')}
                            </Text>
                        </View>
                    )}

                    {/* Declaration */}
                    {settings?.cvShowDeclaration !== false && profile.declaration && (
                        <View style={{ marginTop: 25 }}>
                            <Text style={styles.sectionHeading}>Declaration</Text>
                            <Text style={styles.descriptionText}>
                                {profile.declaration}
                            </Text>
                        </View>
                    )}

                </View>
            </Page>
        </Document>
    );
};

export default ResumeDocument;
