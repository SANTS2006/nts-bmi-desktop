import {
    Building2,
    Building,
    Users as UsersIcon,
    UserCheck,
    Search,
    RefreshCw,
    Eye,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getDepartments,
    createDepartment,
} from "../../api/departments.js";


/*
 * ==================================================
 * DEPARTMENTS
 * ==================================================
 *
 * Department management page for the NTS Business
 * Management System.
 *
 * Features:
 *
 * - Department statistics
 * - Search
 * - Status filtering
 * - Refresh
 * - Department cards
 * - Create department modal
 * - Responsive layout
 * - Existing BMS design variables
 *
 * ==================================================
 */

export default function Departments() {

    const navigate =
        useNavigate();


    /*
     * ==================================================
     * STATE
     * ==================================================
     */

    const [
        departments,
        setDepartments
    ] = useState([]);


    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    const [
        isRefreshing,
        setIsRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState(null);


    const [
        searchQuery,
        setSearchQuery
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");


    /*
     * ==================================================
     * CREATE MODAL
     * ==================================================
     */

    const [
        isCreateModalOpen,
        setIsCreateModalOpen
    ] = useState(false);


    /*
     * ==================================================
     * LOAD DEPARTMENTS
     * ==================================================
     */

    const loadDepartments =
        useCallback(
            async ({
                refresh = false,
            } = {}) => {

                try {

                    if (refresh) {

                        setIsRefreshing(true);

                    } else {

                        setIsLoading(true);

                    }


                    setError(null);


                    const response =
                        await getDepartments();


                    /*
                     * Primary API response:
                     *
                     * getDepartments()
                     * returns response.data
                     *
                     * Therefore response should
                     * normally be the departments array.
                     */

                    if (
                        Array.isArray(
                            response
                        )
                    ) {

                        setDepartments(
                            response
                        );

                    } else if (
                        Array.isArray(
                            response?.departments
                        )
                    ) {

                        setDepartments(
                            response.departments
                        );

                    } else {

                        setDepartments([]);

                    }

                } catch (err) {

                    console.error(
                        "Failed to load departments:",
                        err
                    );


                    setDepartments([]);


                    setError(
                        err?.message ||
                        "Unable to load departments."
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

        loadDepartments();

    }, [
        loadDepartments,
    ]);


    /*
     * ==================================================
     * FILTER DEPARTMENTS
     * ==================================================
     */

    const filteredDepartments =
        useMemo(() => {

            const query =
                searchQuery
                    .trim()
                    .toLowerCase();


            return departments.filter(
                (department) => {

                    const name =
                        department.name
                            ?.toLowerCase() ||
                        "";


                    const description =
                        department.description
                            ?.toLowerCase() ||
                        "";


                    const headName =
                        department.head
                            ? `${department.head.firstName || ""} ${department.head.lastName || ""}`
                                .trim()
                                .toLowerCase()
                            : "";


                    const matchesSearch =
                        !query ||
                        name.includes(query) ||
                        description.includes(query) ||
                        headName.includes(query);


                    const isActive =
                        Boolean(
                            department.isActive
                        );


                    const matchesStatus =
                        statusFilter === "ALL" ||
                        (
                            statusFilter === "ACTIVE" &&
                            isActive
                        ) ||
                        (
                            statusFilter === "INACTIVE" &&
                            !isActive
                        );


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            departments,
            searchQuery,
            statusFilter,
        ]);


    /*
     * ==================================================
     * STATISTICS
     * ==================================================
     */

    const totalDepartments =
        departments.length;


    const activeDepartments =
        departments.filter(
            (department) =>
                Boolean(
                    department.isActive
                )
        ).length;


    const inactiveDepartments =
        departments.filter(
            (department) =>
                !Boolean(
                    department.isActive
                )
        ).length;


    const totalMembers =
        departments.reduce(
            (
                total,
                department
            ) =>
                total +
                (
                    Number(
                        department?._count?.members
                    ) || 0
                ),
            0
        );


    /*
     * ==================================================
     * LOADING STATE
     * ==================================================
     */

    if (isLoading) {

        return (

            <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden">

                {/* HEADER */}

                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="h-11 w-11 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

                        <div className="space-y-2">

                            <div className="h-5 w-36 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                            <div className="h-3 w-72 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                        </div>

                    </div>


                    <div className="h-10 w-36 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />

                </div>


                {/* STATISTICS */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[1, 2, 3, 4].map(
                        (item) => (

                            <div
                                key={item}
                                className="
                                    h-28
                                    animate-pulse
                                    rounded-xl
                                    border
                                    border-[var(--bms-border)]
                                    bg-[var(--bms-surface)]
                                "
                            />

                        )
                    )}

                </div>


                {/* CONTENT */}

                <div
                    className="
                        overflow-hidden
                        rounded-xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface)]
                    "
                >

                    <div className="border-b border-[var(--bms-border)] p-3 sm:p-5">

                        <div className="h-5 w-40 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                    </div>


                    <div className="grid w-full min-w-0 gap-3 p-3 sm:gap-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">

                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="
                                        h-60
                                        animate-pulse
                                        rounded-xl
                                        bg-[var(--bms-surface-soft)]
                                    "
                                />

                            )
                        )}

                    </div>

                </div>

            </div>

        );

    }


    /*
     * ==================================================
     * MAIN UI
     * ==================================================
     */

    return (

        <div className="space-y-6">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex min-w-0 items-center gap-3">

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600/10
                            text-blue-500
                        "
                    >

                        <Building2
                            size={22}
                            strokeWidth={1.8}
                        />

                    </div>


                    <div>

                        <h1
                            className="
                                text-xl
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >

                            Departments

                        </h1>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-[var(--bms-text-secondary)]
                            "
                        >

                            Manage company departments, teams and organizational structure.

                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={() =>
                        setIsCreateModalOpen(true)
                    }
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-blue-600
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-blue-700
                        active:scale-[0.98]
                    "
                >

                    <Building
                        size={18}
                    />

                    Create Department

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        p-4
                        text-sm
                        text-red-500
                    "
                >

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            loadDepartments({
                                refresh: true,
                            })
                        }
                        disabled={
                            isRefreshing
                        }
                        className="
                            shrink-0
                            rounded-lg
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            transition
                            hover:bg-red-500/10
                            disabled:opacity-50
                        "
                    >

                        {isRefreshing
                            ? "Retrying..."
                            : "Try again"
                        }

                    </button>

                </div>

            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={Building2}
                    label="Total Departments"
                    value={totalDepartments}
                />


                <StatCard
                    icon={CheckCircle2}
                    label="Active Departments"
                    value={activeDepartments}
                />


                <StatCard
                    icon={XCircle}
                    label="Inactive Departments"
                    value={inactiveDepartments}
                />


                <StatCard
                    icon={UsersIcon}
                    label="Total Members"
                    value={totalMembers}
                />

            </div>


            {/* ==================================================
                DEPARTMENTS
            ================================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                "
            >

                {/* ==================================================
                    HEADER / TOOLBAR
                ================================================== */}

                <div
                    className="
                        border-b
                        border-[var(--bms-border)]
                        px-5
                        py-4
                    "
                >

                    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <h2
                                className="
                                    text-sm
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >

                                Company Departments

                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-[var(--bms-text-muted)]
                                "
                            >

                                Manage organizational departments and their members.

                            </p>

                        </div>


                        {/* TOOLBAR */}

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                            {/* SEARCH */}

                            <div className="relative w-full sm:w-auto">

                                <Search
                                    size={16}
                                    className="
                                        pointer-events-none
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-[var(--bms-text-muted)]
                                    "
                                />


                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search departments..."
                                    aria-label="Search departments"
                                    className="
                                        h-10
                                        w-full
                                        rounded-lg
                                        border
                                        border-[var(--bms-border)]
                                        bg-[var(--bms-surface-soft)]
                                        pl-9
                                        pr-3
                                        text-sm
                                        text-[var(--bms-text)]
                                        outline-none
                                        transition
                                        placeholder:text-[var(--bms-text-muted)]
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-500/10
                                        sm:w-64
                                    "
                                />

                            </div>


                            {/* STATUS FILTER */}

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                aria-label="Filter departments by status"
                                className="
                                    h-10
                                    rounded-lg
                                    border
                                    border-[var(--bms-border)]
                                    bg-[var(--bms-surface-soft)]
                                    px-3
                                    text-sm
                                    text-[var(--bms-text)]
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/10
                                "
                            >

                                <option value="ALL">
                                    All Statuses
                                </option>

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={() =>
                                    loadDepartments({
                                        refresh: true,
                                    })
                                }
                                disabled={
                                    isRefreshing
                                }
                                title="Refresh departments"
                                aria-label="Refresh departments"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-[var(--bms-border)]
                                    bg-[var(--bms-surface-soft)]
                                    text-[var(--bms-text-secondary)]
                                    transition
                                    hover:text-[var(--bms-text)]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <RefreshCw
                                    size={17}
                                    className={
                                        isRefreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                            </button>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {filteredDepartments.length === 0 ? (

                    <div
                        className="
                            flex
                            min-h-64
                            flex-col
                            items-center
                            justify-center
                            px-6
                            text-center
                        "
                    >

                        <Building2
                            size={36}
                            className="text-[var(--bms-text-muted)]"
                        />


                        <h3
                            className="
                                mt-3
                                text-sm
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >

                            {departments.length === 0
                                ? "No departments found"
                                : "No matching departments"
                            }

                        </h3>


                        <p
                            className="
                                mt-1
                                max-w-sm
                                text-xs
                                text-[var(--bms-text-secondary)]
                            "
                        >

                            {departments.length === 0
                                ? "There are currently no departments configured in the system."
                                : "Try changing your search or status filter."
                            }

                        </p>


                        {departments.length === 0 && (

                            <button
                                type="button"
                                onClick={() =>
                                    setIsCreateModalOpen(true)
                                }
                                className="
                                    mt-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    bg-blue-600
                                    px-4
                                    py-2
                                    text-xs
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-blue-700
                                "
                            >

                                <Building
                                    size={15}
                                />

                                Create Department

                            </button>

                        )}

                    </div>

                ) : (

                    /* ==================================================
                       DEPARTMENT GRID
                    ================================================== */

                    <div
                        className="
                            grid
                            gap-4
                            p-5
                            md:grid-cols-2
                            xl:grid-cols-3
                        "
                    >

                        {filteredDepartments.map(
                            (department) => {

                                const head =
                                    department?.head;


                                const memberCount =
                                    Number(
                                        department?._count?.members
                                    ) || 0;


                                const isActive =
                                    Boolean(
                                        department?.isActive
                                    );


                                return (

                                    <div
                                        key={
                                            department.id
                                        }
                                        className="
                                            rounded-xl
                                            border
                                            border-[var(--bms-border)]
                                            bg-[var(--bms-surface)]
                                            p-5
                                            transition
                                            hover:-translate-y-0.5
                                            hover:border-blue-500/20
                                            hover:shadow-md
                                        "
                                    >

                                        {/* CARD HEADER */}

                                        <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">

                                            <div className="flex min-w-0 items-start gap-3">

                                                <div
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-blue-600/10
                                                        text-blue-500
                                                    "
                                                >

                                                    <Building2
                                                        size={19}
                                                        strokeWidth={1.8}
                                                    />

                                                </div>


                                                <div className="min-w-0">

                                                    <h3
                                                        className="
                                                            truncate
                                                            text-sm
                                                            font-semibold
                                                            text-[var(--bms-text)]
                                                        "
                                                    >

                                                        {
                                                            department.name
                                                        }

                                                    </h3>


                                                    <p
                                                        className="
                                                            mt-0.5
                                                            text-xs
                                                            text-[var(--bms-text-muted)]
                                                        "
                                                    >

                                                        Department

                                                    </p>

                                                </div>

                                            </div>


                                            <DepartmentStatusBadge
                                                isActive={
                                                    isActive
                                                }
                                            />

                                        </div>


                                        {/* DESCRIPTION */}

                                        <p
                                            className="
                                                mt-4
                                                line-clamp-3
                                                text-sm
                                                leading-6
                                                text-[var(--bms-text-secondary)]
                                            "
                                        >

                                            {
                                                department.description ||
                                                "No description provided."
                                            }

                                        </p>


                                        {/* INFORMATION */}

                                        <div
                                            className="
                                                mt-5
                                                space-y-3
                                                border-t
                                                border-[var(--bms-border)]
                                                pt-4
                                            "
                                        >

                                            {/* HEAD */}

                                            <div className="flex items-center justify-between gap-4">

                                                <div className="flex items-center gap-2">

                                                    <UserCheck
                                                        size={15}
                                                        className="text-[var(--bms-text-muted)]"
                                                    />

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-[var(--bms-text-muted)]
                                                        "
                                                    >

                                                        Department Head

                                                    </span>

                                                </div>


                                                <span
                                                    className="
                                                        max-w-[150px]
                                                        truncate
                                                        text-right
                                                        text-xs
                                                        font-medium
                                                        text-[var(--bms-text-secondary)]
                                                    "
                                                >

                                                    {head
                                                        ? `${head.firstName || ""} ${head.lastName || ""}`.trim()
                                                        : "Not assigned"
                                                    }

                                                </span>

                                            </div>


                                            {/* MEMBERS */}

                                            <div className="flex items-center justify-between gap-4">

                                                <div className="flex items-center gap-2">

                                                    <UsersIcon
                                                        size={15}
                                                        className="text-[var(--bms-text-muted)]"
                                                    />

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-[var(--bms-text-muted)]
                                                        "
                                                    >

                                                        Members

                                                    </span>

                                                </div>


                                                <span
                                                    className="
                                                        text-xs
                                                        font-semibold
                                                        text-[var(--bms-text-secondary)]
                                                    "
                                                >

                                                    {memberCount}

                                                </span>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="mt-5 flex items-center gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/departments/${department.id}`
                                                    )
                                                }
                                                className="
                                                    inline-flex
                                                    h-9
                                                    flex-1
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    rounded-lg
                                                    bg-blue-600
                                                    px-3
                                                    text-xs
                                                    font-medium
                                                    text-white
                                                    transition
                                                    hover:bg-blue-700
                                                    active:scale-[0.98]
                                                "
                                            >

                                                <Eye
                                                    size={15}
                                                />

                                                View Department

                                            </button>


                                            <button
                                                type="button"
                                                title="More actions"
                                                aria-label={`More actions for ${department.name}`}
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    border
                                                    border-[var(--bms-border)]
                                                    text-[var(--bms-text-muted)]
                                                    transition
                                                    hover:bg-[var(--bms-surface-soft)]
                                                    hover:text-[var(--bms-text)]
                                                "
                                            >

                                                <MoreHorizontal
                                                    size={17}
                                                />

                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}


                {/* ==================================================
                    FOOTER
                ================================================== */}

                {filteredDepartments.length > 0 && (

                    <div
                        className="
                            flex
                            flex-col
                            gap-2
                            border-t
                            border-[var(--bms-border)]
                            px-5
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-[var(--bms-text-muted)]
                            "
                        >

                            Showing{" "}

                            <span
                                className="
                                    font-medium
                                    text-[var(--bms-text-secondary)]
                                "
                            >

                                {filteredDepartments.length}

                            </span>

                            {" "}of{" "}

                            <span
                                className="
                                    font-medium
                                    text-[var(--bms-text-secondary)]
                                "
                            >

                                {departments.length}

                            </span>

                            {" "}departments

                        </p>


                        <p
                            className="
                                text-xs
                                text-[var(--bms-text-muted)]
                            "
                        >

                            {activeDepartments} active

                            {" · "}

                            {inactiveDepartments} inactive

                        </p>

                    </div>

                )}

            </div>


            {/* ==================================================
                CREATE DEPARTMENT MODAL
            ================================================== */}

            {isCreateModalOpen && (

                <CreateDepartmentModal

                    onClose={() =>
                        setIsCreateModalOpen(false)
                    }

                    onCreated={async () => {

                        setIsCreateModalOpen(
                            false
                        );

                        await loadDepartments({
                            refresh: true,
                        });

                    }}

                />

            )}

        </div>

    );

}


/*
 * ==================================================
 * STAT CARD
 * ==================================================
 */

function StatCard({
    icon: Icon,
    label,
    value,
}) {

    return (

        <div
            className="
                rounded-xl
                border
                border-[var(--bms-border)]
                bg-[var(--bms-surface)]
                p-5
            "
        >

            <div className="flex items-center justify-between">

                <div>

                    <p
                        className="
                            text-xs
                            font-medium
                            text-[var(--bms-text-muted)]
                        "
                    >

                        {label}

                    </p>


                    <p
                        className="
                            mt-2
                            text-2xl
                            font-semibold
                            text-[var(--bms-text)]
                        "
                    >

                        {value}

                    </p>

                </div>


                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-600/10
                        text-blue-500
                    "
                >

                    <Icon
                        size={20}
                        strokeWidth={1.8}
                    />

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * DEPARTMENT STATUS BADGE
 * ==================================================
 */

function DepartmentStatusBadge({
    isActive,
}) {

    return (

        <span
            className={`
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-xs
                font-medium
                ${
                    isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-gray-500/10 text-gray-500"
                }
            `}
        >

            {isActive ? (

                <CheckCircle2
                    size={12}
                />

            ) : (

                <XCircle
                    size={12}
                />

            )}


            {isActive
                ? "Active"
                : "Inactive"
            }

        </span>

    );

}


/*
 * ==================================================
 * CREATE DEPARTMENT MODAL
 * ==================================================
 */

function CreateDepartmentModal({
    onClose,
    onCreated,
}) {

    const [
        name,
        setName
    ] = useState("");


    const [
        description,
        setDescription
    ] = useState("");


    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    /*
     * ==================================================
     * SUBMIT
     * ==================================================
     */

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            const trimmedName =
                name.trim();


            const trimmedDescription =
                description.trim();


            /*
             * Client-side validation.
             *
             * Backend validation remains authoritative.
             */

            if (
                trimmedName.length < 2
            ) {

                setError(
                    "Department name must be at least 2 characters."
                );

                return;

            }


            if (
                trimmedName.length > 100
            ) {

                setError(
                    "Department name must not exceed 100 characters."
                );

                return;

            }


            if (
                trimmedDescription.length > 500
            ) {

                setError(
                    "Department description must not exceed 500 characters."
                );

                return;

            }


            try {

                setIsSubmitting(true);

                setError("");


                await createDepartment({

                    name:
                        trimmedName,

                    description:
                        trimmedDescription ||
                        null,

                });


                await onCreated();

            } catch (err) {

                console.error(
                    "Failed to create department:",
                    err
                );


                setError(
                    err?.message ||
                    "Unable to create department."
                );

            } finally {

                setIsSubmitting(false);

            }

        };


    /*
     * ==================================================
     * ESCAPE KEY
     * ==================================================
     */

    useEffect(() => {

        const handleKeyDown =
            (event) => {

                if (
                    event.key === "Escape" &&
                    !isSubmitting
                ) {

                    onClose();

                }

            };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [
        isSubmitting,
        onClose,
    ]);


    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                p-4
                backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-department-title"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget &&
                    !isSubmitting
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="
                    w-full
                    max-w-lg
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                    shadow-2xl
                "
            >

                {/* ==================================================
                    MODAL HEADER
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--bms-border)]
                        px-5
                        py-4
                    "
                >

                    <div className="flex min-w-0 items-center gap-3">

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-600/10
                                text-blue-500
                            "
                        >

                            <Building2
                                size={19}
                            />

                        </div>


                        <div>

                            <h2
                                id="create-department-title"
                                className="
                                    text-sm
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >

                                Create Department

                            </h2>


                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-[var(--bms-text-muted)]
                                "
                            >

                                Add a new department to your organization.

                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close"
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-[var(--bms-text-muted)]
                            transition
                            hover:bg-[var(--bms-surface-soft)]
                            hover:text-[var(--bms-text)]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        <X
                            size={18}
                        />

                    </button>

                </div>


                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="space-y-5 p-5">

                        {/* ERROR */}

                        {error && (

                            <div
                                className="
                                    rounded-lg
                                    border
                                    border-red-500/20
                                    bg-red-500/10
                                    px-4
                                    py-3
                                    text-xs
                                    text-red-500
                                "
                            >

                                {error}

                            </div>

                        )}


                        {/* NAME */}

                        <div>

                            <label
                                htmlFor="department-name"
                                className="
                                    mb-2
                                    block
                                    text-xs
                                    font-medium
                                    text-[var(--bms-text-secondary)]
                                "
                            >

                                Department Name

                                <span className="ml-1 text-red-500">
                                    *
                                </span>

                            </label>


                            <input
                                id="department-name"
                                type="text"
                                value={name}
                                onChange={(event) => {

                                    setName(
                                        event.target.value
                                    );

                                    if (error) {
                                        setError("");
                                    }

                                }}
                                placeholder="e.g. Software Development"
                                maxLength={100}
                                autoFocus
                                disabled={isSubmitting}
                                className="
                                    h-11
                                    w-full
                                    rounded-lg
                                    border
                                    border-[var(--bms-border)]
                                    bg-[var(--bms-surface-soft)]
                                    px-3
                                    text-sm
                                    text-[var(--bms-text)]
                                    outline-none
                                    transition
                                    placeholder:text-[var(--bms-text-muted)]
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            />


                            <div
                                className="
                                    mt-1.5
                                    flex
                                    justify-end
                                "
                            >

                                <span
                                    className="
                                        text-[10px]
                                        text-[var(--bms-text-muted)]
                                    "
                                >

                                    {name.length}/100

                                </span>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div>

                            <label
                                htmlFor="department-description"
                                className="
                                    mb-2
                                    block
                                    text-xs
                                    font-medium
                                    text-[var(--bms-text-secondary)]
                                "
                            >

                                Description

                            </label>


                            <textarea
                                id="department-description"
                                value={description}
                                onChange={(event) => {

                                    setDescription(
                                        event.target.value
                                    );

                                    if (error) {
                                        setError("");
                                    }

                                }}
                                placeholder="Describe the purpose and responsibilities of this department..."
                                maxLength={500}
                                rows={5}
                                disabled={isSubmitting}
                                className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-[var(--bms-border)]
                                    bg-[var(--bms-surface-soft)]
                                    px-3
                                    py-3
                                    text-sm
                                    leading-6
                                    text-[var(--bms-text)]
                                    outline-none
                                    transition
                                    placeholder:text-[var(--bms-text-muted)]
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            />


                            <div
                                className="
                                    mt-1.5
                                    flex
                                    justify-end
                                "
                            >

                                <span
                                    className="
                                        text-[10px]
                                        text-[var(--bms-text-muted)]
                                    "
                                >

                                    {description.length}/500

                                </span>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <div
                        className="
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-[var(--bms-border)]
                            bg-[var(--bms-surface-soft)]
                            px-5
                            py-4
                            sm:flex-row
                            sm:justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="
                                inline-flex
                                h-10
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-[var(--bms-border)]
                                px-4
                                text-xs
                                font-medium
                                text-[var(--bms-text-secondary)]
                                transition
                                hover:bg-[var(--bms-surface)]
                                hover:text-[var(--bms-text)]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !name.trim()
                            }
                            className="
                                inline-flex
                                h-10
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-blue-600
                                px-5
                                text-xs
                                font-medium
                                text-white
                                transition
                                hover:bg-blue-700
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {isSubmitting ? (

                                <>
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />

                                    Creating...

                                </>

                            ) : (

                                <>
                                    <Building
                                        size={15}
                                    />

                                    Create Department
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}