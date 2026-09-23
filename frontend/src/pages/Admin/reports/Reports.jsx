import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  AlertTriangle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  exportReportCsv,
  getActivityReport,
  getAuditReport,
  getFinancialReport,
  getOverviewReport,
  getProjectsReport,
  getWorkforceReport,
} from "../../../api/reports.js";

import MiniBarChart from "../../../components/reports/MiniBarChart.jsx";
import ReportDonutChart from "../../../components/reports/ReportDonutChart.jsx";

const today = new Date();

const monthAgo = new Date(today);
monthAgo.setDate(monthAgo.getDate() - 30);

const iso = date =>
  date.toISOString().slice(0, 10);

const money = value =>
  `SLE ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const number = value =>
  Number(value || 0).toLocaleString();

const normalizeReport = response =>
  response?.data ?? response ?? null;

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  trendType = "neutral",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--bms-text-muted)]">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-bold text-[var(--bms-text)]">
            {value}
          </p>

          {hint && (
            <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">
              {hint}
            </p>
          )}

          {trend !== undefined && trend !== null && (
            <div
              className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold ${trendType === "negative"
                  ? "text-red-500"
                  : trendType === "positive"
                    ? "text-emerald-500"
                    : "text-[var(--bms-text-muted)]"
                }`}
            >
              {trendType === "negative" ? (
                <TrendingDown size={12} />
              ) : (
                <TrendingUp size={12} />
              )}

              {trend}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

function Panel({
  title,
  description,
  icon: Icon,
  children,
  action,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon
              size={18}
              className="text-blue-500"
            />

            <h2 className="text-sm font-semibold text-[var(--bms-text)]">
              {title}
            </h2>
          </div>

          {description && (
            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </motion.section>
  );
}

function EmptyState({
  message = "No data available for this period.",
}) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[var(--bms-border)] px-4 text-center text-sm text-[var(--bms-text-muted)]">
      {message}
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.min(100, (Number(value || 0) / total) * 100)
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs capitalize text-[var(--bms-text-secondary)]">
          {label.replaceAll("_", " ").toLowerCase()}
        </span>

        <span className="text-xs font-semibold text-[var(--bms-text)]">
          {number(value)}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--bms-surface-soft)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-blue-500"
        />
      </div>
    </div>
  );
}

export default function Reports() {
  const [range, setRange] = useState({
    from: iso(monthAgo),
    to: iso(today),
  });

  const [overview, setOverview] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [workforce, setWorkforce] = useState(null);
  const [projects, setProjects] = useState(null);
  const [activity, setActivity] = useState(null);
  const [audit, setAudit] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  const load = useCallback(async () => {
    if (!range.from || !range.to) {
      setError("Please select both report dates.");
      return;
    }

    if (range.from > range.to) {
      setError("The start date cannot be after the end date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        from: range.from,
        to: range.to,
      };

      const [
        overviewResponse,
        financialResponse,
        workforceResponse,
        projectsResponse,
        activityResponse,
        auditResponse,
      ] = await Promise.all([
        getOverviewReport(params),
        getFinancialReport(params),
        getWorkforceReport(params),
        getProjectsReport(params),
        getActivityReport(params),
        getAuditReport(params),
      ]);

      setOverview(normalizeReport(overviewResponse));
      setFinancial(normalizeReport(financialResponse));
      setWorkforce(normalizeReport(workforceResponse));
      setProjects(normalizeReport(projectsResponse));
      setActivity(normalizeReport(activityResponse));
      setAudit(normalizeReport(auditResponse));
    } catch (err) {
      setError(
        err?.message ||
        "Unable to load reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const attendance =
    overview?.attendance?.byStatus || {};

  const leave =
    overview?.leave?.byStatus || {};

  const projectStatus =
    projects?.byStatus ||
    projects?.statusBreakdown ||
    overview?.delivery?.byStatus ||
    {};

  const invoiceStatus =
    financial?.invoiceStatus ||
    financial?.invoicesByStatus ||
    {};

  const exportRows = useMemo(
    () => ({
      workforce: workforce?.rows || [],
      projects: projects?.rows || [],
      activity: activity?.rows || [],
      audit: audit?.rows || [],
    }),
    [
      workforce,
      projects,
      activity,
      audit,
    ]
  );

  async function download(report, rows) {
    if (!rows?.length) {
      setError(`There is no ${report} data to export.`);
      return;
    }

    setExporting(report);
    setError("");

    try {
      const result = await exportReportCsv({
        report,
        rows,
        from: range.from,
        to: range.to,
      });

      const csv =
        typeof result === "string"
          ? result
          : result?.data || "";

      if (!csv) {
        throw new Error(
          "The server returned an empty CSV file."
        );
      }

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8",
      });

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        `nts-bms-${report}-${range.from}-${range.to}.csv`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.message ||
        `Unable to export ${report}.`
      );
    } finally {
      setExporting("");
    }
  }

  const attendanceTotal = Object.values(
    attendance
  ).reduce(
    (sum, value) =>
      sum + Number(value || 0),
    0
  );

  const leaveTotal = Object.values(
    leave
  ).reduce(
    (sum, value) =>
      sum + Number(value || 0),
    0
  );

  const projectTotal = Object.values(
    projectStatus
  ).reduce(
    (sum, value) =>
      sum + Number(value || 0),
    0
  );

  const invoiceTotal = Object.values(
    invoiceStatus
  ).reduce(
    (sum, value) =>
      sum + Number(value || 0),
    0
  );

  return (
    <main
      className="min-h-full scroll-smooth bg-[var(--bms-background)] px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <motion.header
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-500">
              Reports & Analysis
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[var(--bms-text)] sm:text-3xl">
              Company intelligence at a glance
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-[var(--bms-text-secondary)]">
              Analyze workforce, delivery, finance,
              attendance, leave and system activity
              from one controlled reporting workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-2">
            <CalendarDays
              size={16}
              className="ml-1 text-[var(--bms-text-muted)]"
            />

            <input
              aria-label="Report start date"
              type="date"
              value={range.from}
              onChange={event =>
                setRange(value => ({
                  ...value,
                  from: event.target.value,
                }))
              }
              className="rounded-lg border border-[var(--bms-border)] bg-transparent px-2 py-1.5 text-xs text-[var(--bms-text)] outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <span className="text-xs text-[var(--bms-text-muted)]">
              to
            </span>

            <input
              aria-label="Report end date"
              type="date"
              value={range.to}
              onChange={event =>
                setRange(value => ({
                  ...value,
                  to: event.target.value,
                }))
              }
              className="rounded-lg border border-[var(--bms-border)] bg-transparent px-2 py-1.5 text-xs text-[var(--bms-text)] outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {loading
                ? "Loading…"
                : "Refresh"}
            </button>
          </div>
        </motion.header>

        {/* ERROR */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Report loading error
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING */}
        {loading && !overview ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]"
              />
            ))}
          </div>
        ) : overview ? (
          <>
            {/* KPI ROW 1 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                icon={Users}
                label="Employees"
                value={number(
                  overview?.workforce?.employees
                )}
              />

              <Stat
                icon={BriefcaseBusiness}
                label="Projects"
                value={number(
                  overview?.delivery?.projects
                )}
              />

              <Stat
                icon={WalletCards}
                label="Revenue"
                value={money(
                  overview?.finance?.revenue
                )}
              />

              <Stat
                icon={TrendingUp}
                label="Net Position"
                value={money(
                  overview?.finance?.net
                )}
              />
            </div>

            {/* KPI ROW 2 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                icon={FileText}
                label="Invoice Value"
                value={money(
                  overview?.finance?.invoiceValue
                )}
              />

              <Stat
                icon={WalletCards}
                label="Outstanding"
                value={money(
                  overview?.finance?.outstanding
                )}
              />

              <Stat
                icon={CalendarDays}
                label="Leave Days"
                value={number(
                  overview?.leave?.days
                )}
              />

              <Stat
                icon={ShieldCheck}
                label="Audit Events"
                value={number(
                  activity?.auditLogs ??
                  audit?.total ??
                  0
                )}
              />
            </div>

            {/* FINANCIAL TRENDS */}
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel
                title="Revenue trend"
                description="Income recorded during the selected period."
                icon={TrendingUp}
              >
                <MiniBarChart
                  data={
                    financial?.monthlyIncome ||
                    financial?.incomeTrend ||
                    []
                  }
                />
              </Panel>

              <Panel
                title="Expense trend"
                description="Expenses recorded during the selected period."
                icon={TrendingDown}
              >
                <MiniBarChart
                  data={
                    financial?.monthlyExpenses ||
                    financial?.expenseTrend ||
                    []
                  }
                />
              </Panel>
            </div>

            {/* DISTRIBUTIONS */}
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel
                title="Attendance distribution"
                description="Attendance records grouped by status."
                icon={CalendarDays}
              >
                <ReportDonutChart
                  data={attendance}
                  title="records"
                />
              </Panel>

              <Panel
                title="Leave distribution"
                description="Leave requests grouped by status."
                icon={CalendarDays}
              >
                <ReportDonutChart
                  data={leave}
                  title="requests"
                />
              </Panel>
            </div>

            {/* ATTENDANCE / LEAVE / ACTIVITY */}
            <div className="grid gap-5 lg:grid-cols-3">
              <Panel
                title="Attendance status"
                icon={CalendarDays}
              >
                {attendanceTotal === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      attendance
                    ).map(([key, value]) => (
                      <StatusBar
                        key={key}
                        label={key}
                        value={value}
                        total={attendanceTotal}
                      />
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="Leave requests"
                icon={CalendarDays}
              >
                {leaveTotal === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      leave
                    ).map(([key, value]) => (
                      <StatusBar
                        key={key}
                        label={key}
                        value={value}
                        total={leaveTotal}
                      />
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="System activity"
                icon={Activity}
              >
                {!activity ||
                  !Object.keys(activity).length ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-3">
                    {Object.entries(
                      activity
                    )
                      .filter(
                        ([key]) =>
                          key !== "period" &&
                          typeof activity[key] !==
                          "object"
                      )
                      .map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-3 border-b border-[var(--bms-border)] pb-3 last:border-0 last:pb-0"
                          >
                            <span className="capitalize text-xs text-[var(--bms-text-secondary)]">
                              {key.replaceAll(
                                "_",
                                " "
                              )}
                            </span>

                            <span className="text-sm font-semibold text-[var(--bms-text)]">
                              {number(value)}
                            </span>
                          </div>
                        )
                      )}
                  </div>
                )}
              </Panel>
            </div>

            {/* PROJECT ANALYTICS */}
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel
                title="Project status"
                description="Current distribution of projects."
                icon={BriefcaseBusiness}
              >
                <ReportDonutChart
                  data={projectStatus}
                  title="projects"
                />
              </Panel>

              <Panel
                title="Invoice status"
                description="Invoice distribution by current status."
                icon={FileText}
              >
                <ReportDonutChart
                  data={invoiceStatus}
                  title="invoices"
                />
              </Panel>
            </div>

            {/* PROJECT TABLE */}
            <Panel
              title="Project delivery"
              description="Project execution and task performance."
              icon={BriefcaseBusiness}
              action={
                <button
                  type="button"
                  onClick={() =>
                    download(
                      "projects",
                      exportRows.projects
                    )
                  }
                  disabled={
                    exporting === "projects" ||
                    !exportRows.projects.length
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-semibold text-[var(--bms-text)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={14} />

                  {exporting === "projects"
                    ? "Exporting…"
                    : "Export CSV"}
                </button>
              }
            >
              {exportRows.projects.length === 0 ? (
                <EmptyState message="No project data available for this period." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--bms-border)] text-[var(--bms-text-muted)]">
                        <th className="px-3 py-3">
                          Project
                        </th>

                        <th className="px-3 py-3">
                          Status
                        </th>

                        <th className="px-3 py-3">
                          Tasks
                        </th>

                        <th className="px-3 py-3">
                          Completed
                        </th>

                        <th className="px-3 py-3">
                          Open issues
                        </th>

                        <th className="px-3 py-3">
                          Budget
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {exportRows.projects.map(
                        row => (
                          <tr
                            key={row.id}
                            className="border-b border-[var(--bms-border)] transition-colors hover:bg-[var(--bms-surface-soft)] last:border-0"
                          >
                            <td className="px-3 py-3 font-medium text-[var(--bms-text)]">
                              {row.name ||
                                "Unnamed project"}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {row.status ||
                                "—"}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {number(
                                row.tasks
                              )}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {number(
                                row.completedTasks
                              )}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {number(
                                row.openIssues
                              )}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {row.budget ==
                                null
                                ? "—"
                                : money(
                                  row.budget
                                )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {/* WORKFORCE */}
            <Panel
              title="Workforce analysis"
              description="Employee-level attendance and leave performance."
              icon={Users}
              action={
                <button
                  type="button"
                  onClick={() =>
                    download(
                      "workforce",
                      exportRows.workforce
                    )
                  }
                  disabled={
                    exporting === "workforce" ||
                    !exportRows.workforce.length
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-semibold text-[var(--bms-text)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={14} />

                  {exporting === "workforce"
                    ? "Exporting…"
                    : "Export CSV"}
                </button>
              }
            >
              {exportRows.workforce.length ===
                0 ? (
                <EmptyState message="No workforce data available for this period." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--bms-border)] text-[var(--bms-text-muted)]">
                        <th className="px-3 py-3">
                          Employee
                        </th>

                        <th className="px-3 py-3">
                          Job title
                        </th>

                        <th className="px-3 py-3">
                          Attendance
                        </th>

                        <th className="px-3 py-3">
                          Present
                        </th>

                        <th className="px-3 py-3">
                          Late
                        </th>

                        <th className="px-3 py-3">
                          Absent
                        </th>

                        <th className="px-3 py-3">
                          Leave days
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {exportRows.workforce.map(
                        row => (
                          <tr
                            key={
                              row.employeeId
                            }
                            className="border-b border-[var(--bms-border)] transition-colors hover:bg-[var(--bms-surface-soft)] last:border-0"
                          >
                            <td className="px-3 py-3 font-medium text-[var(--bms-text)]">
                              {row.name ||
                                row.employeeNumber ||
                                "Unknown employee"}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {row.jobTitle ||
                                "—"}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {number(
                                row.attendance
                              )}
                            </td>

                            <td className="px-3 py-3 font-medium text-emerald-500">
                              {number(
                                row.present
                              )}
                            </td>

                            <td className="px-3 py-3 text-amber-500">
                              {number(
                                row.late
                              )}
                            </td>

                            <td className="px-3 py-3 text-red-500">
                              {number(
                                row.absent
                              )}
                            </td>

                            <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                              {number(
                                row.leaveDays
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {/* PERFORMANCE SUMMARY */}
            <div className="grid gap-5 md:grid-cols-3">
              <Panel
                title="Attendance rate"
                icon={CheckCircle2}
              >
                <div className="flex items-center justify-center py-5">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--bms-text)]">
                      {attendanceTotal
                        ? `${(
                          ((attendance.PRESENT ||
                            0) /
                            attendanceTotal) *
                          100
                        ).toFixed(1)}%`
                        : "0%"}
                    </p>

                    <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                      Present records
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel
                title="Leave approval rate"
                icon={CalendarDays}
              >
                <div className="flex items-center justify-center py-5">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--bms-text)]">
                      {leaveTotal
                        ? `${(
                          ((leave.APPROVED ||
                            0) /
                            leaveTotal) *
                          100
                        ).toFixed(1)}%`
                        : "0%"}
                    </p>

                    <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                      Approved requests
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel
                title="Project completion"
                icon={CheckCircle2}
              >
                <div className="flex items-center justify-center py-5">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--bms-text)]">
                      {projectTotal
                        ? `${(
                          ((projectStatus.COMPLETED ||
                            0) /
                            projectTotal) *
                          100
                        ).toFixed(1)}%`
                        : "0%"}
                    </p>

                    <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                      Completed projects
                    </p>
                  </div>
                </div>
              </Panel>
            </div>

            {/* AUDIT */}
            {audit && (
              <Panel
                title="Audit activity"
                description="System activity and security events during the selected period."
                icon={ShieldCheck}
                action={
                  <button
                    type="button"
                    onClick={() =>
                      download(
                        "audit",
                        exportRows.audit
                      )
                    }
                    disabled={
                      exporting === "audit" ||
                      !exportRows.audit.length
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--bms-border)] px-3 py-2 text-xs font-semibold text-[var(--bms-text)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={14} />

                    {exporting === "audit"
                      ? "Exporting…"
                      : "Export CSV"}
                  </button>
                }
              >
                {exportRows.audit.length ===
                  0 ? (
                  <EmptyState message="No audit records available for this period." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-[var(--bms-border)] text-[var(--bms-text-muted)]">
                          <th className="px-3 py-3">
                            Action
                          </th>

                          <th className="px-3 py-3">
                            Result
                          </th>

                          <th className="px-3 py-3">
                            Target
                          </th>

                          <th className="px-3 py-3">
                            Description
                          </th>

                          <th className="px-3 py-3">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {exportRows.audit.map(
                          row => (
                            <tr
                              key={
                                row.id ||
                                `${row.action}-${row.createdAt}`
                              }
                              className="border-b border-[var(--bms-border)] hover:bg-[var(--bms-surface-soft)] last:border-0"
                            >
                              <td className="px-3 py-3 font-medium text-[var(--bms-text)]">
                                {row.action ||
                                  "—"}
                              </td>

                              <td className="px-3 py-3">
                                <span
                                  className={
                                    row.result ===
                                      "SUCCESS"
                                      ? "font-semibold text-emerald-500"
                                      : "font-semibold text-red-500"
                                  }
                                >
                                  {row.result ||
                                    "—"}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-[var(--bms-text-secondary)]">
                                {row.targetType ||
                                  row.target ||
                                  "—"}
                              </td>

                              <td className="max-w-[280px] truncate px-3 py-3 text-[var(--bms-text-secondary)]">
                                {row.description ||
                                  "—"}
                              </td>

                              <td className="whitespace-nowrap px-3 py-3 text-[var(--bms-text-muted)]">
                                {row.createdAt
                                  ? new Date(
                                    row.createdAt
                                  ).toLocaleString()
                                  : "—"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}
          </>
        ) : (
          <EmptyState message="No report data is available for the selected period." />
        )}
      </div>
    </main>
  );
}