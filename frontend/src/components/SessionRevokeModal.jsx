import {
    AlertTriangle,
    X,
    LogOut,
    Loader2,
} from "lucide-react";


function SessionRevokeModal({
    session,
    open,
    onClose,
    onConfirm,
    isRevoking = false,
}) {

    if (!open || !session) {
        return null;
    }


    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    if (!isRevoking) {
                        onClose();
                    }
                }

            }}
        >

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="revoke-session-title"
                className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl"
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-start justify-between gap-4 p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">

                            <AlertTriangle
                                size={20}
                                strokeWidth={1.8}
                            />

                        </div>


                        <div>

                            <h2
                                id="revoke-session-title"
                                className="text-sm font-semibold text-[var(--bms-text)]"
                            >
                                Revoke session?
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">
                                This will immediately sign out
                                the selected device.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRevoking}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition-colors hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X
                            size={17}
                        />
                    </button>

                </div>


                {/* ==================================================
                    SESSION INFO
                ================================================== */}

                <div className="mx-5 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-3">

                    <p className="text-xs font-medium text-[var(--bms-text)]">
                        {session.ipAddress ||
                            "Unknown IP address"}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-[var(--bms-text-muted)]">
                        {session.userAgent ||
                            "Unknown device"}
                    </p>

                </div>


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="flex items-center justify-end gap-2 p-5">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRevoking}
                        className="rounded-lg px-4 py-2.5 text-xs font-medium text-[var(--bms-text-secondary)] transition-colors hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isRevoking}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {isRevoking ? (
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <LogOut
                                size={15}
                            />
                        )}

                        {isRevoking
                            ? "Revoking..."
                            : "Revoke session"}

                    </button>

                </div>

            </div>

        </div>
    );
}


export default SessionRevokeModal;