import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    MessageSquareText,
    Pencil,
    ShieldAlert,
    Star,
    UserRound,
    AlertTriangle,
    ThumbsUp,
    Target,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getPerformanceRecords,
} from "../api/performance.js";

import {
    getEmployees,
} from "../api/employee.js";

import {
    arrayData,
    getError,
    nameOf,
    dateOf,
    Button,
    Empty,
    ErrorBox,
} from "../components/employeeManagement/ManagementUI.jsx";


/* =========================================================
   RATING META
   ========================================================= */

const RATING_META = {

    EXCEPTIONAL: {
        label: "Exceptional",
        className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
        icon: Star,
    },

    EXCEEDS_EXPECTATIONS: {
        label: "Exceeds Expectations",
        className:
            "border-blue-500/20 bg-blue-500/10 text-blue-500",
        icon: CheckCircle2,
    },

    MEETS_EXPECTATIONS: {
        label: "Meets Expectations",
        className:
            "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
        icon: CheckCircle2,
    },

    NEEDS_IMPROVEMENT: {
        label: "Needs Improvement",
        className:
            "border-amber-500/20 bg-amber-500/10 text-amber-500",
        icon: AlertTriangle,
    },

    UNSATISFACTORY: {
        label: "Unsatisfactory",
        className:
            "border-red-500/20 bg-red-500/10 text-red-500",
        icon: ShieldAlert,
    },

};


/* =========================================================
   HELPERS
   ========================================================= */

function ratingMeta(
    value
) {

    return (
        RATING_META[value] ||
        RATING_META.MEETS_EXPECTATIONS
    );

}


function getInitials(
    person
) {

    if (!person) {
        return "EM";
    }

    const firstName =
        person?.user?.firstName ||
        person?.firstName ||
        "";

    const lastName =
        person?.user?.lastName ||
        person?.lastName ||
        "";

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase();

    if (initials) {
        return initials;
    }

    return (
        nameOf(
            person,
            ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0)
            )
            .join("")
            .toUpperCase() ||
        "EM"
    );

}


function getJobTitle(
    employee
) {

    return (
        employee?.jobTitle ||
        employee?.user?.jobTitle ||
        employee?.position ||
        "Employee"
    );

}


function unwrap(
    value
) {

    return value?.data ?? value;

}


/* =========================================================
   AVATAR
   ========================================================= */

function EmployeeAvatar({
    employee,
}) {

    return (

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-xl font-bold text-blue-500 ring-4 ring-blue-500/5">

            {
                getInitials(
                    employee
                )
            }

        </div>

    );

}


/* =========================================================
   RATING BADGE
   ========================================================= */

function RatingBadge({
    rating,
}) {

    const meta =
        ratingMeta(
            rating
        );

    const Icon =
        meta.icon;

    return (

        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.className}`}
        >

            <Icon
                size={14}
            />

            {
                meta.label
            }

        </span>

    );

}


/* =========================================================
   DETAIL SECTION
   ========================================================= */

function DetailSection({
    icon: Icon,
    title,
    children,
    tone = "default",
}) {

    const wrapper =
        tone === "success"
            ? "border-emerald-500/15 bg-emerald-500/5"
            : tone === "warning"
                ? "border-amber-500/15 bg-amber-500/5"
                : "border-[var(--bms-border)] bg-[var(--bms-surface)]";

    const iconClass =
        tone === "success"
            ? "text-emerald-500"
            : tone === "warning"
                ? "text-amber-500"
                : "text-blue-500";

    return (

        <section
            className={`rounded-2xl border p-5 sm:p-6 ${wrapper}`}
        >

            <div className="flex items-center gap-2">

                <Icon
                    size={17}
                    className={
                        iconClass
                    }
                />

                <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                    {title}
                </h2>

            </div>


            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--bms-text-secondary)]">

                {
                    children
                }

            </div>

        </section>

    );

}


/* =========================================================
   INFO ITEM
   ========================================================= */

function InfoItem({
    icon: Icon,
    label,
    value,
}) {

    return (

        <div className="flex items-start gap-3 rounded-xl bg-[var(--bms-surface-soft)] p-3.5">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                <Icon
                    size={15}
                />

            </div>


            <div className="min-w-0">

                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-medium text-[var(--bms-text)]">
                    {value || "—"}
                </p>

            </div>

        </div>

    );

}


/* =========================================================
   PERFORMANCE DETAILS
   ========================================================= */

export default function PerformanceDetails() {

    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();

    const location =
        useLocation();


    /* -------------------------------------------------------
       DATA
    ------------------------------------------------------- */

    const [
        record,
        setRecord,
    ] = useState(
        location.state?.record ||
        null
    );

    const [
        employees,
        setEmployees,
    ] = useState([]);


    /* -------------------------------------------------------
       LOADING
    ------------------------------------------------------- */

    const [
        loading,
        setLoading,
    ] = useState(
        !location.state?.record
    );

    const [
        error,
        setError,
    ] = useState("");


    /* =======================================================
       LOAD DETAILS
    ======================================================= */

    useEffect(
        () => {

            let cancelled = false;


            async function loadDetails() {

                try {

                    setError("");


                    /*
                     * If the record was passed through
                     * navigation state, we already have it.
                     *
                     * Still load employees so we can resolve
                     * missing employee/reviewer objects.
                     */

                    const employeesResponse =
                        await getEmployees({
                            page: 1,
                            limit: 100,
                        });


                    if (
                        !cancelled
                    ) {

                        setEmployees(
                            arrayData(
                                employeesResponse,
                                [
                                    "employees",
                                ]
                            )
                        );

                    }


                    /*
                     * If the page was opened directly or
                     * refreshed, retrieve the record again.
                     */

                    if (
                        !record &&
                        id
                    ) {

                        setLoading(
                            true
                        );


                        const response =
                            await getPerformanceRecords({
                                employeeId: "",
                                rating: "",
                            });


                        const data =
                            unwrap(
                                response
                            );


                        const records =
                            Array.isArray(
                                data
                            )
                                ? data
                                : arrayData(
                                    response,
                                    [
                                        "records",
                                        "performance",
                                        "performanceRecords",
                                    ]
                                );


                        const found =
                            records.find(
                                (
                                    item
                                ) =>
                                    item.id ===
                                    id
                            );


                        if (
                            !found
                        ) {

                            throw new Error(
                                "Performance review not found."
                            );

                        }


                        if (
                            !cancelled
                        ) {

                            setRecord(
                                found
                            );

                        }

                    }

                } catch (err) {

                    if (
                        !cancelled
                    ) {

                        console.error(
                            "Failed to load performance details:",
                            err
                        );

                        setError(
                            getError(
                                err,
                                "Unable to load performance review."
                            )
                        );

                    }

                } finally {

                    if (
                        !cancelled
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            }


            loadDetails();


            return () => {

                cancelled = true;

            };

        },
        [
            id,
        ]
    );


    /* =======================================================
       RESOLVE EMPLOYEE
    ======================================================= */

    const employee =
        record?.employee ||
        employees.find(
            (
                item
            ) =>
                item.id ===
                record?.employeeId
        );


    /* =======================================================
       RESOLVE REVIEWER
    ======================================================= */

    const reviewer =
        record?.reviewer ||
        employees.find(
            (
                item
            ) =>
                item.id ===
                record?.reviewerId
        );


    /* =======================================================
       LOADING
    ======================================================= */

    if (loading) {

        return (

            <div className="p-4 sm:p-6">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            -1
                        )
                    }
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)]"
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to performance

                </button>


                <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                    <Empty
                        text="Loading performance review..."
                    />

                </div>

            </div>

        );

    }


    /* =======================================================
       ERROR / NOT FOUND
    ======================================================= */

    if (
        error ||
        !record
    ) {

        return (

            <div className="p-4 sm:p-6">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            -1
                        )
                    }
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)]"
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to performance

                </button>


                {error ? (

                    <ErrorBox
                        message={
                            error
                        }
                    />

                ) : (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text="Performance review not found."
                        />

                    </div>

                )}

            </div>

        );

    }


    /* =======================================================
       RENDER
    ======================================================= */

    return (

        <div className="p-4 sm:p-6">

            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        -1
                    )
                }
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] transition-colors hover:text-[var(--bms-text)]"
            >

                <ArrowLeft
                    size={16}
                />

                Back to performance

            </button>


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                            <ClipboardCheck
                                size={18}
                            />

                        </div>

                        <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                            Performance review
                        </p>

                    </div>


                    <h1 className="mt-2 text-2xl font-bold text-[var(--bms-text)] sm:text-3xl">

                        Performance details

                    </h1>


                    <p className="mt-1 text-sm text-[var(--bms-text-muted)]">

                        Complete performance evaluation and feedback.

                    </p>

                </div>


                <Button
                    onClick={() =>
                        navigate(
                            `/performance/${record.id}/edit`,
                            {
                                state: {
                                    record,
                                },
                            }
                        )
                    }
                >

                    <Pencil
                        size={15}
                    />

                    Edit review

                </Button>

            </div>


            {/* =================================================
                EMPLOYEE HERO
            ================================================= */}

            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* Employee */}

                        <div className="flex min-w-0 items-center gap-4">

                            <EmployeeAvatar
                                employee={
                                    employee
                                }
                            />


                            <div className="min-w-0">

                                <h2 className="truncate text-xl font-bold text-[var(--bms-text)]">

                                    {
                                        nameOf(
                                            employee,
                                            "Unknown employee"
                                        )
                                    }

                                </h2>


                                <p className="mt-1 text-sm text-[var(--bms-text-muted)]">

                                    {
                                        getJobTitle(
                                            employee
                                        )
                                    }

                                </p>

                            </div>

                        </div>


                        {/* Rating */}

                        <div className="flex flex-col items-start gap-2 lg:items-end">

                            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                                Overall rating
                            </p>

                            <RatingBadge
                                rating={
                                    record.rating
                                }
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                REVIEW INFORMATION
            ================================================= */}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <InfoItem
                    icon={
                        CalendarDays
                    }
                    label="Review date"
                    value={
                        dateOf(
                            record.reviewDate
                        )
                    }
                />


                <InfoItem
                    icon={
                        UserRound
                    }
                    label="Reviewer"
                    value={
                        nameOf(
                            reviewer,
                            "Unknown reviewer"
                        )
                    }
                />


                <InfoItem
                    icon={
                        Target
                    }
                    label="Review type"
                    value="Employee performance review"
                />

            </div>


            {/* =================================================
                MAIN DETAILS
            ================================================= */}

            <div className="mt-5 grid gap-4">

                {/* Summary */}

                {record.summary ? (

                    <DetailSection
                        icon={
                            MessageSquareText
                        }
                        title="Performance summary"
                    >

                        {
                            record.summary
                        }

                    </DetailSection>

                ) : (

                    <DetailSection
                        icon={
                            MessageSquareText
                        }
                        title="Performance summary"
                    >

                        <p className="italic text-[var(--bms-text-muted)]">
                            No performance summary was provided.
                        </p>

                    </DetailSection>

                )}


                {/* Strengths */}

                <DetailSection
                    icon={
                        ThumbsUp
                    }
                    title="Strengths"
                    tone="success"
                >

                    {record.strengths ? (

                        record.strengths

                    ) : (

                        <p className="italic text-[var(--bms-text-muted)]">
                            No strengths were recorded.
                        </p>

                    )}

                </DetailSection>


                {/* Areas for improvement */}

                <DetailSection
                    icon={
                        AlertTriangle
                    }
                    title="Areas for improvement"
                    tone="warning"
                >

                    {record.areasForImprovement ? (

                        record.areasForImprovement

                    ) : (

                        <p className="italic text-[var(--bms-text-muted)]">
                            No areas for improvement were recorded.
                        </p>

                    )}

                </DetailSection>


                {/* Recommendations */}

                <DetailSection
                    icon={
                        Target
                    }
                    title="Recommendations"
                >

                    {record.recommendations ? (

                        record.recommendations

                    ) : (

                        <p className="italic text-[var(--bms-text-muted)]">
                            No recommendations were provided.
                        </p>

                    )}

                </DetailSection>

            </div>


            {/* =================================================
                REVIEW FOOTER
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <p className="text-xs font-medium text-[var(--bms-text)]">
                            Performance review
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">

                            Reviewed on{" "}

                            {
                                dateOf(
                                    record.reviewDate
                                )
                            }

                            {" "}by{" "}

                            {
                                nameOf(
                                    reviewer,
                                    "Unknown reviewer"
                                )
                            }

                        </p>

                    </div>


                    <RatingBadge
                        rating={
                            record.rating
                        }
                    />

                </div>

            </div>

        </div>

    );

}