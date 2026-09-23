import {
  Settings,
  Palette,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  User,
  Mail,
  Check,
  ChevronRight,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function AccountSettings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const formattedStatus = user?.status
    ? user.status.charAt(0) +
      user.status.slice(1).toLowerCase()
    : "Unknown";

  return (
    <div className="mx-auto w-full space-y-6">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <section>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Settings
              size={21}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-3xl">
              Account Settings
            </h1>

            <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
              Manage your account preferences and application settings.
            </p>
          </div>

        </div>
      </section>

      {/* ==================================================
          APPEARANCE
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm transition-colors duration-300 sm:p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <Palette
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--bms-text)]">
              Appearance
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
              Customize how the NTS Business Management System looks on your device.
            </p>
          </div>

        </div>

        <div className="mt-6 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 transition-colors duration-300">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bms-surface)] text-[var(--bms-text-secondary)]">
                {theme === "dark" ? (
                  <Moon
                    size={19}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Sun
                    size={19}
                    strokeWidth={1.8}
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--bms-text)]">
                  Theme
                </p>

                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                  Currently using {theme === "dark" ? "dark" : "light"} mode.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text)] transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/5 active:scale-[0.98]"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <>
                  <Sun size={17} />
                  Light mode
                </>
              ) : (
                <>
                  <Moon size={17} />
                  Dark mode
                </>
              )}
            </button>

          </div>

        </div>

      </section>

      {/* ==================================================
          NOTIFICATION PREFERENCES
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm transition-colors duration-300 sm:p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Bell
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--bms-text)]">
              Notification Preferences
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
              Control how you receive notifications from the system.
            </p>
          </div>

        </div>

        <div className="mt-6 divide-y divide-[var(--bms-border)] rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)]">

          <SettingRow
            icon={Mail}
            title="Email notifications"
            description="Receive important system updates by email."
          />

          <SettingRow
            icon={Bell}
            title="System notifications"
            description="Receive notifications inside the NTS BMS application."
          />

          <SettingRow
            icon={ShieldCheck}
            title="Security notifications"
            description="Receive alerts about important security events."
            enabled
          />

        </div>

        <p className="mt-4 text-xs text-[var(--bms-text-muted)]">
          Notification preferences will be persisted to your account when the notification preferences API is implemented.
        </p>

      </section>

      {/* ==================================================
          ACCOUNT INFORMATION
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm transition-colors duration-300 sm:p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <User
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--bms-text)]">
              Account Information
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
              Basic information associated with your NTS BMS account.
            </p>
          </div>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <InfoItem
            label="Full name"
            value={fullName || "Not available"}
          />

          <InfoItem
            label="Email address"
            value={user?.email || "Not available"}
          />

          <InfoItem
            label="Account status"
            value={formattedStatus}
          />

          <InfoItem
            label="Account ID"
            value={user?.id || "Not available"}
            truncate
          />

        </div>

      </section>

      {/* ==================================================
          SECURITY
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm transition-colors duration-300 sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <ShieldCheck
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--bms-text)]">
                Security
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
                Manage your password, sessions, and account security.
              </p>
            </div>

          </div>

          <a
            href="/security"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text)] transition-all duration-300 hover:border-blue-500/50 hover:text-blue-500"
          >
            Security settings
            <ChevronRight size={16} />
          </a>

        </div>

      </section>

    </div>
  );
}

/*
 * ==================================================
 * SETTING ROW
 * ==================================================
 */

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bms-surface)] text-[var(--bms-text-muted)]">
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">

          <p className="text-sm font-medium text-[var(--bms-text)]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--bms-text-muted)]">
            {description}
          </p>

        </div>

      </div>

      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          enabled
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-[var(--bms-surface)] text-[var(--bms-text-muted)]"
        }`}
        aria-label={
          enabled
            ? "Enabled"
            : "Not configured"
        }
      >
        {enabled && (
          <Check size={14} />
        )}
      </div>

    </div>
  );
}

/*
 * ==================================================
 * INFORMATION ITEM
 * ==================================================
 */

function InfoItem({
  label,
  value,
  truncate = false,
}) {
  return (
    <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4 transition-colors duration-300">

      <p className="text-xs font-medium text-[var(--bms-text-muted)]">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-semibold text-[var(--bms-text)] ${
          truncate
            ? "truncate"
            : "break-words"
        }`}
        title={truncate ? value : undefined}
      >
        {value}
      </p>

    </div>
  );
}

export default AccountSettings;