export type TemplateId = "classic" | "modern" | "executive";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  website: string;
  photo: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  score: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface AchievementItem {
  id: string;
  description: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  achievements: AchievementItem[];
  template: TemplateId;
}

export const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Intermediate",
  "Basic",
] as const;

export const LIMITS = {
  fullName: 80,
  jobTitle: 90,
  phone: 24,
  email: 80,
  location: 80,
  linkedin: 120,
  website: 120,
  summary: 700,
  degree: 90,
  institution: 100,
  year: 24,
  score: 24,
  company: 90,
  position: 90,
  responsibilities: 900,
  skill: 40,
  skillsMax: 28,
  projectName: 90,
  projectDescription: 420,
  technologies: 140,
  certName: 90,
  certIssuer: 90,
  language: 40,
  achievement: 220,
} as const;
