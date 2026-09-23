import {
  UserPlus,
  ClipboardCheck,
  ShieldAlert,
  Settings,
  Check,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function NotificationItem({
  notification,
  compact = false,
  onClick,
}) {

  if (!notification) {
    return null;
  }


  const {
    type,
    title,
    message,
    read,
    createdAt,
  } = notification;


  /*
   * ==================================================
   * NORMALIZE NOTIFICATION TYPE
   * ==================================================
   */

  const normalizedType =
    String(type || "INFO")
      .toUpperCase();


  /*
   * ==================================================
   * ICONS
   * ==================================================
   */

  const notificationIcons = {

    INFO: Info,

    SUCCESS: Check,

    WARNING: AlertTriangle,

    ERROR: XCircle,

    SECURITY: ShieldAlert,

    APPROVAL: ClipboardCheck,

    SYSTEM: Settings,

    USER: UserPlus,

  };


  const Icon =
    notificationIcons[
      normalizedType
    ] || Info;


  /*
   * ==================================================
   * ICON STYLES
   * ==================================================
   */

  const iconStyles = {

    INFO:
      "bg-blue-500/10 text-blue-500",

    SUCCESS:
      "bg-emerald-500/10 text-emerald-500",

    WARNING:
      "bg-amber-500/10 text-amber-500",

    ERROR:
      "bg-red-500/10 text-red-500",

    SECURITY:
      "bg-red-500/10 text-red-500",

    APPROVAL:
      "bg-emerald-500/10 text-emerald-500",

    SYSTEM:
      "bg-purple-500/10 text-purple-500",

    USER:
      "bg-blue-500/10 text-blue-500",

  };


  const iconClass =
    iconStyles[
      normalizedType
    ] ||
    "bg-slate-500/10 text-slate-500";


  /*
   * ==================================================
   * FORMAT DATE
   * ==================================================
   */

  const formattedTime =
    createdAt
      ? new Date(
          createdAt
        ).toLocaleString([], {
          dateStyle:
            "medium",
          timeStyle:
            "short",
        })
      : "Unknown time";


  /*
   * ==================================================
   * CLICK HANDLER
   * ==================================================
   */

  const handleClick =
    () => {

      if (
        typeof onClick ===
        "function"
      ) {

        onClick(
          notification
        );

      }

    };


  return (

    <button
      type="button"
      onClick={handleClick}
      className={`group flex w-full gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
        read

          ? "border-transparent bg-transparent hover:border-[var(--bms-border)] hover:bg-[var(--bms-surface-soft)]"

          : "border-blue-500/10 bg-blue-500/[0.04] hover:border-blue-500/20 hover:bg-blue-500/[0.07]"
      }`}
    >

      {/* ==================================================
          ICON
      ================================================== */}

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >

        <Icon
          size={18}
          strokeWidth={1.8}
        />

      </div>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-2">

            {!read && (

              <span
                className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
                aria-label="Unread notification"
              />

            )}


            <h3
              className={`truncate text-sm ${
                read
                  ? "font-medium text-[var(--bms-text-secondary)]"
                  : "font-semibold text-[var(--bms-text)]"
              }`}
            >

              {title}

            </h3>

          </div>


          {!compact && (

            <span className="shrink-0 text-[11px] text-[var(--bms-text-muted)]">

              {formattedTime}

            </span>

          )}

        </div>


        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--bms-text-muted)]">

          {message}

        </p>


        {compact && (

          <p className="mt-1 text-[11px] text-[var(--bms-text-muted)]">

            {formattedTime}

          </p>

        )}


        {!compact && read && (

          <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--bms-text-muted)]">

            <Check
              size={13}
              aria-hidden="true"
            />

            Read

          </div>

        )}

      </div>

    </button>

  );
}


export default NotificationItem;