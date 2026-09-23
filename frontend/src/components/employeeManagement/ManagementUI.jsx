import { LoaderCircle, Plus, RefreshCw, Search, X } from "lucide-react";

export function unwrap(response) {
  return response?.data ?? response;
}
export function arrayData(response, keys = []) {
  const value = unwrap(response);
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
}
export function nameOf(value, fallback = "Unknown") {
  const u = value?.user || value;
  const name = `${u?.firstName || ""} ${u?.lastName || ""}`.trim();
  return name || u?.email || fallback;
}
export function labelize(value) {
  return String(value || "—").replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
}
export function dateOf(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { day:"2-digit", month:"short", year:"numeric" });
}
export function getError(error, fallback = "Something went wrong.") {
  return error?.message || (Array.isArray(error?.details) ? error.details.map(x => x?.message).filter(Boolean).join(", ") : "") || fallback;
}
export function PageHeader({ icon: Icon, title, description, action, onRefresh, refreshing }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><Icon size={21}/></div><div><h1 className="text-2xl font-bold tracking-tight text-[var(--bms-text)]">{title}</h1><p className="mt-1 text-sm text-[var(--bms-text-secondary)]">{description}</p></div></div>
    <div className="flex gap-2">{onRefresh && <button onClick={onRefresh} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-sm font-medium text-[var(--bms-text)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin":""}/>Refresh</button>}{action}</div>
  </div>;
}
export function SearchBox({ value, onChange, placeholder="Search..." }) {
  return <div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] pl-9 pr-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500"/></div>;
}
export function Modal({ open, title, onClose, children, width="max-w-2xl" }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={`max-h-[90vh] w-full ${width} overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl`}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--bms-border)] bg-[var(--bms-surface)] px-5 py-4"><h2 className="font-semibold text-[var(--bms-text)]">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)]"><X size={18}/></button></div>{children}</div></div>;
}
export function Field({ label, children, required=false }) { return <label className="block"><span className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">{label}{required && <span className="text-red-500"> *</span>}</span>{children}</label>; }
export const inputClass="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500";
export const textareaClass="min-h-24 w-full resize-y rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500";
export const selectClass=inputClass;
export function Button({ children, type="button", onClick, disabled=false, variant="primary" }) {
 const cls=variant==="danger"?"border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15":"border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text)] hover:bg-[var(--bms-surface-soft)]";
 const primary=variant==="primary"?"border-blue-600 bg-blue-600 text-white hover:bg-blue-700":"";
 return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${primary||cls}`}>{disabled?<LoaderCircle size={16} className="animate-spin"/>:null}{children}</button>;
}
export function Empty({ text }) { return <div className="py-14 text-center text-sm text-[var(--bms-text-muted)]">{text}</div>; }
export function ErrorBox({ message }) { return <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{message}</div>; }
