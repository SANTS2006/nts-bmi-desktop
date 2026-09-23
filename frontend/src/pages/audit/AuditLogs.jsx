import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
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

import {
  getAuditLogs,
} from "../../api/audit";


function AuditLogs() {

  const navigate =
    useNavigate();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [
    logs,
    setLogs,
  ] = useState([]);


  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });


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


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    resultFilter,
    setResultFilter,
  ] = useState("ALL");


  const [
    selectedLog,
    setSelectedLog,
  ] = useState(null);


  /*
   * ==================================================
   * LOAD AUDIT LOGS
   * ==================================================
   */

  const loadAuditLogs =
    useCallback(
      async ({
        page = 1,
        showLoader = true,
      } = {}) => {

        try {

          if (showLoader) {

            setIsLoading(true);

          } else {

            setIsRefreshing(true);

          }


          setError(null);


          const response =
            await getAuditLogs({
              page,
              limit: 20,
            });


          const data =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];


          setLogs(data);


          setPagination(
            response?.pagination || {
              page,
              limit: 20,
              total: data.length,
              totalPages: 1,
            }
          );

        } catch (error) {

          console.error(
            "Failed to load audit logs:",
            error
          );


          setError(
            error?.message ||
            "Unable to load audit logs."
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

    loadAuditLogs();

  }, [
    loadAuditLogs,
  ]);


  /*
   * ==================================================
   * FORMAT ACTION
   * ==================================================
   */

  const formatAction =
    (action) => {

      if (!action) {

        return "Unknown Action";

      }


      return action
        .toLowerCase()
        .split("_")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");

    };


  /*
   * ==================================================
   * FORMAT RESULT
   * ==================================================
   */

  const formatResult =
    (result) => {

      if (!result) {

        return "Unknown";

      }


      return (
        result.charAt(0) +
        result
          .slice(1)
          .toLowerCase()
      );

    };


  /*
   * ==================================================
   * FORMAT DATE
   * ==================================================
   */

  const formatDate =
    (date) => {

      if (!date) {

        return "Unknown";

      }


      const parsedDate =
        new Date(date);


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return "Unknown";

      }


      return new Intl.DateTimeFormat(
        undefined,
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(
        parsedDate
      );

    };


  /*
   * ==================================================
   * GET ACTOR NAME
   * ==================================================
   */

  const getActorName =
    (actor) => {

      if (!actor) {

        return "System";

      }


      const name = [
        actor.firstName,
        actor.lastName,
      ]
        .filter(Boolean)
        .join(" ");


      return (
        name ||
        actor.email ||
        "Unknown user"
      );

    };


  /*
   * ==================================================
   * FILTER LOGS
   * ==================================================
   *
   * Filtering happens on the currently loaded
   * page because the backend currently only
   * provides pagination.
   *
   */

  const filteredLogs =
    useMemo(() => {

      let result =
        [...logs];


      /*
       * Result filter
       */

      if (
        resultFilter !==
        "ALL"
      ) {

        result =
          result.filter(
            (log) =>
              log.result ===
              resultFilter
          );

      }


      /*
       * Search
       */

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      if (search) {

        result =
          result.filter(
            (log) => {

              const actorName =
                getActorName(
                  log.actor
                );


              const searchableText = [
                log.action,
                log.result,
                log.description,
                log.targetType,
                log.targetId,
                log.actor?.email,
                actorName,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


              return searchableText.includes(
                search
              );

            }
          );

      }


      return result;

    }, [
      logs,
      resultFilter,
      searchTerm,
    ]);


  /*
   * ==================================================
   * PAGE NAVIGATION
   * ==================================================
   */

  const goToPage =
    (page) => {

      if (
        page < 1 ||
        page >
          pagination.totalPages ||
        page ===
          pagination.page
      ) {

        return;

      }


      loadAuditLogs({
        page,
      });


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };


  /*
   * ==================================================
   * PAGE NUMBERS
   * ==================================================
   */

  const pageNumbers =
    useMemo(() => {

      const totalPages =
        pagination.totalPages;


      const currentPage =
        pagination.page;


      if (
        totalPages <= 5
      ) {

        return Array.from(
          {
            length:
              totalPages,
          },
          (_, index) =>
            index + 1
        );

      }


      const pages = [];


      pages.push(1);


      if (
        currentPage > 3
      ) {

        pages.push(
          "..."
        );

      }


      const start =
        Math.max(
          2,
          currentPage - 1
        );


      const end =
        Math.min(
          totalPages - 1,
          currentPage + 1
        );


      for (
        let page = start;
        page <= end;
        page++
      ) {

        pages.push(page);

      }


      if (
        currentPage <
        totalPages - 2
      ) {

        pages.push(
          "..."
        );

      }


      pages.push(
        totalPages
      );


      return pages;

    }, [
      pagination,
    ]);


  /*
   * ==================================================
   * LOADING STATE
   * ==================================================
   */

  if (isLoading) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="flex items-center gap-3 text-sm text-[var(--bms-text-muted)]">

          <RefreshCw
            size={18}
            className="animate-spin"
          />

          Loading audit logs...

        </div>

      </div>

    );

  }


  return (

    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-3">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            aria-label="Go back"
            title="Go back"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
          >

            <ArrowLeft
              size={19}
              strokeWidth={1.8}
            />

          </button>


          {/* TITLE */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                <ClipboardList
                  size={20}
                />

              </div>


              <div>

                <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                  Audit Logs
                </h1>

                <p className="mt-0.5 text-sm text-[var(--bms-text-muted)]">
                  Monitor important activity across the system.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* REFRESH */}

        <button
          type="button"
          onClick={() =>
            loadAuditLogs({
              page:
                pagination.page,
              showLoader:
                false,
            })
          }
          disabled={
            isRefreshing
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition-all hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={16}
            className={
              isRefreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">

          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0">

            <p className="font-medium">
              Unable to load audit logs
            </p>

            <p className="mt-1 text-xs opacity-80">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Total Logs
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--bms-text)]">
                {pagination.total}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

              <ClipboardList
                size={19}
              />

            </div>

          </div>

        </div>


        {/* SUCCESS */}

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Successful
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-500">
                {logs.filter(
                  (log) =>
                    log.result ===
                    "SUCCESS"
                ).length}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">

              <ShieldCheck
                size={19}
              />

            </div>

          </div>

        </div>


        {/* FAILURE */}

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Failed
              </p>

              <p className="mt-2 text-2xl font-semibold text-red-500">
                {logs.filter(
                  (log) =>
                    log.result ===
                    "FAILURE"
                ).length}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">

              <AlertCircle
                size={19}
              />

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          FILTER BAR
      ================================================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        {/* SEARCH */}

        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 lg:max-w-md">

          <Search
            size={17}
            className="shrink-0 text-[var(--bms-text-muted)]"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(
              event
            ) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search audit logs..."
            className="w-full bg-transparent text-sm text-[var(--bms-text)] outline-none placeholder:text-[var(--bms-text-muted)]"
            aria-label="Search audit logs"
          />

        </div>


        {/* RESULT FILTER */}

        <div className="flex items-center gap-2">

          {[
            {
              value: "ALL",
              label: "All",
            },
            {
              value: "SUCCESS",
              label: "Success",
            },
            {
              value: "FAILURE",
              label: "Failure",
            },
          ].map(
            (filter) => (

              <button
                key={
                  filter.value
                }
                type="button"
                onClick={() =>
                  setResultFilter(
                    filter.value
                  )
                }
                className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  resultFilter ===
                  filter.value
                    ? "bg-blue-500 text-white"
                    : "border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                }`}
              >

                {filter.label}

              </button>

            )
          )}

        </div>

      </div>


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b border-[var(--bms-border)] bg-[var(--bms-surface-soft)]/50">

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Action
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Actor
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Target
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Result
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Date
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Details
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-[var(--bms-border)]">

              {filteredLogs.map(
                (log) => (

                  <tr
                    key={
                      log.id
                    }
                    className="transition-colors hover:bg-[var(--bms-surface-soft)]/50"
                  >

                    {/* ACTION */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                          <ClipboardList
                            size={16}
                          />

                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                            {formatAction(
                              log.action
                            )}
                          </p>

                          <p className="mt-0.5 max-w-xs truncate text-[11px] text-[var(--bms-text-muted)]">
                            {log.description ||
                              "No description"}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* ACTOR */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">

                          <UserRound
                            size={14}
                          />

                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-xs font-medium text-[var(--bms-text)]">
                            {getActorName(
                              log.actor
                            )}
                          </p>

                          <p className="truncate text-[11px] text-[var(--bms-text-muted)]">
                            {log.actor?.email ||
                              "System"}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* TARGET */}

                    <td className="px-5 py-4">

                      <p className="text-xs font-medium text-[var(--bms-text)]">
                        {log.targetType ||
                          "—"}
                      </p>

                      <p className="mt-0.5 max-w-32 truncate font-mono text-[10px] text-[var(--bms-text-muted)]">
                        {log.targetId ||
                          "—"}
                      </p>

                    </td>


                    {/* RESULT */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          log.result ===
                          "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >

                        {formatResult(
                          log.result
                        )}

                      </span>

                    </td>


                    {/* DATE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-1.5 text-xs text-[var(--bms-text-secondary)]">

                        <Clock3
                          size={13}
                          className="text-[var(--bms-text-muted)]"
                        />

                        {formatDate(
                          log.createdAt
                        )}

                      </div>

                    </td>


                    {/* DETAILS */}

                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLog(
                            log
                          )
                        }
                        aria-label="View audit log details"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition hover:bg-blue-500/10 hover:text-blue-500"
                      >

                        <Eye
                          size={16}
                        />

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>


        {/* MOBILE LIST */}

        <div className="divide-y divide-[var(--bms-border)] md:hidden">

          {filteredLogs.map(
            (log) => (

              <button
                key={
                  log.id
                }
                type="button"
                onClick={() =>
                  setSelectedLog(
                    log
                  )
                }
                className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[var(--bms-surface-soft)]/50"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                  <ClipboardList
                    size={16}
                  />

                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium text-[var(--bms-text)]">
                        {formatAction(
                          log.action
                        )}
                      </p>

                      <p className="mt-1 truncate text-xs text-[var(--bms-text-muted)]">
                        {getActorName(
                          log.actor
                        )}
                      </p>

                    </div>


                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                        log.result ===
                        "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {formatResult(
                        log.result
                      )}
                    </span>

                  </div>


                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--bms-text-muted)]">

                    <Clock3
                      size={12}
                    />

                    {formatDate(
                      log.createdAt
                    )}

                  </div>

                </div>

              </button>

            )
          )}

        </div>


        {/* EMPTY */}

        {filteredLogs.length ===
          0 && (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

              <ClipboardList
                size={24}
              />

            </div>


            <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
              No audit logs found
            </h3>


            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              Try changing your search or filter.
            </p>

          </div>

        )}

      </div>


      {/* ==================================================
          PAGINATION
      ================================================== */}

      {pagination.totalPages >
        1 && (

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-[var(--bms-text-muted)]">

            Page{" "}
            <span className="font-medium text-[var(--bms-text)]">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[var(--bms-text)]">
              {pagination.totalPages}
            </span>

          </p>


          <div className="flex items-center gap-1">

            {/* PREVIOUS */}

            <button
              type="button"
              onClick={() =>
                goToPage(
                  pagination.page -
                    1
                )
              }
              disabled={
                pagination.page ===
                1
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >

              <ChevronLeft
                size={16}
              />

            </button>


            {/* PAGE NUMBERS */}

            {pageNumbers.map(
              (
                page,
                index
              ) => {

                if (
                  page ===
                  "..."
                ) {

                  return (

                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 w-9 items-center justify-center text-xs text-[var(--bms-text-muted)]"
                    >
                      ...
                    </span>

                  );

                }


                return (

                  <button
                    key={
                      page
                    }
                    type="button"
                    onClick={() =>
                      goToPage(
                        page
                      )
                    }
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-medium transition ${
                      pagination.page ===
                      page
                        ? "bg-blue-500 text-white"
                        : "border border-[var(--bms-border)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                    }`}
                  >

                    {page}

                  </button>

                );

              }
            )}


            {/* NEXT */}

            <button
              type="button"
              onClick={() =>
                goToPage(
                  pagination.page +
                    1
                )
              }
              disabled={
                pagination.page ===
                pagination.totalPages
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >

              <ChevronRight
                size={16}
              />

            </button>

          </div>

        </div>

      )}


      {/* ==================================================
          DETAILS MODAL
      ================================================== */}

      {selectedLog && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setSelectedLog(
                null
              );

            }

          }}
        >

          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[var(--bms-border)] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                  <ClipboardList
                    size={20}
                  />

                </div>


                <div>

                  <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                    Audit Log Details
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                    {formatAction(
                      selectedLog.action
                    )}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedLog(
                    null
                  )
                }
                aria-label="Close audit log details"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* DETAILS */}

            <div className="space-y-5 p-5">

              {/* RESULT */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Result
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedLog.result ===
                    "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >

                  {formatResult(
                    selectedLog.result
                  )}

                </span>

              </div>


              {/* DESCRIPTION */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Description
                </p>

                <div className="mt-2 rounded-xl bg-[var(--bms-surface-soft)] p-3">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--bms-text-secondary)]">

                    {selectedLog.description ||
                      "No description provided."}

                  </p>

                </div>

              </div>


              {/* ACTOR */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Actor
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">

                    <UserRound
                      size={16}
                    />

                  </div>


                  <div>

                    <p className="text-sm font-medium text-[var(--bms-text)]">
                      {getActorName(
                        selectedLog.actor
                      )}
                    </p>

                    <p className="text-xs text-[var(--bms-text-muted)]">
                      {selectedLog.actor?.email ||
                        "System"}
                    </p>

                  </div>

                </div>

              </div>


              {/* TARGET */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Target Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--bms-text)]">
                    {selectedLog.targetType ||
                      "—"}
                  </p>

                </div>


                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Target ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-[var(--bms-text-secondary)]">
                    {selectedLog.targetId ||
                      "—"}
                  </p>

                </div>

              </div>


              {/* IP */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    IP Address
                  </p>

                  <p className="mt-1 font-mono text-xs text-[var(--bms-text-secondary)]">
                    {selectedLog.ipAddress ||
                      "—"}
                  </p>

                </div>


                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Created
                  </p>

                  <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">
                    {formatDate(
                      selectedLog.createdAt
                    )}
                  </p>

                </div>

              </div>


              {/* USER AGENT */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  User Agent
                </p>

                <div className="mt-2 rounded-xl bg-[var(--bms-surface-soft)] p-3">

                  <p className="break-words font-mono text-[11px] leading-5 text-[var(--bms-text-secondary)]">

                    {selectedLog.userAgent ||
                      "—"}

                  </p>

                </div>

              </div>


              {/* METADATA */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Metadata
                </p>

                <div className="mt-2 overflow-x-auto rounded-xl bg-[var(--bms-surface-soft)] p-3">

                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-[var(--bms-text-secondary)]">

                    {selectedLog.metadata
                      ? JSON.stringify(
                          selectedLog.metadata,
                          null,
                          2
                        )
                      : "No metadata"}

                  </pre>

                </div>

              </div>

            </div>


            {/* FOOTER */}

            <div className="border-t border-[var(--bms-border)] p-4">

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(
                    null
                  )
                }
                className="w-full rounded-xl border border-[var(--bms-border)] px-4 py-2.5 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)]"
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default AuditLogs;