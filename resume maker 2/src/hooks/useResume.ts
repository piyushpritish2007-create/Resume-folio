import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAchievement,
  createCertification,
  createEducation,
  createEmptyResume,
  createExperience,
  createLanguage,
  createProject,
} from "../defaults";
import { clearResumeStorage, loadResume, saveResume } from "../storage";
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
import { LIMITS } from "../types";
import { moveItem } from "../utils/resume";

export function useResume(onSaveError?: (message: string) => void) {
  const [data, setData] = useState<ResumeData>(() => loadResume());
  const onSaveErrorRef = useRef(onSaveError);
  onSaveErrorRef.current = onSaveError;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = saveResume(data);
      if (!result.ok && result.error) onSaveErrorRef.current?.(result.error);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [data]);

  const setPersonal = useCallback((patch: Partial<PersonalInfo>) => {
    setData((d) => ({ ...d, personal: { ...d.personal, ...patch } }));
  }, []);

  const setSummary = useCallback((summary: string) => {
    setData((d) => ({ ...d, summary: summary.slice(0, LIMITS.summary) }));
  }, []);

  const setTemplate = useCallback((template: TemplateId) => {
    setData((d) => ({ ...d, template }));
  }, []);

  const addEducation = useCallback(() => {
    setData((d) => ({ ...d, education: [...d.education, createEducation()] }));
  }, []);

  const updateEducation = useCallback((id: string, patch: Partial<EducationItem>) => {
    setData((d) => ({
      ...d,
      education: d.education.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setData((d) => ({ ...d, education: d.education.filter((item) => item.id !== id) }));
  }, []);

  const moveEducation = useCallback((id: string, dir: -1 | 1) => {
    setData((d) => ({ ...d, education: moveItem(d.education, id, dir) }));
  }, []);

  const addExperience = useCallback(() => {
    setData((d) => ({ ...d, experience: [...d.experience, createExperience()] }));
  }, []);

  const updateExperience = useCallback((id: string, patch: Partial<ExperienceItem>) => {
    setData((d) => ({
      ...d,
      experience: d.experience.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setData((d) => ({ ...d, experience: d.experience.filter((item) => item.id !== id) }));
  }, []);

  const moveExperience = useCallback((id: string, dir: -1 | 1) => {
    setData((d) => ({ ...d, experience: moveItem(d.experience, id, dir) }));
  }, []);

  const addProject = useCallback(() => {
    setData((d) => ({ ...d, projects: [...d.projects, createProject()] }));
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<ProjectItem>) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setData((d) => ({ ...d, projects: d.projects.filter((item) => item.id !== id) }));
  }, []);

  const moveProject = useCallback((id: string, dir: -1 | 1) => {
    setData((d) => ({ ...d, projects: moveItem(d.projects, id, dir) }));
  }, []);

  const addCertification = useCallback(() => {
    setData((d) => ({ ...d, certifications: [...d.certifications, createCertification()] }));
  }, []);

  const updateCertification = useCallback((id: string, patch: Partial<CertificationItem>) => {
    setData((d) => ({
      ...d,
      certifications: d.certifications.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      certifications: d.certifications.filter((item) => item.id !== id),
    }));
  }, []);

  const moveCertification = useCallback((id: string, dir: -1 | 1) => {
    setData((d) => ({ ...d, certifications: moveItem(d.certifications, id, dir) }));
  }, []);

  const addLanguage = useCallback(() => {
    setData((d) => ({ ...d, languages: [...d.languages, createLanguage()] }));
  }, []);

  const updateLanguage = useCallback((id: string, patch: Partial<LanguageItem>) => {
    setData((d) => ({
      ...d,
      languages: d.languages.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setData((d) => ({ ...d, languages: d.languages.filter((item) => item.id !== id) }));
  }, []);

  const addAchievement = useCallback(() => {
    setData((d) => ({ ...d, achievements: [...d.achievements, createAchievement()] }));
  }, []);

  const updateAchievement = useCallback((id: string, patch: Partial<AchievementItem>) => {
    setData((d) => ({
      ...d,
      achievements: d.achievements.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }, []);

  const removeAchievement = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      achievements: d.achievements.filter((item) => item.id !== id),
    }));
  }, []);

  const addSkill = useCallback((raw: string) => {
    const skill = raw.trim().slice(0, LIMITS.skill);
    if (!skill) return false;
    let added = false;
    setData((d) => {
      if (d.skills.length >= LIMITS.skillsMax) return d;
      if (d.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) return d;
      added = true;
      return { ...d, skills: [...d.skills, skill] };
    });
    return added;
  }, []);

  const removeSkill = useCallback((skill: string) => {
    setData((d) => ({ ...d, skills: d.skills.filter((s) => s !== skill) }));
  }, []);

  const reset = useCallback(() => {
    clearResumeStorage();
    setData(createEmptyResume());
  }, []);

  const replace = useCallback((next: ResumeData) => {
    setData(next);
  }, []);

  return {
    data,
    setPersonal,
    setSummary,
    setTemplate,
    addEducation,
    updateEducation,
    removeEducation,
    moveEducation,
    addExperience,
    updateExperience,
    removeExperience,
    moveExperience,
    addProject,
    updateProject,
    removeProject,
    moveProject,
    addCertification,
    updateCertification,
    removeCertification,
    moveCertification,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addAchievement,
    updateAchievement,
    removeAchievement,
    addSkill,
    removeSkill,
    reset,
    replace,
  };
}
