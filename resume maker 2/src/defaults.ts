import type {
  AchievementItem,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  ResumeData,
} from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createEducation(): EducationItem {
  return { id: uid(), degree: "", institution: "", year: "", score: "" };
}

export function createExperience(): ExperienceItem {
  return {
    id: uid(),
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: "",
  };
}

export function createProject(): ProjectItem {
  return { id: uid(), name: "", description: "", technologies: "" };
}

export function createCertification(): CertificationItem {
  return { id: uid(), name: "", issuer: "", year: "" };
}

export function createLanguage(): LanguageItem {
  return { id: uid(), name: "", proficiency: "Professional" };
}

export function createAchievement(): AchievementItem {
  return { id: uid(), description: "" };
}

export function createEmptyResume(): ResumeData {
  return {
    personal: {
      fullName: "",
      jobTitle: "",
      phone: "",
      email: "",
      location: "",
      linkedin: "",
      website: "",
      photo: "",
    },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
    template: "classic",
  };
}
