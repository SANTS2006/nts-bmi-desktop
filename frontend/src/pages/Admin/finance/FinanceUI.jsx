import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react';

export const fmtMoney = (value, currency='SLE') => `${currency} ${Number(value || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const fmtDate = (value) => value ? new Date(value).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}) : '—';
export const label = (value='') => String(value).toLowerCase().split('_').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
export const unwrap = (r) => r?.data ?? r;
export const errorMessage = (e, fallback='Something went wrong.') => e?.message || fallback;

export function Page({title,description,icon:Icon,action,children,onRefresh,refreshing=false}){
 return <div className="space-y-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
   <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><Icon size={22}/></div><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-[var(--bms-text-secondary)]">{description}</p></div></div>
   <div className="flex gap-2">{onRefresh&&<button onClick={onRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-sm font-medium hover:bg-[var(--bms-surface-soft)] disabled:opacity-60"><RefreshCw size={16} className={refreshing?'animate-spin':''}/>Refresh</button>}{action}</div>
  </div>{children}
 </div>
}
export function Card({children,className=''}){return <div className={`rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] ${className}`}>{children}</div>}
export function Button({children,onClick,type='button',variant='primary',disabled=false}){return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variant==='secondary'?'border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text)] hover:bg-[var(--bms-surface-soft)]':'bg-blue-600 text-white hover:bg-blue-700'}`}>{disabled&&<Loader2 size={15} className="animate-spin"/>}{children}</button>}
export function Field({label:caption,children,required}){return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--bms-text-secondary)]">{caption}{required&&<span className="ml-1 text-red-500">*</span>}</span>{children}</label>}
export const inputClass='w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2.5 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500';
export const selectClass=inputClass;
export const textareaClass=`${inputClass} min-h-24 resize-y`;
export function Modal({open,onClose,title,children}){if(!open)return null;return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4"><h2 className="font-semibold">{title}</h2><button onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--bms-surface-soft)]"><X size={18}/></button></div>{children}</div></div>}
export function ConfirmDialog({open,onClose,onConfirm,title='Confirm action',message='Are you sure?',busy=false}){return <Modal open={open} onClose={onClose} title={title}><div className="p-5"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500"><AlertCircle size={20}/></div><p className="text-sm leading-6 text-[var(--bms-text-secondary)]">{message}</p></div><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onConfirm} disabled={busy}>{busy?'Processing…':'Confirm'}</Button></div></div></Modal>}
export function ErrorBox({message,onClose}){return <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500"><span>{message}</span>{onClose&&<button onClick={onClose}><X size={16}/></button>}</div>}
export function Loading({text='Loading...'}){return <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[var(--bms-text-muted)]"><Loader2 size={18} className="animate-spin"/>{text}</div>}
export function Empty({text='No records found.'}){return <div className="flex min-h-40 items-center justify-center text-sm text-[var(--bms-text-muted)]">{text}</div>}
export function Badge({children,tone='blue'}){const map={blue:'bg-blue-500/10 text-blue-500',green:'bg-emerald-500/10 text-emerald-500',red:'bg-red-500/10 text-red-500',amber:'bg-amber-500/10 text-amber-500',violet:'bg-violet-500/10 text-violet-500',slate:'bg-slate-500/10 text-slate-500'};return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${map[tone]||map.blue}`}>{children}</span>}
export function toneForStatus(s=''){if(['PAID','COMPLETED','ACTIVE','SUCCESS'].includes(s))return 'green';if(['CANCELLED','FAILED','CLOSED'].includes(s))return 'slate';if(['OVERDUE','ON_HOLD','PENDING'].includes(s))return 'amber';if(['OPEN','SENT','IN_PROGRESS'].includes(s))return 'blue';return 'violet'}
export function useConfirm(){const [target,setTarget]=useState(null);return {target,ask:setTarget,setTarget,close:()=>setTarget(null)}}
export function SuccessMark(){return <CheckCircle2 size={16} className="text-emerald-500"/>}
