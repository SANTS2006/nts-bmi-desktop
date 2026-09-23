import {
    AlertCircle,
    Activity,
    Bell,
    BriefcaseBusiness,
    CalendarClock,
    CalendarDays,
    ChartNoAxesCombined,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileText,
    FolderKanban,
    ListChecks,
    MessageSquare,
    Receipt,
    RefreshCw,
    ShieldCheck,
    TriangleAlert,
    UserPlus,
    UserRoundCheck,
    Users,
    WalletCards,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import StatCard from "../components/StatCard";
import ActivityItem from "../components/ActivityItem";
import QuickAction from "../components/QuickAction";

import {
    getDashboardOverview,
} from "../api/dashboard";

import {
    useAuth,
} from "../context/AuthContext";


/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function formatDate(value) {

    if (!value) {
        return "No date";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "No date";
    }

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}


function formatShortDate(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
        }
    );
}


function formatNumber(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return "0";
    }

    return number.toLocaleString(
        undefined,
        {
            maximumFractionDigits: 2,
        }
    );
}


function formatCurrency(
    value,
    currency = "SLE"
) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return "0";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }
    ).format(number);
}


function formatStatus(value) {

    if (!value) {
        return "Unknown";
    }

    return String(value)
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word
                    .charAt(0)
                    .toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}


function getStatusClass(status) {

    switch (status) {

        case "DONE":
        case "COMPLETED":
        case "PAID":
        case "APPROVED":
            return "bg-emerald-500/10 text-emerald-500";

        case "IN_PROGRESS":
        case "ACTIVE":
        case "SENT":
        case "PRESENT":
            return "bg-blue-500/10 text-blue-500";

        case "REVIEW":
        case "PLANNING":
        case "PARTIALLY_PAID":
            return "bg-violet-500/10 text-violet-500";

        case "BLOCKED":
        case "ON_HOLD":
        case "OVERDUE":
        case "PENDING":
            return "bg-amber-500/10 text-amber-500";

        case "CANCELLED":
        case "CLOSED":
        case "REJECTED":
            return "bg-slate-500/10 text-slate-500";

        case "OPEN":
        case "TODO":
        case "LATE":
            return "bg-orange-500/10 text-orange-500";

        case "ABSENT":
        case "CRITICAL":
            return "bg-red-500/10 text-red-500";

        default:
            return "bg-slate-500/10 text-slate-500";
    }
}


function getPriorityClass(priority) {

    switch (priority) {

        case "CRITICAL":
            return "bg-red-500/10 text-red-500";

        case "HIGH":
            return "bg-orange-500/10 text-orange-500";

        case "MEDIUM":
        case "NORMAL":
            return "bg-blue-500/10 text-blue-500";

        case "LOW":
            return "bg-slate-500/10 text-slate-500";

        default:
            return "bg-slate-500/10 text-slate-500";
    }
}


function getUserName(user) {

    if (!user) {
        return "Unassigned";
    }

    const name =
        [
            user.firstName,
            user.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

    return (
        name ||
        user.email ||
        "Unassigned"
    );
}


function getUserInitials(name) {

    if (!name) {
        return "?";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (part) =>
                part
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");
}


function clampPercentage(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(
            0,
            number
        )
    );
}


/*
 * ==================================================
 * MAIN DASHBOARD
 * ==================================================
 */

function Dashboard() {

    const {
        user,
    } = useAuth();


    const [
        dashboard,
        setDashboard,
    ] = useState(null);


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


    /*
     * ==================================================
     * LOAD DASHBOARD
     * ==================================================
     */

    const loadDashboard =
        useCallback(
            async (
                initial = false
            ) => {

                try {

                    if (initial) {

                        setIsLoading(
                            true
                        );

                    } else {

                        setIsRefreshing(
                            true
                        );
                    }


                    setError(
                        null
                    );


                    const data =
                        await getDashboardOverview();


                    setDashboard(
                        data
                    );

                } catch (
                loadError
                ) {

                    console.error(
                        "Dashboard loading failed:",
                        loadError
                    );


                    setError(
                        loadError?.message ||
                        "Unable to load dashboard data."
                    );

                } finally {

                    setIsLoading(
                        false
                    );

                    setIsRefreshing(
                        false
                    );

                }

            },
            []
        );


    /*
     * ==================================================
     * INITIAL LOAD
     * ==================================================
     */

    useEffect(
        () => {

            loadDashboard(
                true
            );

        },
        [
            loadDashboard,
        ]
    );


    /*
     * ==================================================
     * DATA
     * ==================================================
     */

    const statistics =
        dashboard?.statistics ||
        {};


    const clients =
        dashboard?.clients ||
        {};


    const projects =
        dashboard?.projects ||
        {};


    const tasks =
        dashboard?.tasks ||
        {};


    const milestones =
        dashboard?.milestones ||
        {};


    const requirements =
        dashboard?.requirements ||
        {};


    const issues =
        dashboard?.issues ||
        {};


    const documents =
        dashboard?.documents ||
        {};


    const employees =
        dashboard?.employees ||
        {};


    const teams =
        dashboard?.teams ||
        {};


    const attendance =
        dashboard?.attendance ||
        {};


    const leave =
        dashboard?.leave ||
        {};


    const finance =
        dashboard?.finance ||
        {};


    const invoices =
        dashboard?.invoices ||
        {};


    const budgets =
        dashboard?.budgets ||
        {};


    const communication =
        dashboard?.communication ||
        {};


    const approvals =
        dashboard?.approvals ||
        {};


    const security =
        dashboard?.security ||
        {};


    const performance =
        dashboard?.performance ||
        {};


    const goals =
        dashboard?.goals ||
        {};


    const skills =
        dashboard?.skills ||
        {};


    const notifications =
        dashboard?.notifications ||
        {};


    const attention =
        dashboard?.attention ||
        {};


    const recentActivity =
        dashboard?.recentActivity ||
        [];


    const weeklyActivity =
        dashboard?.weeklyActivity ||
        {};


    const firstName =
        user?.firstName ||
        "there";


    /*
     * ==================================================
     * ATTENTION TOTAL
     * ==================================================
     */

    const attentionTotal =
        useMemo(
            () =>
                Number(
                    attention.overdueTasks ||
                    0
                ) +
                Number(
                    attention.overdueMilestones ||
                    0
                ) +
                Number(
                    attention.overdueProjects ||
                    0
                ) +
                Number(
                    attention.criticalIssues ||
                    0
                ) +
                Number(
                    attention.unassignedTasks ||
                    0
                ) +
                Number(
                    attention.pendingApprovals ||
                    0
                ) +
                Number(
                    attention.pendingLeaveRequests ||
                    0
                ) +
                Number(
                    attention.overdueGoals ||
                    0
                ) +
                Number(
                    attention.failedLogins ||
                    0
                ),
            [
                attention,
            ]
        );


    /*
     * ==================================================
     * SAFE LISTS
     * ==================================================
     */

    const upcomingTasks =
        Array.isArray(
            tasks.upcoming
        )
            ? tasks.upcoming
            : [];


    const overdueTaskItems =
        Array.isArray(
            tasks.overdueItems
        )
            ? tasks.overdueItems
            : [];


    const upcomingMilestones =
        Array.isArray(
            milestones.upcoming
        )
            ? milestones.upcoming
            : [];


    const recentIssues =
        Array.isArray(
            issues.recent
        )
            ? issues.recent
            : [];


    /*
     * ==================================================
     * RENDER
     * ==================================================
     */

    return (

        <div className="w-full space-y-6">


            {/* ==================================================
                HEADER
            ================================================== */}

            <section>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>

                        <p className="text-sm font-medium text-blue-500">
                            NTS BMS Overview
                        </p>


                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-3xl">

                            Welcome back,{" "}

                            {firstName}

                        </h1>


                        <p className="mt-2 max-w-3xl text-sm text-[var(--bms-text-muted)]">

                            Here's what's happening across
                            your business, workforce,
                            finances, clients and
                            delivery operations.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadDashboard()
                        }
                        disabled={
                            isRefreshing ||
                            isLoading
                        }
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        <RefreshCw
                            size={15}
                            className={
                                isRefreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {isRefreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>

            </section>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">

                    <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                    />


                    <div className="flex-1">

                        <p className="font-medium">
                            Unable to load dashboard
                        </p>


                        <p className="mt-1 text-xs opacity-80">
                            {error}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadDashboard()
                        }
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-red-500/10"
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ==================================================
                PRIMARY STATISTICS
            ================================================== */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">


                <StatCard
                    title="Active Projects"
                    value={
                        isLoading
                            ? "—"
                            : formatNumber(
                                projects.active
                            )
                    }
                    change={
                        isLoading
                            ? "Loading..."
                            : `${projects.completionRate || 0}%`
                    }
                    changeLabel="overall completion"
                    icon={FolderKanban}
                    iconClass="bg-blue-600/15 text-blue-500"
                    chartClass="text-blue-500"
                    loading={isLoading}
                />


                <StatCard
                    title="Active Clients"
                    value={
                        isLoading
                            ? "—"
                            : formatNumber(
                                clients.active
                            )
                    }
                    change={
                        isLoading
                            ? "Loading..."
                            : `${clients.total || 0}`
                    }
                    changeLabel="total clients"
                    icon={BriefcaseBusiness}
                    iconClass="bg-purple-600/15 text-purple-500"
                    chartClass="text-purple-500"
                    loading={isLoading}
                />


                <StatCard
                    title="Outstanding Invoices"
                    value={
                        isLoading
                            ? "—"
                            : formatNumber(
                                invoices.outstanding
                            )
                    }
                    change={
                        isLoading
                            ? "Loading..."
                            : `${invoices.total || 0}`
                    }
                    changeLabel="total invoices"
                    icon={Receipt}
                    iconClass="bg-orange-600/15 text-orange-500"
                    chartClass="text-orange-500"
                    loading={isLoading}
                />


                <StatCard
                    title="Needs Attention"
                    value={
                        isLoading
                            ? "—"
                            : formatNumber(
                                attentionTotal
                            )
                    }
                    change={
                        isLoading
                            ? "Loading..."
                            : attentionTotal > 0
                                ? "Requires attention"
                                : "All clear"
                    }
                    changeLabel="open items"
                    icon={TriangleAlert}
                    iconClass="bg-red-600/15 text-red-500"
                    chartClass="text-red-500"
                    loading={isLoading}
                />

            </section>


            {/* ==================================================
                BUSINESS SNAPSHOT
            ================================================== */}

            <section className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">

                <MiniMetric
                    label="Employees"
                    value={
                        employees.active
                    }
                    icon={Users}
                />


                <MiniMetric
                    label="Teams"
                    value={
                        teams.active
                    }
                    icon={Users}
                />


                <MiniMetric
                    label="Departments"
                    value={
                        statistics.activeDepartments
                    }
                    icon={BriefcaseBusiness}
                />


                <MiniMetric
                    label="Pending Approvals"
                    value={
                        approvals.pending
                    }
                    icon={ClipboardCheck}
                    danger={
                        Number(
                            approvals.pending
                        ) > 0
                    }
                />


                <MiniMetric
                    label="Unread Notifications"
                    value={
                        notifications.unread
                    }
                    icon={Bell}
                    danger={
                        Number(
                            notifications.unread
                        ) > 0
                    }
                />


                <MiniMetric
                    label="Unread Chats"
                    value={
                        communication.unreadConversations
                    }
                    icon={MessageSquare}
                    danger={
                        Number(
                            communication.unreadConversations
                        ) > 0
                    }
                />


                <MiniMetric
                    label="Active Sessions"
                    value={
                        security.activeSessions
                    }
                    icon={ShieldCheck}
                />


                <MiniMetric
                    label="Open Issues"
                    value={
                        issues.open
                    }
                    icon={TriangleAlert}
                    danger={
                        Number(
                            issues.open
                        ) > 0
                    }
                />

            </section>


            {/* ==================================================
                FINANCIAL OVERVIEW
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">


                <DashboardCard
                    title="Financial Overview"
                    subtitle="Current financial position"
                    icon={WalletCards}
                    action={
                        <Link
                            to="/finance"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View finance
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-4">

                        <FinanceMetric
                            label="Balance"
                            value={
                                finance.balance
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                        />


                        <FinanceMetric
                            label="Revenue"
                            value={
                                finance.revenue
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                            positive
                        />


                        <FinanceMetric
                            label="Expenses"
                            value={
                                finance.expenses
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                        />


                        <FinanceMetric
                            label="Net Cash Flow"
                            value={
                                finance.netCashFlow
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                            positive={
                                Number(
                                    finance.netCashFlow
                                ) >= 0
                            }
                            negative={
                                Number(
                                    finance.netCashFlow
                                ) < 0
                            }
                        />

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Invoices"
                    subtitle="Accounts receivable overview"
                    icon={Receipt}
                    action={
                        <Link
                            to="/invoices"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View invoices
                        </Link>
                    }
                >

                    <div className="space-y-4">

                        <FinanceMetric
                            label="Invoice Value"
                            value={
                                invoices.value
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                        />


                        <FinanceMetric
                            label="Paid"
                            value={
                                invoices.paid
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                            positive
                        />


                        <FinanceMetric
                            label="Outstanding"
                            value={
                                invoices.outstanding
                            }
                            currency={
                                finance.accounts?.[0]?.currency ||
                                "SLE"
                            }
                            negative={
                                Number(
                                    invoices.outstanding
                                ) > 0
                            }
                        />

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Budgets"
                    subtitle="Currently active budgets"
                    icon={ChartNoAxesCombined}
                    action={
                        <Link
                            to="/budgets"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View budgets
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniStat
                            label="Active Budgets"
                            value={
                                budgets.active
                            }
                        />


                        <MiniStat
                            label="Transactions"
                            value={
                                finance.transactionCount
                            }
                        />


                        <div className="col-span-2 rounded-lg bg-[var(--bms-surface-soft)] p-3">

                            <p className="text-xs text-[var(--bms-text-muted)]">
                                Allocated Amount
                            </p>

                            <p className="mt-1 text-lg font-bold text-[var(--bms-text)]">

                                {formatCurrency(
                                    budgets.activeAmount,
                                    finance.accounts?.[0]?.currency ||
                                    "SLE"
                                )}

                            </p>

                        </div>


                        <div className="col-span-2 rounded-lg bg-[var(--bms-surface-soft)] p-3">

                            <p className="text-xs text-[var(--bms-text-muted)]">
                                Payments this month
                            </p>

                            <p className="mt-1 text-lg font-bold text-emerald-500">

                                {formatCurrency(
                                    finance.paymentsThisMonth,
                                    finance.accounts?.[0]?.currency ||
                                    "SLE"
                                )}

                            </p>

                        </div>

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                WORKFORCE
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">


                <DashboardCard
                    title="Workforce"
                    subtitle="Current employee status"
                    icon={Users}
                    action={
                        <Link
                            to="/employees"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View employees
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniStat
                            label="Active"
                            value={
                                employees.active
                            }
                        />


                        <MiniStat
                            label="Total"
                            value={
                                employees.total
                            }
                        />


                        <MiniStat
                            label="On Leave"
                            value={
                                employees.onLeave
                            }
                            danger={
                                Number(
                                    employees.onLeave
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Suspended"
                            value={
                                employees.suspended
                            }
                            danger={
                                Number(
                                    employees.suspended
                                ) > 0
                            }
                        />

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Today's Attendance"
                    subtitle="Workforce attendance snapshot"
                    icon={Clock3}
                    action={
                        <Link
                            to="/attendance"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View attendance
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniStat
                            label="Present"
                            value={
                                attendance.today?.present
                            }
                        />


                        <MiniStat
                            label="Late"
                            value={
                                attendance.today?.late
                            }
                            danger={
                                Number(
                                    attendance.today?.late
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Absent"
                            value={
                                attendance.today?.absent
                            }
                            danger={
                                Number(
                                    attendance.today?.absent
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="On Leave"
                            value={
                                attendance.today?.onLeave
                            }
                        />

                    </div>


                    <div className="mt-5">

                        <div className="flex items-center justify-between text-xs">

                            <span className="text-[var(--bms-text-muted)]">
                                Attendance rate
                            </span>

                            <span className="font-semibold text-[var(--bms-text)]">

                                {attendance.today?.attendanceRate || 0}%

                            </span>

                        </div>


                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">

                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{
                                    width:
                                        `${clampPercentage(
                                            attendance.today?.attendanceRate
                                        )}%`,
                                }}
                            />

                        </div>

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Leave Management"
                    subtitle="Leave activity requiring attention"
                    icon={CalendarDays}
                    action={
                        <Link
                            to="/leave"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View leave
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniStat
                            label="Pending"
                            value={
                                leave.pending
                            }
                            danger={
                                Number(
                                    leave.pending
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Approved"
                            value={
                                leave.approved
                            }
                        />


                        <MiniStat
                            label="Days This Month"
                            value={
                                leave.daysThisMonth
                            }
                        />


                        <MiniStat
                            label="Upcoming"
                            value={
                                leave.upcoming?.length ||
                                0
                            }
                        />

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                PROJECT + TASK OVERVIEW
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Project Overview"
                    subtitle="Current project distribution"
                    icon={FolderKanban}
                >

                    <DistributionBars
                        data={
                            projects.byStatus
                        }
                        order={[
                            "ACTIVE",
                            "PLANNING",
                            "ON_HOLD",
                            "COMPLETED",
                            "CANCELLED",
                        ]}
                        labelFormatter={
                            formatStatus
                        }
                    />

                </DashboardCard>


                <DashboardCard
                    title="Task Overview"
                    subtitle="Current delivery workload"
                    icon={ListChecks}
                >

                    <DistributionBars
                        data={
                            tasks.byStatus
                        }
                        order={[
                            "TODO",
                            "IN_PROGRESS",
                            "BLOCKED",
                            "REVIEW",
                            "DONE",
                            "CANCELLED",
                        ]}
                        labelFormatter={
                            formatStatus
                        }
                    />

                </DashboardCard>

            </section>


            {/* ==================================================
                PROJECT PROGRESS + TEAM WORKLOAD
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Project Progress"
                    subtitle="Delivery progress based on tasks"
                    icon={Activity}
                    action={
                        <Link
                            to="/projects"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View projects
                        </Link>
                    }
                >

                    <div className="space-y-5">

                        {isLoading ? (

                            <ListSkeleton
                                count={4}
                            />

                        ) : projects.progress?.length ? (

                            projects.progress
                                .slice(
                                    0,
                                    6
                                )
                                .map(
                                    (project) => (

                                        <div
                                            key={
                                                project.id
                                            }
                                        >

                                            <div className="flex items-center justify-between gap-3">

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                                                        {project.name}
                                                    </p>


                                                    <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">

                                                        {project.client?.name ||
                                                            "No client"}

                                                    </p>

                                                </div>


                                                <span className="shrink-0 text-xs font-semibold text-[var(--bms-text-secondary)]">

                                                    {project.progress || 0}%

                                                </span>

                                            </div>


                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">

                                                <div
                                                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                                    style={{
                                                        width:
                                                            `${clampPercentage(
                                                                project.progress
                                                            )}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    )
                                )

                        ) : (

                            <EmptyState
                                icon={FolderKanban}
                                title="No active projects"
                                description="Project progress will appear here."
                            />

                        )}

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Team Workload"
                    subtitle="Tasks currently assigned to team members"
                    icon={Users}
                    action={
                        <Link
                            to="/tasks"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View tasks
                        </Link>
                    }
                >

                    <div className="space-y-4">

                        {isLoading ? (

                            <ListSkeleton
                                count={5}
                            />

                        ) : tasks.teamWorkload?.length ? (

                            tasks.teamWorkload.map(
                                (member) => (

                                    <div
                                        key={
                                            member.userId
                                        }
                                        className="flex items-center gap-3"
                                    >

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-500">

                                            {getUserInitials(
                                                member.name
                                            )}

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-center justify-between gap-3">

                                                <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                                                    {member.name}
                                                </p>


                                                <span className="shrink-0 text-xs text-[var(--bms-text-muted)]">

                                                    {member.active || 0} active

                                                </span>

                                            </div>


                                            <div className="mt-2">

                                                <WorkloadSegment
                                                    value={
                                                        member.completed
                                                    }
                                                    total={
                                                        member.total
                                                    }
                                                />

                                            </div>


                                            {Number(
                                                member.overdue ||
                                                0
                                            ) > 0 && (

                                                    <p className="mt-1 text-[10px] text-red-500">

                                                        {member.overdue} overdue

                                                    </p>

                                                )}

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <EmptyState
                                icon={Users}
                                title="No assigned tasks"
                                description="Team workload will appear when tasks are assigned."
                            />

                        )}

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                APPROVALS + SECURITY
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Approval Center"
                    subtitle="Workflow requests requiring review"
                    icon={ClipboardCheck}
                    action={
                        <Link
                            to="/approvals"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View approvals
                        </Link>
                    }
                >

                    <div className="grid grid-cols-3 gap-3">

                        <MiniStat
                            label="Pending"
                            value={
                                approvals.pending
                            }
                            danger={
                                Number(
                                    approvals.pending
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Approved"
                            value={
                                approvals.approved
                            }
                        />


                        <MiniStat
                            label="Rejected"
                            value={
                                approvals.rejected
                            }
                        />

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Security Overview"
                    subtitle="Authentication and system security"
                    icon={ShieldCheck}
                    action={
                        <Link
                            to="/audit-logs"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View audit logs
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniStat
                            label="Active Sessions"
                            value={
                                security.activeSessions
                            }
                        />


                        <MiniStat
                            label="Failed Logins"
                            value={
                                security.failedLogins
                            }
                            danger={
                                Number(
                                    security.failedLogins
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Failed Events"
                            value={
                                security.failedAuditLogs
                            }
                            danger={
                                Number(
                                    security.failedAuditLogs
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Locked Accounts"
                            value={
                                security.lockedAccounts
                            }
                            danger={
                                Number(
                                    security.lockedAccounts
                                ) > 0
                            }
                        />

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                COMMUNICATION + EMPLOYEE DEVELOPMENT
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Internal Communication"
                    subtitle="Your communication activity"
                    icon={MessageSquare}
                    action={
                        <Link
                            to="/communications"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            Open messages
                        </Link>
                    }
                >

                    <div className="grid grid-cols-3 gap-3">

                        <MiniStat
                            label="Conversations"
                            value={
                                communication.conversations
                            }
                        />


                        <MiniStat
                            label="Unread"
                            value={
                                communication.unreadConversations
                            }
                            danger={
                                Number(
                                    communication.unreadConversations
                                ) > 0
                            }
                        />


                        <MiniStat
                            label="Messages / 7d"
                            value={
                                communication.messagesThisWeek
                            }
                        />

                    </div>


                    <div className="mt-5 space-y-2">

                        {communication.recent?.length ? (

                            communication.recent
                                .slice(
                                    0,
                                    4
                                )
                                .map(
                                    (
                                        conversation
                                    ) => (

                                        <Link
                                            key={
                                                conversation.id
                                            }
                                            to="/communications"
                                            className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] p-3 transition-colors hover:bg-[var(--bms-surface-soft)]"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                                                <MessageSquare
                                                    size={16}
                                                />

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-medium text-[var(--bms-text)]">

                                                    {conversation.name}

                                                </p>


                                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                                                    {formatStatus(
                                                        conversation.type
                                                    )}

                                                    {conversation.lastMessageAt
                                                        ? ` · ${formatDate(
                                                            conversation.lastMessageAt
                                                        )}`
                                                        : ""}

                                                </p>

                                            </div>

                                        </Link>

                                    )
                                )

                        ) : (

                            <EmptyState
                                icon={MessageSquare}
                                title="No conversations"
                                description="Your internal conversations will appear here."
                            />

                        )}

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Employee Development"
                    subtitle="Performance, goals and skills"
                    icon={UserRoundCheck}
                    action={
                        <Link
                            to="/employees"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View workforce
                        </Link>
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniStat
                            label="Performance Reviews"
                            value={
                                performance.totalReviews
                            }
                        />


                        <MiniStat
                            label="Employee Goals"
                            value={
                                goals.total
                            }
                        />


                        <MiniStat
                            label="Active Goals"
                            value={
                                goals.active
                            }
                        />


                        <MiniStat
                            label="Skills"
                            value={
                                skills.total
                            }
                        />

                    </div>


                    <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

                            <p className="text-xs text-[var(--bms-text-muted)]">
                                Completed goals
                            </p>

                            <p className="mt-1 text-lg font-bold text-emerald-500">

                                {formatNumber(
                                    goals.completed
                                )}

                            </p>

                        </div>


                        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

                            <p className="text-xs text-[var(--bms-text-muted)]">
                                Overdue goals
                            </p>

                            <p className="mt-1 text-lg font-bold text-red-500">

                                {formatNumber(
                                    goals.overdue
                                )}

                            </p>

                        </div>

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                NEEDS ATTENTION + UPCOMING DEADLINES
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Needs Attention"
                    subtitle="Items that may require immediate action"
                    icon={TriangleAlert}
                >

                    <div className="space-y-3">


                        <AttentionRow
                            icon={Clock3}
                            title="Overdue tasks"
                            value={
                                attention.overdueTasks
                            }
                            to="/tasks"
                            danger={
                                Number(
                                    attention.overdueTasks
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={CalendarClock}
                            title="Overdue milestones"
                            value={
                                attention.overdueMilestones
                            }
                            to="/projects"
                            danger={
                                Number(
                                    attention.overdueMilestones
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={FolderKanban}
                            title="Overdue projects"
                            value={
                                attention.overdueProjects ??
                                projects.overdue?.length ??
                                0
                            }
                            to="/projects"
                            danger={
                                Number(
                                    attention.overdueProjects ??
                                    projects.overdue?.length ??
                                    0
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={TriangleAlert}
                            title="Critical issues"
                            value={
                                attention.criticalIssues ??
                                issues.critical ??
                                0
                            }
                            to="/projects"
                            danger={
                                Number(
                                    attention.criticalIssues ??
                                    issues.critical ??
                                    0
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={UserRoundCheck}
                            title="Unassigned tasks"
                            value={
                                attention.unassignedTasks
                            }
                            to="/tasks"
                            danger={
                                Number(
                                    attention.unassignedTasks
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={ClipboardCheck}
                            title="Pending approvals"
                            value={
                                attention.pendingApprovals ??
                                approvals.pending ??
                                0
                            }
                            to="/approvals"
                            danger={
                                Number(
                                    attention.pendingApprovals ??
                                    approvals.pending ??
                                    0
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={CalendarDays}
                            title="Pending leave requests"
                            value={
                                attention.pendingLeaveRequests ??
                                leave.pending ??
                                0
                            }
                            to="/leave"
                            danger={
                                Number(
                                    attention.pendingLeaveRequests ??
                                    leave.pending ??
                                    0
                                ) > 0
                            }
                        />


                        <AttentionRow
                            icon={ShieldCheck}
                            title="Failed logins"
                            value={
                                attention.failedLogins ??
                                security.failedLogins ??
                                0
                            }
                            to="/audit-logs"
                            danger={
                                Number(
                                    attention.failedLogins ??
                                    security.failedLogins ??
                                    0
                                ) > 0
                            }
                        />

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Upcoming Deadlines"
                    subtitle="Tasks and milestones due soon"
                    icon={CalendarClock}
                    action={
                        <Link
                            to="/tasks"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View tasks
                        </Link>
                    }
                >

                    <div className="space-y-3">

                        {isLoading ? (

                            <ListSkeleton
                                count={5}
                            />

                        ) : (

                            <>

                                {upcomingTasks
                                    .slice(
                                        0,
                                        4
                                    )
                                    .map(
                                        (task) => (

                                            <DeadlineRow
                                                key={
                                                    `task-${task.id}`
                                                }
                                                type="Task"
                                                title={
                                                    task.title
                                                }
                                                parent={
                                                    task.project?.name
                                                }
                                                date={
                                                    task.dueDate
                                                }
                                                status={
                                                    task.status
                                                }
                                            />

                                        )
                                    )}


                                {upcomingMilestones
                                    .slice(
                                        0,
                                        3
                                    )
                                    .map(
                                        (
                                            milestone
                                        ) => (

                                            <DeadlineRow
                                                key={
                                                    `milestone-${milestone.id}`
                                                }
                                                type="Milestone"
                                                title={
                                                    milestone.name
                                                }
                                                parent={
                                                    milestone.project?.name
                                                }
                                                date={
                                                    milestone.dueDate
                                                }
                                                status={
                                                    milestone.status
                                                }
                                            />

                                        )
                                    )}


                                {!upcomingTasks.length &&
                                    !upcomingMilestones.length && (

                                        <EmptyState
                                            icon={
                                                CalendarClock
                                            }
                                            title="No upcoming deadlines"
                                            description="You're all caught up for now."
                                        />

                                    )}

                            </>

                        )}

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                OVERDUE TASKS + ISSUES
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Overdue Tasks"
                    subtitle="Tasks that have passed their deadline"
                    icon={Clock3}
                    action={
                        <Link
                            to="/tasks"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View all
                        </Link>
                    }
                >

                    <div className="space-y-3">

                        {overdueTaskItems.length ? (

                            overdueTaskItems
                                .slice(
                                    0,
                                    6
                                )
                                .map(
                                    (task) => (

                                        <Link
                                            key={
                                                task.id
                                            }
                                            to={
                                                `/tasks/${task.id}`
                                            }
                                            className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] p-3 transition-colors hover:bg-[var(--bms-surface-soft)]"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">

                                                <Clock3
                                                    size={17}
                                                />

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                                                    {task.title}
                                                </p>


                                                <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">

                                                    {task.project?.name ||
                                                        "No project"}

                                                    {" · "}

                                                    {task.assignee
                                                        ? getUserName(
                                                            task.assignee
                                                        )
                                                        : "Unassigned"}

                                                </p>

                                            </div>


                                            <div className="shrink-0 text-right">

                                                <span
                                                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${getPriorityClass(
                                                        task.priority
                                                    )}`}
                                                >

                                                    {formatStatus(
                                                        task.priority
                                                    )}

                                                </span>


                                                <p className="mt-1 text-[10px] text-red-500">

                                                    {formatShortDate(
                                                        task.dueDate
                                                    )}

                                                </p>

                                            </div>

                                        </Link>

                                    )
                                )

                        ) : (

                            <EmptyState
                                icon={
                                    CheckCircle2
                                }
                                title="No overdue tasks"
                                description="Excellent. Your task deadlines are under control."
                            />

                        )}

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Open Issues"
                    subtitle="Recent issues requiring attention"
                    icon={TriangleAlert}
                    action={
                        <Link
                            to="/projects"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View projects
                        </Link>
                    }
                >

                    <div className="space-y-3">

                        {recentIssues.length ? (

                            recentIssues
                                .slice(
                                    0,
                                    6
                                )
                                .map(
                                    (issue) => (

                                        <div
                                            key={
                                                issue.id
                                            }
                                            className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] p-3"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">

                                                <TriangleAlert
                                                    size={17}
                                                />

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                                                    {issue.title}
                                                </p>


                                                <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">

                                                    {issue.project?.name ||
                                                        "No project"}

                                                </p>

                                            </div>


                                            <div className="shrink-0 text-right">

                                                <span
                                                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${getPriorityClass(
                                                        issue.priority
                                                    )}`}
                                                >

                                                    {formatStatus(
                                                        issue.priority
                                                    )}

                                                </span>


                                                <p className="mt-1 text-[10px] text-[var(--bms-text-muted)]">

                                                    {formatStatus(
                                                        issue.status
                                                    )}

                                                </p>

                                            </div>

                                        </div>

                                    )
                                )

                        ) : (

                            <EmptyState
                                icon={
                                    CheckCircle2
                                }
                                title="No open issues"
                                description="There are currently no open project issues."
                            />

                        )}

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                CLIENTS + NOTIFICATIONS
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                <DashboardCard
                    title="Clients"
                    subtitle="Clients and their project activity"
                    icon={BriefcaseBusiness}
                    action={
                        <Link
                            to="/clients"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View clients
                        </Link>
                    }
                >

                    <div className="space-y-3">

                        {clients.top?.length ? (

                            clients.top
                                .slice(
                                    0,
                                    5
                                )
                                .map(
                                    (client) => (

                                        <Link
                                            key={
                                                client.id
                                            }
                                            to={
                                                `/clients/${client.id}`
                                            }
                                            className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] p-3 transition-colors hover:bg-[var(--bms-surface-soft)]"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">

                                                <BriefcaseBusiness
                                                    size={17}
                                                />

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                                                    {client.name}
                                                </p>


                                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                                                    {client.isActive
                                                        ? "Active client"
                                                        : "Inactive client"}

                                                </p>

                                            </div>


                                            <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-500">

                                                {client.projectCount}

                                                {" "}

                                                {client.projectCount === 1
                                                    ? "project"
                                                    : "projects"}

                                            </span>

                                        </Link>

                                    )
                                )

                        ) : (

                            <EmptyState
                                icon={
                                    BriefcaseBusiness
                                }
                                title="No clients yet"
                                description="Clients will appear here once they are added."
                            />

                        )}

                    </div>

                </DashboardCard>


                <DashboardCard
                    title="Notifications"
                    subtitle="Your latest system notifications"
                    icon={Bell}
                    action={
                        <Link
                            to="/notifications"
                            className="text-xs font-medium text-blue-500 hover:underline"
                        >
                            View all
                        </Link>
                    }
                >

                    <div className="space-y-3">

                        {notifications.recent?.length ? (

                            notifications.recent
                                .slice(
                                    0,
                                    5
                                )
                                .map(
                                    (
                                        notification
                                    ) => (

                                        <Link
                                            key={
                                                notification.id
                                            }
                                            to={
                                                notification.actionUrl ||
                                                "/notifications"
                                            }
                                            className={`block rounded-lg border border-[var(--bms-border)] p-3 transition-colors hover:bg-[var(--bms-surface-soft)] ${!notification.read
                                                    ? "border-blue-500/20 bg-blue-500/5"
                                                    : ""
                                                }`}
                                        >

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                                                    <Bell
                                                        size={15}
                                                    />

                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <p className="truncate text-sm font-medium text-[var(--bms-text)]">

                                                        {notification.title}

                                                    </p>


                                                    <p className="mt-1 line-clamp-2 text-xs text-[var(--bms-text-muted)]">

                                                        {notification.message}

                                                    </p>


                                                    <p className="mt-2 text-[10px] text-[var(--bms-text-muted)]">

                                                        {formatDate(
                                                            notification.createdAt
                                                        )}

                                                    </p>

                                                </div>


                                                {!notification.read && (

                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                                                )}

                                            </div>

                                        </Link>

                                    )
                                )

                        ) : (

                            <EmptyState
                                icon={
                                    Bell
                                }
                                title="No notifications"
                                description="You're all caught up."
                            />

                        )}

                    </div>

                </DashboardCard>

            </section>


            {/* ==================================================
                RECENT ACTIVITY + SYSTEM
            ================================================== */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">


                {/* ==================================================
                    RECENT ACTIVITY
                ================================================== */}

                <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-colors duration-300 xl:col-span-3">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                                Recent Activity
                            </h2>


                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                Latest activity across your system
                            </p>

                        </div>


                        <Link
                            to="/audit-logs"
                            className="rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                        >
                            View all
                        </Link>

                    </div>


                    <div className="mt-3">

                        {isLoading ? (

                            <DashboardActivitySkeleton />

                        ) : recentActivity.length > 0 ? (

                            recentActivity.map(
                                (log) => (

                                    <ActivityItem
                                        key={
                                            log.id
                                        }
                                        auditLog={
                                            log
                                        }
                                    />

                                )
                            )

                        ) : (

                            <EmptyState
                                icon={
                                    Activity
                                }
                                title="No recent activity"
                                description="System activity will appear here."
                            />

                        )}

                    </div>


                    <Link
                        to="/audit-logs"
                        className="mt-4 flex w-full items-center justify-center rounded-lg border border-[var(--bms-border)] py-3 text-sm font-medium text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                    >
                        View all activity
                    </Link>

                </div>


                {/* ==================================================
                    RIGHT COLUMN
                ================================================== */}

                <div className="space-y-6 xl:col-span-2">


                    {/* ==================================================
                        SYSTEM OVERVIEW
                    ================================================== */}

                    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-colors duration-300">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                                    System Overview
                                </h2>


                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                    Activity over the last 7 days
                                </p>

                            </div>


                            <Activity
                                size={19}
                                className="text-blue-500"
                            />

                        </div>


                        <SystemActivityChart
                            weeklyActivity={
                                weeklyActivity
                            }
                            isLoading={
                                isLoading
                            }
                        />

                    </div>


                    {/* ==================================================
                        QUICK ACTIONS
                    ================================================== */}

                    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-colors duration-300">

                        <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                            Quick Actions
                        </h2>


                        <div className="mt-4 grid grid-cols-2 gap-3">

                            <QuickAction
                                to="/users"
                                icon={
                                    UserPlus
                                }
                                title="Add User"
                                iconClass="bg-blue-600/15 text-blue-500"
                            />


                            <QuickAction
                                to="/projects"
                                icon={
                                    FolderKanban
                                }
                                title="New Project"
                                iconClass="bg-purple-600/15 text-purple-500"
                            />


                            <QuickAction
                                to="/tasks"
                                icon={
                                    ListChecks
                                }
                                title="New Task"
                                iconClass="bg-emerald-600/15 text-emerald-500"
                            />


                            <QuickAction
                                to="/clients"
                                icon={
                                    BriefcaseBusiness
                                }
                                title="Add Client"
                                iconClass="bg-orange-600/15 text-orange-500"
                            />


                            <QuickAction
                                to="/employees"
                                icon={
                                    UserRoundCheck
                                }
                                title="Add Employee"
                                iconClass="bg-cyan-600/15 text-cyan-500"
                            />


                            <QuickAction
                                to="/approvals"
                                icon={
                                    ClipboardCheck
                                }
                                title="Review Approvals"
                                iconClass="bg-violet-600/15 text-violet-500"
                            />

                        </div>

                    </div>

                </div>

            </section>

        </div>

    );
}


/*
 * ==================================================
 * MINI METRIC
 * ==================================================
 */

function MiniMetric({
    label,
    value,
    icon: Icon,
    danger = false,
}) {

    return (

        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

            <div className="flex items-center justify-between gap-2">

                <span className="truncate text-xs text-[var(--bms-text-muted)]">
                    {label}
                </span>


                <Icon
                    size={15}
                    className={
                        danger
                            ? "text-red-500"
                            : "text-blue-500"
                    }
                />

            </div>


            <p
                className={`mt-2 text-xl font-bold ${danger
                        ? "text-red-500"
                        : "text-[var(--bms-text)]"
                    }`}
            >
                {formatNumber(
                    value
                )}
            </p>

        </div>

    );
}


/*
 * ==================================================
 * MINI STAT
 * ==================================================
 */

function MiniStat({
    label,
    value,
    danger = false,
}) {

    return (

        <div className="rounded-lg bg-[var(--bms-surface-soft)] p-3">

            <p className="text-xs text-[var(--bms-text-muted)]">
                {label}
            </p>


            <p
                className={`mt-1 text-lg font-bold ${danger
                        ? "text-red-500"
                        : "text-[var(--bms-text)]"
                    }`}
            >
                {formatNumber(
                    value
                )}
            </p>

        </div>

    );
}


/*
 * ==================================================
 * FINANCE METRIC
 * ==================================================
 */

function FinanceMetric({
    label,
    value,
    currency = "SLE",
    positive = false,
    negative = false,
}) {

    return (

        <div>

            <p className="text-xs text-[var(--bms-text-muted)]">
                {label}
            </p>


            <p
                className={`mt-1 text-lg font-bold ${positive
                        ? "text-emerald-500"
                        : negative
                            ? "text-red-500"
                            : "text-[var(--bms-text)]"
                    }`}
            >
                {formatCurrency(
                    value,
                    currency
                )}
            </p>

        </div>

    );
}


/*
 * ==================================================
 * DASHBOARD CARD
 * ==================================================
 */

function DashboardCard({
    title,
    subtitle,
    icon: Icon,
    action,
    children,
}) {

    return (

        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-colors duration-300">

            <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                        <Icon
                            size={18}
                        />

                    </div>


                    <div>

                        <h2 className="text-lg font-semibold text-[var(--bms-text)]">
                            {title}
                        </h2>


                        {subtitle && (

                            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                                {subtitle}
                            </p>

                        )}

                    </div>

                </div>


                {action}

            </div>


            <div className="mt-5">

                {children}

            </div>

        </div>

    );
}


/*
 * ==================================================
 * DISTRIBUTION BARS
 * ==================================================
 */

function DistributionBars({
    data,
    order,
    labelFormatter,
}) {

    const values =
        order.map(
            (key) => ({
                key,
                value:
                    Number(
                        data?.[key] ||
                        0
                    ),
            })
        );


    const max =
        Math.max(
            ...values.map(
                (item) =>
                    item.value
            ),
            1
        );


    return (

        <div className="space-y-4">

            {values.map(
                (item) => (

                    <div
                        key={
                            item.key
                        }
                    >

                        <div className="mb-1.5 flex items-center justify-between">

                            <span className="text-xs font-medium text-[var(--bms-text-secondary)]">

                                {labelFormatter(
                                    item.key
                                )}

                            </span>


                            <span className="text-xs font-semibold text-[var(--bms-text)]">

                                {formatNumber(
                                    item.value
                                )}

                            </span>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">

                            <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                style={{
                                    width:
                                        `${(
                                            item.value /
                                            max
                                        ) *
                                        100}%`,
                                }}
                            />

                        </div>

                    </div>

                )
            )}

        </div>

    );
}


/*
 * ==================================================
 * ATTENTION ROW
 * ==================================================
 */

function AttentionRow({
    icon: Icon,
    title,
    value,
    to,
    danger = false,
}) {

    return (

        <Link
            to={to}
            className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] p-3 transition-colors hover:bg-[var(--bms-surface-soft)]"
        >

            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${danger
                        ? "bg-red-500/10 text-red-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
            >

                <Icon
                    size={17}
                />

            </div>


            <span className="flex-1 text-sm text-[var(--bms-text-secondary)]">

                {title}

            </span>


            <span
                className={`text-sm font-bold ${danger
                        ? "text-red-500"
                        : "text-[var(--bms-text)]"
                    }`}
            >

                {formatNumber(
                    value
                )}

            </span>

        </Link>

    );
}


/*
 * ==================================================
 * DEADLINE ROW
 * ==================================================
 */

function DeadlineRow({
    type,
    title,
    parent,
    date,
    status,
}) {

    return (

        <div className="flex items-center gap-3 rounded-lg border border-[var(--bms-border)] p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                <CalendarClock
                    size={17}
                />

            </div>


            <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">

                        {type}

                    </span>

                </div>


                <p className="mt-1 truncate text-sm font-medium text-[var(--bms-text)]">

                    {title}

                </p>


                <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">

                    {parent ||
                        "No project"}

                </p>

            </div>


            <div className="shrink-0 text-right">

                <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClass(
                        status
                    )}`}
                >

                    {formatStatus(
                        status
                    )}

                </span>


                <p className="mt-1 text-[10px] text-[var(--bms-text-muted)]">

                    {formatShortDate(
                        date
                    )}

                </p>

            </div>

        </div>

    );
}


/*
 * ==================================================
 * WORKLOAD SEGMENT
 * ==================================================
 */

function WorkloadSegment({
    value,
    total,
}) {

    const width =
        Number(total) > 0
            ? Math.min(
                100,
                (
                    Number(value || 0) /
                    Number(total)
                ) *
                100
            )
            : 0;


    return (

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">

            <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{
                    width:
                        `${width}%`,
                }}
            />

        </div>

    );
}


/*
 * ==================================================
 * EMPTY STATE
 * ==================================================
 */

function EmptyState({
    icon: Icon,
    title,
    description,
}) {

    return (

        <div className="py-8 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

                <Icon
                    size={18}
                />

            </div>


            <p className="mt-3 text-sm font-medium text-[var(--bms-text)]">

                {title}

            </p>


            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                {description}

            </p>

        </div>

    );
}


/*
 * ==================================================
 * LIST SKELETON
 * ==================================================
 */

function ListSkeleton({
    count = 4,
}) {

    return (

        <div className="space-y-4">

            {Array.from(
                {
                    length:
                        count,
                }
            ).map(
                (
                    _,
                    index
                ) => (

                    <div
                        key={
                            index
                        }
                        className="animate-pulse"
                    >

                        <div className="h-3 w-3/4 rounded bg-[var(--bms-surface-soft)]" />

                        <div className="mt-2 h-2 w-full rounded bg-[var(--bms-surface-soft)]" />

                    </div>

                )
            )}

        </div>

    );
}


/*
 * ==================================================
 * ACTIVITY SKELETON
 * ==================================================
 */

function DashboardActivitySkeleton() {

    return (

        <div>

            {[
                1,
                2,
                3,
                4,
                5,
            ].map(
                (item) => (

                    <div
                        key={
                            item
                        }
                        className="flex items-center gap-4 border-b border-[var(--bms-border)]/70 py-4"
                    >

                        <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--bms-surface-soft)]" />


                        <div className="flex-1">

                            <div className="h-3 w-44 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                            <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                        </div>

                    </div>

                )
            )}

        </div>

    );
}


/*
 * ==================================================
 * SYSTEM ACTIVITY CHART
 * ==================================================
 */

function SystemActivityChart({
    weeklyActivity,
    isLoading,
}) {

    const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
    ];


    if (isLoading) {

        return (

            <div className="mt-6">

                <div className="h-48 animate-pulse rounded-lg bg-[var(--bms-surface-soft)]" />

            </div>

        );

    }


    const values =
        days.map(
            (day) =>
                Number(
                    weeklyActivity?.[
                    day
                    ] ||
                    0
                )
        );


    const max =
        Math.max(
            ...values,
            1
        );


    const width =
        500;


    const height =
        180;


    const bottom =
        160;


    const top =
        20;


    const points =
        values.map(
            (
                value,
                index
            ) => {

                const x =
                    index *
                    (
                        width /
                        (
                            values.length -
                            1
                        )
                    );


                const y =
                    bottom -
                    (
                        value /
                        max
                    ) *
                    (
                        bottom -
                        top
                    );


                return {
                    x,
                    y,
                };

            }
        );


    const linePath =
        points
            .map(
                (
                    point,
                    index
                ) =>
                    `${index === 0
                        ? "M"
                        : "L"
                    }${point.x} ${point.y}`
            )
            .join(" ");


    const areaPath =
        `${linePath} L${width} ${bottom} L0 ${bottom} Z`;


    return (

        <div className="mt-6">

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-48 w-full"
                preserveAspectRatio="none"
                role="img"
                aria-label="System activity for the last seven days"
            >

                <defs>

                    <linearGradient
                        id="dashboardActivityGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >

                        <stop
                            offset="0%"
                            stopColor="#2563eb"
                            stopOpacity="0.35"
                        />


                        <stop
                            offset="100%"
                            stopColor="#2563eb"
                            stopOpacity="0"
                        />

                    </linearGradient>

                </defs>


                <path
                    d={
                        areaPath
                    }
                    fill="url(#dashboardActivityGradient)"
                />


                <path
                    d={
                        linePath
                    }
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />


                {points.map(
                    (
                        point,
                        index
                    ) => (

                        <circle
                            key={
                                days[index]
                            }
                            cx={
                                point.x
                            }
                            cy={
                                point.y
                            }
                            r="4"
                            fill="#3b82f6"
                        />

                    )
                )}

            </svg>


            <div className="mt-2 flex justify-between text-xs text-[var(--bms-text-muted)]">

                {days.map(
                    (day) => (

                        <span
                            key={
                                day
                            }
                        >
                            {day}
                        </span>

                    )
                )}

            </div>

        </div>

    );
}


export default Dashboard;