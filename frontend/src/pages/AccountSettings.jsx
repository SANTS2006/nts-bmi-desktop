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
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  isDesktopApp,
  getCurrentAppVersion,
  checkForAppUpdate,
  downloadAndInstallUpdate,
} from "../services/updater";

function AccountSettings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [appVersion, setAppVersion] = useState(null);
  const [update, setUpdate] = useState(null);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateError, setUpdateError] = useState("");

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

  useEffect(() => {
    let mounted = true;

    async function loadAppVersion() {
      if (!isDesktopApp()) {
        return;
      }

      const version = await getCurrentAppVersion();

      if (mounted) {
        setAppVersion(version);
      }
    }

    loadAppVersion();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCheckForUpdate() {
    setCheckingForUpdate(true);
    setUpdateError("");
    setUpdate(null);

    try {
      const result = await checkForAppUpdate();

      if (result.available) {
        setUpdate(result.update);
        setUpdateStatus("Update available");
      } else {
        setUpdateStatus("You're using the latest version.");
      }
    } catch (error) {
      console.error("Unable to check for updates:", error);

      setUpdateError(
        "We couldn't check for updates right now. Please try again later."
      );

      setUpdateStatus("");
    } finally {
      setCheckingForUpdate(false);
    }
  }

  async function handleInstallUpdate() {
    if (!update) {
      return;
    }

    setInstallingUpdate(true);
    setUpdateError("");
    setUpdateStatus("Preparing update...");
    setUpdateProgress(0);

    try {
      await downloadAndInstallUpdate(update, (progress) => {
        setUpdateProgress(progress.percentage || 0);

        if (progress.status === "downloading") {
          setUpdateStatus("Downloading update...");
        }

        if (progress.status === "finished") {
          setUpdateStatus("Download complete.");
        }

        if (progress.status === "installing") {
          setUpdateStatus("Installing update...");
        }
      });
    } catch (error) {
      console.error("Unable to install update:", error);

      setUpdateError(
        "The update could not be installed. Please try again later."
      );

      setInstallingUpdate(false);
    }
  }

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
          UPDATE CENTER
      ================================================== */}

      {isDesktopApp() && (
        <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-sm transition-colors duration-300 sm:p-6">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <PackageCheck
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--bms-text)]">
                Update Center
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--bms-text-secondary)]">
                Keep NTS BMI up to date with the latest features,
                improvements, and security updates.
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-[var(--bms-text)]">
                  Current version
                </p>

                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                  NTS BMI Desktop{" "}
                  <span className="font-medium text-[var(--bms-text)]">
                    {appVersion ? `v${appVersion}` : "Loading..."}
                  </span>
                </p>

              </div>

              <button
                type="button"
                onClick={handleCheckForUpdate}
                disabled={checkingForUpdate || installingUpdate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text)] transition-all duration-300 hover:border-blue-500/50 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <RefreshCw
                  size={16}
                  className={
                    checkingForUpdate
                      ? "animate-spin"
                      : ""
                  }
                />

                {checkingForUpdate
                  ? "Checking..."
                  : "Check for Updates"}

              </button>

            </div>

            {/* ==================================================
                UPDATE AVAILABLE
                ================================================== */}

            {update && (
              <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Download size={17} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-[var(--bms-text)]">
                      Update available
                    </p>

                    <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                      NTS BMI v{update.version} is available.
                    </p>

                    {update.body && (
                      <div className="mt-3 whitespace-pre-line text-xs leading-5 text-[var(--bms-text-muted)]">
                        {update.body}
                      </div>
                    )}

                  </div>

                </div>

                {!installingUpdate && (
                  <button
                    type="button"
                    onClick={handleInstallUpdate}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <Download size={16} />
                    Install Update
                  </button>
                )}

                {installingUpdate && (
                  <div className="mt-5">

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-[var(--bms-text-secondary)]">
                        {updateStatus || "Updating..."}
                      </span>

                      <span className="font-semibold text-[var(--bms-text)]">
                        {updateProgress}%
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bms-border)]">

                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${updateProgress}%`,
                        }}
                      />

                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                SUCCESS
                ================================================== */}

            {!update &&
              updateStatus ===
              "You're using the latest version." && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-500"
                  />

                  <div>

                    <p className="text-sm font-semibold text-[var(--bms-text)]">
                      You're up to date
                    </p>

                    <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
                      You are running the latest available version of NTS BMI.
                    </p>

                  </div>

                </div>
              )}

            {/* ==================================================
                ERROR
                ================================================== */}

            {updateError && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p className="text-xs leading-5 text-red-500">
                  {updateError}
                </p>

              </div>
            )}

            {/* ==================================================
                STATUS
                ================================================== */}

            {!update &&
              updateStatus &&
              updateStatus !==
              "You're using the latest version." &&
              !updateError && (
                <p className="mt-4 text-xs text-[var(--bms-text-muted)]">
                  {updateStatus}
                </p>
              )}

          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--bms-text-muted)]">
            Updates are digitally signed to help ensure that only
            authorized NTS BMI releases can be installed.
          </p>

        </section>
      )}

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