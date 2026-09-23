import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Edit3,
    ExternalLink,
    Globe,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Trash2,
    Users,
    X,
    XCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    deleteClient,
    getClientById,
    updateClient,
    updateClientStatus,
} from "../../api/clients";


/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function getInitials(
    name
) {

    if (!name) {
        return "CL";
    }


    return name

        .trim()

        .split(/\s+/)

        .slice(0, 2)

        .map(
            (part) =>
                part
                    .charAt(0)
                    .toUpperCase()
        )

        .join("");

}


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


function formatDateTime(
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
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(date);

}


/*
 * ==================================================
 * MAIN
 * ==================================================
 */

export default function ClientDetails() {

    const navigate =
        useNavigate();


    const {
        id
    } =
        useParams();


    /*
     * ==================================================
     * STATE
     * ==================================================
     */

    const [
        client,
        setClient
    ] = useState(null);


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
        isEditing,
        setIsEditing
    ] = useState(false);


    const [
        isSaving,
        setIsSaving
    ] = useState(false);


    const [
        isUpdatingStatus,
        setIsUpdatingStatus
    ] = useState(false);


    const [
        isDeleting,
        setIsDeleting
    ] = useState(false);


    const [
        showDeleteConfirm,
        setShowDeleteConfirm
    ] = useState(false);


    const [
        form,
        setForm
    ] = useState({

        name: "",

        email: "",

        phone: "",

        address: "",

        website: "",

    });


    const [
        formErrors,
        setFormErrors
    ] = useState({});


    /*
     * ==================================================
     * LOAD CLIENT
     * ==================================================
     */

    const loadClient =
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
                        await getClientById(
                            id
                        );


                    const data =
                        response?.data ||
                        response?.client ||
                        response;


                    if (!data) {

                        throw new Error(
                            "Client information could not be loaded."
                        );

                    }


                    setClient(
                        data
                    );


                    setForm({

                        name:
                            data.name ||
                            "",

                        email:
                            data.email ||
                            "",

                        phone:
                            data.phone ||
                            "",

                        address:
                            data.address ||
                            "",

                        website:
                            data.website ||
                            "",

                    });

                } catch (err) {

                    console.error(
                        "Failed to load client:",
                        err
                    );


                    setError(
                        err?.message ||
                        "Unable to load client information."
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
            [
                id
            ]
        );


    useEffect(() => {

        if (id) {

            loadClient();

        }

    }, [
        id,
        loadClient
    ]);


    /*
     * ==================================================
     * SUCCESS MESSAGE
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


        return () =>
            window.clearTimeout(
                timer
            );

    }, [
        successMessage
    ]);


    /*
     * ==================================================
     * FORM
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
     * EDIT
     * ==================================================
     */

    function startEditing() {

        setForm({

            name:
                client?.name ||
                "",

            email:
                client?.email ||
                "",

            phone:
                client?.phone ||
                "",

            address:
                client?.address ||
                "",

            website:
                client?.website ||
                "",

        });


        setFormErrors(
            {}
        );


        setIsEditing(
            true
        );

    }


    function cancelEditing() {

        if (
            isSaving
        ) {

            return;

        }


        setIsEditing(
            false
        );


        setFormErrors(
            {}
        );


        if (client) {

            setForm({

                name:
                    client.name ||
                    "",

                email:
                    client.email ||
                    "",

                phone:
                    client.phone ||
                    "",

                address:
                    client.address ||
                    "",

                website:
                    client.website ||
                    "",

            });

        }

    }


    async function handleSave() {

        if (
            !client
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


            const response =
                await updateClient(

                    client.id,

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


            const updatedClient =
                response?.data ||
                response?.client ||
                response;


            if (
                updatedClient &&
                typeof updatedClient ===
                    "object"
            ) {

                setClient(
                    (current) => ({
                        ...current,
                        ...updatedClient,
                    })
                );

            } else {

                await loadClient();

            }


            setIsEditing(
                false
            );


            setSuccessMessage(
                "Client updated successfully."
            );

        } catch (err) {

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

    async function handleStatusChange() {

        if (
            !client
        ) {

            return;

        }


        try {

            setIsUpdatingStatus(
                true
            );


            const nextStatus =
                !client.isActive;


            const response =
                await updateClientStatus(

                    client.id,

                    nextStatus

                );


            const updatedClient =
                response?.data ||
                response?.client ||
                response;


            setClient(
                (current) => ({

                    ...current,

                    isActive:
                        typeof updatedClient
                            ?.isActive ===
                            "boolean"

                            ? updatedClient
                                .isActive

                            : nextStatus,

                })
            );


            setSuccessMessage(

                nextStatus

                    ? "Client activated successfully."

                    : "Client deactivated successfully."

            );

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

    async function handleDelete() {

        if (
            !client
        ) {

            return;

        }


        try {

            setIsDeleting(
                true
            );


            await deleteClient(
                client.id
            );


            navigate(
                "/clients",
                {
                    replace:
                        true,
                    state: {
                        message:
                            "Client deleted successfully.",
                    },
                }
            );

        } catch (err) {

            setError(
                err?.message ||
                "Unable to delete client."
            );

            setShowDeleteConfirm(
                false
            );

        } finally {

            setIsDeleting(
                false
            );

        }

    }


    /*
     * ==================================================
     * LOADING
     * ==================================================
     */

    if (
        isLoading
    ) {

        return (

            <div className="space-y-6">

                <div className="h-6 w-32 animate-pulse rounded bg-[var(--bms-surface-soft)]" />

                <div className="h-40 animate-pulse rounded-xl bg-[var(--bms-surface-soft)]" />

                <div className="grid gap-6 lg:grid-cols-3">

                    <div className="h-64 animate-pulse rounded-xl bg-[var(--bms-surface-soft)] lg:col-span-1" />

                    <div className="h-64 animate-pulse rounded-xl bg-[var(--bms-surface-soft)] lg:col-span-2" />

                </div>

            </div>

        );

    }


    /*
     * ==================================================
     * ERROR / NOT FOUND
     * ==================================================
     */

    if (
        error &&
        !client
    ) {

        return (

            <div className="space-y-5">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/clients"
                        )
                    }
                    className="inline-flex items-center gap-2 text-sm text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)]"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Clients

                </button>


                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500">

                    {error}

                </div>

            </div>

        );

    }


    /*
     * ==================================================
     * RENDER
     * ==================================================
     */

    return (

        <div className="space-y-6">

            {/* =========================================
                TOP NAV
            ========================================== */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/clients"
                        )
                    }
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--bms-text-secondary)] hover:text-[var(--bms-text)]"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Clients

                </button>


                <button
                    type="button"
                    onClick={() =>
                        loadClient({
                            refresh: true,
                        })
                    }
                    disabled={
                        isRefreshing
                    }
                    className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-[var(--bms-border)] px-3 text-xs font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                >

                    <RefreshCw
                        size={14}
                        className={
                            isRefreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =========================================
                SUCCESS
            ========================================== */}

            {successMessage && (

                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">

                    <CheckCircle2
                        size={18}
                    />

                    {successMessage}

                </div>

            )}


            {/* =========================================
                ERROR
            ========================================== */}

            {error && client && (

                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError(
                                null
                            )
                        }
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>

            )}


            {/* =========================================
                CLIENT HERO
            ========================================== */}

            <div className="rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-xl font-bold text-blue-500">

                            {
                                getInitials(
                                    client?.name
                                )
                            }

                        </div>


                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <h1 className="truncate text-xl font-semibold text-[var(--bms-text)] sm:text-2xl">

                                    {
                                        client?.name
                                    }

                                </h1>


                                <StatusBadge
                                    isActive={
                                        client?.isActive
                                    }
                                />

                            </div>


                            <p className="mt-1 text-sm text-[var(--bms-text-secondary)]">

                                Client organization

                            </p>


                            <p className="mt-2 text-xs text-[var(--bms-text-muted)]">

                                Created{" "}
                                {
                                    formatDate(
                                        client?.createdAt
                                    )
                                }

                            </p>

                        </div>

                    </div>


                    <div className="flex flex-wrap gap-2">

                        {!isEditing && (

                            <>

                                <button
                                    type="button"
                                    onClick={
                                        startEditing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] hover:text-[var(--bms-text)]"
                                >

                                    <Edit3
                                        size={16}
                                    />

                                    Edit

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleStatusChange
                                    }
                                    disabled={
                                        isUpdatingStatus
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)] disabled:opacity-50"
                                >

                                    {client?.isActive ? (

                                        <XCircle
                                            size={16}
                                        />

                                    ) : (

                                        <CheckCircle2
                                            size={16}
                                        />

                                    )}

                                    {
                                        client?.isActive
                                            ? "Deactivate"
                                            : "Activate"
                                    }

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteConfirm(
                                            true
                                        )
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                                >

                                    <Trash2
                                        size={16}
                                    />

                                    Delete

                                </button>

                            </>

                        )}

                    </div>

                </div>

            </div>


            {/* =========================================
                EDIT PANEL
            ========================================== */}

            {isEditing && (

                <div className="rounded-xl border border-blue-500/20 bg-[var(--bms-surface)]">

                    <div className="border-b border-[var(--bms-border)] px-5 py-4">

                        <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                            Edit Client

                        </h2>

                        <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                            Update the client's core information.

                        </p>

                    </div>


                    <div className="p-5">

                        {formErrors.general && (

                            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">

                                {
                                    formErrors.general
                                }

                            </div>

                        )}


                        <div className="grid gap-5 md:grid-cols-2">

                            <Field
                                label="Client name"
                                required
                                error={
                                    formErrors.name
                                }
                            >

                                <input
                                    value={
                                        form.name
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    className={inputClass(
                                        Boolean(
                                            formErrors.name
                                        )
                                    )}
                                />

                            </Field>


                            <Field
                                label="Email"
                                error={
                                    formErrors.email
                                }
                            >

                                <input
                                    type="email"
                                    value={
                                        form.email
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "email",
                                            event.target.value
                                        )
                                    }
                                    className={inputClass(
                                        Boolean(
                                            formErrors.email
                                        )
                                    )}
                                />

                            </Field>


                            <Field
                                label="Phone"
                            >

                                <input
                                    type="tel"
                                    value={
                                        form.phone
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "phone",
                                            event.target.value
                                        )
                                    }
                                    className={inputClass(
                                        false
                                    )}
                                />

                            </Field>


                            <Field
                                label="Website"
                                error={
                                    formErrors.website
                                }
                            >

                                <input
                                    type="url"
                                    value={
                                        form.website
                                    }
                                    onChange={(event) =>
                                        updateForm(
                                            "website",
                                            event.target.value
                                        )
                                    }
                                    placeholder="https://example.com"
                                    className={inputClass(
                                        Boolean(
                                            formErrors.website
                                        )
                                    )}
                                />

                            </Field>


                            <div className="md:col-span-2">

                                <Field
                                    label="Address"
                                >

                                    <textarea
                                        value={
                                            form.address
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "address",
                                                event.target.value
                                            )
                                        }
                                        rows={3}
                                        className={`${inputClass(
                                            false
                                        )} resize-y`}
                                    />

                                </Field>

                            </div>

                        </div>


                        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[var(--bms-border)] pt-5 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    cancelEditing
                                }
                                disabled={
                                    isSaving
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                            >

                                <X
                                    size={16}
                                />

                                Cancel

                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleSave
                                }
                                disabled={
                                    isSaving
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
                                        : "Save Changes"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =========================================
                MAIN CONTENT
            ========================================== */}

            <div className="grid gap-6 lg:grid-cols-3">

                {/* CONTACT INFORMATION */}

                <div className="space-y-6 lg:col-span-1">

                    <section className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <div className="border-b border-[var(--bms-border)] px-5 py-4">

                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                                Client Information

                            </h2>

                        </div>


                        <div className="space-y-5 p-5">

                            <DetailItem
                                icon={Mail}
                                label="Email"
                                value={
                                    client?.email
                                }
                                href={
                                    client?.email
                                        ? `mailto:${client.email}`
                                        : null
                                }
                            />


                            <DetailItem
                                icon={Phone}
                                label="Phone"
                                value={
                                    client?.phone
                                }
                                href={
                                    client?.phone
                                        ? `tel:${client.phone}`
                                        : null
                                }
                            />


                            <DetailItem
                                icon={MapPin}
                                label="Address"
                                value={
                                    client?.address
                                }
                            />


                            <DetailItem
                                icon={Globe}
                                label="Website"
                                value={
                                    client?.website
                                }
                                href={
                                    client?.website
                                }
                                external
                            />

                        </div>

                    </section>


                    <section className="rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <div className="border-b border-[var(--bms-border)] px-5 py-4">

                            <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                                Record Information

                            </h2>

                        </div>


                        <div className="space-y-5 p-5">

                            <MetaItem
                                icon={
                                    CalendarDays
                                }
                                label="Created"
                                value={
                                    formatDateTime(
                                        client?.createdAt
                                    )
                                }
                            />


                            <MetaItem
                                icon={
                                    RefreshCw
                                }
                                label="Last Updated"
                                value={
                                    formatDateTime(
                                        client?.updatedAt
                                    )
                                }
                            />


                            <MetaItem
                                icon={
                                    Users
                                }
                                label="Projects"
                                value={
                                    String(
                                        client?._count
                                            ?.projects ||
                                        client?.projects
                                            ?.length ||
                                        0
                                    )
                                }
                            />

                        </div>

                    </section>

                </div>


                {/* PROJECTS */}

                <div className="lg:col-span-2">

                    <section className="overflow-hidden rounded-xl border border-[var(--bms-border)] bg-[var(--bms-surface)]">

                        <div className="flex items-center justify-between gap-4 border-b border-[var(--bms-border)] px-5 py-4">

                            <div>

                                <h2 className="text-sm font-semibold text-[var(--bms-text)]">

                                    Projects

                                </h2>

                                <p className="mt-1 text-xs text-[var(--bms-text-muted)]">

                                    Projects associated with this client.

                                </p>

                            </div>


                            <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600/10 px-2 text-xs font-semibold text-blue-500">

                                {
                                    client?._count
                                        ?.projects ||
                                    client?.projects
                                        ?.length ||
                                    0
                                }

                            </div>

                        </div>


                        {Array.isArray(
                            client?.projects
                        ) &&
                        client.projects.length >
                            0 ? (

                            <div className="divide-y divide-[var(--bms-border)]">

                                {client.projects.map(
                                    (project) => (

                                        <ProjectRow
                                            key={
                                                project.id
                                            }
                                            project={
                                                project
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/projects/${project.id}`
                                                )
                                            }
                                        />

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

                                    <Building2
                                        size={21}
                                    />

                                </div>


                                <h3 className="mt-3 text-sm font-semibold text-[var(--bms-text)]">

                                    No projects yet

                                </h3>


                                <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--bms-text-secondary)]">

                                    Projects associated with this client will appear here.

                                </p>

                            </div>

                        )}

                    </section>

                </div>

            </div>


            {/* =========================================
                DELETE CONFIRMATION
            ========================================== */}

            {showDeleteConfirm && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-md rounded-2xl border border-[var(--bms-border)] bg-[var(--bms-surface)] p-5 shadow-2xl"
                    >

                        <div className="flex items-start gap-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">

                                <Trash2
                                    size={19}
                                />

                            </div>


                            <div>

                                <h2 className="text-base font-semibold text-[var(--bms-text)]">

                                    Delete Client?

                                </h2>

                                <p className="mt-1.5 text-sm leading-6 text-[var(--bms-text-secondary)]">

                                    Are you sure you want to permanently delete{" "}

                                    <strong className="font-semibold text-[var(--bms-text)]">

                                        {client?.name}

                                    </strong>

                                    ?

                                    Existing projects will not be deleted.

                                </p>

                            </div>

                        </div>


                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeleteConfirm(
                                        false
                                    )
                                }
                                disabled={
                                    isDeleting
                                }
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--bms-border)] px-4 text-sm font-medium text-[var(--bms-text-secondary)] hover:bg-[var(--bms-surface-soft)]"
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    isDeleting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >

                                {isDeleting && (

                                    <RefreshCw
                                        size={15}
                                        className="animate-spin"
                                    />

                                )}

                                {
                                    isDeleting
                                        ? "Deleting..."
                                        : "Delete Client"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

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
 * DETAIL ITEM
 * ==================================================
 */

function DetailItem({

    icon: Icon,

    label,

    value,

    href,

    external = false,

}) {

    return (

        <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

                <Icon
                    size={16}
                />

            </div>


            <div className="min-w-0">

                <p className="text-xs text-[var(--bms-text-muted)]">

                    {label}

                </p>


                {href ? (

                    <a
                        href={href}
                        target={
                            external
                                ? "_blank"
                                : undefined
                        }
                        rel={
                            external
                                ? "noreferrer"
                                : undefined
                        }
                        className="mt-1 flex items-center gap-1 break-words text-sm text-blue-500 hover:underline"
                    >

                        {value}

                        {external && (

                            <ExternalLink
                                size={12}
                                className="shrink-0"
                            />

                        )}

                    </a>

                ) : (

                    <p className="mt-1 whitespace-pre-line break-words text-sm text-[var(--bms-text)]">

                        {
                            value ||
                            "Not provided"
                        }

                    </p>

                )}

            </div>

        </div>

    );

}


/*
 * ==================================================
 * META ITEM
 * ==================================================
 */

function MetaItem({

    icon: Icon,

    label,

    value,

}) {

    return (

        <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bms-surface-soft)] text-[var(--bms-text-muted)]">

                <Icon
                    size={15}
                />

            </div>


            <div>

                <p className="text-xs text-[var(--bms-text-muted)]">

                    {label}

                </p>

                <p className="mt-0.5 text-sm font-medium text-[var(--bms-text)]">

                    {value}

                </p>

            </div>

        </div>

    );

}


/*
 * ==================================================
 * PROJECT ROW
 * ==================================================
 */

function ProjectRow({

    project,

    onClick,

}) {

    return (

        <button
            type="button"
            onClick={onClick}
            className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-[var(--bms-surface-soft)] sm:flex-row sm:items-center sm:justify-between"
        >

            <div className="min-w-0">

                <p className="truncate text-sm font-medium text-[var(--bms-text)]">

                    {
                        project.name
                    }

                </p>


                {project.description && (

                    <p className="mt-1 line-clamp-2 text-xs text-[var(--bms-text-secondary)]">

                        {
                            project.description
                        }

                    </p>

                )}

            </div>


            <div className="flex shrink-0 items-center gap-3">

                {project.status && (

                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">

                        {
                            project.status
                        }

                    </span>

                )}


                {project.priority && (

                    <span className="hidden rounded-full bg-[var(--bms-surface-soft)] px-2.5 py-1 text-xs text-[var(--bms-text-muted)] sm:inline-flex">

                        {
                            project.priority
                        }

                    </span>

                )}

            </div>

        </button>

    );

}


/*
 * ==================================================
 * FORM FIELD
 * ==================================================
 */

function Field({

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