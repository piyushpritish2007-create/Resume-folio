import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  error,
  maxLength,
  required,
  type = "text",
  placeholder,
  hint,
  id,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  maxLength?: number;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  id: string;
  disabled?: boolean;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-slate-700">
        <span>
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </span>
        {maxLength ? (
          <span className="text-[11px] font-normal tabular-nums text-slate-400">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400",
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
        )}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  hint,
  id,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  id: string;
  rows?: number;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-slate-700">
        <span>{label}</span>
        {maxLength ? (
          <span className="text-[11px] font-normal tabular-nums text-slate-400">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </span>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </label>
  );
}

export function SectionCard({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <div className="mt-3 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error" | "info";
}) {
  const tone =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-rose-600"
        : "bg-slate-800";
  return (
    <div
      role="status"
      className={cn(
        "fixed right-4 top-4 z-[80] max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg",
        tone,
      )}
    >
      {message}
    </div>
  );
}
