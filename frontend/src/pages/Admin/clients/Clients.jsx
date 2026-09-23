import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Edit3,
    Eye,
    Globe,
    Mail,
    MapPin,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
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
    createClient,
    deleteClient,
    getClients,
    updateClient,
    updateClientStatus,
} from "../../../api/clients";


/*
 * ==================================================
 * CONSTANTS
 * ==================================================
 */

const EMPTY_FORM = {

    name: "",

    email: "",

    phone: "",

    address: "",

    website: "",

    isActive: true,

};


const STATUS_FILTERS = [

    {
        value: "ALL",
        label: "All Statuses",
    },

    {
        value: "ACTIVE",
        label: "Active",
    },

    {
        value: "INACTIVE",
        label: "Inactive",
    },

];


/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    ).format(date);

}


/*
 * ==================================================
 * MAIN COMPONENT
 * ==================================================
 */

export default function Clients() {

    const navigate =
        useNavigate();


    /*
     * ==================================================
     * STATE
     * ==================================================
     */

    const [
        clients,
        setClients
    ] = useState([]);


    const [
        isLoading,
        setIsLoading
    ] = useState(true);


    const [
        isRefreshing,
        setIsRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState(null);


    const [
        successMessage,
        setSuccessMessage
    ] = useState(null);


    const [
        searchQuery,
        setSearchQuery
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");


    /*
     * MODALS
     */

    const [
        showCreateModal,
        setShowCreateModal
    ] = useState(false);


    const [
        showEditModal,
        setShowEditModal
    ] = useState(false);


    const [
        showDeleteModal,
        setShowDeleteModal
    ] = useState(false);


    const [
        showStatusModal,
        setShowStatusModal
    ] = useState(false);


    const [
        selectedClient,
        setSelectedClient
    ] = useState(null);


    /*
     * FORM
     */

    const [
        form,
        setForm
    ] = useState(
        EMPTY_FORM
    );


    const [
        formErrors,
        setFormErrors
    ] = useState({});


    const [
        isSaving,
        setIsSaving
    ] = useState(false);


    const [
        isDeleting,
        setIsDeleting
    ] = useState(false);


    const [
        isUpdatingStatus,
        setIsUpdatingStatus
    ] = useState(false);


    /*
     * ==================================================
     * LOAD CLIENTS
     * ==================================================
     */

    const loadClients =
        useCallback(
            async ({
                refresh = false,
            } = {}) => {

                try {

                    if (refresh) {

                        setIsRefreshing(
                            true
                        );

                    } else {

                        setIsLoading(
                            true
                        );

                    }


                    setError(
                        null
                    );


                    const response =
                        await getClients();


                    let data = [];


                    if (
                        Array.isArray(
                            response
                        )
                    ) {

                        data =
                            response;

                    } else if (
                        Array.isArray(
                            response?.data
                        )
                    ) {

                        data =
                            response.data;

                    } else if (
                        Array.isArray(
                            response?.data?.clients
                        )
                    ) {

                        data =
                            response.data.clients;

                    } else if (
                        Array.isArray(
                            response?.clients
                        )
                    ) {

                        data =
                            response.clients;

                    }


                    setClients(
                        data
                    );

                } catch (err) {

                    console.error(
                        "Failed to load clients:",
                        err
                    );


                    setClients(
                        []
                    );


                    setError(
                        err?.message ||
                        "Unable to load clients."
                    );

                } finally {

                    setIsLoading(
                        false
                    );

                    setIsRefreshing(
                        false
                    );

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

        loadClients();

    }, [
        loadClients
    ]);


    /*
     * ==================================================
     * SUCCESS MESSAGE AUTO CLEAR
     * ==================================================
     */

    useEffect(() => {

        if (
            !successMessage
        ) {

            return undefined;

        }


        const timer =
            window.setTimeout(
                () => {

                    setSuccessMessage(
                        null
                    );

                },
                3500
            );


        return () => {

            window.clearTimeout(
                timer
            );

        };

    }, [
        successMessage
    ]);


    /*
     * ==================================================
     * FILTER CLIENTS
     * ==================================================
     */

    const filteredClients =
        useMemo(
            () => {

                const query =
                    searchQuery
                        .trim()
                        .toLowerCase();


                return clients.filter(
                    (client) => {

                        const name =
                            client.name
                                ?.toLowerCase() ||
                            "";


                        const email =
                            client.email
                                ?.toLowerCase() ||
                            "";


                        const phone =
                            client.phone
                                ?.toLowerCase() ||
                            "";


                        const address =
                            client.address
                                ?.toLowerCase() ||
                            "";


                        const matchesSearch =
                            !query ||
                            name.includes(
                                query
                            ) ||
                            email.includes(
                                query
                            ) ||
                            phone.includes(
                                query
                            ) ||
                            address.includes(
                                query
                            );


                        const matchesStatus =
                            statusFilter ===
                                "ALL" ||

                            (
                                statusFilter ===
                                    "ACTIVE" &&
                                client.isActive
                            ) ||

                            (
                                statusFilter ===
                                    "INACTIVE" &&
                                !client.isActive
                            );


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

            },
            [
                clients,
                searchQuery,
                statusFilter,
            ]
        );


    /*
     * ==================================================
     * STATISTICS
     * ==================================================
     */

    const totalClients =
        clients.length;


    const activeClients =
        clients.filter(
            (client) =>
                client.isActive
        ).length;


    const inactiveClients =
        clients.filter(
            (client) =>
                !client.isActive
        ).length;


    const totalProjects =
        clients.reduce(
            (
                total,
                client
            ) =>
                total +
                Number(
                    client._count
                        ?.projects || 0
                ),
            0
        );


    /*
     * ==================================================
     * FORM HANDLING
     * ==================================================
     */

    function updateForm(
        field,
        value
    ) {

        setForm(
            (current) => ({
                ...current,
                [field]:
                    value,
            })
        );


        if (
            formErrors[field]
        ) {

            setFormErrors(
                (current) => {

                    const next = {
                        ...current,
                    };


                    delete next[field];


                    return next;

                }
            );

        }

    }


    function validateForm() {

        const errors = {};


        const name =
            form.name.trim();


        if (!name) {

            errors.name =
                "Client name is required.";

        } else if (
            name.length < 2
        ) {

            errors.name =
                "Client name must be at least 2 characters.";

        } else if (
            name.length > 150
        ) {

            errors.name =
                "Client name must not exceed 150 characters.";

        }


        if (
            form.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email.trim()
            )
        ) {

            errors.email =
                "Enter a valid email address.";

        }


        if (
            form.website.trim() &&
            !/^https?:\/\/.+/i.test(
                form.website.trim()
            )
        ) {

            errors.website =
                "Website must start with http:// or https://.";

        }


        setFormErrors(
            errors
        );


        return (
            Object.keys(
                errors
            ).length === 0
        );

    }


    /*
     * ==================================================
     * CREATE MODAL
     * ==================================================
     */

    function openCreateModal() {

        setSelectedClient(
            null
        );


        setForm(
            EMPTY_FORM
        );


        setFormErrors(
            {}
        );


        setShowCreateModal(
            true
        );

    }


    function closeCreateModal() {

        if (
            isSaving
        ) {

            return;

        }


        setShowCreateModal(
            false
        );


        setForm(
            EMPTY_FORM
        );


        setFormErrors(
            {}
        );

    }


    /*
     * ==================================================
     * EDIT MODAL
     * ==================================================
     */

    function openEditModal(
        client
    ) {

        setSelectedClient(
            client
        );


        setForm({

            name:
                client.name || "",

            email:
                client.email || "",

            phone:
                client.phone || "",

            address:
                client.address || "",

            website:
                client.website || "",

            isActive:
                Boolean(
                    client.isActive
                ),

        });


        setFormErrors(
            {}
        );


        setShowEditModal(
            true
        );

    }


    function closeEditModal() {

        if (
            isSaving
        ) {

            return;

        }


        setShowEditModal(
            false
        );


        setSelectedClient(
            null
        );


        setFormErrors(
            {}
        );

    }


    /*
     * ==================================================
     * SAVE CLIENT
     * ==================================================
     */

    async function handleCreateClient(
        event
    ) {

        event.preventDefault();


        if (
            !validateForm()
        ) {

            return;

        }


        try {

            setIsSaving(
                true
            );


            setError(
                null
            );


            await createClient({

                name:
                    form.name,

                email:
                    form.email,

                phone:
                    form.phone,

                address:
                    form.address,

                website:
                    form.website,

                isActive:
                    form.isActive,

            });


            setShowCreateModal(
                false
            );


            setForm(
                EMPTY_FORM
            );


            setSuccessMessage(
                "Client created successfully."
            );


            await loadClients();

        } catch (err) {

            console.error(
                "Failed to create client:",
                err
            );


            setFormErrors({

                general:
                    err?.message ||
                    "Unable to create client.",

            });

        } finally {

            setIsSaving(
                false
            );

        }

    }


    async function handleUpdateClient(
        event
    ) {

        event.preventDefault();


        if (
            !selectedClient
        ) {

            return;

        }


        if (
            !validateForm()
        ) {

            return;

        }


        try {

            setIsSaving(
                true
            );


            setError(
                null
            );


            await updateClient(

                selectedClient.id,

                {

                    name:
                        form.name,

                    email:
                        form.email,

                    phone:
                        form.phone,

                    address:
                        form.address,

                    website:
                        form.website,

                }

            );


            setShowEditModal(
                false
            );


            setSuccessMessage(
                "Client updated successfully."
            );


            await loadClients();

        } catch (err) {

            console.error(
                "Failed to update client:",
                err
            );


            setFormErrors({

                general:
                    err?.message ||
                    "Unable to update client.",

            });

        } finally {

            setIsSaving(
                false
            );

        }

    }


    /*
     * ==================================================
     * STATUS
     * ==================================================
     */

    function openStatusModal(
        client
    ) {

        setSelectedClient(
            client
        );


        setShowStatusModal(
            true
        );

    }


    function closeStatusModal() {

        if (
            isUpdatingStatus
        ) {

            return;

        }


        setShowStatusModal(
            false
        );


        setSelectedClient(
            null
        );

    }


    async function handleStatusChange() {

        if (
            !selectedClient
        ) {

            return;

        }


        try {

            setIsUpdatingStatus(
                true
            );


            await updateClientStatus(

                selectedClient.id,

                !selectedClient.isActive

            );


            setShowStatusModal(
                false
            );


            setSuccessMessage(

                selectedClient.isActive

                    ? "Client deactivated successfully."

                    : "Client activated successfully."

            );


            await loadClients();

        } catch (err) {

            setError(
                err?.message ||
                "Unable to update client status."
            );

        } finally {

            setIsUpdatingStatus(
                false
            );

        }

    }


    /*
     * ==================================================
     * DELETE
     * ==================================================
     */

    function openDeleteModal(
        client
    ) {

        setSelectedClient(
            client
        );


        setShowDeleteModal(
            true
        );

    }


    function closeDeleteModal() {

        if (
            isDeleting
        ) {

            return;

        }


        setShowDeleteModal(
            false
        );


        setSelectedClient(
            null
        );

    }


    async function handleDeleteClient() {

        if (
            !selectedClient
        ) {

            return;

        }


        try {

            setIsDeleting(
                true
            );


            await deleteClient(
                selectedClient.id
            );


            setShowDeleteModal(
                false
            );


            setSuccessMessage(
                "Client deleted successfully."
            );


            await loadClients();

        } catch (err) {

            setError(
                err?.message ||
                "Unable to delete client."
            );

        } finally {

            setIsDeleting(
                false
            );

        }

    }


    /*
     * ==================================================
     * ESCAPE KEY
     * ==================================================
     */

    useEffect(() => {

        function handleKeyDown(
            event
        ) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            if (
                showCreateModal
            ) {

                closeCreateModal();

            }


            if (
                showEditModal
            ) {

                closeEditModal();

            }


            if (
                showDeleteModal
            ) {

                closeDeleteModal();

            }


            if (
                showStatusModal
            ) {

                closeStatusModal();

            }

        }


        window.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    });


    /*
     * ==================================================
     * RENDER
     * ==================================================
     */

    return (

        <div className="space-y-6">

            {/* =========================================
                HEADER
            ========================================== */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <div>

                            <h1 className="text-xl font-semibold text-[var(--bms-text)]">

                                Company Clients

                            </h1>

                            <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">

                                Manage clients and monitor their projects.

                            </p>

                        </div>

                    </div>

                </div>


                <div className="flex flex-wrap items-center gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            loadClients({
                                refresh: true,
                            })
                        }
                        disabled={
                            isRefreshing
                        }
                        title="Refresh clients"
                        aria-label="Refresh clients"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:cursor-not-allowed disabled:opacity-50"
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


                    <button
                        type="button"
                        onClick={
                            openCreateModal
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                    >

                        <Plus
                            size={17}
                        />

                        Add Client

                    </button>

                </div>

            </div>


            {/* =========================================
                SUCCESS
            ========================================== */}

            {successMessage && (

                <div
                    role="status"
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
                >

                    <CheckCircle2
                        size={18}
                    />

                    <span>
                        {successMessage}
                    </span>

                </div>

            )}


            {/* =========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">

                    <div className="flex items-start gap-3">

                        <XCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <span>
                            {error}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setError(
                                null
                            )
                        }
                        className="shrink-0 opacity-70 hover:opacity-100"
                        aria-label="Dismiss error"
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>

            )}


            {/* =========================================
                STATISTICS
            ========================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={Building2}
                    label="Total Clients"
                    value={totalClients}
                />

                <StatCard
                    icon={CheckCircle2}
                    label="Active Clients"
                    value={activeClients}
                />

                <StatCard
                    icon={XCircle}
                    label="Inactive Clients"
                    value={inactiveClients}
                />

                <StatCard
                    icon={Users}
                    label="Client Projects"
                    value={totalProjects}
                />

            </div>


            {/* =========================================
                FILTERS
            ========================================== */}

            <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative flex-1 lg:max-w-md">

                        <Search
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                        />

                        <input
                            type="search"
                            value={
                                searchQuery
                            }
                            onChange={(event) =>
                                setSearchQuery(
                                    event.target.value
                                )
                            }
                            placeholder="Search clients..."
                            aria-label="Search clients"
                            className="h-10 w-full rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-9 pr-3 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />

                    </div>


                    <div className="relative">

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            aria-label="Filter clients by status"
                            className="h-10 appearance-none rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] pl-3 pr-9 text-sm text-[var(--bms-text)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >

                            {STATUS_FILTERS.map(
                                (filter) => (

                                    <option
                                        key={
                                            filter.value
                                        }
                                        value={
                                            filter.value
                                        }
                                    >

                                        {
                                            filter.label
                                        }

                                    </option>

                                )
                            )}

                        </select>


                        <ChevronDown
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                        />

                    </div>

                </div>

            </div>


            {/* =========================================
                CLIENTS
            ========================================== */}

            <div className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="flex flex-col gap-3 border-b border-[var(--bms-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                    <div>

                        <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                            Client Directory

                        </h2>

                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                            Manage clients and monitor their projects.

                        </p>

                    </div>

                    <p className="text-xs text-[var(--bms-text-muted)]">

                        {filteredClients.length}{" "}
                        {filteredClients.length === 1
                            ? "client"
                            : "clients"}{" "}
                        shown

                    </p>

                </div>


                {isLoading ? (

                    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-5">

                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="h-72 animate-pulse rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface-soft)]"
                                />

                            )
                        )}

                    </div>

                ) : filteredClients.length === 0 ? (

                    <EmptyState
                        hasFilters={
                            Boolean(searchQuery.trim()) ||
                            statusFilter !== "ALL"
                        }
                        onCreate={openCreateModal}
                    />

                ) : (

                    <>

                        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-5">

                            {filteredClients.map((client) => (

                                <ClientCard
                                    key={client.id}
                                    client={client}
                                    onView={() =>
                                        navigate(`/clients/${client.id}`)
                                    }
                                    onEdit={() =>
                                        openEditModal(client)
                                    }
                                    onStatus={() =>
                                        openStatusModal(client)
                                    }
                                    onDelete={() =>
                                        openDeleteModal(client)
                                    }
                                />

                            ))}

                        </div>

                        <div className="flex flex-col gap-1 border-t border-[var(--bms-border)] px-4 py-3 text-xs text-[var(--bms-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-5">

                            <span>
                                Showing {filteredClients.length} of {clients.length} clients
                            </span>

                            <span>
                                {activeClients} active · {inactiveClients} inactive
                            </span>

                        </div>

                    </>

                )}

            </div>


            {/* =========================================
                CREATE MODAL
            ========================================== */}

            {showCreateModal && (

                <ClientModal
                    title="Create Client"
                    description="Add a new client organization to the BMS."
                    form={form}
                    errors={formErrors}
                    isSaving={isSaving}
                    submitLabel="Create Client"
                    onClose={
                        closeCreateModal
                    }
                    onChange={
                        updateForm
                    }
                    onSubmit={
                        handleCreateClient
                    }
                />

            )}


            {/* =========================================
                EDIT MODAL
            ========================================== */}

            {showEditModal && (

                <ClientModal
                    title="Edit Client"
                    description={`Update information for ${selectedClient?.name || "this client"}.`}
                    form={form}
                    errors={formErrors}
                    isSaving={isSaving}
                    submitLabel="Save Changes"
                    onClose={
                        closeEditModal
                    }
                    onChange={
                        updateForm
                    }
                    onSubmit={
                        handleUpdateClient
                    }
                    isEdit
                />

            )}


            {/* =========================================
                STATUS MODAL
            ========================================== */}

            {showStatusModal && (

                <ConfirmModal
                    title={
                        selectedClient?.isActive
                            ? "Deactivate Client?"
                            : "Activate Client?"
                    }
                    description={
                        selectedClient?.isActive
                            ? `Deactivating "${selectedClient?.name}" will remove it from active client workflows.`
                            : `Activating "${selectedClient?.name}" will make it available as an active client again.`
                    }
                    confirmLabel={
                        selectedClient?.isActive
                            ? "Deactivate"
                            : "Activate"
                    }
                    isLoading={
                        isUpdatingStatus
                    }
                    danger={
                        selectedClient?.isActive
                    }
                    onClose={
                        closeStatusModal
                    }
                    onConfirm={
                        handleStatusChange
                    }
                />

            )}


            {/* =========================================
                DELETE MODAL
            ========================================== */}

            {showDeleteModal && (

                <ConfirmModal
                    title="Delete Client?"
                    description={`This will permanently delete "${selectedClient?.name}". Existing projects are not deleted.`}
                    confirmLabel="Delete Client"
                    isLoading={
                        isDeleting
                    }
                    danger
                    onClose={
                        closeDeleteModal
                    }
                    onConfirm={
                        handleDeleteClient
                    }
                />

            )}

        </div>

    );

}


/*
 * ==================================================
 * STAT CARD
 * ==================================================
 */

function StatCard({

    icon: Icon,

    label,

    value,

}) {

    return (

        <div className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs font-medium text-[var(--bms-text-muted)]">

                        {label}

                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[var(--bms-text)]">

                        {value}

                    </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                    <Icon
                        size={19}
                    />

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * CLIENT CARD
 * ==================================================
 */

function ClientCard({

    client,

    onView,

    onEdit,

    onStatus,

    onDelete,

}) {

    const projectCount =
        Number(client._count?.projects || 0);

    const contact =
        client.email ||
        client.phone ||
        client.website ||
        "No contact information";

    const address =
        client.address?.trim() ||
        "No address provided";

    return (

        <article className="group flex min-h-[280px] flex-col rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-black/5 sm:p-4">

            <div className="flex items-start justify-between gap-3">

                <button
                    type="button"
                    onClick={onView}
                    className="flex min-w-0 items-center gap-3 text-left"
                    aria-label={`View ${client.name}`}
                >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">

                        <Building2
                            size={18}
                            strokeWidth={1.8}
                        />

                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[var(--bms-text)] transition group-hover:text-blue-500">
                            {client.name || "Unnamed client"}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-[var(--bms-text-muted)]">
                            {client.website || client.email || "Client organization"}
                        </p>

                    </div>

                </button>

                <button
                    type="button"
                    onClick={onStatus}
                    className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    aria-label={`${client.isActive ? "Deactivate" : "Activate"} ${client.name}`}
                    title={client.isActive ? "Deactivate client" : "Activate client"}
                >

                    <StatusBadge
                        isActive={client.isActive}
                    />

                </button>

            </div>


            <div className="mt-4 min-h-[46px]">

                <p className="line-clamp-2 text-sm leading-6 text-[var(--bms-text-secondary)]">
                    {address}
                </p>

            </div>


            <div className="mt-4 rounded-lg bg-[var(--bms-surface-soft)] px-3 py-2.5">

                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--bms-text-muted)]">
                    Contact
                </p>

                <p className="mt-1 truncate text-xs text-[var(--bms-text-secondary)]" title={contact}>
                    {contact}
                </p>

            </div>


            <div className="mt-4 space-y-2.5 border-t border-[var(--bms-border)] pt-3">

                <CardMeta
                    icon={Users}
                    label="Projects"
                    value={projectCount}
                />

                <CardMeta
                    icon={Phone}
                    label="Phone"
                    value={client.phone || "—"}
                />

                <CardMeta
                    icon={CalendarDays}
                    label="Created"
                    value={formatDate(client.createdAt)}
                />

            </div>


            <div className="mt-auto flex items-center gap-2 pt-4">

                <button
                    type="button"
                    onClick={onView}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >

                    <Eye
                        size={14}
                    />

                    View Client

                </button>

                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--bms-border)] text-[var(--bms-text-secondary)] transition hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                    aria-label={`Edit ${client.name}`}
                    title="Edit client"
                >

                    <Edit3
                        size={14}
                    />

                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 text-red-500 transition hover:bg-red-500/10"
                    aria-label={`Delete ${client.name}`}
                    title="Delete client"
                >

                    <Trash2
                        size={14}
                    />

                </button>

            </div>

        </article>

    );

}


/*
 * ==================================================
 * CARD META
 * ==================================================
 */

function CardMeta({

    icon: Icon,

    label,

    value,

}) {

    return (

        <div className="flex min-w-0 items-center justify-between gap-3 text-xs">

            <div className="flex min-w-0 items-center gap-2 text-[var(--bms-text-muted)]">

                <Icon
                    size={13}
                    className="shrink-0"
                />

                <span>{label}</span>

            </div>

            <span
                className="max-w-[58%] truncate text-right font-medium text-[var(--bms-text-secondary)]"
                title={String(value ?? "—")}
            >
                {value ?? "—"}
            </span>

        </div>

    );

}


/*
 * ==================================================
 * STATUS BADGE
 * ==================================================
 */

function StatusBadge({

    isActive,

}) {

    return (

        <span
            className={
                isActive

                    ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"

                    : "inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2.5 py-1 text-xs font-medium text-gray-500"
            }
        >

            <span
                className={
                    isActive
                        ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                        : "h-1.5 w-1.5 rounded-full bg-gray-400"
                }
            />

            {
                isActive
                    ? "Active"
                    : "Inactive"
            }

        </span>

    );

}


/*
 * ==================================================
 * EMPTY STATE
 * ==================================================
 */

function EmptyState({

    hasFilters,

    onCreate,

}) {

    return (

        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500">

                <Building2
                    size={25}
                />

            </div>


            <h3 className="mt-4 text-sm font-semibold text-[var(--bms-text)]">

                {
                    hasFilters
                        ? "No clients found"
                        : "No clients yet"
                }

            </h3>


            <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--bms-text-secondary)]">

                {
                    hasFilters
                        ? "Try changing your search or status filter."
                        : "Create your first client to start building the client directory."
                }

            </p>


            {!hasFilters && (

                <button
                    type="button"
                    onClick={
                        onCreate
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                >

                    <Plus
                        size={15}
                    />

                    Create Client

                </button>

            )}

        </div>

    );

}


/*
 * ==================================================
 * CLIENT MODAL
 * ==================================================
 */

function ClientModal({

    title,

    description,

    form,

    errors,

    isSaving,

    submitLabel,

    onClose,

    onChange,

    onSubmit,

    isEdit = false,

}) {

    return (

        <ModalShell
            title={title}
            description={description}
            onClose={onClose}
            isBusy={isSaving}
        >

            <form
                onSubmit={
                    onSubmit
                }
                noValidate
            >

                {errors.general && (

                    <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">

                        {errors.general}

                    </div>

                )}


                <div className="grid gap-5 sm:grid-cols-2">

                    <div className="sm:col-span-2">

                        <FormField
                            label="Client name"
                            required
                            error={
                                errors.name
                            }
                        >

                            <input
                                type="text"
                                value={
                                    form.name
                                }
                                onChange={(event) =>
                                    onChange(
                                        "name",
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Airborne Security"
                                autoFocus
                                disabled={
                                    isSaving
                                }
                                className={inputClass(
                                    Boolean(
                                        errors.name
                                    )
                                )}
                            />

                        </FormField>

                    </div>


                    <FormField
                        label="Email"
                        error={
                            errors.email
                        }
                    >

                        <div className="relative">

                            <Mail
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                            />

                            <input
                                type="email"
                                value={
                                    form.email
                                }
                                onChange={(event) =>
                                    onChange(
                                        "email",
                                        event.target.value
                                    )
                                }
                                placeholder="client@example.com"
                                disabled={
                                    isSaving
                                }
                                className={`${inputClass(
                                    Boolean(
                                        errors.email
                                    )
                                )} pl-9`}
                            />

                        </div>

                    </FormField>


                    <FormField
                        label="Phone"
                    >

                        <div className="relative">

                            <Phone
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                            />

                            <input
                                type="tel"
                                value={
                                    form.phone
                                }
                                onChange={(event) =>
                                    onChange(
                                        "phone",
                                        event.target.value
                                    )
                                }
                                placeholder="+232..."
                                disabled={
                                    isSaving
                                }
                                className={`${inputClass(
                                    false
                                )} pl-9`}
                            />

                        </div>

                    </FormField>


                    <div className="sm:col-span-2">

                        <FormField
                            label="Address"
                        >

                            <div className="relative">

                                <MapPin
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-3 text-[var(--bms-text-muted)]"
                                />

                                <textarea
                                    value={
                                        form.address
                                    }
                                    onChange={(event) =>
                                        onChange(
                                            "address",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Client address"
                                    rows={3}
                                    disabled={
                                        isSaving
                                    }
                                    className={`${inputClass(
                                        false
                                    )} min-h-[92px] resize-y pl-9 pt-2.5`}
                                />

                            </div>

                        </FormField>

                    </div>


                    <div className="sm:col-span-2">

                        <FormField
                            label="Website"
                            error={
                                errors.website
                            }
                        >

                            <div className="relative">

                                <Globe
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bms-text-muted)]"
                                />

                                <input
                                    type="url"
                                    value={
                                        form.website
                                    }
                                    onChange={(event) =>
                                        onChange(
                                            "website",
                                            event.target.value
                                        )
                                    }
                                    placeholder="https://example.com"
                                    disabled={
                                        isSaving
                                    }
                                    className={`${inputClass(
                                        Boolean(
                                            errors.website
                                        )
                                    )} pl-9`}
                                />

                            </div>

                        </FormField>

                    </div>


                    {!isEdit && (

                        <div className="sm:col-span-2">

                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--bms-border)] bg-[var(--bms-surface-soft)] px-3 py-3">

                                <input
                                    type="checkbox"
                                    checked={
                                        form.isActive
                                    }
                                    onChange={(event) =>
                                        onChange(
                                            "isActive",
                                            event.target.checked
                                        )
                                    }
                                    disabled={
                                        isSaving
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <span>

                                    <span className="block text-sm font-medium text-[var(--bms-text)]">

                                        Active client

                                    </span>

                                    <span className="block text-xs text-[var(--bms-text-muted)]">

                                        Make this client immediately available for active workflows.

                                    </span>

                                </span>

                            </label>

                        </div>

                    )}

                </div>


                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[var(--bms-border)] pt-5 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            isSaving
                        }
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                    >

                        Cancel

                    </button>


                    <button
                        type="submit"
                        disabled={
                            isSaving
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {isSaving && (

                            <RefreshCw
                                size={15}
                                className="animate-spin"
                            />

                        )}

                        {
                            isSaving
                                ? "Saving..."
                                : submitLabel
                        }

                    </button>

                </div>

            </form>

        </ModalShell>

    );

}


/*
 * ==================================================
 * FORM FIELD
 * ==================================================
 */

function FormField({

    label,

    required = false,

    error,

    children,

}) {

    return (

        <div>

            <label className="mb-1.5 block text-xs font-medium text-[var(--bms-text-secondary)]">

                {label}

                {required && (

                    <span className="ml-1 text-red-500">
                        *
                    </span>

                )}

            </label>


            {children}


            {error && (

                <p className="mt-1.5 text-xs text-red-500">

                    {error}

                </p>

            )}

        </div>

    );

}


/*
 * ==================================================
 * INPUT CLASS
 * ==================================================
 */

function inputClass(
    hasError
) {

    return (

        "w-full rounded-lg border bg-[var(--bms-surface-soft)] px-3 py-2.5 text-sm text-[var(--bms-text)] outline-none transition placeholder:text-[var(--bms-text-muted)] " +

        (
            hasError

                ? "border-red-500 focus:ring-2 focus:ring-red-500/10"

                : "border-[var(--bms-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        )

    );

}


/*
 * ==================================================
 * MODAL SHELL
 * ==================================================
 */

function ModalShell({

    title,

    description,

    children,

    onClose,

    isBusy = false,

}) {

    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget &&
                    !isBusy
                ) {

                    onClose();

                }

            }}
        >

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="client-modal-title"
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] shadow-2xl"
            >

                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--bms-border)] bg-[var(--bms-surface)] px-5 py-4">

                    <div>

                        <h2
                            id="client-modal-title"
                            className="text-base font-semibold text-[var(--bms-text)]"
                        >

                            {title}

                        </h2>

                        <p className="mt-1 text-xs text-[var(--bms-text-secondary)]">

                            {description}

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            isBusy
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--bms-text-muted)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)] disabled:opacity-50"
                        aria-label="Close dialog"
                    >

                        <X
                            size={18}
                        />

                    </button>

                </div>


                <div className="p-5">

                    {children}

                </div>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * CONFIRM MODAL
 * ==================================================
 */

function ConfirmModal({

    title,

    description,

    confirmLabel,

    isLoading,

    danger = false,

    onClose,

    onConfirm,

}) {

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-2xl"
            >

                <div className="flex items-start gap-4">

                    <div
                        className={
                            danger
                                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500"
                                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"
                        }
                    >

                        {danger ? (

                            <Trash2
                                size={19}
                            />

                        ) : (

                            <CheckCircle2
                                size={19}
                            />

                        )}

                    </div>


                    <div>

                        <h2 className="text-base font-semibold text-[var(--bms-text)]">

                            {title}

                        </h2>

                        <p className="mt-1.5 text-sm leading-6 text-[var(--bms-text-secondary)]">

                            {description}

                        </p>

                    </div>

                </div>


                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            isLoading
                        }
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                    >

                        Cancel

                    </button>


                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            isLoading
                        }
                        className={
                            danger

                                ? "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"

                                : "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        }
                    >

                        {isLoading && (

                            <RefreshCw
                                size={15}
                                className="animate-spin"
                            />

                        )}

                        {
                            isLoading
                                ? "Processing..."
                                : confirmLabel
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}