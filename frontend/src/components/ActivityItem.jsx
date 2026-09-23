import {
  Users,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  UserPlus,
  Activity,
} from "lucide-react";


function ActivityItem({
  auditLog,
}) {

  /*
   * ==================================================
   * DETERMINE ICON
   * ==================================================
   */

  const getIcon =
    (action) => {

      const normalized =
        action
          ?.toLowerCase()
          .replace(/[_\s-]+/g, ".");


      if (
        normalized?.includes(
          "user"
        )
      ) {
        return {
          icon: Users,
          iconClass:
            "bg-blue-600/15 text-blue-500",
        };
      }


      if (
        normalized?.includes(
          "approval"
        )
      ) {
        return {
          icon: ClipboardCheck,
          iconClass:
            "bg-emerald-600/15 text-emerald-500",
        };
      }


      if (
        normalized?.includes(
          "role"
        )
      ) {
        return {
          icon: ShieldCheck,
          iconClass:
            "bg-purple-600/15 text-purple-500",
        };
      }


      if (
        normalized?.includes(
          "session"
        )
      ) {
        return {
          icon: ShieldCheck,
          iconClass:
            "bg-orange-600/15 text-orange-500",
        };
      }


      if (
        normalized?.includes(
          "login"
        )
      ) {
        return {
          icon: UserPlus,
          iconClass:
            "bg-blue-600/15 text-blue-500",
        };
      }


      return {
        icon: FileText,
        iconClass:
          "bg-slate-600/15 text-slate-500",
      };

    };


  /*
   * ==================================================
   * FORMAT ACTION
   * ==================================================
   */

  const formatAction =
    (action) => {

      if (!action) {
        return "System activity";
      }


      return action
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

    };


  /*
   * ==================================================
   * FORMAT ACTOR
   * ==================================================
   */

  const actor =
    auditLog?.actor;


  const actorName =
    actor
      ? [
          actor.firstName,
          actor.lastName,
        ]
          .filter(Boolean)
          .join(" ")
      : "System";


  /*
   * ==================================================
   * FORMAT TIME
   * ==================================================
   */

  const formatTime =
    (date) => {

      if (!date) {
        return "";
      }


      const timestamp =
        new Date(date);


      if (
        Number.isNaN(
          timestamp.getTime()
        )
      ) {
        return "";
      }


      const difference =
        Date.now() -
        timestamp.getTime();


      const seconds =
        Math.floor(
          difference / 1000
        );


      if (seconds < 60) {
        return `${seconds}s ago`;
      }


      const minutes =
        Math.floor(
          seconds / 60
        );


      if (minutes < 60) {
        return `${minutes}m ago`;
      }


      const hours =
        Math.floor(
          minutes / 60
        );


      if (hours < 24) {
        return `${hours}h ago`;
      }


      const days =
        Math.floor(
          hours / 24
        );


      if (days < 7) {
        return `${days}d ago`;
      }


      return timestamp.toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
        }
      );

    };


  const {
    icon: Icon,
    iconClass,
  } =
    getIcon(
      auditLog?.action
    );


  return (

    <div className="flex items-center gap-4 border-b border-[var(--bms-border)]/70 py-4 last:border-b-0">


      {/* Icon */}

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}
      >

        <Icon
          size={18}
        />

      </div>


      {/* Information */}

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-medium text-[var(--bms-text)]">

          {auditLog?.description ||
            formatAction(
              auditLog?.action
            )}

        </p>


        <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">

          By{" "}

          {actorName}

        </p>

      </div>


      {/* Time */}

      <span className="shrink-0 text-xs text-[var(--bms-text-muted)]">

        {formatTime(
          auditLog?.createdAt
        )}

      </span>

    </div>

  );
}


export default ActivityItem;