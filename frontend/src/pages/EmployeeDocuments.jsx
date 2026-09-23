import {
    AlertTriangle,
    CalendarDays,
    Download,
    FileText,
    FileType2,
    Loader2,
    Pencil,
    Plus,
    Trash2,
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
    createEmployeeDocument,
    deleteEmployeeDocument,
    getEmployeeDocuments,
    getEmployeeDocumentDownloadUrl,
    updateEmployeeDocument,
} from "../api/employeeDocuments.js";

import {
    getEmployees,
} from "../api/employee.js";

import {
    arrayData,
    getError,
    nameOf,
    dateOf,
    Button,
    Empty,
    ErrorBox,
    Field,
    inputClass,
    Modal,
    PageHeader,
    SearchBox,
    selectClass,
    textareaClass,
} from "../components/employeeManagement/ManagementUI.jsx";


/*
 * =========================================================
 * DOCUMENT TYPES
 * =========================================================
 */

const DOCUMENT_TYPES = [
    {
        value: "CONTRACT",
        label: "Contract",
    },
    {
        value: "ID_DOCUMENT",
        label: "ID Document",
    },
    {
        value: "CERTIFICATE",
        label: "Certificate",
    },
    {
        value: "CV",
        label: "CV",
    },
    {
        value: "RESUME",
        label: "Resume",
    },
    {
        value: "QUALIFICATION",
        label: "Qualification",
    },
    {
        value: "PERFORMANCE_REVIEW",
        label: "Performance Review",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];


/*
 * =========================================================
 * EMPTY FORM
 * =========================================================
 */

const EMPTY_FORM = {
    employeeId: "",
    name: "",
    description: "",
    type: "OTHER",
    file: null,
};


/*
 * =========================================================
 * FILE SIZE
 * =========================================================
 */

function formatFileSize(bytes) {

    if (
        bytes === null ||
        bytes === undefined ||
        Number.isNaN(Number(bytes))
    ) {
        return "—";
    }


    const value =
        Number(bytes);


    if (value < 1024) {
        return `${value} B`;
    }


    if (value < 1024 * 1024) {
        return `${Math.round(
            value / 1024
        )} KB`;
    }


    if (value < 1024 * 1024 * 1024) {
        return `${(
            value /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    }


    return `${(
        value /
        (1024 * 1024 * 1024)
    ).toFixed(1)} GB`;
}


/*
 * =========================================================
 * DOCUMENT TYPE LABEL
 * =========================================================
 */

function documentTypeLabel(
    type
) {

    const found =
        DOCUMENT_TYPES.find(
            (item) =>
                item.value === type
        );


    return (
        found?.label ||
        type ||
        "Other"
    );
}


/*
 * =========================================================
 * FILE EXTENSION
 * =========================================================
 */

function getFileExtension(
    documentRecord
) {

    const fileName =
        documentRecord?.fileName ||
        documentRecord?.name ||
        "";


    const parts =
        fileName.split(".");


    if (parts.length < 2) {
        return "FILE";
    }


    return parts
        .pop()
        .toUpperCase();
}


/*
 * =========================================================
 * DOCUMENT ICON
 * =========================================================
 */

function DocumentIcon() {

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <FileText size={22} />
        </div>
    );
}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function EmployeeDocuments() {

    /*
     * -------------------------------------------------------
     * DATA
     * -------------------------------------------------------
     */

    const [
        items,
        setItems,
    ] = useState([]);


    const [
        employees,
        setEmployees,
    ] = useState([]);


    /*
     * -------------------------------------------------------
     * FILTERS
     * -------------------------------------------------------
     */

    const [
        employeeId,
        setEmployeeId,
    ] = useState("");


    const [
        type,
        setType,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    /*
     * -------------------------------------------------------
     * LOADING
     * -------------------------------------------------------
     */

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    /*
     * -------------------------------------------------------
     * CREATE / EDIT MODAL
     * -------------------------------------------------------
     */

    const [
        modal,
        setModal,
    ] = useState(false);


    const [
        edit,
        setEdit,
    ] = useState(null);


    const [
        form,
        setForm,
    ] = useState({
        ...EMPTY_FORM,
    });


    const [
        saving,
        setSaving,
    ] = useState(false);


    /*
     * -------------------------------------------------------
     * DOWNLOAD STATE
     * -------------------------------------------------------
     */

    const [
        downloadingId,
        setDownloadingId,
    ] = useState(null);


    /*
     * -------------------------------------------------------
     * DELETE CONFIRMATION
     * -------------------------------------------------------
     *
     * Replaces window.confirm().
     */

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState(null);


    const [
        deleting,
        setDeleting,
    ] = useState(false);


    /*
     * =======================================================
     * LOAD
     * =======================================================
     */

    const load =
        useCallback(
            async (
                refresh = false
            ) => {

                try {

                    if (refresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }


                    setError("");


                    const [
                        documentsResponse,
                        employeesResponse,
                    ] =
                        await Promise.all([

                            getEmployeeDocuments({
                                employeeId,
                                type,
                            }),

                            getEmployees({
                                page: 1,
                                limit: 100,
                            }),

                        ]);


                    setItems(
                        arrayData(
                            documentsResponse
                        )
                    );


                    setEmployees(
                        arrayData(
                            employeesResponse,
                            [
                                "employees",
                            ]
                        )
                    );

                } catch (err) {

                    console.error(
                        "Failed to load employee documents:",
                        err
                    );


                    setError(
                        getError(
                            err,
                            "Unable to load employee documents."
                        )
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }

            },
            [
                employeeId,
                type,
            ]
        );


    /*
     * =======================================================
     * LOAD WHEN FILTER CHANGES
     * =======================================================
     */

    useEffect(
        () => {

            load();

        },
        [
            load,
        ]
    );


    /*
     * =======================================================
     * SEARCH
     * =======================================================
     */

    const filtered =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                if (!query) {
                    return items;
                }


                return items.filter(
                    (
                        documentRecord
                    ) => {

                        const employee =
                            employees.find(
                                (
                                    item
                                ) =>
                                    item.id ===
                                    documentRecord.employeeId
                            );


                        const employeeName =
                            nameOf(
                                employee,
                                "Unknown employee"
                            )
                                .toLowerCase();


                        const uploadedBy =
                            nameOf(
                                documentRecord.uploadedBy
                            )
                                .toLowerCase();


                        const documentName =
                            String(
                                documentRecord.name ||
                                documentRecord.fileName ||
                                ""
                            )
                                .toLowerCase();


                        const documentType =
                            documentTypeLabel(
                                documentRecord.type
                            )
                                .toLowerCase();


                        return (
                            employeeName.includes(
                                query
                            ) ||
                            uploadedBy.includes(
                                query
                            ) ||
                            documentName.includes(
                                query
                            ) ||
                            documentType.includes(
                                query
                            )
                        );
                    }
                );

            },
            [
                items,
                employees,
                search,
            ]
        );


    /*
     * =======================================================
     * FORM FIELD
     * =======================================================
     */

    function updateFormField(
        field,
        value
    ) {

        setForm(
            (
                current
            ) => ({

                ...current,

                [field]:
                    value,
            })
        );
    }


    /*
     * =======================================================
     * OPEN CREATE / EDIT
     * =======================================================
     */

    function open(
        documentRecord = null
    ) {

        setError("");

        setEdit(
            documentRecord
        );


        if (
            documentRecord
        ) {

            setForm({

                employeeId:
                    documentRecord.employeeId ||
                    "",

                name:
                    documentRecord.name ||
                    "",

                description:
                    documentRecord.description ||
                    "",

                type:
                    documentRecord.type ||
                    "OTHER",

                file:
                    null,
            });

        } else {

            setForm({
                ...EMPTY_FORM,
            });
        }


        setModal(true);
    }


    /*
     * =======================================================
     * CLOSE CREATE / EDIT MODAL
     * =======================================================
     */

    function closeModal() {

        if (saving) {
            return;
        }


        setModal(false);

        setEdit(null);

        setForm({
            ...EMPTY_FORM,
        });
    }


    /*
     * =======================================================
     * SAVE
     * =======================================================
     */

    async function save(
        event
    ) {

        event.preventDefault();


        try {

            setSaving(true);

            setError("");


            /*
             * CREATE
             */

            if (!edit) {

                if (!form.employeeId) {

                    setError(
                        "Please select an employee."
                    );

                    return;
                }


                if (!form.file) {

                    setError(
                        "Please select a file to upload."
                    );

                    return;
                }


                await createEmployeeDocument(
                    form.employeeId,
                    {
                        name:
                            form.name.trim(),

                        description:
                            form.description.trim(),

                        type:
                            form.type,

                        file:
                            form.file,
                    }
                );

            }


            /*
             * UPDATE
             */

            else {

                const payload = {

                    name:
                        form.name.trim(),

                    description:
                        form.description.trim(),

                    type:
                        form.type,
                };


                if (
                    form.file
                ) {

                    payload.file =
                        form.file;
                }


                await updateEmployeeDocument(
                    edit.id,
                    payload
                );
            }


            closeModal();

            await load(true);

        } catch (err) {

            console.error(
                "Failed to save employee document:",
                err
            );


            setError(
                getError(
                    err,
                    "Unable to save document."
                )
            );

        } finally {

            setSaving(false);
        }
    }


    /*
     * =======================================================
     * GET SIGNED DOWNLOAD URL
     * =======================================================
     */

    async function getSecureDocumentUrl(
        documentRecord
    ) {

        if (
            !documentRecord?.id
        ) {

            throw new Error(
                "Document ID is missing."
            );
        }


        const response =
            await getEmployeeDocumentDownloadUrl(
                documentRecord.id
            );


        /*
         * apiRequest() may return:
         *
         * {
         *     success: true,
         *     data: {...}
         * }
         *
         * or the data directly.
         */

        const responseData =
            response?.data ??
            response;


        const signedUrl =
            responseData?.url ||
            responseData?.signedUrl;


        if (!signedUrl) {

            throw new Error(
                "Secure document URL was not returned by the server."
            );
        }


        return {
            ...responseData,
            url:
                signedUrl,
        };
    }


    /*
     * =======================================================
     * DOWNLOAD
     * =======================================================
     */

    async function downloadDocument(
        documentRecord
    ) {

        if (
            !documentRecord?.id
        ) {
            return;
        }


        try {

            setError("");

            setDownloadingId(
                documentRecord.id
            );


            const data =
                await getSecureDocumentUrl(
                    documentRecord
                );


            /*
             * Fetch the signed Cloudinary URL.
             */

            const fileResponse =
                await fetch(
                    data.url
                );


            if (
                !fileResponse.ok
            ) {

                throw new Error(
                    `Unable to download document (${fileResponse.status}).`
                );
            }


            const blob =
                await fileResponse.blob();


            const objectUrl =
                window.URL.createObjectURL(
                    blob
                );


            /*
             * IMPORTANT:
             *
             * Do not use "document" as the
             * function parameter name.
             *
             * It shadows the browser's global
             * document object.
             */

            const anchor =
                globalThis.document.createElement(
                    "a"
                );


            anchor.href =
                objectUrl;


            anchor.download =
                data.fileName ||
                documentRecord.fileName ||
                documentRecord.name ||
                "employee-document";


            anchor.style.display =
                "none";


            globalThis.document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();


            /*
             * Give the browser a moment to
             * start consuming the blob before
             * releasing the object URL.
             */

            window.setTimeout(
                () => {

                    window.URL.revokeObjectURL(
                        objectUrl
                    );

                },
                1000
            );

        } catch (err) {

            console.error(
                "Failed to download employee document:",
                err
            );


            setError(
                getError(
                    err,
                    "Unable to download document."
                )
            );

        } finally {

            setDownloadingId(
                null
            );
        }
    }


    /*
     * =======================================================
     * OPEN DOCUMENT
     * =======================================================
     */

    async function openDocument(
        documentRecord
    ) {

        if (
            !documentRecord?.id
        ) {
            return;
        }


        try {

            setError("");


            const data =
                await getSecureDocumentUrl(
                    documentRecord
                );


            /*
             * Open in a new browser tab.
             *
             * PDFs/images will normally preview.
             * Other formats may download depending
             * on browser behavior.
             */

            const newWindow =
                window.open(
                    data.url,
                    "_blank",
                    "noopener,noreferrer"
                );


            /*
             * Popup blockers can prevent window.open().
             */

            if (!newWindow) {

                throw new Error(
                    "The browser blocked the document window. Please allow pop-ups for NTS BMS and try again."
                );
            }

        } catch (err) {

            console.error(
                "Failed to open employee document:",
                err
            );


            setError(
                getError(
                    err,
                    "Unable to open document."
                )
            );
        }
    }


    /*
     * =======================================================
     * REQUEST DELETE
     * =======================================================
     *
     * This only opens the confirmation dialog.
     *
     * It does NOT delete anything.
     */

    function requestDelete(
        documentRecord
    ) {

        setError("");

        setDeleteTarget(
            documentRecord
        );
    }


    /*
     * =======================================================
     * CANCEL DELETE
     * =======================================================
     */

    function cancelDelete() {

        if (deleting) {
            return;
        }


        setDeleteTarget(
            null
        );
    }


    /*
     * =======================================================
     * CONFIRM DELETE
     * =======================================================
     */

    async function confirmDelete() {

        if (
            !deleteTarget?.id
        ) {
            return;
        }


        try {

            setDeleting(true);

            setError("");


            await deleteEmployeeDocument(
                deleteTarget.id
            );


            setDeleteTarget(
                null
            );


            await load(true);

        } catch (err) {

            console.error(
                "Failed to delete employee document:",
                err
            );


            setError(
                getError(
                    err,
                    "Unable to delete document."
                )
            );

        } finally {

            setDeleting(false);
        }
    }


    /*
     * =======================================================
     * CLEAR FILTERS
     * =======================================================
     */

    function clearFilters() {

        setEmployeeId("");

        setType("");

        setSearch("");
    }


    /*
     * =======================================================
     * RENDER
     * =======================================================
     */

    return (

        <div className="p-4 sm:p-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <PageHeader
                icon={FileText}
                title="Employee Documents"
                description="Securely manage employee contracts, certificates and other records."
                onRefresh={() =>
                    load(true)
                }
                refreshing={
                    refreshing
                }
                action={

                    <Button
                        onClick={() =>
                            open()
                        }
                    >

                        <Plus size={16} />

                        Upload document

                    </Button>
                }
            />


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="mt-4">

                    <ErrorBox
                        message={
                            error
                        }
                    />

                </div>
            )}


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">

                    <SearchBox
                        value={
                            search
                        }
                        onChange={
                            setSearch
                        }
                        placeholder="Search documents or employees..."
                    />


                    <select
                        className={
                            selectClass
                        }
                        value={
                            employeeId
                        }
                        onChange={(
                            event
                        ) =>
                            setEmployeeId(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All employees
                        </option>

                        {employees.map(
                            (
                                employee
                            ) => (

                                <option
                                    key={
                                        employee.id
                                    }
                                    value={
                                        employee.id
                                    }
                                >

                                    {nameOf(
                                        employee
                                    )}

                                </option>
                            )
                        )}

                    </select>


                    <select
                        className={
                            selectClass
                        }
                        value={
                            type
                        }
                        onChange={(
                            event
                        ) =>
                            setType(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All document types
                        </option>

                        {DOCUMENT_TYPES.map(
                            (
                                documentType
                            ) => (

                                <option
                                    key={
                                        documentType.value
                                    }
                                    value={
                                        documentType.value
                                    }
                                >

                                    {
                                        documentType.label
                                    }

                                </option>
                            )
                        )}

                    </select>


                    {(employeeId ||
                        type ||
                        search) && (

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear
                        </Button>
                    )}

                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            {!loading &&
                filtered.length > 0 && (

                <div className="mt-5 flex items-center justify-between">

                    <div>

                        <h2 className="text-sm font-semibold text-[var(--bms-text)]">
                            Employee documents
                        </h2>

                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                            {filtered.length}

                            {" "}

                            {filtered.length === 1
                                ? "document"
                                : "documents"}

                            {" "}
                            found

                        </p>

                    </div>

                </div>
            )}


            {/* =================================================
                DOCUMENT CARDS
            ================================================= */}

            <div className="mt-4">

                {loading ? (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text="Loading documents..."
                        />

                    </div>

                ) : filtered.length === 0 ? (

                    <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <Empty
                            text="No employee documents found."
                        />

                    </div>

                ) : (

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {filtered.map(
                            (
                                documentRecord
                            ) => {

                                const employee =
                                    employees.find(
                                        (
                                            item
                                        ) =>
                                            item.id ===
                                            documentRecord.employeeId
                                    );


                                const isDownloading =
                                    downloadingId ===
                                    documentRecord.id;


                                return (

                                    <article
                                        key={
                                            documentRecord.id
                                        }
                                        className="group flex min-h-[310px] flex-col overflow-hidden rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl"
                                    >

                                        {/* =================================
                                            HEADER
                                        ================================= */}

                                        <div className="border-b border-[var(--bms-border)] p-5">

                                            <div className="flex items-start justify-between gap-3">

                                                <DocumentIcon />

                                                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-500">

                                                    {
                                                        documentTypeLabel(
                                                            documentRecord.type
                                                        )
                                                    }

                                                </span>

                                            </div>


                                            <h3 className="mt-4 line-clamp-2 break-words text-base font-semibold text-[var(--bms-text)]">

                                                {
                                                    documentRecord.name ||
                                                    documentRecord.fileName ||
                                                    "Unnamed document"
                                                }

                                            </h3>


                                            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--bms-text-secondary)]">

                                                <UserRound
                                                    size={14}
                                                    className="shrink-0 text-[var(--bms-text-muted)]"
                                                />

                                                <span className="truncate">

                                                    {nameOf(
                                                        employee,
                                                        "Unknown employee"
                                                    )}

                                                </span>

                                            </div>

                                        </div>


                                        {/* =================================
                                            BODY
                                        ================================= */}

                                        <div className="flex flex-1 flex-col p-5">

                                            {documentRecord.description ? (

                                                <p className="line-clamp-3 text-sm leading-6 text-[var(--bms-text-secondary)]">

                                                    {
                                                        documentRecord.description
                                                    }

                                                </p>

                                            ) : (

                                                <p className="text-sm italic text-[var(--bms-text-muted)]">

                                                    No description provided.

                                                </p>
                                            )}


                                            <div className="mt-auto grid grid-cols-2 gap-3 pt-5">

                                                <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">

                                                    <div className="flex items-center gap-2">

                                                        <FileType2
                                                            size={14}
                                                            className="text-blue-500"
                                                        />

                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                                                            File
                                                        </p>

                                                    </div>


                                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--bms-text)]">

                                                        {
                                                            getFileExtension(
                                                                documentRecord
                                                            )
                                                        }

                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-[var(--bms-surface-soft)] p-3">

                                                    <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                                                        Size
                                                    </p>


                                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--bms-text)]">

                                                        {
                                                            formatFileSize(
                                                                documentRecord.fileSize
                                                            )
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--bms-text-muted)]">

                                                <CalendarDays
                                                    size={13}
                                                />

                                                Uploaded{" "}

                                                {dateOf(
                                                    documentRecord.createdAt
                                                )}

                                            </div>

                                        </div>


                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <div className="flex items-center justify-between border-t border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-4 py-3">

                                            <div className="flex items-center gap-1">

                                                {/* OPEN */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDocument(
                                                            documentRecord
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-500/10"
                                                    title="Open document"
                                                    aria-label={`Open ${documentRecord.name || "document"}`}
                                                >

                                                    <FileText
                                                        size={15}
                                                    />

                                                    Open

                                                </button>


                                                {/* DOWNLOAD */}

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isDownloading
                                                    }
                                                    onClick={() =>
                                                        downloadDocument(
                                                            documentRecord
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--bms-text-secondary)] transition-colors hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Download document"
                                                    aria-label={`Download ${documentRecord.name || "document"}`}
                                                >

                                                    {isDownloading ? (

                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />

                                                    ) : (

                                                        <Download
                                                            size={15}
                                                        />

                                                    )}

                                                    {isDownloading
                                                        ? "Downloading..."
                                                        : "Download"}

                                                </button>

                                            </div>


                                            <div className="flex items-center gap-1">

                                                {/* EDIT */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        open(
                                                            documentRecord
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-[var(--bms-text-muted)] transition-colors hover:bg-[var(--bms-surface)] hover:text-[var(--bms-text)]"
                                                    title="Edit document"
                                                    aria-label={`Edit ${documentRecord.name || "document"}`}
                                                >

                                                    <Pencil
                                                        size={16}
                                                    />

                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        requestDelete(
                                                            documentRecord
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                                                    title="Delete document"
                                                    aria-label={`Delete ${documentRecord.name || "document"}`}
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>
                )}

            </div>


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            <Modal
                open={
                    modal
                }
                onClose={
                    closeModal
                }
                title={
                    edit
                        ? "Edit document"
                        : "Upload employee document"
                }
                width="max-w-2xl"
            >

                <form
                    onSubmit={
                        save
                    }
                    className="space-y-4 p-5"
                >

                    {!edit && (

                        <Field
                            label="Employee"
                            required
                        >

                            <select
                                className={
                                    selectClass
                                }
                                required
                                value={
                                    form.employeeId
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateFormField(
                                        "employeeId",
                                        event.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select employee
                                </option>

                                {employees.map(
                                    (
                                        employee
                                    ) => (

                                        <option
                                            key={
                                                employee.id
                                            }
                                            value={
                                                employee.id
                                            }
                                        >

                                            {nameOf(
                                                employee
                                            )}

                                        </option>
                                    )
                                )}

                            </select>

                        </Field>
                    )}


                    <Field
                        label="Document name"
                    >

                        <input
                            type="text"
                            className={
                                inputClass
                            }
                            value={
                                form.name
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "name",
                                    event.target.value
                                )
                            }
                            maxLength={200}
                            placeholder="Defaults to file name"
                        />

                    </Field>


                    <Field
                        label="Type"
                        required
                    >

                        <select
                            className={
                                selectClass
                            }
                            required
                            value={
                                form.type
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "type",
                                    event.target.value
                                )
                            }
                        >

                            {DOCUMENT_TYPES.map(
                                (
                                    documentType
                                ) => (

                                    <option
                                        key={
                                            documentType.value
                                        }
                                        value={
                                            documentType.value
                                        }
                                    >

                                        {
                                            documentType.label
                                        }

                                    </option>
                                )
                            )}

                        </select>

                    </Field>


                    <Field
                        label="Description"
                    >

                        <textarea
                            className={
                                textareaClass
                            }
                            value={
                                form.description
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "description",
                                    event.target.value
                                )
                            }
                            maxLength={2000}
                        />

                    </Field>


                    <Field
                        label={
                            edit
                                ? "Replace file (optional)"
                                : "File"
                        }
                        required={
                            !edit
                        }
                    >

                        <input
                            type="file"
                            required={
                                !edit
                            }
                            onChange={(
                                event
                            ) =>
                                updateFormField(
                                    "file",
                                    event.target.files?.[0] ||
                                    null
                                )
                            }
                            className="block w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] px-3 py-2 text-sm text-[var(--bms-text)] file:mr-3 file:rounded-md file:border-0 file:bg-blue-500/10 file:px-3 file:py-1.5 file:text-sm file:text-blue-500"
                        />


                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                            Maximum 25 MB. PDF, Office documents,
                            TXT, CSV, JPG, PNG and WEBP are supported.

                        </p>

                    </Field>


                    <div className="flex justify-end gap-2">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                closeModal
                            }
                            disabled={
                                saving
                            }
                        >
                            Cancel
                        </Button>


                        <Button
                            type="submit"
                            disabled={
                                saving
                            }
                        >

                            {saving
                                ? edit
                                    ? "Saving..."
                                    : "Uploading..."
                                : edit
                                    ? "Save changes"
                                    : "Upload document"}

                        </Button>

                    </div>

                </form>

            </Modal>


            {/* =================================================
                DELETE CONFIRMATION MODAL
            ================================================= */}

            {deleteTarget && (

                <Modal
                    open={
                        true
                    }
                    onClose={
                        cancelDelete
                    }
                    title="Delete employee document"
                    width="max-w-md"
                >

                    <div className="p-5">

                        {/* WARNING ICON */}

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">

                                <AlertTriangle
                                    size={22}
                                />

                            </div>


                            <div className="min-w-0">

                                <h3 className="text-sm font-semibold text-[var(--bms-text)]">

                                    Are you sure you want to delete this document?

                                </h3>


                                <p className="mt-2 text-sm leading-6 text-[var(--bms-text-secondary)]">

                                    You are about to permanently delete{" "}

                                    <span className="font-semibold text-[var(--bms-text)]">

                                        "
                                        {
                                            deleteTarget.name ||
                                            deleteTarget.fileName ||
                                            "this document"
                                        }
                                        "

                                    </span>

                                    . This action cannot be undone.

                                </p>

                            </div>

                        </div>


                        {/* DOCUMENT INFO */}

                        <div className="mt-5 rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">

                                    <FileText
                                        size={18}
                                    />

                                </div>


                                <div className="min-w-0">

                                    <p className="truncate text-sm font-medium text-[var(--bms-text)]">

                                        {
                                            deleteTarget.name ||
                                            deleteTarget.fileName ||
                                            "Unnamed document"
                                        }

                                    </p>


                                    <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                                        {
                                            documentTypeLabel(
                                                deleteTarget.type
                                            )
                                        }

                                        {" · "}

                                        {
                                            formatFileSize(
                                                deleteTarget.fileSize
                                            )
                                        }

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    cancelDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] transition-colors hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <X
                                    size={15}
                                />

                                Cancel

                            </button>


                            <button
                                type="button"
                                onClick={
                                    confirmDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {deleting ? (

                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />

                                ) : (

                                    <Trash2
                                        size={15}
                                    />

                                )}

                                {deleting
                                    ? "Deleting..."
                                    : "Delete document"}

                            </button>

                        </div>

                    </div>

                </Modal>
            )}

        </div>
    );
}