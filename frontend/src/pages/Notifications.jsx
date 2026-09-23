import {
  Bell,
  CheckCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
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

import NotificationItem from "../components/NotificationItem";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notifications";


function Notifications() {

  const navigate = useNavigate();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [
    notificationList,
    setNotificationList,
  ] = useState([]);


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  const [
    filter,
    setFilter,
  ] = useState("all");


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);


  const [
    isMarkingAllRead,
    setIsMarkingAllRead,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  /*
   * ==================================================
   * LOAD NOTIFICATIONS
   * ==================================================
   */

  const loadNotifications =
    useCallback(
      async (
        showRefresh = false
      ) => {

        try {

          if (showRefresh) {

            setIsRefreshing(true);

          } else {

            setIsLoading(true);

          }


          setError(null);


          /*
           * Get notifications
           */

          const response =
            await getNotifications(100);


          const notifications =
            response?.data?.notifications;


          setNotificationList(
            Array.isArray(
              notifications
            )
              ? notifications
              : []
          );


          /*
           * Get unread count
           */

          const unreadResponse =
            await getUnreadNotificationCount();


          const count =
            Number(
              unreadResponse?.data?.count
            );


          setUnreadCount(
            Number.isFinite(count)
              ? count
              : 0
          );

        } catch (error) {

          console.error(
            "Failed to load notifications:",
            error
          );


          setError(
            error?.message ||
            "Unable to load notifications."
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

    loadNotifications();

  }, [
    loadNotifications,
  ]);


  /*
   * ==================================================
   * MARK ALL AS READ
   * ==================================================
   */

  const handleMarkAllAsRead =
    async () => {

      if (
        isMarkingAllRead ||
        unreadCount === 0
      ) {

        return;

      }


      try {

        setIsMarkingAllRead(
          true
        );


        await markAllNotificationsAsRead();


        /*
         * Update UI immediately
         */

        setNotificationList(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,

                read: true,

                readAt:
                  notification.readAt ||
                  new Date().toISOString(),

              })
            )
        );


        setUnreadCount(0);

      } catch (error) {

        console.error(
          "Failed to mark all notifications as read:",
          error
        );


        setError(
          error?.message ||
          "Unable to mark notifications as read."
        );

      } finally {

        setIsMarkingAllRead(
          false
        );

      }

    };


  /*
   * ==================================================
   * NOTIFICATION CLICK
   * ==================================================
   *
   * Flow:
   *
   * 1. User clicks notification
   * 2. Mark notification as read
   * 3. Update local state
   * 4. Navigate to notification details
   *
   * IMPORTANT:
   *
   * We intentionally DO NOT use notification.actionUrl
   * here.
   *
   * Every notification clicked from this page goes to:
   *
   * /notifications/:notificationId
   *
   */

  const handleNotificationClick =
    async (
      notification
    ) => {

      if (!notification) {
        return;
      }


      /*
       * ==================================================
       * MARK AS READ
       * ==================================================
       */

      if (!notification.read) {

        try {

          await markNotificationAsRead(
            notification.id
          );


          /*
           * Update notification locally.
           */

          setNotificationList(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  notification.id
                    ? {
                        ...item,

                        read: true,

                        readAt:
                          new Date().toISOString(),

                      }
                    : item
              )
          );


          /*
           * Decrease unread count.
           */

          setUnreadCount(
            (previous) =>
              Math.max(
                0,
                previous - 1
              )
          );

        } catch (error) {

          /*
           * We log the error but still
           * allow navigation to details.
           */

          console.error(
            "Failed to mark notification as read:",
            error
          );

        }

      }


      /*
       * ==================================================
       * NAVIGATE TO DETAILS
       * ==================================================
       *
       * This is the important part.
       */

      navigate(
        `/notifications/${notification.id}`
      );

    };


  /*
   * ==================================================
   * FILTER NOTIFICATIONS
   * ==================================================
   */

  const filteredNotifications =
    useMemo(() => {

      if (
        filter ===
        "unread"
      ) {

        return notificationList.filter(
          (notification) =>
            !notification.read
        );

      }


      return notificationList;

    }, [
      filter,
      notificationList,
    ]);


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <div className="mx-auto w-full space-y-6">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

              <Bell
                size={21}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--bms-text)] sm:text-3xl">
                Notifications
              </h1>


              <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">
                Stay up to date with activity across your system.
              </p>

            </div>

          </div>

        </div>


        <div className="flex items-center gap-2">


          {/* ==================================================
              REFRESH
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              loadNotifications(true)
            }
            disabled={
              isRefreshing ||
              isLoading
            }
            aria-label="Refresh notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] transition-all hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-60"
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


          {/* ==================================================
              MARK ALL
          ================================================== */}

          {unreadCount > 0 && (

            <button
              type="button"
              onClick={
                handleMarkAllAsRead
              }
              disabled={
                isMarkingAllRead
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition-all duration-200 hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {isMarkingAllRead ? (

                <Loader2
                  size={17}
                  className="animate-spin"
                />

              ) : (

                <CheckCheck
                  size={17}
                />

              )}

              {isMarkingAllRead
                ? "Marking..."
                : "Mark all as read"}

            </button>

          )}

        </div>

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />


          <div className="min-w-0 flex-1">

            <p className="text-sm font-semibold">
              Unable to load notifications
            </p>


            <p className="mt-1 text-xs opacity-80">
              {error}
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              loadNotifications(true)
            }
            className="shrink-0 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
          >
            Retry
          </button>

        </div>

      )}


      {/* ==================================================
          FILTERS
      ================================================== */}

      <section className="flex items-center gap-2">

        <button
          type="button"
          onClick={() =>
            setFilter("all")
          }
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
          }`}
        >

          All

          <span className="ml-1">
            ({notificationList.length})
          </span>

        </button>


        <button
          type="button"
          onClick={() =>
            setFilter("unread")
          }
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filter === "unread"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
          }`}
        >

          Unread

          {unreadCount > 0 && (

            <span className="ml-1.5">
              ({unreadCount})
            </span>

          )}

        </button>

      </section>


      {/* ==================================================
          NOTIFICATION LIST
      ================================================== */}

      <section className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-2 shadow-sm transition-colors duration-300">


        {/* ==================================================
            LOADING
        ================================================== */}

        {isLoading && (

          <div className="flex min-h-[300px] items-center justify-center">

            <Loader2
              size={28}
              className="animate-spin text-blue-500"
            />

          </div>

        )}


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!isLoading &&
          !error &&
          filteredNotifications.length ===
            0 && (

            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

                <Bell
                  size={28}
                  strokeWidth={1.6}
                />

              </div>


              <h2 className="mt-5 text-base font-semibold text-[var(--bms-text)]">

                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}

              </h2>


              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--bms-text-muted)]">

                {filter === "unread"
                  ? "You're all caught up. New notifications will appear here when there is activity that requires your attention."
                  : "There are currently no notifications for your account."}

              </p>

            </div>

          )}


        {/* ==================================================
            NOTIFICATION LIST
        ================================================== */}

        {!isLoading &&
          filteredNotifications.length >
            0 && (

            <div className="space-y-1">

              {filteredNotifications.map(
                (notification) => (

                  <NotificationItem
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onClick={
                      handleNotificationClick
                    }
                  />

                )
              )}

            </div>

          )}

      </section>

    </div>

  );

}


export default Notifications;