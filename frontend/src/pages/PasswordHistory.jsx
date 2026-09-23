import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Clock3,
    History,
    Info,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getPasswordHistory,
} from "../api/auth";


function PasswordHistory() {

    const navigate = useNavigate();

    const [history, setHistory] = useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");


    /*
     * ==================================================
     * LOAD PASSWORD HISTORY
     * ==================================================
     */

    useEffect(() => {

        let mounted = true;


        const loadPasswordHistory =
            async () => {

                try {

                    setIsLoading(true);
                    setErrorMessage("");


                    const result =
                        await getPasswordHistory();


                    if (!mounted) {
                        return;
                    }


                    setHistory(
                        result?.data?.history || []
                    );

                } catch (error) {

                    console.error(
                        "Password history error:",
                        error
                    );


                    if (!mounted) {
                        return;
                    }


                    setErrorMessage(
                        error?.message ||
                        "Unable to load your password history."
                    );

                } finally {

                    if (mounted) {
                        setIsLoading(false);
                    }

                }

            };


        loadPasswordHistory();


        return () => {
            mounted = false;
        };

    }, []);


    /*
     * ==================================================
     * FORMAT DATE
     * ==================================================
     */

    const formatDate = (date) => {

        if (!date) {
            return "Unknown date";
        }


        return new Intl.DateTimeFormat(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        ).format(
            new Date(date)
        );

    };


    /*
     * ==================================================
     * FORMAT RELATIVE DATE
     * ==================================================
     */

    const formatRelativeDate = (date) => {

        if (!date) {
            return "";
        }


        const target =
            new Date(date);

        const now =
            new Date();

        const difference =
            now.getTime() -
            target.getTime();

        const seconds =
            Math.floor(
                difference / 1000
            );


        if (seconds < 60) {
            return "Just now";
        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        if (minutes < 60) {

            return `${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 30) {

            return `${days} ${
                days === 1
                    ? "day"
                    : "days"
            } ago`;

        }


        return formatDate(date);

    };


    return (

        <main
            className="
                min-h-full
                bg-[var(--bms-bg)]
                text-[var(--bms-text)]
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-6xl
                    space-y-6
                    p-4
                    sm:p-6
                    lg:p-8
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <section>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/security")
                        }
                        className="
                            mb-4
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-[var(--bms-text-secondary)]
                            transition-colors
                            hover:text-blue-500
                        "
                    >

                        <ArrowLeft size={16} />

                        Back to Security

                    </button>


                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-2xl
                                bg-blue-500/10
                                text-blue-500
                            "
                        >

                            <History size={22} />

                        </div>


                        <div>

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-[var(--bms-text)]
                                "
                            >
                                Password History
                            </h1>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                Review your recent password changes.
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    SECURITY INFORMATION
                ================================================== */}

                <section
                    className="
                        rounded-2xl
                        border
                        border-blue-500/20
                        bg-blue-500/5
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            items-start
                            gap-4
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-500/10
                                text-blue-500
                            "
                        >

                            <ShieldCheck size={20} />

                        </div>


                        <div>

                            <h2
                                className="
                                    text-sm
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >
                                Your password history is protected
                            </h2>


                            <p
                                className="
                                    mt-1.5
                                    text-sm
                                    leading-6
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                For your security, previous passwords
                                are stored securely and cannot be viewed.
                                This page only shows when previous passwords
                                were changed.
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {errorMessage && (

                    <section
                        role="alert"
                        className="
                            rounded-2xl
                            border
                            border-red-500/20
                            bg-red-500/5
                            p-5
                            text-sm
                            text-red-500
                        "
                    >
                        {errorMessage}
                    </section>

                )}


                {/* ==================================================
                    PASSWORD HISTORY
                ================================================== */}

                <section
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface)]
                        shadow-sm
                    "
                >

                    <div
                        className="
                            border-b
                            border-[var(--bms-border)]
                            px-5
                            py-4
                            sm:px-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[var(--bms-text)]
                                    "
                                >
                                    Recent passwords
                                </h2>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-[var(--bms-text-muted)]
                                    "
                                >
                                    Your five most recent previous passwords.
                                </p>

                            </div>


                            <div
                                className="
                                    hidden
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-[var(--bms-surface-soft)]
                                    px-3
                                    py-2
                                    text-xs
                                    text-[var(--bms-text-secondary)]
                                    sm:flex
                                "
                            >

                                <LockKeyhole size={14} />

                                Protected

                            </div>

                        </div>

                    </div>


                    {/* LOADING */}

                    {isLoading ? (

                        <div
                            className="
                                space-y-3
                                p-5
                                sm:p-6
                            "
                        >

                            {[1, 2, 3].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="
                                            animate-pulse
                                            rounded-2xl
                                            border
                                            border-[var(--bms-border)]
                                            bg-[var(--bms-surface-soft)]
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                h-4
                                                w-40
                                                rounded
                                                bg-[var(--bms-border)]
                                            "
                                        />

                                        <div
                                            className="
                                                mt-3
                                                h-3
                                                w-56
                                                rounded
                                                bg-[var(--bms-border)]
                                            "
                                        />

                                    </div>

                                )
                            )}

                        </div>

                    ) : history.length === 0 ? (

                        /* EMPTY */

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                px-6
                                py-16
                                text-center
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[var(--bms-surface-soft)]
                                    text-[var(--bms-text-muted)]
                                "
                            >

                                <LockKeyhole size={24} />

                            </div>


                            <h3
                                className="
                                    mt-4
                                    text-sm
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >
                                No password history yet
                            </h3>


                            <p
                                className="
                                    mt-2
                                    max-w-md
                                    text-sm
                                    leading-6
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                Previous passwords will appear here
                                after you change your password.
                            </p>

                        </div>

                    ) : (

                        /* HISTORY LIST */

                        <div
                            className="
                                divide-y
                                divide-[var(--bms-border)]
                            "
                        >

                            {history.map(
                                (
                                    entry,
                                    index
                                ) => (

                                    <div
                                        key={entry.id}
                                        className="
                                            group
                                            flex
                                            items-center
                                            gap-4
                                            px-5
                                            py-5
                                            transition-colors
                                            hover:bg-[var(--bms-surface-soft)]
                                            sm:px-6
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-blue-500/10
                                                text-blue-500
                                            "
                                        >

                                            <LockKeyhole size={19} />

                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                <h3
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-[var(--bms-text)]
                                                    "
                                                >
                                                    {entry.label ||
                                                        `Previous password ${
                                                            index + 1
                                                        }`}
                                                </h3>


                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-[var(--bms-surface-soft)]
                                                        px-2
                                                        py-0.5
                                                        text-[10px]
                                                        font-medium
                                                        text-[var(--bms-text-muted)]
                                                    "
                                                >
                                                    Protected
                                                </span>

                                            </div>


                                            <div
                                                className="
                                                    mt-1.5
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-x-4
                                                    gap-y-1
                                                    text-xs
                                                    text-[var(--bms-text-muted)]
                                                "
                                            >

                                                <span
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                    "
                                                >

                                                    <Clock3 size={13} />

                                                    {formatDate(
                                                        entry.createdAt
                                                    )}

                                                </span>


                                                <span
                                                    className="
                                                        hidden
                                                        sm:inline
                                                    "
                                                >
                                                    •
                                                </span>


                                                <span>
                                                    {formatRelativeDate(
                                                        entry.createdAt
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <div
                                            className="
                                                hidden
                                                shrink-0
                                                sm:flex
                                            "
                                        >

                                            <div
                                                title="Previous passwords cannot be viewed for security."
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    text-[var(--bms-text-muted)]
                                                "
                                            >

                                                <Info size={17} />

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    SECURITY ACTION
                ================================================== */}

                <section
                    className="
                        flex
                        flex-col
                        gap-3
                        rounded-2xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface)]
                        p-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:px-6
                    "
                >

                    <div>

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            Want to change your password?
                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-[var(--bms-text-secondary)]
                            "
                        >
                            Use a strong password that you have not
                            used recently.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/security")
                        }
                        className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600
                            px-4
                            text-sm
                            font-semibold
                            text-white
                            shadow-lg
                            shadow-blue-600/20
                            transition-all
                            hover:bg-blue-500
                            active:scale-[0.985]
                        "
                    >
                        Security settings
                    </button>

                </section>

            </div>

        </main>

    );

}


export default PasswordHistory;