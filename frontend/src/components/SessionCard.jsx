import {
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Clock3,
    CalendarDays,
    ShieldCheck,
    LogOut,
} from "lucide-react";


function SessionCard({
    session,
    onRevoke,
    isRevoking = false,
}) {

    /*
     * ==================================================
     * DEVICE DETECTION
     * ==================================================
     */

    const userAgent =
        session?.userAgent || "";


    const getDeviceType = () => {

        if (
            /mobile|android|iphone|ipod/i.test(
                userAgent
            )
        ) {
            return "mobile";
        }


        if (
            /tablet|ipad/i.test(
                userAgent
            )
        ) {
            return "tablet";
        }


        return "desktop";
    };


    const deviceType =
        getDeviceType();


    const DeviceIcon =
        deviceType === "mobile"
            ? Smartphone
            : deviceType === "tablet"
                ? Tablet
                : Monitor;


    /*
     * ==================================================
     * FORMAT DATE
     * ==================================================
     */

    const formatDate = (
        value
    ) => {

        if (!value) {
            return "Unknown";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Unknown";
        }


        return new Intl.DateTimeFormat(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        ).format(date);
    };


    /*
     * ==================================================
     * SESSION INFORMATION
     * ==================================================
     */

    const createdAt =
        formatDate(
            session.createdAt
        );


    const lastActivityAt =
        formatDate(
            session.lastActivityAt
        );


    const expiresAt =
        formatDate(
            session.expiresAt
        );


    /*
     * ==================================================
     * DEVICE LABEL
     * ==================================================
     */

    const deviceLabel =
        deviceType === "mobile"
            ? "Mobile device"
            : deviceType === "tablet"
                ? "Tablet"
                : "Desktop device";


    return (
        <article
            className={`rounded-2xl border bg-[var(--bms-surface)] p-4 transition-all duration-200 sm:p-5 ${
                session.isCurrent
                    ? "border-blue-500/30 shadow-sm shadow-blue-500/5"
                    : "border-[var(--bms-border)] hover:border-blue-500/20 hover:shadow-sm"
            }`}
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            session.isCurrent
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]"
                        }`}
                    >
                        <DeviceIcon
                            size={20}
                            strokeWidth={1.8}
                        />
                    </div>


                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <h3 className="truncate text-sm font-semibold text-[var(--bms-text)]">
                                {deviceLabel}
                            </h3>


                            {session.isCurrent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                                    <ShieldCheck
                                        size={11}
                                    />
                                    This device
                                </span>
                            )}

                        </div>


                        <p className="mt-0.5 truncate text-xs text-[var(--bms-text-muted)]">
                            {userAgent || "Unknown browser"}
                        </p>

                    </div>

                </div>


                {!session.isCurrent && (
                    <button
                        type="button"
                        onClick={() =>
                            onRevoke(session)
                        }
                        disabled={isRevoking}
                        className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-2.5 text-xs font-medium text-red-500 transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                    >
                        <LogOut
                            size={15}
                            strokeWidth={1.8}
                        />

                        <span className="hidden sm:inline">
                            {isRevoking
                                ? "Revoking..."
                                : "Revoke"}
                        </span>
                    </button>
                )}

            </div>


            {/* ==================================================
                SESSION DETAILS
            ================================================== */}

            <div className="mt-4 grid gap-3 border-t border-[var(--bms-border)] pt-4 sm:grid-cols-2">

                {/* IP */}
                <div className="flex items-start gap-2.5">

                    <Globe
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--bms-text-muted)]"
                    />

                    <div className="min-w-0">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                            IP Address
                        </p>

                        <p className="mt-0.5 truncate text-xs font-medium text-[var(--bms-text)]">
                            {session.ipAddress ||
                                "Unknown"}
                        </p>

                    </div>

                </div>


                {/* Last activity */}
                <div className="flex items-start gap-2.5">

                    <Clock3
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--bms-text-muted)]"
                    />

                    <div className="min-w-0">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Last Activity
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-[var(--bms-text)]">
                            {lastActivityAt}
                        </p>

                    </div>

                </div>


                {/* Created */}
                <div className="flex items-start gap-2.5">

                    <CalendarDays
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--bms-text-muted)]"
                    />

                    <div className="min-w-0">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Created
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-[var(--bms-text)]">
                            {createdAt}
                        </p>

                    </div>

                </div>


                {/* Expires */}
                <div className="flex items-start gap-2.5">

                    <Clock3
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--bms-text-muted)]"
                    />

                    <div className="min-w-0">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                            Expires
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-[var(--bms-text)]">
                            {expiresAt}
                        </p>

                    </div>

                </div>

            </div>

        </article>
    );
}


export default SessionCard;