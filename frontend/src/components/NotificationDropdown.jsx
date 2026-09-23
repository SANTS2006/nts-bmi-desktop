import {
  Bell,
  CheckCheck,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import NotificationItem from "./NotificationItem";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notifications";


function NotificationDropdown() {

  const containerRef =
    useRef(null);

  const navigate =
    useNavigate();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    notificationList,
    setNotificationList,
  ] = useState([]);


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  const [
    isLoading,
    setIsLoading,
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
      async () => {

        try {

          setIsLoading(true);

          setError(null);


          /*
           * Fetch notifications.
           */

          const response =
            await getNotifications(20);


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
           * Fetch unread notification count.
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
   * REFRESH WHEN DROPDOWN OPENS
   * ==================================================
   */

  useEffect(() => {

    if (!open) {
      return;
    }


    loadNotifications();

  }, [
    open,
    loadNotifications,
  ]);


  /*
   * ==================================================
   * CLOSE WHEN CLICKING OUTSIDE
   * ==================================================
   */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target
          )
        ) {

          setOpen(false);

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  /*
   * ==================================================
   * CLOSE WITH ESCAPE
   * ==================================================
   */

  useEffect(() => {

    const handleEscape =
      (event) => {

        if (
          event.key === "Escape" &&
          open
        ) {

          setOpen(false);

        }

      };


    document.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, [
    open,
  ]);


  /*
   * ==================================================
   * MARK ALL AS READ
   * ==================================================
   */

  const handleMarkAllAsRead =
    async () => {

      /*
       * Prevent duplicate requests.
       */

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


        /*
         * Mark all notifications as read
         * on the server.
         */

        await markAllNotificationsAsRead();


        /*
         * Immediately update local UI.
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


        /*
         * Reset unread counter.
         */

        setUnreadCount(0);

      } catch (error) {

        console.error(
          "Failed to mark notifications as read:",
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
   * IMPORTANT
   * --------------------------------------------------
   *
   * Clicking a notification ALWAYS opens:
   *
   * /notifications/:notificationId
   *
   * We intentionally DO NOT use actionUrl here.
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
       * Mark unread notification as read.
       */

      if (!notification.read) {

        try {

          await markNotificationAsRead(
            notification.id
          );


          /*
           * Update local notification.
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
           * We still navigate even if marking
           * the notification as read fails.
           */

          console.error(
            "Failed to mark notification as read:",
            error
          );

        }

      }


      /*
       * Close dropdown.
       */

      setOpen(false);


      /*
       * ALWAYS navigate to the notification
       * details page.
       */

      navigate(
        `/notifications/${notification.id}`
      );

    };


  /*
   * ==================================================
   * RECENT NOTIFICATIONS
   * ==================================================
   *
   * Display only the four most recent
   * notifications in the dropdown.
   *
   */

  const recentNotifications =
    notificationList.slice(
      0,
      4
    );


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <div
      ref={containerRef}
      className="relative"
    >

      {/* ==================================================
          NOTIFICATION BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        className="
          relative
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-[var(--bms-text-secondary)]
          transition-all
          duration-200
          hover:bg-[var(--bms-surface-soft)]
          hover:text-[var(--bms-text)]
          active:scale-95
        "
      >

        <Bell
          size={19}
          strokeWidth={1.8}
        />


        {/* ==================================================
            UNREAD INDICATOR
        ================================================== */}

        {unreadCount > 0 && (

          <>

            <span
              className="
                absolute
                right-1.5
                top-1.5
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-blue-500
                ring-2
                ring-[var(--bms-surface)]
              "
              aria-hidden="true"
            />


            <span className="sr-only">

              {unreadCount}
              {" "}
              unread notifications

            </span>

          </>

        )}

      </button>


      {/* ==================================================
          NOTIFICATION DROPDOWN
      ==================================================
      
      MOBILE
      --------------------------------------------------
      On mobile the dropdown is positioned relative
      to the viewport.

      left-1/2
      -translate-x-1/2

      This guarantees that the dropdown stays centered
      instead of being pushed off the left side by the
      navbar/container.

      DESKTOP
      --------------------------------------------------
      On screens >= sm, the dropdown returns to the
      notification button and aligns to the right.

      ================================================== */}

      <div
        role="presentation"
        className={`
          fixed
          left-1/2
          top-[4.25rem]
          z-[60]

          w-[calc(100vw-1rem)]
          max-w-[380px]

          -translate-x-1/2

          origin-top

          transition-all
          duration-200
          ease-out

          sm:absolute
          sm:left-auto
          sm:right-0
          sm:top-[calc(100%+0.75rem)]

          sm:w-96
          sm:max-w-[380px]

          sm:translate-x-0
          sm:origin-top-right

          ${
            open
              ? `
                pointer-events-auto
                translate-y-0
                scale-100
                opacity-100
              `
              : `
                pointer-events-none
                -translate-y-2
                scale-95
                opacity-0
              `
          }
        `}
      >

        {/* ==================================================
            DROPDOWN CONTAINER
        ================================================== */}

        <div
          className="
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-[var(--bms-border)]
            bg-[var(--bms-surface)]
            shadow-2xl
            shadow-black/10
          "
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-[var(--bms-border)]
              px-4
              py-3
            "
          >

            <div className="min-w-0">

              <h2
                className="
                  text-sm
                  font-semibold
                  text-[var(--bms-text)]
                "
              >
                Notifications
              </h2>


              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-[var(--bms-text-muted)]
                "
              >

                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1
                        ? ""
                        : "s"
                    }`
                  : "You're all caught up"}

              </p>

            </div>


            {/* ==================================================
                MARK ALL AS READ
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
                className="
                  ml-3
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2
                  py-1.5
                  text-[11px]
                  font-medium
                  text-blue-500
                  transition-colors
                  hover:bg-blue-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {isMarkingAllRead ? (

                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                ) : (

                  <CheckCheck
                    size={14}
                  />

                )}


                <span>

                  {isMarkingAllRead
                    ? "Marking..."
                    : "Mark all read"}

                </span>

              </button>

            )}

          </div>


          {/* ==================================================
              CONTENT
          ================================================== */}

          <div
            className="
              max-h-[420px]
              overflow-y-auto
              overscroll-contain
              scroll-smooth
              p-2

              bms-dropdown-scroll
            "
          >

            {/* ==================================================
                LOADING
            ================================================== */}

            {isLoading && (

              <div
                className="
                  flex
                  items-center
                  justify-center
                  px-6
                  py-10
                "
              >

                <Loader2
                  size={22}
                  className="
                    animate-spin
                    text-blue-500
                  "
                />

                <span className="sr-only">
                  Loading notifications
                </span>

              </div>

            )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {!isLoading &&
              error && (

                <div
                  className="
                    px-5
                    py-8
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-red-500/10
                      text-red-500
                    "
                  >

                    <AlertCircle
                      size={20}
                    />

                  </div>


                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-[var(--bms-text)]
                    "
                  >
                    Unable to load notifications
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--bms-text-muted)]
                    "
                  >
                    {error}
                  </p>


                  <button
                    type="button"
                    onClick={
                      loadNotifications
                    }
                    className="
                      mt-4
                      rounded-lg
                      bg-blue-500
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-white
                      transition-colors
                      hover:bg-blue-600
                    "
                  >
                    Try again
                  </button>

                </div>

              )}


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {!isLoading &&
              !error &&
              recentNotifications.length ===
                0 && (

                <div
                  className="
                    px-6
                    py-10
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--bms-surface-soft)]
                      text-[var(--bms-text-muted)]
                    "
                  >

                    <Bell
                      size={21}
                    />

                  </div>


                  <p
                    className="
                      mt-3
                      text-sm
                      font-medium
                      text-[var(--bms-text)]
                    "
                  >
                    No notifications
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--bms-text-muted)]
                    "
                  >
                    You're all caught up.
                  </p>

                </div>

              )}


            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            {!isLoading &&
              !error &&
              recentNotifications.length >
                0 && (

                <div>

                  {recentNotifications.map(
                    (notification) => (

                      <NotificationItem
                        key={
                          notification.id
                        }
                        notification={
                          notification
                        }
                        compact
                        onClick={
                          handleNotificationClick
                        }
                      />

                    )
                  )}

                </div>

              )}

          </div>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className="
              border-t
              border-[var(--bms-border)]
              p-2
            "
          >

            <Link
              to="/notifications"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                justify-center
                gap-1
                rounded-xl
                px-3
                py-2.5
                text-xs
                font-semibold
                text-blue-500
                transition-colors
                hover:bg-blue-500/10
              "
            >

              View all notifications

              <ChevronRight
                size={14}
              />

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}


export default NotificationDropdown;