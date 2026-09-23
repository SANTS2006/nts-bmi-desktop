import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  RefreshCw,
  UserRound,
  UserRoundPlus,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPendingApprovals,
  approveApproval,
  rejectApproval,
} from "../../api/approvals";

import {
  History,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


function Approvals() {

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
    processingId,
    setProcessingId,
  ] = useState(null);

  const [
    selectedApproval,
    setSelectedApproval,
  ] = useState(null);

  const [
    rejectModalOpen,
    setRejectModalOpen,
  ] = useState(false);

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState(null);


  /*
   * ==================================================
   * FETCH APPROVALS
   * ==================================================
   */

  const loadApprovals = useCallback(
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
          await getPendingApprovals();


        const data =
          Array.isArray(
            response?.data
          )
            ? response.data
            : [];


        setApprovals(data);

      } catch (err) {

        console.error(
          "Failed to load approvals:",
          err
        );


        setError(
          err?.message ||
          "Unable to load approval requests."
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

    loadApprovals();

  }, [
    loadApprovals,
  ]);


  /*
   * ==================================================
   * FILTER
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
          approval.type ===
          activeFilter
      );

    }, [
      approvals,
      activeFilter,
    ]);


  /*
   * ==================================================
   * APPROVAL COUNT
   * ==================================================
   */

  const pendingCount =
    approvals.length;


  /*
   * ==================================================
   * FORMAT DATE
   * ==================================================
   */

  const formatDate = (
    date
  ) => {

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
   * FORMAT TYPE
   * ==================================================
   */

  const formatApprovalType = (
    type
  ) => {

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


    return type
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
      "Approval";

  };


  /*
   * ==================================================
   * APPROVAL ICON
   * ==================================================
   */

  const getApprovalIcon = (
    type
  ) => {

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
   * APPROVE
   * ==================================================
   */

  const handleApprove =
    async (
      approval
    ) => {

      if (
        processingId
      ) {
        return;
      }


      try {

        setProcessingId(
          approval.id
        );

        setActionError(
          null
        );


        await approveApproval(
          approval.id
        );


        /*
         * Remove the approved
         * request immediately.
         *
         * No page refresh.
         */

        setApprovals(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                approval.id
            )
        );


        setSelectedApproval(
          null
        );

      } catch (err) {

        console.error(
          "Failed to approve:",
          err
        );


        setActionError(
          err?.message ||
          "Unable to approve this request."
        );

      } finally {

        setProcessingId(
          null
        );

      }

    };


  /*
   * ==================================================
   * OPEN REJECT MODAL
   * ==================================================
   */

  const openRejectModal =
    (
      approval
    ) => {

      setSelectedApproval(
        approval
      );

      setRejectionReason(
        ""
      );

      setActionError(
        null
      );

      setRejectModalOpen(
        true
      );

    };


  /*
   * ==================================================
   * REJECT
   * ==================================================
   */

  const handleReject =
    async () => {

      if (
        !selectedApproval ||
        processingId
      ) {
        return;
      }


      if (
        !rejectionReason.trim()
      ) {

        setActionError(
          "Please provide a rejection reason."
        );

        return;
      }


      try {

        setProcessingId(
          selectedApproval.id
        );

        setActionError(
          null
        );


        await rejectApproval(
          selectedApproval.id,
          rejectionReason
        );


        /*
         * Remove rejected request
         * immediately from the list.
         */

        setApprovals(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                selectedApproval.id
            )
        );


        setRejectModalOpen(
          false
        );

        setSelectedApproval(
          null
        );

        setRejectionReason(
          ""
        );

      } catch (err) {

        console.error(
          "Failed to reject:",
          err
        );


        setActionError(
          err?.message ||
          "Unable to reject this request."
        );

      } finally {

        setProcessingId(
          null
        );

      }

    };


  /*
   * ==================================================
   * LOADING
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

          Loading approvals...

        </div>

      </div>
    );

  }


  /*
   * ==================================================
   * PAGE
   * ==================================================
   */

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

              <CheckCircle2
                size={20}
              />

            </div>

            <div>

              <h1 className="text-xl font-semibold text-[var(--bms-text)]">
                Approval Center
              </h1>

              <p className="mt-0.5 text-sm text-[var(--bms-text-muted)]">
                Review and manage pending approval requests.
              </p>

            </div>

          </div>

        </div>


        <div className="flex flex-wrap gap-2">

  <Link
    to="/approvals/history"
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] px-4 py-2.5 text-sm font-medium text-[var(--bms-text-secondary)] transition-all hover:bg-[var(--bms-surface-soft)]"
  >

    <History
      size={16}
    />

    View History

  </Link>


  <button
    type="button"
    onClick={() =>
      loadApprovals({
        showLoader: false,
      })
    }
    disabled={isRefreshing}
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
              Unable to load approvals
            </p>

            <p className="mt-1 text-xs opacity-80">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="flex flex-wrap items-center gap-2">

        {[
          {
            value: "ALL",
            label: "All",
          },
          {
            value: "USER_REGISTRATION",
            label: "User Registration",
          },
          {
            value: "ROLE_CHANGE",
            label: "Role Change",
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
                  ? "bg-blue-500 text-white shadow-sm"
                  : "border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
              }`}
            >

              {filter.label}

            </button>

          )
        )}

      </div>


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-medium text-[var(--bms-text-muted)]">
                Pending approvals
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--bms-text)]">
                {pendingCount}
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">

              <Clock3
                size={19}
              />

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          APPROVAL LIST
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

        <div className="border-b border-[var(--bms-border)] px-5 py-4">

          <h2 className="text-sm font-semibold text-[var(--bms-text)]">
            Pending Requests
          </h2>

          <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
            {filteredApprovals.length} request
            {filteredApprovals.length === 1
              ? ""
              : "s"} awaiting review.
          </p>

        </div>


        {filteredApprovals.length ===
        0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">

              <CheckCircle2
                size={24}
              />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">
              No pending approvals
            </h3>

            <p className="mt-1 text-xs text-[var(--bms-text-muted)]">
              There are currently no approval requests waiting for review.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-[var(--bms-border)]">

            {filteredApprovals.map(
              (approval) => {

                const isProcessing =
                  processingId ===
                  approval.id;


                const requesterName = [
                  approval.requestedBy?.firstName,
                  approval.requestedBy?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ");


                return (

                  <div
                    key={
                      approval.id
                    }
                    className="p-5 transition-colors hover:bg-[var(--bms-surface-soft)]/50"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">

                          {getApprovalIcon(
                            approval.type
                          )}

                        </div>


                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-sm font-semibold text-[var(--bms-text)]">

                              {formatApprovalType(
                                approval.type
                              )}

                            </h3>

                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">

                              Pending

                            </span>

                          </div>


                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--bms-text-muted)]">

                            <UserRound
                              size={13}
                            />

                            {requesterName ||
                              approval.requestedBy?.email ||
                              "Unknown requester"}

                          </div>


                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--bms-text-secondary)]">

                            {approval.reason ||
                              "No reason provided."}

                          </p>


                          <p className="mt-2 text-[11px] text-[var(--bms-text-muted)]">

                            Requested{" "}
                            {formatDate(
                              approval.requestedAt
                            )}

                          </p>

                        </div>

                      </div>


                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openRejectModal(
                              approval
                            )
                          }
                          disabled={
                            Boolean(
                              processingId
                            )
                          }
                          className="rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-2 text-xs font-medium text-red-500 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          Reject

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleApprove(
                              approval
                            )
                          }
                          disabled={
                            Boolean(
                              processingId
                            )
                          }
                          className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {isProcessing ? (

                            <span className="flex items-center gap-1.5">

                              <RefreshCw
                                size={14}
                                className="animate-spin"
                              />

                              Processing...

                            </span>

                          ) : (
                            "Approve"
                          )}

                        </button>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ==================================================
          REJECTION MODAL
      ================================================== */}

      {rejectModalOpen &&
        selectedApproval && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >

          <div className="w-full max-w-md rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl">

            <div className="border-b border-[var(--bms-border)] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">

                  <XCircle
                    size={20}
                  />

                </div>

                <div>

                  <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                    Reject Approval
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--bms-text-muted)]">
                    Provide a reason for rejecting this request.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5">

              <label
                htmlFor="rejection-reason"
                className="text-xs font-medium text-[var(--bms-text-secondary)]"
              >
                Rejection reason
              </label>


              <textarea
                id="rejection-reason"
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Explain why this request is being rejected..."
                className="mt-2 w-full resize-none rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 py-2.5 text-sm text-[var(--bms-text)] outline-none transition focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
              />


              {actionError && (

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">

                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  {actionError}

                </div>

              )}

            </div>


            <div className="flex justify-end gap-2 border-t border-[var(--bms-border)] p-4">

              <button
                type="button"
                onClick={() => {

                  setRejectModalOpen(
                    false
                  );

                  setSelectedApproval(
                    null
                  );

                  setRejectionReason(
                    ""
                  );

                  setActionError(
                    null
                  );

                }}
                disabled={
                  Boolean(
                    processingId
                  )
                }
                className="rounded-xl border border-[var(--bms-border)] px-4 py-2.5 text-xs font-medium text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
              >

                Cancel

              </button>


              <button
                type="button"
                onClick={
                  handleReject
                }
                disabled={
                  Boolean(
                    processingId
                  )
                }
                className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {processingId ? (
                  <span className="flex items-center gap-1.5">

                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />

                    Rejecting...

                  </span>
                ) : (
                  "Reject Request"
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );

}


export default Approvals;