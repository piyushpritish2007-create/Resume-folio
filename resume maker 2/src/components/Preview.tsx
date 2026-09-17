import { useEffect, useRef, useState } from "react";
import type { ResumeData, TemplateId } from "../types";
import { cn } from "../utils/cn";
import { isResumeStarted } from "../utils/resume";
import { ResumePaper } from "./templates";

function TemplateThumb({ id }: { id: TemplateId }) {
  if (id === "modern") {
    return (
      <span className="flex h-10 w-8 overflow-hidden rounded-[3px] border border-slate-200 bg-white">
        <span className="w-[38%] bg-[#14344b]" />
        <span className="flex flex-1 flex-col gap-0.5 p-1">
          <span className="h-1 w-full bg-slate-300" />
          <span className="h-1 w-4/5 bg-slate-200" />
          <span className="h-1 w-full bg-slate-200" />
        </span>
      </span>
    );
  }
  if (id === "executive") {
    return (
      <span className="flex h-10 w-8 flex-col items-center gap-0.5 rounded-[3px] border border-amber-200 bg-[#fffaf3] p-1">
        <span className="h-1 w-5 bg-stone-400" />
        <span className="h-px w-full bg-amber-700/60" />
        <span className="h-1 w-full bg-stone-200" />
        <span className="h-1 w-4/5 bg-stone-200" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-8 flex-col gap-0.5 rounded-[3px] border border-slate-200 bg-white p-1">
      <span className="h-1.5 w-4/5 bg-slate-400" />
      <span className="h-px w-full bg-slate-700" />
      <span className="h-1 w-full bg-slate-200" />
      <span className="h-1 w-full bg-slate-200" />
    </span>
  );
}

const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic", blurb: "Traditional single column" },
  { id: "modern", name: "Modern", blurb: "Sidebar layout" },
  { id: "executive", name: "Executive", blurb: "Centered and elegant" },
];

export function Preview({
  data,
  onTemplate,
}: {
  data: ResumeData;
  onTemplate: (id: TemplateId) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [zoomMode, setZoomMode] = useState<"fit" | number>("fit");
  const [paper, setPaper] = useState({ w: 794, h: 1123 });
  const started = isResumeStarted(data);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const apply = () => {
      const available = frame.clientWidth - 40;
      const next = zoomMode === "fit" ? Math.min(1, Math.max(0.28, available / paper.w)) : zoomMode;
      setScale(next);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [zoomMode, paper.w]);

  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPaper({ w: el.offsetWidth, h: el.offsetHeight });
    });
    ro.observe(el);
    setPaper({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, [data]);

  const a4h = paper.w * (297 / 210);
  const pages = Math.max(1, Math.ceil(paper.h / a4h - 0.02));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTemplate(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition",
                data.template === t.id
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <TemplateThumb id={t.id} />
              <span>
                <span className="block text-xs font-semibold text-slate-800">{t.name}</span>
                <span className="block text-[10px] text-slate-500">{t.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="hidden sm:inline">
            {pages} page{pages === 1 ? "" : "s"}
          </span>
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            {(["fit", 0.6, 0.8, 1] as const).map((z) => (
              <button
                key={String(z)}
                type="button"
                onClick={() => setZoomMode(z)}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-medium",
                  zoomMode === z ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {z === "fit" ? "Fit" : `${Math.round(z * 100)}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={frameRef}
        className="relative min-h-[520px] flex-1 overflow-auto bg-[#c5d0de] px-4 py-6"
      >
        <div
          className="relative mx-auto"
          style={{ width: paper.w * scale, height: paper.h * scale }}
        >
          <div
            ref={paperRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: "210mm",
            }}
            className="shadow-2xl"
          >
            <ResumePaper data={data} />
          </div>
          {pages > 1
            ? Array.from({ length: pages - 1 }, (_, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-slate-500/50"
                  style={{ top: a4h * (i + 1) * scale }}
                >
                  <span className="absolute right-1 -top-4 rounded bg-slate-700/80 px-1.5 py-0.5 text-[9px] text-white">
                    Page {i + 2}
                  </span>
                </div>
              ))
            : null}
          {!started ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-8 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-700">Live A4 preview</p>
                <p className="mt-1 text-xs text-slate-500">
                  Start with your name and job title. This page updates as you type.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
