import { createEmptyResume, uid } from "../defaults";
import type {
  AchievementItem,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PersonalInfo,
  ProjectItem,
  ResumeData,
  TemplateId,
} from "../types";
import { PROFICIENCY_LEVELS } from "../types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonth(value: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  const mi = Number(month);
  if (!year || !mi || mi < 1 || mi > 12) return value;
  return `${MONTHS[mi - 1]} ${year}`;
}

export function formatRange(start: string, end: string, current: boolean): string {
  const a = formatMonth(start);
  const b = current ? "Present" : formatMonth(end);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export function splitBullets(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[•\-\*\u2013\u2014]\s*/, "").trim())
    .filter(Boolean);
}

export function prettyUrl(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function absUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t)) return t;
  return `https://${t}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function filled(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

export function showEducation(items: EducationItem[]): boolean {
  return items.some((i) => filled(i.degree) || filled(i.institution));
}

export function showExperience(items: ExperienceItem[]): boolean {
  return items.some((i) => filled(i.company) || filled(i.position));
}

export function showProjects(items: ProjectItem[]): boolean {
  return items.some((i) => filled(i.name) || filled(i.description));
}

export function showCerts(items: CertificationItem[]): boolean {
  return items.some((i) => filled(i.name) || filled(i.issuer));
}

export function showLanguages(items: LanguageItem[]): boolean {
  return items.some((i) => filled(i.name));
}

export function showAchievements(items: AchievementItem[]): boolean {
  return items.some((i) => filled(i.description));
}

export function isResumeStarted(data: ResumeData): boolean {
  const p = data.personal;
  return (
    filled(p.fullName) ||
    filled(p.jobTitle) ||
    filled(p.email) ||
    filled(p.phone) ||
    filled(p.photo) ||
    filled(data.summary) ||
    data.skills.length > 0 ||
    showEducation(data.education) ||
    showExperience(data.experience) ||
    showProjects(data.projects) ||
    showCerts(data.certifications) ||
    showLanguages(data.languages) ||
    showAchievements(data.achievements)
  );
}

export function completeness(data: ResumeData): { percent: number; label: string } {
  let score = 0;
  if (filled(data.personal.fullName)) score += 12;
  if (filled(data.personal.jobTitle)) score += 8;
  if (filled(data.personal.email)) score += 8;
  if (filled(data.personal.phone)) score += 6;
  if (filled(data.personal.location)) score += 4;
  if (data.summary.trim().length >= 40) score += 14;
  else if (filled(data.summary)) score += 6;
  if (showExperience(data.experience)) score += 16;
  if (showEducation(data.education)) score += 12;
  if (data.skills.length > 0) score += 8;
  if (showProjects(data.projects)) score += 6;
  if (showCerts(data.certifications)) score += 2;
  if (showLanguages(data.languages)) score += 2;
  if (showAchievements(data.achievements)) score += 2;
  const percent = Math.min(100, score);
  let label = "Add your name to begin";
  if (percent >= 90) label = "Ready to download";
  else if (percent >= 70) label = "Looking strong";
  else if (percent >= 40) label = "Coming together";
  else if (percent > 0) label = "Keep going";
  return { percent, label };
}

export function validateEmail(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Enter a valid email address.";
  return null;
}

export function validatePhone(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const digits = t.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Enter a phone number with 7–15 digits.";
  }
  return null;
}

export function validateUrl(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const candidate = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "Enter a valid website URL.";
    if (!u.hostname.includes(".")) return "Enter a valid website URL.";
    return null;
  } catch {
    return "Enter a valid website URL.";
  }
}

export function downloadIssues(data: ResumeData): string[] {
  const issues: string[] = [];
  if (!filled(data.personal.fullName)) issues.push("Add your full name.");
  if (!filled(data.personal.email) && !filled(data.personal.phone)) {
    issues.push("Add an email or phone number so employers can contact you.");
  }
  const emailErr = validateEmail(data.personal.email);
  if (emailErr) issues.push(emailErr);
  const phoneErr = validatePhone(data.personal.phone);
  if (phoneErr) issues.push(phoneErr);
  return issues;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown): boolean {
  return Boolean(value);
}

function asTemplate(value: unknown): TemplateId {
  if (value === "modern" || value === "executive" || value === "classic") return value;
  return "classic";
}

function withId<T extends { id: string }>(item: T): T {
  return item.id ? item : { ...item, id: uid() };
}

export function normalizeResume(input: unknown): ResumeData {
  const empty = createEmptyResume();
  if (!input || typeof input !== "object") return empty;
  const root = input as Record<string, unknown>;
  const src = (
    root.data && typeof root.data === "object" ? root.data : root
  ) as Record<string, unknown>;
  const personalSrc = (src.personal && typeof src.personal === "object"
    ? src.personal
    : {}) as Record<string, unknown>;

  const personal: PersonalInfo = {
    fullName: asString(personalSrc.fullName),
    jobTitle: asString(personalSrc.jobTitle),
    phone: asString(personalSrc.phone),
    email: asString(personalSrc.email),
    location: asString(personalSrc.location),
    linkedin: asString(personalSrc.linkedin),
    website: asString(personalSrc.website),
    photo: asString(personalSrc.photo),
  };

  const education = Array.isArray(src.education)
    ? src.education.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return withId({
          id: asString(row.id),
          degree: asString(row.degree),
          institution: asString(row.institution),
          year: asString(row.year),
          score: asString(row.score),
        });
      })
    : [];

  const experience = Array.isArray(src.experience)
    ? src.experience.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return withId({
          id: asString(row.id),
          company: asString(row.company),
          position: asString(row.position),
          startDate: asString(row.startDate),
          endDate: asString(row.endDate),
          current: asBool(row.current),
          responsibilities: asString(row.responsibilities),
        });
      })
    : [];

  const projects = Array.isArray(src.projects)
    ? src.projects.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return withId({
          id: asString(row.id),
          name: asString(row.name),
          description: asString(row.description),
          technologies: asString(row.technologies),
        });
      })
    : [];

  const certifications = Array.isArray(src.certifications)
    ? src.certifications.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return withId({
          id: asString(row.id),
          name: asString(row.name),
          issuer: asString(row.issuer),
          year: asString(row.year),
        });
      })
    : [];

  const languages = Array.isArray(src.languages)
    ? src.languages.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        const proficiency = asString(row.proficiency, "Professional");
        return withId({
          id: asString(row.id),
          name: asString(row.name),
          proficiency: (PROFICIENCY_LEVELS as readonly string[]).includes(proficiency)
            ? proficiency
            : "Professional",
        });
      })
    : [];

  const achievements = Array.isArray(src.achievements)
    ? src.achievements.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return withId({
          id: asString(row.id),
          description: asString(row.description),
        });
      })
    : [];

  const skills = Array.isArray(src.skills)
    ? src.skills.map((s) => asString(s).trim()).filter(Boolean).slice(0, 28)
    : [];

  return {
    personal,
    summary: asString(src.summary),
    education,
    experience,
    skills,
    projects,
    certifications,
    languages,
    achievements,
    template: asTemplate(src.template),
  };
}

export function moveItem<T extends { id: string }>(arr: T[], id: string, dir: -1 | 1): T[] {
  const i = arr.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const copy = arr.slice();
  const current = copy[i]!;
  copy[i] = copy[j]!;
  copy[j] = current;
  return copy;
}

export function resumeBasename(name: string): string {
  const s = name
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 40);
  return s || "Resume";
}

export type ContactItem = { text: string; href?: string };

export function contactItems(p: PersonalInfo): ContactItem[] {
  const items: ContactItem[] = [];
  if (filled(p.phone)) items.push({ text: p.phone.trim(), href: `tel:${p.phone.trim()}` });
  if (filled(p.email)) items.push({ text: p.email.trim(), href: `mailto:${p.email.trim()}` });
  if (filled(p.location)) items.push({ text: p.location.trim() });
  if (filled(p.linkedin)) {
    items.push({ text: prettyUrl(p.linkedin), href: absUrl(p.linkedin) });
  }
  if (filled(p.website)) {
    items.push({ text: prettyUrl(p.website), href: absUrl(p.website) });
  }
  return items;
}
