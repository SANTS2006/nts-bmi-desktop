import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Search, UserPlus, X } from "lucide-react";
import { addParticipants, getAvailableParticipants } from "../../api/internalCommunication.js";

const getInitials = (user) => `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
const fullName = (user) => `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
const responseData = (response) => response?.data?.data ?? response?.data ?? response;

const responseList = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.employees)) return data.employees;
  return [];
};

export default function AddPeopleModal({ open, conversationId, onClose, onAdded }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!open || !conversationId) return undefined;
    setSelected([]);
    setSearch("");
    setError("");
    setHasLoaded(false);
    return undefined;
  }, [open, conversationId]);

  useEffect(() => {
    if (!open || !conversationId) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      setHasLoaded(false);
      try {
        const response = await getAvailableParticipants(conversationId, { search, page: 1, limit: 25 });
        if (!cancelled) {
          setUsers(responseList(response));
          setHasLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setUsers([]);
          setError(err?.message || "Unable to load employees.");
          setHasLoaded(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, conversationId, search]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const save = async () => {
    if (!selected.length) return;
    setSaving(true);
    setError("");
    try {
      const response = await addParticipants(conversationId, selected);
      onAdded?.(responseData(response));
      onClose?.();
    } catch (err) {
      setError(err.message || "Unable to add participants.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-xl overflow-hidden rounded-t-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl sm:rounded-2xl" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
            <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-[var(--bms-text)]">Add people</h2>
                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">Search active employees and select everyone who should join.</p>
              </div>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)]" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]" size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} autoFocus placeholder="Search by name or email..." className="h-11 w-full rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-10 pr-4 text-sm text-[var(--bms-text)] outline-none focus:border-[var(--bms-accent)]" />
              </div>

              {selected.length > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--bms-accent)]/20 bg-[var(--bms-accent)]/5 px-3 py-2 text-xs">
                  <span className="font-semibold text-[var(--bms-text)]">{selected.length} selected</span>
                  <button type="button" onClick={() => setSelected([])} className="font-semibold text-[var(--bms-accent)]">Clear</button>
                </div>
              )}

              <div className="mt-4 max-h-[55vh] overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-[var(--bms-text-muted)]"><Loader2 className="animate-spin" size={20} /></div>
                ) : users.length ? (
                  <div className="space-y-1.5">
                    {users.map((user) => {
                      const checked = selectedSet.has(user.id);
                      return (
                        <button key={user.id} type="button" onClick={() => toggle(user.id)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${checked ? "border-[var(--bms-accent)]/40 bg-[var(--bms-accent)]/5" : "border-transparent hover:border-[var(--bms-border)] hover:bg-[var(--bms-surface-soft)]"}`}>
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bms-accent)]/10 text-xs font-bold text-[var(--bms-accent)]">{getInitials(user)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--bms-text)]">{fullName(user)}</p>
                            <p className="truncate text-xs text-[var(--bms-text-muted)]">{user.email}</p>
                          </div>
                          <span className={`grid h-6 w-6 place-items-center rounded-full border ${checked ? "border-[var(--bms-accent)] bg-[var(--bms-accent)] text-white" : "border-[var(--bms-border)] text-transparent"}`}><Check size={14} /></span>
                        </button>
                      );
                    })}
                  </div>
                ) : hasLoaded ? (
                  <div className="py-10 text-center text-sm text-[var(--bms-text-muted)]">No available employees found.</div>
                ) : null}
              </div>

              {error && <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-5 py-4">
              <button type="button" onClick={onClose} className="rounded-lg border border-[var(--bms-border)] px-4 py-2 text-sm font-semibold text-[var(--bms-text)]">Cancel</button>
              <button type="button" onClick={save} disabled={!selected.length || saving} className="inline-flex items-center gap-2 rounded-lg bg-[var(--bms-accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {saving ? "Adding..." : `Add ${selected.length || "people"}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
