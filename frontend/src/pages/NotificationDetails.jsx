import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Info,
  ShieldAlert,
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  getNotifications,
  markNotificationAsRead,
} from "../api/notifications";


function NotificationDetails() {

  const {
    notificationId,
  } = useParams();


  const [
    notification,
    setNotification,
  ] = useState(null);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(null);


  /*
   * ==================================================
   * LOAD NOTIFICATION
   * ==================================================
   *
   * Your current backend does not have:
   *
   * GET /api/notifications/:id
   *
   * Therefore we retrieve the user's notifications
   * and find the requested notification locally.
   *
   * Later we can add a dedicated endpoint.
   */

  useEffect(() => {

    const loadNotification =
      async () => {

        try {

          setIsLoading(true);

          setError(null);


          const response =
            await getNotifications(100);


          const notifications =
            response?.data?.notifications || [];


          const found =
            notifications.find(
              (item) =>
                item.id ===
                notificationId
            );


          if (!found) {

            setNotification(
              null
            );

            return;

          }


          /*
           * Mark unread notification
           * as read.
           */

          if (!found.read) {

            try {

              await markNotificationAsRead(
                found.id
              );


              found.read = true;

              found.readAt =
                new Date().toISOString();

            } catch (readError) {

              console.error(
                "Failed to mark notification as read:",
                readError
              );

            }

          }


          setNotification(
            found
          );

        } catch (error) {

          console.error(
            "Failed to load notification:",
            error
          );


          setError(
            error?.message ||
            "Unable to load notification."
          );

        } finally {

          setIsLoading(false);

        }

      };


    loadNotification();

  }, [
    notificationId,
  ]);


  /*
   * ==================================================
   * LOADING STATE
   * ==================================================
   */

  if (isLoading) {

    return (
      <section className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={28}
            className="mx-auto animate-spin text-blue-500"
          />

          <p className="mt-4 text-sm text-[var(--bms-text-secondary)]">
            Loading notification...
          </p>

        </div>

      </section>
    );

  }


  /*
   * ==================================================
   * ERROR STATE
   * ==================================================
   */

  if (error) {

    return (
      <section className="flex min-h-[60vh] items-center justify-center">

        <div className="max-w-md text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">

            <AlertTriangle
              size={24}
            />

          </div>


          <h1 className="mt-5 text-xl font-bold text-[var(--bms-text)]">
            Unable to load notification
          </h1>


          <p className="mt-2 text-sm text-[var(--bms-text-secondary)]">
            {error}
          </p>


          <Link
            to="/notifications"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >

            <ArrowLeft
              size={16}
            />

            Back to notifications

          </Link>

        </div>

      </section>
    );

  }


  /*
   * ==================================================
   * NOT FOUND
   * ==================================================
   */

  if (!notification) {

    return (
      <section className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

            <Bell
              size={24}
            />

          </div>


          <h1 className="mt-5 text-xl font-bold text-[var(--bms-text)]">
            Notification not found
          </h1>


          <p className="mt-2 text-sm text-[var(--bms-text-secondary)]">
            This notification may have been removed or is no longer available.
          </p>


          <Link
            to="/notifications"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >

            <ArrowLeft
              size={16}
            />

            Back to notifications

          </Link>

        </div>

      </section>
    );

  }


  /*
   * ==================================================
   * ICON
   * ==================================================
   */

  const iconMap = {

    APPROVAL:
      ClipboardCheck,

    SECURITY:
      ShieldAlert,

    SUCCESS:
      CheckCircle,

    WARNING:
      AlertTriangle,

    ERROR:
      AlertTriangle,

    SYSTEM:
      Settings,

    INFO:
      Info,

  };


  const Icon =
    iconMap[
      notification.type
    ] || Info;


  /*
   * ==================================================
   * DATE
   * ==================================================
   */

  const formattedTime =
    new Date(
      notification.createdAt
    ).toLocaleString([], {
      dateStyle: "full",
      timeStyle: "short",
    });


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <div className="mx-auto w-full max-w-4xl space-y-6">

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        to="/notifications"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] transition-colors hover:text-[var(--bms-text)]"
      >

        <ArrowLeft
          size={17}
        />

        Back to notifications

      </Link>


      {/* ==================================================
          MAIN CARD
      ================================================== */}

      <article className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-sm">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="border-b border-[var(--bms-border)] p-6 sm:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

              <Icon
                size={23}
                strokeWidth={1.8}
              />

            </div>


            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-xl font-bold tracking-tight text-[var(--bms-text)] sm:text-2xl">
                  {notification.title}
                </h1>


                {!notification.read && (

                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                    Unread
                  </span>

                )}

              </div>


              <p className="mt-2 text-xs text-[var(--bms-text-muted)]">
                {formattedTime}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="p-6 sm:p-8">

          <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-5">

            <p className="text-sm leading-7 text-[var(--bms-text-secondary)]">
              {notification.message}
            </p>

          </div>


          {/* ==================================================
              METADATA
          ================================================== */}

          {notification.metadata &&
            typeof notification.metadata ===
              "object" && (

              <div className="mt-8">

                <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                  Notification details
                </h2>


                <div className="mt-4 divide-y divide-[var(--bms-border)] rounded-xl border border-[var(--bms-border)]">

                  {Object.entries(
                    notification.metadata
                  ).map(
                    ([
                      key,
                      value,
                    ]) => (

                      <div
                        key={key}
                        className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >

                        <span className="text-xs font-medium capitalize text-[var(--bms-text-muted)]">

                          {key.replace(
                            /([A-Z])/g,
                            " $1"
                          )}

                        </span>


                        <span className="break-all text-sm font-medium text-[var(--bms-text)] sm:text-right">

                          {typeof value ===
                          "object"
                            ? JSON.stringify(
                                value
                              )
                            : String(
                                value
                              )}

                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {/* ==================================================
              ENTITY INFORMATION
          ================================================== */}

          {(notification.entityType ||
            notification.entityId) && (

            <div className="mt-8">

              <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                Related entity
              </h2>


              <div className="mt-4 rounded-xl border border-[var(--bms-border)]">

                {notification.entityType && (

                  <div className="flex items-center justify-between border-b border-[var(--bms-border)] px-4 py-3">

                    <span className="text-xs text-[var(--bms-text-muted)]">
                      Type
                    </span>

                    <span className="text-sm font-medium text-[var(--bms-text)]">
                      {notification.entityType}
                    </span>

                  </div>

                )}


                {notification.entityId && (

                  <div className="flex items-center justify-between gap-4 px-4 py-3">

                    <span className="text-xs text-[var(--bms-text-muted)]">
                      ID
                    </span>

                    <span className="break-all text-xs font-medium text-[var(--bms-text)]">
                      {notification.entityId}
                    </span>

                  </div>

                )}

              </div>

            </div>

          )}


          {/* ==================================================
              STATUS
          ================================================== */}

          <div className="mt-8 flex items-center gap-2 text-xs text-emerald-500">

            <CheckCircle2
              size={16}
            />

            Notification received successfully.

          </div>

        </div>

      </article>

    </div>

  );
}

export default NotificationDetails;