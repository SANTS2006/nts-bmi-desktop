import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const quickLinks = [
  {
    label: "Communication",
    description: "Connect with colleagues and teams.",
    path: "/communication",
    permission: "communication.read",
    icon: MessageSquare,
  },
  {
    label: "Projects",
    description: "View projects and delivery work.",
    path: "/projects",
    permission: "projects.read",
    icon: FolderKanban,
  },
  {
    label: "Employees",
    description: "Browse employee and team information.",
    path: "/employees",
    permission: "employees.read",
    icon: UsersRound,
  },
  {
    label: "Attendance",
    description: "Review your available attendance tools.",
    path: "/attendance",
    permission: "attendance.read",
    icon: CalendarCheck,
  },
];

function formatRole(role) {
  return String(role || "Staff")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Home() {
  const { user, activeRoleName, canAccess } = useAuth();
  const firstName = user?.firstName || "there";
  const visibleLinks = quickLinks.filter((item) => canAccess({ permission: item.permission }));

  return (
    <div className="mx-auto w-full max-w-7xl">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-6 shadow-sm sm:p-8 lg:p-10"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500"
            >
              <Sparkles size={14} />
              NTS Digital Solutions
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.45 }}
              className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[var(--bms-text)] sm:text-4xl lg:text-5xl"
            >
              Welcome back, {firstName}.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="mt-4 max-w-2xl text-sm leading-7 text-[var(--bms-text-secondary)] sm:text-base"
            >
              Welcome to the NTS Business Management System. Use this workspace to stay connected, manage your work, and access the tools available to you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.45 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/notifications"
                className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]"
              >
                <Bell size={17} />
                View notifications
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/profile"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-5 text-sm font-semibold text-[var(--bms-text)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--bms-surface)] active:scale-[0.98]"
              >
                My profile
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600/10 text-blue-500">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold">
                    {(user?.firstName?.[0] || "N") + (user?.lastName?.[0] || "T")}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[var(--bms-text)]">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "NTS User"}
                </p>
                <p className="truncate text-xs text-[var(--bms-text-muted)]">{user?.email || ""}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-[var(--bms-text-secondary)]">
                <ShieldCheck size={16} className="text-emerald-500" />
                Current role
              </div>
              <span className="text-xs font-bold text-[var(--bms-text)]">{formatRole(activeRoleName)}</span>
            </div>

            <div className="mt-4 flex items-start gap-3 text-xs leading-5 text-[var(--bms-text-muted)]">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              Your workspace automatically shows the areas and actions available to your current role.
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--bms-text)]">Your workspace</h2>
            <p className="mt-1 text-sm text-[var(--bms-text-muted)]">Quick access to the areas available to you.</p>
          </div>
        </div>

        {visibleLinks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.06, duration: 0.35 }}
                >
                  <Link
                    to={item.path}
                    className="group block h-full rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 transition-transform duration-300 group-hover:scale-105">
                        <Icon size={21} />
                      </div>
                      <ChevronRight size={18} className="mt-1 text-[var(--bms-text-muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
                    </div>
                    <h3 className="mt-5 text-sm font-bold text-[var(--bms-text)]">{item.label}</h3>
                    <p className="mt-2 text-xs leading-5 text-[var(--bms-text-muted)]">{item.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-8 text-center">
            <p className="text-sm font-medium text-[var(--bms-text)]">No additional modules are available.</p>
            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">Contact an administrator if you need access to another area.</p>
          </div>
        )}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-8 rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--bms-text)]">Need help?</h2>
            <p className="mt-1 text-sm text-[var(--bms-text-muted)]">Visit the Help Center for guidance on using the NTS-BMS platform.</p>
          </div>
          <Link
            to="/help"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 text-sm font-semibold text-[var(--bms-text)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--bms-surface)]"
          >
            Help Center
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
