import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
  XCircle,
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
  getApprovalHistory,
} from "../../api/approvals";


function ApprovalHistory() {

  const navigate =
    useNavigate();


  /*
   * ==================================================
   * STATE
   * ==================================================
   */

  const [
    approvals,
    setApprovals,
  ] = useState([]);


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
    activeFilter,
    setActiveFilter,
  ] = useState("ALL");


  const [
    selectedApproval,
    setSelectedApproval,
  ] = useState(null);


  /*
   * ==================================================
   * LOAD APPROVAL HISTORY
   * ==================================================
   */

  const loadHistory =
    useCallback(
      async ({
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
            await getApprovalHistory();


          const data =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];


          setApprovals(
            data
          );

        } catch (err) {

          console.error(
            "Failed to load approval history:",
            err
          );


          setError(
            err?.message ||
            "Unable to load approval history."
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

    loadHistory();

  }, [
    loadHistory,
  ]);


  /*
   * ==================================================
   * FILTER APPROVALS
   * ==================================================
   */

  const filteredApprovals =
    useMemo(() => {

      if (
        activeFilter ===
        "ALL"
      ) {

        return approvals;

      }


      return approvals.filter(
        (approval) =>
          approval.status ===
          activeFilter
      );

    }, [
      approvals,
      activeFilter,
    ]);


  /*
   * ==================================================
   * COUNTS
   * ==================================================
   */

  const approvedCount =
    approvals.filter(
      (approval) =>
        approval.status ===
        "APPROVED"
    ).length;


  const rejectedCount =
    approvals.filter(
      (approval) =>
        approval.status ===
        "REJECTED"
    ).length;


  /*
   * ==================================================
   * FORMAT DATE
   * ==================================================
   */

  const formatDate =
    (date) => {

      if (!date) {

        return "Unknown date";

      }


      return new Intl.DateTimeFormat(
        undefined,
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(
        new Date(date)
      );

    };


  /*
   * ==================================================
   * FORMAT USER NAME
   * ==================================================
   */

  const getUserName =
    (person) => {

      if (!person) {

        return "Unknown user";

      }


      const name = [
        person.firstName,
        person.lastName,
      ]
        .filter(Boolean)
        .join(" ");


      return (
        name ||
        person.email ||
        "Unknown user"
      );

    };


  /*
   * ==================================================
   * FORMAT APPROVAL TYPE
   * ==================================================
   */

  const formatApprovalType =
    (type) => {

      if (
        type ===
        "USER_REGISTRATION"
      ) {

        return "User Registration";

      }


      if (
        type ===
        "ROLE_CHANGE"
      ) {

        return "Role Change";

      }


      return (
        type
          ?.toLowerCase()
          ?.replaceAll(
            "_",
            " "
          )
          ?.replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          ) ||
        "Approval"
      );

    };


  /*
   * ==================================================
   * GET TYPE ICON
   * ==================================================
   */

  const getTypeIcon =
    (type) => {

      if (
        type ===
        "USER_REGISTRATION"
      ) {

        return (
          <UserRoundPlus
            size={18}
          />
        );

      }


      if (
        type ===
        "ROLE_CHANGE"
      ) {

        return (
          <ShieldCheck
            size={18}
          />
        );

      }


      return (
        <FileCheck2
          size={18}
        />
      );

    };


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

          Loading approval history...

        </div>

      </div>

    );

  }


  return (

    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-3">

          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/approvals"
              )
            }
            aria-label="Back to approvals"
            title="Back to approvals"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
          >

            <ArrowLeft
              size={19}
              strokeWidth={1.8}
            />

          </button>


          {/* ==================================================
              PAGE TITLE
          ================================================== */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                <Clock3
                  size={20}
                />

              </div>


              <div>

                <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                  Approval History
                </h1>

                <p className="mt-0.5 text-sm text-[var(--bms-text-muted)]">
                  View previously reviewed approval requests.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            REFRESH
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            loadHistory({
              showLoader: false,
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

          <div>

            <p className="font-medium">
              Unable to load approval history
            </p>

            <p className="mt-1 text-xs opacity-80">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Reviewed requests
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--bms-text)]">
                {approvals.length}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

              <FileCheck2
                size={19}
              />

            </div>

          </div>

        </div>


        {/* APPROVED */}

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Approved
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-500">
                {approvedCount}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">

              <CheckCircle2
                size={19}
              />

            </div>

          </div>

        </div>


        {/* REJECTED */}

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Rejected
              </p>

              <p className="mt-2 text-2xl font-semibold text-red-500">
                {rejectedCount}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">

              <XCircle
                size={19}
              />

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="flex flex-wrap gap-2">

        {[
          {
            value: "ALL",
            label: "All",
          },
          {
            value: "APPROVED",
            label: "Approved",
          },
          {
            value: "REJECTED",
            label: "Rejected",
          },
        ].map(
          (filter) => (

            <button
              key={
                filter.value
              }
              type="button"
              onClick={() =>
                setActiveFilter(
                  filter.value
                )
              }
              className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                activeFilter ===
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


      {/* ==================================================
          HISTORY LIST
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <h2 className="text-sm font-semibold text-[var(--bms-text)]">
            Reviewed Requests
          </h2>

          <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
            {filteredApprovals.length} request
            {filteredApprovals.length ===
            1
              ? ""
              : "s"}
          </p>

        </div>


        {filteredApprovals.length ===
        0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

              <FileCheck2
                size={24}
              />

            </div>


            <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
              No approval history
            </h3>


            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              No approved or rejected requests match this filter.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-[var(--bms-border)]">

            {filteredApprovals.map(
              (approval) => {

                const isApproved =
                  approval.status ===
                  "APPROVED";


                return (

                  <button
                    key={
                      approval.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedApproval(
                        approval
                      )
                    }
                    className="block w-full p-5 text-left transition-colors hover:bg-[var(--bms-surface-soft)]/50"
                  >

                    <div className="flex items-start gap-4">

                      {/* ICON */}

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isApproved
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >

                        {getTypeIcon(
                          approval.type
                        )}

                      </div>


                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-semibold text-[var(--bms-text)]">

                            {formatApprovalType(
                              approval.type
                            )}

                          </h3>


                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isApproved
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >

                            {isApproved
                              ? "Approved"
                              : "Rejected"}

                          </span>

                        </div>


                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--bms-text-muted)]">

                          <span className="flex items-center gap-1.5">

                            <UserRound
                              size={13}
                            />

                            Requested by{" "}
                            {getUserName(
                              approval.requestedBy
                            )}

                          </span>

                        </div>


                        {approval.requestedRole && (

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-500">

                            <ShieldCheck
                              size={13}
                            />

                            Role:{" "}
                            {
                              approval
                                .requestedRole
                                .name
                            }

                          </div>

                        )}


                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--bms-text-secondary)]">

                          {approval.reason ||
                            "No reason provided."}

                        </p>


                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--bms-text-muted)]">

                          <span>
                            Requested{" "}
                            {formatDate(
                              approval.requestedAt
                            )}
                          </span>

                          <span>
                            Reviewed{" "}
                            {formatDate(
                              approval.reviewedAt
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                  </button>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ==================================================
          DETAILS MODAL
      ================================================== */}

      {selectedApproval && (

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

              setSelectedApproval(
                null
              );

            }

          }}
        >

          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="border-b border-[var(--bms-border)] p-5">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      selectedApproval.status ===
                      "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >

                    {selectedApproval.status ===
                    "APPROVED" ? (

                      <CheckCircle2
                        size={20}
                      />

                    ) : (

                      <XCircle
                        size={20}
                      />

                    )}

                  </div>


                  <div>

                    <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                      {formatApprovalType(
                        selectedApproval.type
                      )}

                    </h2>


                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        selectedApproval.status ===
                        "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >

                      {selectedApproval.status ===
                      "APPROVED"
                        ? "Approved"
                        : "Rejected"}

                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedApproval(
                      null
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bms-text-muted)] transition-colors hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                  aria-label="Close approval details"
                >

                  <XCircle
                    size={18}
                  />

                </button>

              </div>

            </div>


            {/* MODAL DETAILS */}

            <div className="space-y-5 p-5">

              {/* REQUESTER */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Requested By
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--bms-text)]">

                  {getUserName(
                    selectedApproval.requestedBy
                  )}

                </p>

                <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">

                  {
                    selectedApproval
                      .requestedBy
                      ?.email
                  }

                </p>

              </div>


              {/* REQUESTED ROLE */}

              {selectedApproval.requestedRole && (

                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Requested Role
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <ShieldCheck
                      size={16}
                      className="text-blue-500"
                    />

                    <span className="text-sm font-medium text-[var(--bms-text)]">

                      {
                        selectedApproval
                          .requestedRole
                          .name
                      }

                    </span>

                  </div>


                  {selectedApproval.requestedRole.description && (

                    <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                      {
                        selectedApproval
                          .requestedRole
                          .description
                      }

                    </p>

                  )}

                </div>

              )}


              {/* REQUEST REASON */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Request Reason
                </p>

                <div className="mt-2 rounded-xl bg-[var(--bms-surface-soft)] p-3">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--bms-text-secondary)]">

                    {selectedApproval.reason ||
                      "No reason provided."}

                  </p>

                </div>

              </div>


              {/* REVIEWER */}

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bms-text-muted)]">
                  Reviewed By
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--bms-text)]">

                  {getUserName(
                    selectedApproval.reviewedBy
                  )}

                </p>

                <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">

                  Reviewed{" "}
                  {formatDate(
                    selectedApproval.reviewedAt
                  )}

                </p>

              </div>


              {/* REJECTION REASON */}

              {selectedApproval.status ===
                "REJECTED" && (

                <div>

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
                    Rejection Reason
                  </p>

                  <div className="mt-2 rounded-xl border border-red-500/10 bg-red-500/5 p-3">

                    <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--bms-text-secondary)]">

                      {selectedApproval.reviewReason ||
                        "No rejection reason provided."}

                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="border-t border-[var(--bms-border)] p-4">

              <button
                type="button"
                onClick={() =>
                  setSelectedApproval(
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


export default ApprovalHistory;