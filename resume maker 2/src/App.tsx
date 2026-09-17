import { useEffect, useRef, useState } from "react";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { ResumePaper } from "./components/templates";
import { Modal, Toast } from "./components/ui";
import { useResume } from "./hooks/useResume";
import { peekHasDraft } from "./storage";
import { cn } from "./utils/cn";
import { downloadResumePdf } from "./utils/pdf";
import { completeness, downloadIssues, normalizeResume, resumeBasename } from "./utils/resume";

type ToastState = { message: string; type: "success" | "error" | "info" } | null;

export default function App() {
  const [toast, setToast] = useState<ToastState>(null);
  const api = useResume((message) => setToast({ message, type: "error" }));
  const { data } = api;
  const printRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [confirmReset, setConfirmReset] = useState(false);
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<"print" | "pdf" | null>(null);
  const [busy, setBusy] = useState(false);
  const restored = useRef(peekHasDraft());
  const progress = completeness(data);

  useEffect(() => {
    if (restored.current) {
      setToast({ message: "Your draft was restored from this browser.", type: "info" });
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  function notice(message: string, type: "success" | "error" | "info") {
    setToast({ message, type });
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeBasename(data.personal.fullName)}_Resume.json`;
    a.click();
    URL.revokeObjectURL(url);
    notice("Resume data exported as JSON.", "success");
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        api.replace(normalizeResume(parsed));
        notice("Resume data imported.", "success");
      } catch {
        notice("That file is not valid resume JSON.", "error");
      }
    };
    reader.onerror = () => notice("Could not read that file.", "error");
    reader.readAsText(file);
  }

  function requestOutput(kind: "print" | "pdf") {
    const found = downloadIssues(data);
    if (found.length) {
      setIssues(found);
      setPendingAction(kind);
      setIssuesOpen(true);
      return;
    }
    void runOutput(kind);
  }

  async function runOutput(kind: "print" | "pdf") {
    setIssuesOpen(false);
    if (kind === "print") {
      window.print();
      return;
    }
    const el = printRef.current;
    if (!el) return;
    setBusy(true);
    try {
      await downloadResumePdf(el, `${resumeBasename(data.personal.fullName)}_Resume.pdf`);
      notice("PDF downloaded.", "success");
    } catch {
      notice("Could not generate the PDF. Try Print and choose Save as PDF.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#e8eef5] text-slate-900">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 3h8l5 5v13H7z" />
                <path d="M15 3v5h5M9 13h6M9 17h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">ForgeCV</p>
              <p className="text-[11px] text-slate-500">Professional resume builder</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:px-3"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:px-3"
            >
              Import
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:px-3"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => requestOutput("print")}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:px-3"
            >
              Print
            </button>
            <button
              type="button"
              onClick={() => requestOutput("pdf")}
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-2.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 sm:px-3"
            >
              {busy ? "Preparing…" : "Download PDF"}
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                importJson(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-1.5 text-[11px] text-slate-500">
          <span>{progress.label}</span>
          <span className="tabular-nums">{progress.percent}% complete</span>
        </div>
      </header>

      <div className="no-print mx-auto flex min-h-0 max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={cn(
            "w-full shrink-0 border-slate-200 lg:h-[calc(100vh-97px)] lg:w-[460px] lg:overflow-y-auto lg:border-r",
            mobileTab === "edit" ? "block" : "hidden lg:block",
          )}
        >
          <Editor api={api} onNotice={notice} />
        </aside>
        <main
          className={cn(
            "min-w-0 flex-1 lg:h-[calc(100vh-97px)]",
            mobileTab === "preview" ? "block" : "hidden lg:block",
          )}
        >
          <Preview data={data} onTemplate={api.setTemplate} />
        </main>
      </div>

      <div className="no-print h-16 lg:hidden" />
      <div className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={cn(
            "py-3 text-sm font-medium",
            mobileTab === "edit" ? "text-indigo-600" : "text-slate-500",
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={cn(
            "py-3 text-sm font-medium",
            mobileTab === "preview" ? "text-indigo-600" : "text-slate-500",
          )}
        >
          Preview
        </button>
      </div>

      <div className="print-source" ref={printRef}>
        <ResumePaper data={data} />
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}

      <Modal open={confirmReset} title="Clear this resume?" onClose={() => setConfirmReset(false)}>
        <p>This removes all fields, your photo, and the saved draft in this browser. This cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={() => {
              api.reset();
              setConfirmReset(false);
              notice("Resume cleared.", "info");
            }}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white"
          >
            Clear resume
          </button>
        </div>
      </Modal>

      <Modal
        open={issuesOpen}
        title="A few details are missing"
        onClose={() => setIssuesOpen(false)}
      >
        <ul className="list-disc space-y-1 pl-4">
          {issues.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          You can still continue, but employers may not be able to reach you.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIssuesOpen(false)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() => pendingAction && void runOutput(pendingAction)}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
          >
            Continue anyway
          </button>
        </div>
      </Modal>

      {busy ? (
        <div className="no-print fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm font-medium text-slate-700 shadow-xl">
            Building your A4 PDF…
          </div>
        </div>
      ) : null}
    </div>
  );
}
