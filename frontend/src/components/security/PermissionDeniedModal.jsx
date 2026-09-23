import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export default function PermissionDeniedModal({
  open,
  onClose,
  permission,
  action = "perform this action",
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-denied-title"
            aria-describedby="permission-denied-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <AlertCircle size={25} />
            </div>

            <h2 id="permission-denied-title" className="mt-5 text-xl font-bold text-[var(--bms-text)]">
              Permission required
            </h2>

            <p id="permission-denied-description" className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">
              You do not have permission to {action}. Please contact an administrator if you believe you should have access.
            </p>

            {permission && (
              <div className="mt-4 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 py-2 text-xs text-[var(--bms-text-muted)]">
                Required permission: <span className="font-semibold text-[var(--bms-text-secondary)]">{permission}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Understood
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
