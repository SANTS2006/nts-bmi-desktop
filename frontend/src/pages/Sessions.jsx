import {
    Activity,
    CheckCircle2,
    Loader2,
    LogOut,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    AlertCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getSessions,
    revokeAllSessions,
    revokeSession,
} from "../api/sessions";

import SessionCard from "../components/SessionCard";

import SessionRevokeModal from "../components/SessionRevokeModal";


function Sessions() {

    const [
        sessions,
        setSessions,
    ] = useState([]);


    const [
        isLoading,
        setIsLoading,
    ] = useState(true);


    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState(null);


    const [
        successMessage,
        setSuccessMessage,
    ] = useState(null);


    const [
        selectedSession,
        setSelectedSession,
    ] = useState(null);


    const [
        isRevoking,
        setIsRevoking,
    ] = useState(false);


    const [
        isRevokingAll,
        setIsRevokingAll,
    ] = useState(false);


    /*
     * ==================================================
     * LOAD SESSIONS
     * ==================================================
     */

    const loadSessions =
        useCallback(
            async (
                showLoading = true
            ) => {

                try {

                    if (showLoading) {
                        setIsLoading(true);
                    } else {
                        setIsRefreshing(true);
                    }


                    setError(null);


                    const response =
                        await getSessions();


                    const sessionData =
                        response?.data?.sessions;


                    setSessions(
                        Array.isArray(
                            sessionData
                        )
                            ? sessionData
                            : []
                    );

                } catch (error) {

                    console.error(
                        "Failed to load sessions:",
                        error
                    );


                    setError(
                        error?.message ||
                        "Unable to load active sessions."
                    );

                } finally {

                    setIsLoading(false);
                    setIsRefreshing(false);

                }

            },
            []
        );


    /*
     * ==================================================
     * INITIAL LOAD
     * ==================================================
     */

    useEffect(() => {

        loadSessions();

    }, [
        loadSessions,
    ]);


    /*
     * ==================================================
     * CLEAR SUCCESS MESSAGE
     * ==================================================
     */

    useEffect(() => {

        if (!successMessage) {
            return undefined;
        }


        const timer =
            setTimeout(
                () => {
                    setSuccessMessage(
                        null
                    );
                },
                4000
            );


        return () =>
            clearTimeout(timer);

    }, [
        successMessage,
    ]);


    /*
     * ==================================================
     * REVOKE ONE SESSION
     * ==================================================
     */

    const handleRevoke =
        async () => {

            if (
                !selectedSession?.id ||
                isRevoking
            ) {
                return;
            }


            try {

                setIsRevoking(
                    true
                );

                setError(null);


                await revokeSession(
                    selectedSession.id
                );


                /*
                 * Remove the session
                 * immediately from the UI.
                 */

                setSessions(
                    (previous) =>
                        previous.filter(
                            (session) =>
                                session.id !==
                                selectedSession.id
                        )
                );


                setSelectedSession(
                    null
                );


                setSuccessMessage(
                    "Session revoked successfully."
                );

            } catch (error) {

                console.error(
                    "Failed to revoke session:",
                    error
                );


                setError(
                    error?.message ||
                    "Unable to revoke session."
                );

            } finally {

                setIsRevoking(
                    false
                );

            }

        };


    /*
     * ==================================================
     * REVOKE ALL
     * ==================================================
     */

    const handleRevokeAll =
        async () => {

            if (
                isRevokingAll
            ) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to revoke all active sessions? You will also be signed out of this device."
                );


            if (!confirmed) {
                return;
            }


            try {

                setIsRevokingAll(
                    true
                );

                setError(null);


                await revokeAllSessions();


                setSessions(
                    []
                );


                setSuccessMessage(
                    "All active sessions have been revoked."
                );

            } catch (error) {

                console.error(
                    "Failed to revoke all sessions:",
                    error
                );


                setError(
                    error?.message ||
                    "Unable to revoke all sessions."
                );

            } finally {

                setIsRevokingAll(
                    false
                );

            }

        };


    /*
     * ==================================================
     * SESSION COUNTS
     * ==================================================
     */

    const currentSession =
        sessions.find(
            (session) =>
                session.isCurrent
        );


    const otherSessions =
        sessions.filter(
            (session) =>
                !session.isCurrent
        );


    return (
        <>
            <main className="min-h-full bg-[var(--bms-background)] px-4 py-6 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-6xl">

                    {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                                    <ShieldCheck
                                        size={18}
                                    />

                                </div>

                                <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                                    Sessions
                                </h1>

                            </div>


                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bms-text-muted)]">
                                Manage the devices currently
                                signed in to your account.
                                Revoke any session you no
                                longer recognize.
                            </p>

                        </div>


                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() =>
                                    loadSessions(false)
                                }
                                disabled={
                                    isRefreshing ||
                                    isLoading
                                }
                                className="flex items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2.5 text-xs font-medium text-[var(--bms-text-secondary)] transition-all hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <RefreshCw
                                    size={15}
                                    className={
                                        isRefreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh

                            </button>


                            {otherSessions.length >
                                0 && (
                                <button
                                    type="button"
                                    onClick={
                                        handleRevokeAll
                                    }
                                    disabled={
                                        isRevokingAll
                                    }
                                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-medium text-red-500 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {isRevokingAll ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <LogOut
                                            size={15}
                                        />
                                    )}

                                    Revoke all

                                </button>
                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">

                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />

                            <div className="min-w-0">

                                <p className="font-medium">
                                    Unable to load sessions
                                </p>

                                <p className="mt-1 text-xs opacity-80">
                                    {error}
                                </p>

                            </div>

                        </div>
                    )}


                    {/* ==================================================
                        SUCCESS
                    ================================================== */}

                    {successMessage && (
                        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-500">

                            <CheckCircle2
                                size={18}
                            />

                            <span>
                                {successMessage}
                            </span>

                        </div>
                    )}


                    {/* ==================================================
                        LOADING
                    ================================================== */}

                    {isLoading ? (

                        <div className="mt-8 flex min-h-64 items-center justify-center">

                            <div className="flex flex-col items-center gap-3">

                                <Loader2
                                    size={28}
                                    className="animate-spin text-blue-500"
                                />

                                <p className="text-sm text-[var(--bms-text-muted)]">
                                    Loading active sessions...
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="mt-8 space-y-8">

                            {/* ==================================================
                                SECURITY SUMMARY
                            ================================================== */}

                            <div className="grid gap-4 sm:grid-cols-3">

                                <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                                            <Activity
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p className="text-xs text-[var(--bms-text-muted)]">
                                                Active sessions
                                            </p>

                                            <p className="mt-0.5 text-lg font-semibold text-[var(--bms-text)]">
                                                {sessions.length}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">

                                            <CheckCircle2
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p className="text-xs text-[var(--bms-text-muted)]">
                                                Current session
                                            </p>

                                            <p className="mt-0.5 text-lg font-semibold text-[var(--bms-text)]">
                                                {currentSession
                                                    ? "Active"
                                                    : "Unknown"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                                            <Smartphone
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p className="text-xs text-[var(--bms-text-muted)]">
                                                Other devices
                                            </p>

                                            <p className="mt-0.5 text-lg font-semibold text-[var(--bms-text)]">
                                                {otherSessions.length}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                CURRENT SESSION
                            ================================================== */}

                            {currentSession && (
                                <section>

                                    <div className="mb-3 flex items-center justify-between">

                                        <div>

                                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                                Current session
                                            </h2>

                                            <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                                                This is the device you are currently using.
                                            </p>

                                        </div>

                                    </div>


                                    <SessionCard
                                        session={
                                            currentSession
                                        }
                                        onRevoke={
                                            setSelectedSession
                                        }
                                    />

                                </section>
                            )}


                            {/* ==================================================
                                OTHER SESSIONS
                            ================================================== */}

                            <section>

                                <div className="mb-3">

                                    <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                                        Other active sessions
                                    </h2>

                                    <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                                        Devices that are currently signed in to your account.
                                    </p>

                                </div>


                                {otherSessions.length >
                                0 ? (

                                    <div className="grid gap-4 lg:grid-cols-2">

                                        {otherSessions.map(
                                            (
                                                session
                                            ) => (
                                                <SessionCard
                                                    key={
                                                        session.id
                                                    }
                                                    session={
                                                        session
                                                    }
                                                    onRevoke={
                                                        setSelectedSession
                                                    }
                                                    isRevoking={
                                                        isRevoking &&
                                                        selectedSession?.id ===
                                                            session.id
                                                    }
                                                />
                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div className="rounded-2xl border border-dashed border-[var(--bms-border)] bg-[var(--bms-surface)] px-6 py-10 text-center">

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">

                                            <CheckCircle2
                                                size={22}
                                            />

                                        </div>

                                        <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">
                                            No other active sessions
                                        </h3>

                                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--bms-text-muted)]">
                                            Your account is not currently
                                            signed in on any other device.
                                        </p>

                                    </div>

                                )}

                            </section>


                            {/* ==================================================
                                SECURITY NOTE
                            ================================================== */}

                            <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">

                                <div className="flex items-start gap-3">

                                    <ShieldCheck
                                        size={18}
                                        className="mt-0.5 shrink-0 text-blue-500"
                                    />

                                    <div>

                                        <p className="text-xs font-semibold text-blue-500">
                                            Session security
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">
                                            If you see a device or location
                                            you don't recognize, revoke that
                                            session immediately. Revoking a
                                            session invalidates its login
                                            session on the server.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </main>


            {/* ==================================================
                REVOKE MODAL
            ================================================== */}

            <SessionRevokeModal
                session={
                    selectedSession
                }
                open={
                    Boolean(
                        selectedSession
                    )
                }
                onClose={() =>
                    setSelectedSession(
                        null
                    )
                }
                onConfirm={
                    handleRevoke
                }
                isRevoking={
                    isRevoking
                }
            />

        </>
    );
}


export default Sessions;