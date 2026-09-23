import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Download,
    X,
    RefreshCw,
} from "lucide-react";

import {
    isDesktopApp,
    checkForAppUpdate,
} from "../services/updater";

function UpdateNotification() {
    const navigate = useNavigate();

    const [update, setUpdate] = useState(null);
    const [visible, setVisible] = useState(false);
    const [checking, setChecking] = useState(false);

    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) {
            return;
        }

        hasChecked.current = true;

        async function checkForUpdateOnStartup() {
            if (!isDesktopApp()) {
                return;
            }

            setChecking(true);

            try {
                const result = await checkForAppUpdate();

                if (result.available && result.update) {
                    setUpdate(result.update);
                    setVisible(true);
                }
            } catch (error) {
                // Startup update checks should never prevent the
                // application from loading.
                console.error(
                    "Automatic update check failed:",
                    error
                );
            } finally {
                setChecking(false);
            }
        }

        /*
         * Give the application a moment to finish loading before
         * contacting the update endpoint.
         */
        const timer = window.setTimeout(
            checkForUpdateOnStartup,
            2500
        );

        return () => {
            window.clearTimeout(timer);
        };
    }, []);

    if (
        checking ||
        !visible ||
        !update
    ) {
        return null;
    }

    function openUpdateCenter() {
        setVisible(false);
        navigate("/settings");
    }

    function dismissNotification() {
        setVisible(false);
    }

    return (
        <div className="fixed bottom-5 right-5 z-[9999] w-[calc(100%-2rem)] max-w-md">
            <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

                {/* ==================================================
            HEADER
        ================================================== */}

                <div className="flex items-start gap-3 p-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <Download
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                            <div>
                                <p className="text-sm font-semibold text-[var(--bms-text)]">
                                    Update available
                                </p>

                                <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                                    NTS BMI v{update.version} is ready.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={dismissNotification}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition-colors hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                                aria-label="Dismiss update notification"
                            >
                                <X size={16} />
                            </button>

                        </div>

                    </div>

                </div>

                {/* ==================================================
            RELEASE NOTES
        ================================================== */}

                {update.body && (
                    <div className="border-t border-[var(--bms-border)] px-4 py-3">

                        <p className="mb-1 text-xs font-medium text-[var(--bms-text-secondary)]">
                            What's new
                        </p>

                        <p className="whitespace-pre-line text-xs leading-5 text-[var(--bms-text-muted)]">
                            {update.body}
                        </p>

                    </div>
                )}

                {/* ==================================================
            ACTIONS
        ================================================== */}

                <div className="flex items-center justify-end gap-2 border-t border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-3">

                    <button
                        type="button"
                        onClick={dismissNotification}
                        className="rounded-xl px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] transition-colors hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)]"
                    >
                        Later
                    </button>

                    <button
                        type="button"
                        onClick={openUpdateCenter}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
                    >
                        <RefreshCw size={14} />
                        View Update
                    </button>

                </div>

            </div>
        </div>
    );
}

export default UpdateNotification;