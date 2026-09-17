import { useRef, useState } from "react";
import type { useResume } from "../hooks/useResume";
import { LIMITS, PROFICIENCY_LEVELS } from "../types";
import { resizePhoto } from "../utils/image";
import { validateEmail, validatePhone, validateUrl } from "../utils/resume";
import { AddButton, IconBtn, SectionCard, TextArea, TextField } from "./ui";

type ResumeApi = ReturnType<typeof useResume>;

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </svg>
  );
}

function UpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const NAV = [
  { id: "personal", label: "Personal" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
  { id: "achievements", label: "Achievements" },
] as const;

export function Editor({
  api,
  onNotice,
}: {
  api: ResumeApi;
  onNotice: (message: string, type: "success" | "error" | "info") => void;
}) {
  const { data } = api;
  const photoRef = useRef<HTMLInputElement>(null);
  const [skillDraft, setSkillDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      const photo = await resizePhoto(file);
      api.setPersonal({ photo });
      onNotice("Photo added to your resume.", "success");
    } catch (err) {
      onNotice(err instanceof Error ? err.message : "Could not add that photo.", "error");
    }
  }

  function commitSkill(raw?: string) {
    const value = (raw ?? skillDraft).trim();
    if (!value) return;
    const ok = api.addSkill(value);
    setSkillDraft("");
    if (!ok && data.skills.length >= LIMITS.skillsMax) {
      onNotice(`You can add up to ${LIMITS.skillsMax} skills.`, "info");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <nav className="sticky top-0 z-10 border-b border-slate-200/80 bg-[#eef2f7]/90 px-3 py-2 backdrop-blur">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-indigo-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-4 p-4 pb-24 lg:pb-8">
        <SectionCard
          id="personal"
          title="Personal information"
          subtitle="This appears at the top of your resume."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
            </svg>
          }
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {data.personal.photo ? (
                <img src={data.personal.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <input
                ref={photoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  void onPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  {data.personal.photo ? "Change photo" : "Upload photo"}
                </button>
                {data.personal.photo ? (
                  <button
                    type="button"
                    onClick={() => api.setPersonal({ photo: "" })}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Optional. JPG or PNG, resized in your browser.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="fullName"
              label="Full name"
              required
              value={data.personal.fullName}
              maxLength={LIMITS.fullName}
              placeholder="e.g. Jordan Lee"
              onChange={(v) => api.setPersonal({ fullName: v })}
            />
            <TextField
              id="jobTitle"
              label="Job title"
              value={data.personal.jobTitle}
              maxLength={LIMITS.jobTitle}
              placeholder="e.g. Product Designer"
              onChange={(v) => api.setPersonal({ jobTitle: v })}
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              value={data.personal.email}
              maxLength={LIMITS.email}
              placeholder="you@email.com"
              error={errors.email}
              onChange={(v) => {
                api.setPersonal({ email: v });
                setErrors((e) => (e.email ? { ...e, email: validateEmail(v) || "" } : e));
              }}
              onBlur={() =>
                setErrors((e) => ({ ...e, email: validateEmail(data.personal.email) || "" }))
              }
            />
            <TextField
              id="phone"
              label="Phone"
              type="tel"
              value={data.personal.phone}
              maxLength={LIMITS.phone}
              placeholder="+1 555 0100"
              error={errors.phone}
              onChange={(v) => {
                api.setPersonal({ phone: v });
                setErrors((e) => (e.phone ? { ...e, phone: validatePhone(v) || "" } : e));
              }}
              onBlur={() =>
                setErrors((e) => ({ ...e, phone: validatePhone(data.personal.phone) || "" }))
              }
            />
            <TextField
              id="location"
              label="Location"
              value={data.personal.location}
              maxLength={LIMITS.location}
              placeholder="City, Country"
              onChange={(v) => api.setPersonal({ location: v })}
            />
            <TextField
              id="linkedin"
              label="LinkedIn"
              value={data.personal.linkedin}
              maxLength={LIMITS.linkedin}
              placeholder="linkedin.com/in/yourname"
              error={errors.linkedin}
              onChange={(v) => {
                api.setPersonal({ linkedin: v });
                setErrors((e) => (e.linkedin ? { ...e, linkedin: validateUrl(v) || "" } : e));
              }}
              onBlur={() =>
                setErrors((e) => ({ ...e, linkedin: validateUrl(data.personal.linkedin) || "" }))
              }
            />
            <div className="sm:col-span-2">
              <TextField
                id="website"
                label="Portfolio / website"
                value={data.personal.website}
                maxLength={LIMITS.website}
                placeholder="yourdomain.com"
                error={errors.website}
                onChange={(v) => {
                  api.setPersonal({ website: v });
                  setErrors((e) => (e.website ? { ...e, website: validateUrl(v) || "" } : e));
                }}
                onBlur={() =>
                  setErrors((e) => ({ ...e, website: validateUrl(data.personal.website) || "" }))
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="summary"
          title="Professional summary"
          subtitle="2–4 sentences about your strengths and what you want next."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          }
        >
          <TextArea
            id="summary-text"
            label="Summary"
            value={data.summary}
            maxLength={LIMITS.summary}
            rows={5}
            placeholder="Write a concise overview of your experience, skills, and career focus."
            hint="Aim for 400 characters or less for the strongest first impression."
            onChange={api.setSummary}
          />
        </SectionCard>

        <SectionCard
          id="experience"
          title="Work experience"
          subtitle="Add roles in reverse chronological order. Press Enter for bullet points."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          }
        >
          <div className="space-y-3">
            {data.experience.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Role {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <IconBtn
                      label="Move up"
                      disabled={index === 0}
                      onClick={() => api.moveExperience(item.id, -1)}
                    >
                      <UpIcon />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={index === data.experience.length - 1}
                      onClick={() => api.moveExperience(item.id, 1)}
                    >
                      <DownIcon />
                    </IconBtn>
                    <IconBtn label="Remove role" onClick={() => api.removeExperience(item.id)}>
                      <TrashIcon />
                    </IconBtn>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id={`pos-${item.id}`}
                    label="Position"
                    value={item.position}
                    maxLength={LIMITS.position}
                    onChange={(v) => api.updateExperience(item.id, { position: v })}
                  />
                  <TextField
                    id={`co-${item.id}`}
                    label="Company"
                    value={item.company}
                    maxLength={LIMITS.company}
                    onChange={(v) => api.updateExperience(item.id, { company: v })}
                  />
                  <TextField
                    id={`start-${item.id}`}
                    label="Start date"
                    type="month"
                    value={item.startDate}
                    onChange={(v) => api.updateExperience(item.id, { startDate: v })}
                  />
                  <TextField
                    id={`end-${item.id}`}
                    label="End date"
                    type="month"
                    value={item.current ? "" : item.endDate}
                    disabled={item.current}
                    error={
                      !item.current && item.startDate && item.endDate && item.endDate < item.startDate
                        ? "End date should be after the start date."
                        : undefined
                    }
                    onChange={(v) => api.updateExperience(item.id, { endDate: v, current: false })}
                  />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) =>
                      api.updateExperience(item.id, {
                        current: e.target.checked,
                        endDate: e.target.checked ? "" : item.endDate,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  I currently work here
                </label>
                <div className="mt-3">
                  <TextArea
                    id={`resp-${item.id}`}
                    label="Responsibilities"
                    value={item.responsibilities}
                    maxLength={LIMITS.responsibilities}
                    rows={4}
                    hint="One achievement per line. These become bullet points on the resume."
                    placeholder={"Led a team of 4 designers\nShipped a redesign that improved conversion"}
                    onChange={(v) => api.updateExperience(item.id, { responsibilities: v })}
                  />
                </div>
              </div>
            ))}
            <AddButton label="Add experience" onClick={api.addExperience} />
          </div>
        </SectionCard>

        <SectionCard
          id="education"
          title="Education"
          subtitle="Degrees, diplomas, or relevant coursework."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10l9-5 9 5-9 5-9-5z" />
              <path d="M7 12v5c0 1 2.5 3 5 3s5-2 5-3v-5" />
            </svg>
          }
        >
          <div className="space-y-3">
            {data.education.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Education {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <IconBtn
                      label="Move up"
                      disabled={index === 0}
                      onClick={() => api.moveEducation(item.id, -1)}
                    >
                      <UpIcon />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={index === data.education.length - 1}
                      onClick={() => api.moveEducation(item.id, 1)}
                    >
                      <DownIcon />
                    </IconBtn>
                    <IconBtn label="Remove education" onClick={() => api.removeEducation(item.id)}>
                      <TrashIcon />
                    </IconBtn>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id={`deg-${item.id}`}
                    label="Degree / course"
                    value={item.degree}
                    maxLength={LIMITS.degree}
                    onChange={(v) => api.updateEducation(item.id, { degree: v })}
                  />
                  <TextField
                    id={`ins-${item.id}`}
                    label="Institution"
                    value={item.institution}
                    maxLength={LIMITS.institution}
                    onChange={(v) => api.updateEducation(item.id, { institution: v })}
                  />
                  <TextField
                    id={`year-${item.id}`}
                    label="Year"
                    value={item.year}
                    maxLength={LIMITS.year}
                    placeholder="2019 – 2023"
                    onChange={(v) => api.updateEducation(item.id, { year: v })}
                  />
                  <TextField
                    id={`score-${item.id}`}
                    label="Percentage / CGPA"
                    value={item.score}
                    maxLength={LIMITS.score}
                    placeholder="Optional"
                    onChange={(v) => api.updateEducation(item.id, { score: v })}
                  />
                </div>
              </div>
            ))}
            <AddButton label="Add education" onClick={api.addEducation} />
          </div>
        </SectionCard>

        <SectionCard
          id="skills"
          title="Skills"
          subtitle="Add the tools and strengths you want recruiters to notice."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
            </svg>
          }
        >
          <div className="flex gap-2">
            <input
              value={skillDraft}
              maxLength={LIMITS.skill}
              placeholder="Type a skill and press Enter"
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  commitSkill();
                }
              }}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => commitSkill()}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
          {data.skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => api.removeSkill(skill)}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-rose-50 hover:text-rose-700"
                  title="Remove skill"
                >
                  {skill}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">No skills yet. Add a few of your strongest ones.</p>
          )}
        </SectionCard>

        <SectionCard
          id="projects"
          title="Projects"
          subtitle="Personal, academic, or professional work worth showing."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18" />
            </svg>
          }
        >
          <div className="space-y-3">
            {data.projects.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Project {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <IconBtn
                      label="Move up"
                      disabled={index === 0}
                      onClick={() => api.moveProject(item.id, -1)}
                    >
                      <UpIcon />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={index === data.projects.length - 1}
                      onClick={() => api.moveProject(item.id, 1)}
                    >
                      <DownIcon />
                    </IconBtn>
                    <IconBtn label="Remove project" onClick={() => api.removeProject(item.id)}>
                      <TrashIcon />
                    </IconBtn>
                  </div>
                </div>
                <div className="grid gap-3">
                  <TextField
                    id={`pname-${item.id}`}
                    label="Project name"
                    value={item.name}
                    maxLength={LIMITS.projectName}
                    onChange={(v) => api.updateProject(item.id, { name: v })}
                  />
                  <TextArea
                    id={`pdesc-${item.id}`}
                    label="Description"
                    value={item.description}
                    maxLength={LIMITS.projectDescription}
                    rows={3}
                    onChange={(v) => api.updateProject(item.id, { description: v })}
                  />
                  <TextField
                    id={`ptech-${item.id}`}
                    label="Technologies used"
                    value={item.technologies}
                    maxLength={LIMITS.technologies}
                    placeholder="React, Node.js, PostgreSQL"
                    onChange={(v) => api.updateProject(item.id, { technologies: v })}
                  />
                </div>
              </div>
            ))}
            <AddButton label="Add project" onClick={api.addProject} />
          </div>
        </SectionCard>

        <SectionCard
          id="certifications"
          title="Certifications"
          subtitle="Optional. Hidden on the resume until you add one."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="5" />
              <path d="M8.5 13 7 21l5-3 5 3-1.5-8" />
            </svg>
          }
        >
          <div className="space-y-3">
            {data.certifications.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Certificate {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <IconBtn
                      label="Move up"
                      disabled={index === 0}
                      onClick={() => api.moveCertification(item.id, -1)}
                    >
                      <UpIcon />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      disabled={index === data.certifications.length - 1}
                      onClick={() => api.moveCertification(item.id, 1)}
                    >
                      <DownIcon />
                    </IconBtn>
                    <IconBtn
                      label="Remove certification"
                      onClick={() => api.removeCertification(item.id)}
                    >
                      <TrashIcon />
                    </IconBtn>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField
                    id={`cn-${item.id}`}
                    label="Name"
                    value={item.name}
                    maxLength={LIMITS.certName}
                    onChange={(v) => api.updateCertification(item.id, { name: v })}
                  />
                  <TextField
                    id={`ci-${item.id}`}
                    label="Issuer"
                    value={item.issuer}
                    maxLength={LIMITS.certIssuer}
                    onChange={(v) => api.updateCertification(item.id, { issuer: v })}
                  />
                  <TextField
                    id={`cy-${item.id}`}
                    label="Year"
                    value={item.year}
                    maxLength={LIMITS.year}
                    onChange={(v) => api.updateCertification(item.id, { year: v })}
                  />
                </div>
              </div>
            ))}
            <AddButton label="Add certification" onClick={api.addCertification} />
          </div>
        </SectionCard>

        <SectionCard
          id="languages"
          title="Languages"
          subtitle="Optional. Shown only when you add a language."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
            </svg>
          }
        >
          <div className="space-y-3">
            {data.languages.map((item) => (
              <div key={item.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <TextField
                    id={`ln-${item.id}`}
                    label="Language"
                    value={item.name}
                    maxLength={LIMITS.language}
                    onChange={(v) => api.updateLanguage(item.id, { name: v })}
                  />
                </div>
                <label className="block w-40">
                  <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Proficiency</span>
                  <select
                    value={item.proficiency}
                    onChange={(e) => api.updateLanguage(item.id, { proficiency: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {PROFICIENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <IconBtn label="Remove language" onClick={() => api.removeLanguage(item.id)}>
                  <TrashIcon />
                </IconBtn>
              </div>
            ))}
            <AddButton label="Add language" onClick={api.addLanguage} />
          </div>
        </SectionCard>

        <SectionCard
          id="achievements"
          title="Achievements"
          subtitle="Awards, publications, or measurable wins."
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
              <path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 13v7M9 20h6" />
            </svg>
          }
        >
          <div className="space-y-3">
            {data.achievements.map((item, index) => (
              <div key={item.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <TextField
                    id={`ach-${item.id}`}
                    label={`Achievement ${index + 1}`}
                    value={item.description}
                    maxLength={LIMITS.achievement}
                    onChange={(v) => api.updateAchievement(item.id, { description: v })}
                  />
                </div>
                <div className="pt-7">
                  <IconBtn label="Remove achievement" onClick={() => api.removeAchievement(item.id)}>
                    <TrashIcon />
                  </IconBtn>
                </div>
              </div>
            ))}
            <AddButton label="Add achievement" onClick={api.addAchievement} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
