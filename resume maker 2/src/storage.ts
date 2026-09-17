import { createEmptyResume } from "./defaults";
import type { ResumeData } from "./types";
import { isResumeStarted, normalizeResume } from "./utils/resume";

const KEY = "forgecv.resume.v1";

export function loadResume(): ResumeData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createEmptyResume();
    return normalizeResume(JSON.parse(raw));
  } catch {
    return createEmptyResume();
  }
}

export function peekHasDraft(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = normalizeResume(JSON.parse(raw));
    return isResumeStarted(data);
  } catch {
    return false;
  }
}

export function saveResume(data: ResumeData): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        data,
      }),
    );
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not auto-save. If you added a photo, try a smaller image.",
    };
  }
}

export function clearResumeStorage(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
