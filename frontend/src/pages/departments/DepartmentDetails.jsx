import {
    ArrowLeft,
    Building2,
    Mail,
    Users,
    UserCheck,
    UserPlus,
    UserMinus,
    Pencil,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
    Search,
    AlertTriangle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getDepartment,
    updateDepartment,
    deleteDepartment,
    assignDepartmentHead,
    removeDepartmentHead,
    addDepartmentMember,
    removeDepartmentMember,
} from "../../api/departments.js";

import {
    getAllUsers,
} from "../../api/users.js";


/*
 * ==================================================
 * SHARED FORM STYLES
 * ==================================================
 */

const INPUT_CLASS = `
    h-11
    w-full
    rounded-lg
    border
    border-[var(--bms-border)]
    bg-[var(--bms-surface-soft)]
    px-3
    text-sm
    text-[var(--bms-text)]
    outline-none
    transition
    placeholder:text-[var(--bms-text-muted)]
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-500/10
    disabled:cursor-not-allowed
    disabled:opacity-60
`;

const TEXTAREA_CLASS = `
    w-full
    resize-none
    rounded-lg
    border
    border-[var(--bms-border)]
    bg-[var(--bms-surface-soft)]
    px-3
    py-3
    text-sm
    leading-6
    text-[var(--bms-text)]
    outline-none
    transition
    placeholder:text-[var(--bms-text-muted)]
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-500/10
    disabled:cursor-not-allowed
    disabled:opacity-60
`;


/*
 * ==================================================
 * DEPARTMENT DETAILS
 * ==================================================
 */

export default function DepartmentDetails() {
    const navigate = useNavigate();

    const { id } = useParams();

    /*
     * ==================================================
     * STATE
     * ==================================================
     */

    const [
        department,
        setDepartment,
    ] = useState(null);

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
        actionLoading,
        setActionLoading,
    ] = useState(false);


    /*
     * ==================================================
     * MODALS
     * ==================================================
     */

    const [
        showEditModal,
        setShowEditModal,
    ] = useState(false);

    const [
        showHeadModal,
        setShowHeadModal,
    ] = useState(false);

    const [
        showMemberModal,
        setShowMemberModal,
    ] = useState(false);

    const [
        showDeleteModal,
        setShowDeleteModal,
    ] = useState(false);

    const [
        isDeleting,
        setIsDeleting,
    ] = useState(false);


    /*
     * ==================================================
     * REMOVE CONFIRMATION MODAL
     *
     * type:
     * - "head"
     * - "member"
     * ==================================================
     */

    const [
        removeConfirmation,
        setRemoveConfirmation,
    ] = useState(null);


    /*
     * ==================================================
     * LOAD DEPARTMENT
     * ==================================================
     */

    const loadDepartment = useCallback(
        async ({
            refresh = false,
        } = {}) => {
            if (!id) {
                setError(
                    "Department ID is missing."
                );

                setIsLoading(false);

                return;
            }

            try {
                if (refresh) {
                    setIsRefreshing(true);
                } else {
                    setIsLoading(true);
                }

                setError(null);

                const data =
                    await getDepartment(id);

                setDepartment(data);

            } catch (err) {
                console.error(
                    "Failed to load department:",
                    err
                );

                setError(
                    err?.message ||
                    "Unable to load department."
                );

            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [id]
    );


    /*
     * ==================================================
     * INITIAL LOAD
     * ==================================================
     */

    useEffect(() => {
        loadDepartment();
    }, [
        loadDepartment,
    ]);


    /*
     * ==================================================
     * DELETE DEPARTMENT
     * ==================================================
     */

    function handleDeleteClick() {
        if (!department) {
            return;
        }

        const members =
            Array.isArray(
                department.members
            )
                ? department.members
                : [];

        if (members.length > 0) {
            setError(
                "This department cannot be deleted because it still has members."
            );

            return;
        }

        setError(null);

        setShowDeleteModal(true);
    }


    /*
     * ==================================================
     * CONFIRM DELETE DEPARTMENT
     * ==================================================
     */

    async function handleConfirmDelete() {
        if (!department) {
            return;
        }

        if (isDeleting) {
            return;
        }

        try {
            setIsDeleting(true);

            setError(null);

            await deleteDepartment(
                department.id
            );

            setShowDeleteModal(false);

            navigate(
                "/departments",
                {
                    replace: true,
                }
            );

        } catch (err) {
            console.error(
                "Failed to delete department:",
                err
            );

            setError(
                err?.message ||
                "Unable to delete department."
            );

            setShowDeleteModal(false);

        } finally {
            setIsDeleting(false);
        }
    }


    /*
     * ==================================================
     * OPEN REMOVE HEAD CONFIRMATION
     * ==================================================
     */

    function handleRemoveHead() {
        if (!department?.head) {
            return;
        }

        const headName =
            `${department.head.firstName || ""} ${
                department.head.lastName || ""
            }`.trim();

        setError(null);

        setRemoveConfirmation({
            type: "head",
            userId:
                department.head.id,
            memberName:
                headName ||
                "this department head",
        });
    }


    /*
     * ==================================================
     * OPEN REMOVE MEMBER CONFIRMATION
     * ==================================================
     */

    function handleRemoveMember(
        userId,
        memberName
    ) {
        if (!userId) {
            return;
        }

        setError(null);

        setRemoveConfirmation({
            type: "member",
            userId,
            memberName:
                memberName ||
                "this user",
        });
    }


    /*
     * ==================================================
     * CONFIRM REMOVE HEAD / MEMBER
     * ==================================================
     */

    async function handleConfirmRemoval() {
        if (
            !removeConfirmation ||
            actionLoading
        ) {
            return;
        }

        try {
            setActionLoading(true);

            setError(null);

            if (
                removeConfirmation.type ===
                "head"
            ) {
                await removeDepartmentHead(
                    department.id
                );
            }

            if (
                removeConfirmation.type ===
                "member"
            ) {
                await removeDepartmentMember(
                    department.id,
                    removeConfirmation.userId
                );
            }

            setRemoveConfirmation(null);

            await loadDepartment({
                refresh: true,
            });

        } catch (err) {
            console.error(
                "Failed to remove department assignment:",
                err
            );

            setError(
                err?.message ||
                "Unable to remove the selected user."
            );

        } finally {
            setActionLoading(false);
        }
    }


    /*
     * ==================================================
     * SUCCESSFUL MUTATION
     * ==================================================
     */

    async function handleMutationSuccess() {
        await loadDepartment({
            refresh: true,
        });
    }


    /*
     * ==================================================
     * LOADING
     * ==================================================
     */

    if (isLoading) {
        return (
            <div className="space-y-6">

                <div
                    className="
                        h-10
                        w-32
                        animate-pulse
                        rounded-lg
                        bg-[var(--bms-surface-soft)]
                    "
                />

                <div
                    className="
                        grid
                        gap-4
                        lg:grid-cols-3
                    "
                >

                    <div
                        className="
                            h-48
                            animate-pulse
                            rounded-xl
                            border
                            border-[var(--bms-border)]
                            bg-[var(--bms-surface)]
                            lg:col-span-2
                        "
                    />

                    <div
                        className="
                            h-48
                            animate-pulse
                            rounded-xl
                            border
                            border-[var(--bms-border)]
                            bg-[var(--bms-surface)]
                        "
                    />

                </div>

                <div
                    className="
                        h-72
                        animate-pulse
                        rounded-xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface)]
                    "
                />

            </div>
        );
    }


    /*
     * ==================================================
     * ERROR / NOT FOUND
     * ==================================================
     */

    if (error && !department) {
        return (
            <div className="space-y-5">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/departments"
                        )
                    }
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-[var(--bms-border)]
                        px-3
                        py-2
                        text-sm
                        text-[var(--bms-text-secondary)]
                        transition
                        hover:bg-[var(--bms-surface-soft)]
                    "
                >
                    <ArrowLeft
                        size={16}
                    />

                    Back to Departments
                </button>


                <div
                    className="
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        p-5
                        text-sm
                        text-red-500
                    "
                >
                    {error}
                </div>

            </div>
        );
    }


    if (!department) {
        return null;
    }


    /*
     * ==================================================
     * NORMALIZED DATA
     * ==================================================
     */

    const head =
        department.head || null;

    const members =
        Array.isArray(
            department.members
        )
            ? department.members
            : [];


    /*
     * ==================================================
     * MAIN UI
     * ==================================================
     */

    return (
        <div className="space-y-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/departments"
                            )
                        }
                        className="
                            mb-4
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            text-[var(--bms-text-secondary)]
                            transition
                            hover:text-[var(--bms-text)]
                        "
                    >
                        <ArrowLeft
                            size={16}
                        />

                        Departments
                    </button>


                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-600/10
                                text-blue-500
                            "
                        >
                            <Building2
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>


                        <div>

                            <h1
                                className="
                                    text-xl
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >
                                {department.name}
                            </h1>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                Department details and
                                member management.
                            </p>

                        </div>

                    </div>

                </div>


                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            loadDepartment({
                                refresh: true,
                            })
                        }
                        disabled={
                            isRefreshing
                        }
                        title="Refresh department"
                        aria-label="Refresh department"
                        className="
                            inline-flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-[var(--bms-border)]
                            bg-[var(--bms-surface)]
                            text-[var(--bms-text-secondary)]
                            transition
                            hover:bg-[var(--bms-surface-soft)]
                            disabled:opacity-50
                        "
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
                        onClick={() =>
                            setShowEditModal(
                                true
                            )
                        }
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-blue-600
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-blue-700
                        "
                    >
                        <Pencil
                            size={16}
                        />

                        Edit Department
                    </button>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        p-4
                        text-sm
                        text-red-500
                    "
                >

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setError(null)
                        }
                        aria-label="Dismiss error"
                        className="
                            rounded-md
                            p-1
                            transition
                            hover:bg-red-500/10
                        "
                    >
                        <X
                            size={15}
                        />
                    </button>

                </div>
            )}


            {/* ==================================================
                OVERVIEW
            ================================================== */}

            <div
                className="
                    grid
                    gap-4
                    lg:grid-cols-3
                "
            >

                <div
                    className="
                        rounded-xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface)]
                        p-5
                        lg:col-span-2
                    "
                >

                    <div
                        className="
                            flex
                            items-start
                            justify-between
                            gap-4
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    text-[var(--bms-text-muted)]
                                "
                            >
                                Department
                            </p>

                            <h2
                                className="
                                    mt-1
                                    text-lg
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >
                                {department.name}
                            </h2>

                        </div>


                        <DepartmentStatus
                            isActive={
                                Boolean(
                                    department.isActive
                                )
                            }
                        />

                    </div>


                    <p
                        className="
                            mt-5
                            text-sm
                            leading-6
                            text-[var(--bms-text-secondary)]
                        "
                    >
                        {department.description ||
                            "No description provided."}
                    </p>


                    <div
                        className="
                            mt-6
                            grid
                            gap-4
                            sm:grid-cols-2
                        "
                    >

                        <InfoItem
                            icon={Users}
                            label="Members"
                            value={
                                members.length
                            }
                        />


                        <InfoItem
                            icon={UserCheck}
                            label="Department Head"
                            value={
                                head
                                    ? `${head.firstName || ""} ${
                                          head.lastName || ""
                                      }`.trim()
                                    : "Not assigned"
                            }
                        />

                    </div>

                </div>


                {/* DEPARTMENT HEAD */}

                <div
                    className="
                        rounded-xl
                        border
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface)]
                        p-5
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <h2
                            className="
                                text-sm
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            Department Head
                        </h2>

                        <UserCheck
                            size={18}
                            className="text-blue-500"
                        />

                    </div>


                    {head ? (
                        <div className="mt-5">

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <Avatar
                                    user={head}
                                />


                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-[var(--bms-text)]
                                        "
                                    >
                                        {head.firstName}{" "}
                                        {head.lastName}
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                            flex
                                            items-center
                                            gap-1
                                            truncate
                                            text-xs
                                            text-[var(--bms-text-muted)]
                                        "
                                    >
                                        <Mail
                                            size={12}
                                        />

                                        {head.email}
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleRemoveHead
                                }
                                disabled={
                                    actionLoading
                                }
                                className="
                                    mt-5
                                    inline-flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-red-500/20
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    text-red-500
                                    transition
                                    hover:bg-red-500/10
                                    disabled:opacity-50
                                "
                            >
                                <UserMinus
                                    size={15}
                                />

                                Remove Head
                            </button>

                        </div>
                    ) : (
                        <div
                            className="
                                mt-5
                                rounded-lg
                                bg-[var(--bms-surface-soft)]
                                p-4
                                text-center
                            "
                        >

                            <UserCheck
                                size={28}
                                className="
                                    mx-auto
                                    text-[var(--bms-text-muted)]
                                "
                            />


                            <p
                                className="
                                    mt-2
                                    text-xs
                                    text-[var(--bms-text-secondary)]
                                "
                            >
                                No department head assigned.
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowHeadModal(
                                        true
                                    )
                                }
                                className="
                                    mt-4
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    bg-blue-600
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-blue-700
                                "
                            >
                                <UserPlus
                                    size={14}
                                />

                                Assign Head
                            </button>

                        </div>
                    )}

                </div>

            </div>


            {/* ==================================================
                MEMBERS
            ================================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        border-b
                        border-[var(--bms-border)]
                        px-5
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-sm
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            Department Members
                        </h2>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-[var(--bms-text-muted)]
                            "
                        >
                            {members.length} active member
                            {members.length === 1
                                ? ""
                                : "s"}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setShowMemberModal(
                                true
                            )
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-blue-600
                            px-4
                            py-2
                            text-xs
                            font-medium
                            text-white
                            transition
                            hover:bg-blue-700
                        "
                    >
                        <UserPlus
                            size={15}
                        />

                        Add Member
                    </button>

                </div>


                {members.length === 0 ? (
                    <div
                        className="
                            flex
                            min-h-52
                            flex-col
                            items-center
                            justify-center
                            px-6
                            text-center
                        "
                    >

                        <Users
                            size={34}
                            className="
                                text-[var(--bms-text-muted)]
                            "
                        />


                        <h3
                            className="
                                mt-3
                                text-sm
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            No members
                        </h3>


                        <p
                            className="
                                mt-1
                                max-w-sm
                                text-xs
                                text-[var(--bms-text-secondary)]
                            "
                        >
                            There are currently no active
                            members assigned to this department.
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                setShowMemberModal(
                                    true
                                )
                            }
                            className="
                                mt-4
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-blue-600
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-white
                                transition
                                hover:bg-blue-700
                            "
                        >
                            <UserPlus
                                size={14}
                            />

                            Add Member
                        </button>

                    </div>
                ) : (
                    <div
                        className="
                            divide-y
                            divide-[var(--bms-border)]
                        "
                    >

                        {members.map(
                            (membership) => {
                                const user =
                                    membership?.user;

                                const fullName =
                                    `${user?.firstName || ""} ${
                                        user?.lastName || ""
                                    }`.trim();

                                return (
                                    <div
                                        key={
                                            membership.id ||
                                            user?.id
                                        }
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            px-5
                                            py-4
                                            transition
                                            hover:bg-[var(--bms-surface-soft)]
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <Avatar
                                                user={user}
                                            />


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                        text-[var(--bms-text)]
                                                    "
                                                >
                                                    {fullName ||
                                                        "Unknown User"}
                                                </p>


                                                <p
                                                    className="
                                                        mt-1
                                                        truncate
                                                        text-xs
                                                        text-[var(--bms-text-muted)]
                                                    "
                                                >
                                                    {user?.email ||
                                                        "No email"}
                                                </p>

                                            </div>

                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    bg-emerald-500/10
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    text-emerald-500
                                                "
                                            >
                                                <CheckCircle2
                                                    size={12}
                                                />

                                                Active
                                            </span>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        user?.id,
                                                        fullName ||
                                                            "this user"
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ||
                                                    !user?.id
                                                }
                                                title="Remove member"
                                                aria-label={`Remove ${
                                                    fullName ||
                                                    "member"
                                                }`}
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    text-[var(--bms-text-muted)]
                                                    transition
                                                    hover:bg-red-500/10
                                                    hover:text-red-500
                                                    disabled:opacity-50
                                                "
                                            >
                                                <UserMinus
                                                    size={16}
                                                />
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>


            {/* ==================================================
                DANGER ZONE
            ================================================== */}

            <div
                className="
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/5
                    p-5
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-sm
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            Delete Department
                        </h2>


                        <p
                            className="
                                mt-1
                                text-xs
                                leading-5
                                text-[var(--bms-text-secondary)]
                            "
                        >
                            A department cannot be deleted
                            while it still has members.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleDeleteClick
                        }
                        disabled={
                            actionLoading ||
                            members.length > 0
                        }
                        className="
                            inline-flex
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-red-500/30
                            px-4
                            py-2
                            text-xs
                            font-medium
                            text-red-500
                            transition
                            hover:bg-red-500/10
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <Trash2
                            size={15}
                        />

                        Delete Department
                    </button>

                </div>

            </div>


            {/* ==================================================
                EDIT MODAL
            ================================================== */}

            {showEditModal && (
                <EditDepartmentModal
                    department={department}
                    onClose={() =>
                        setShowEditModal(
                            false
                        )
                    }
                    onUpdated={async () => {
                        setShowEditModal(
                            false
                        );

                        await handleMutationSuccess();
                    }}
                />
            )}


            {/* ==================================================
                ASSIGN HEAD MODAL
            ================================================== */}

            {showHeadModal && (
                <AssignHeadModal
                    department={department}
                    onClose={() =>
                        setShowHeadModal(
                            false
                        )
                    }
                    onAssigned={async () => {
                        setShowHeadModal(
                            false
                        );

                        await handleMutationSuccess();
                    }}
                />
            )}


            {/* ==================================================
                ADD MULTIPLE MEMBERS MODAL
            ================================================== */}

            {showMemberModal && (
                <AddMemberModal
                    department={department}
                    existingMembers={members}
                    onClose={() =>
                        setShowMemberModal(
                            false
                        )
                    }
                    onAdded={async () => {
                        setShowMemberModal(
                            false
                        );

                        await handleMutationSuccess();
                    }}
                />
            )}


            {/* ==================================================
                DELETE DEPARTMENT CONFIRMATION
            ================================================== */}

            {showDeleteModal && (
                <ConfirmDeleteModal
                    departmentName={
                        department.name
                    }
                    isDeleting={
                        isDeleting
                    }
                    onCancel={() => {
                        if (!isDeleting) {
                            setShowDeleteModal(
                                false
                            );
                        }
                    }}
                    onConfirm={
                        handleConfirmDelete
                    }
                />
            )}


            {/* ==================================================
                REMOVE HEAD / MEMBER CONFIRMATION
            ================================================== */}

            {removeConfirmation && (
                <ConfirmRemoveModal
                    type={
                        removeConfirmation.type
                    }
                    memberName={
                        removeConfirmation.memberName
                    }
                    isRemoving={
                        actionLoading
                    }
                    onCancel={() => {
                        if (!actionLoading) {
                            setRemoveConfirmation(
                                null
                            );
                        }
                    }}
                    onConfirm={
                        handleConfirmRemoval
                    }
                />
            )}

        </div>
    );
}


/*
 * ==================================================
 * EDIT DEPARTMENT MODAL
 * ==================================================
 */

function EditDepartmentModal({
    department,
    onClose,
    onUpdated,
}) {
    const [
        name,
        setName,
    ] = useState(
        department?.name || ""
    );

    const [
        description,
        setDescription,
    ] = useState(
        department?.description || ""
    );

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");


    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        const trimmedName =
            name.trim();

        const trimmedDescription =
            description.trim();

        if (trimmedName.length < 2) {
            setError(
                "Department name must be at least 2 characters."
            );

            return;
        }

        if (trimmedName.length > 100) {
            setError(
                "Department name must not exceed 100 characters."
            );

            return;
        }

        if (trimmedDescription.length > 500) {
            setError(
                "Department description must not exceed 500 characters."
            );

            return;
        }

        try {
            setIsSubmitting(true);

            setError("");

            await updateDepartment(
                department.id,
                {
                    name: trimmedName,
                    description:
                        trimmedDescription ||
                        null,
                }
            );

            await onUpdated();

        } catch (err) {
            console.error(
                "Failed to update department:",
                err
            );

            setError(
                err?.message ||
                "Unable to update department."
            );

        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Modal
            title="Edit Department"
            subtitle="Update the department information."
            icon={Pencil}
            onClose={onClose}
            isSubmitting={isSubmitting}
        >
            <form
                onSubmit={handleSubmit}
            >

                <div
                    className="
                        space-y-5
                        p-5
                    "
                >

                    {error && (
                        <ModalError
                            message={error}
                        />
                    )}


                    <FormField
                        label="Department Name"
                        required
                    >
                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            maxLength={100}
                            disabled={
                                isSubmitting
                            }
                            className={
                                INPUT_CLASS
                            }
                            placeholder="e.g. Software Development"
                            autoFocus
                        />
                    </FormField>


                    <FormField
                        label="Description"
                    >
                        <textarea
                            value={
                                description
                            }
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            maxLength={500}
                            rows={5}
                            disabled={
                                isSubmitting
                            }
                            className={
                                TEXTAREA_CLASS
                            }
                            placeholder="Describe the department..."
                        />
                    </FormField>

                </div>


                <ModalFooter
                    onClose={onClose}
                    isSubmitting={
                        isSubmitting
                    }
                    submitLabel="Save Changes"
                    submitIcon={Pencil}
                />

            </form>
        </Modal>
    );
}


/*
 * ==================================================
 * ASSIGN HEAD MODAL
 * ==================================================
 */

function AssignHeadModal({
    department,
    onClose,
    onAssigned,
}) {
    const [
        users,
        setUsers,
    ] = useState([]);

    const [
        selectedUserId,
        setSelectedUserId,
    ] = useState("");

    const [
        searchQuery,
        setSearchQuery,
    ] = useState("");

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {
        let mounted = true;

        async function loadUsers() {
            try {
                setIsLoading(true);

                setError("");

                const response =
                    await getAllUsers({
                        limit: 100,
                    });

                if (mounted) {
                    setUsers(
                        Array.isArray(
                            response
                        )
                            ? response
                            : []
                    );
                }

            } catch (err) {
                console.error(
                    "Failed to load users:",
                    err
                );

                if (mounted) {
                    setError(
                        err?.message ||
                        "Unable to load users."
                    );
                }

            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            mounted = false;
        };
    }, []);


    const filteredUsers =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase();

            return users.filter(
                (user) => {
                    if (
                        user.status &&
                        user.status !== "ACTIVE"
                    ) {
                        return false;
                    }

                    const fullName =
                        `${user.firstName || ""} ${
                            user.lastName || ""
                        }`
                            .trim()
                            .toLowerCase();

                    const email =
                        user.email
                            ?.toLowerCase() ||
                        "";

                    return (
                        !query ||
                        fullName.includes(
                            query
                        ) ||
                        email.includes(
                            query
                        )
                    );
                }
            );
        }, [
            users,
            searchQuery,
        ]);


    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (!selectedUserId) {
            setError(
                "Please select a department head."
            );

            return;
        }

        try {
            setIsSubmitting(true);

            setError("");

            await assignDepartmentHead(
                department.id,
                selectedUserId
            );

            await onAssigned();

        } catch (err) {
            console.error(
                "Failed to assign department head:",
                err
            );

            setError(
                err?.message ||
                "Unable to assign department head."
            );

        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Modal
            title="Assign Department Head"
            subtitle={`Select an active user to lead ${department.name}.`}
            icon={UserCheck}
            onClose={onClose}
            isSubmitting={isSubmitting}
        >

            <form
                onSubmit={handleSubmit}
            >

                <div
                    className="
                        space-y-4
                        p-5
                    "
                >

                    {error && (
                        <ModalError
                            message={error}
                        />
                    )}


                    <UserSearchInput
                        value={searchQuery}
                        onChange={
                            setSearchQuery
                        }
                        placeholder="Search active users..."
                        disabled={
                            isSubmitting
                        }
                    />


                    {isLoading ? (
                        <LoadingUsers />
                    ) : filteredUsers.length === 0 ? (
                        <EmptyUsers
                            message="No active users found."
                        />
                    ) : (
                        <UserSelectionList
                            users={
                                filteredUsers
                            }
                            selectedUserId={
                                selectedUserId
                            }
                            onSelect={
                                setSelectedUserId
                            }
                        />
                    )}

                </div>


                <ModalFooter
                    onClose={onClose}
                    isSubmitting={
                        isSubmitting
                    }
                    submitLabel="Assign Head"
                    submitIcon={UserCheck}
                    submitDisabled={
                        !selectedUserId
                    }
                />

            </form>

        </Modal>
    );
}


/*
 * ==================================================
 * ADD MULTIPLE MEMBERS MODAL
 * ==================================================
 */

function AddMemberModal({
    department,
    existingMembers,
    onClose,
    onAdded,
}) {
    const [
        users,
        setUsers,
    ] = useState([]);

    /*
     * Set is used instead of a single ID.
     *
     * This allows:
     *
     * [
     *   user-1,
     *   user-2,
     *   user-3
     * ]
     *
     * to be selected at the same time.
     */

    const [
        selectedUserIds,
        setSelectedUserIds,
    ] = useState(
        () => new Set()
    );

    const [
        searchQuery,
        setSearchQuery,
    ] = useState("");

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");


    /*
     * ==================================================
     * LOAD USERS
     * ==================================================
     */

    useEffect(() => {
        let mounted = true;

        async function loadUsers() {
            try {
                setIsLoading(true);

                setError("");

                const response =
                    await getAllUsers({
                        limit: 100,
                    });

                if (mounted) {
                    setUsers(
                        Array.isArray(
                            response
                        )
                            ? response
                            : []
                    );
                }

            } catch (err) {
                console.error(
                    "Failed to load users:",
                    err
                );

                if (mounted) {
                    setError(
                        err?.message ||
                        "Unable to load users."
                    );
                }

            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            mounted = false;
        };
    }, []);


    /*
     * ==================================================
     * EXISTING MEMBERS
     * ==================================================
     */

    const existingMemberIds =
        useMemo(
            () =>
                new Set(
                    existingMembers
                        .map(
                            (membership) =>
                                membership
                                    ?.user
                                    ?.id
                        )
                        .filter(Boolean)
                ),
            [
                existingMembers,
            ]
        );


    /*
     * ==================================================
     * FILTER USERS
     * ==================================================
     */

    const filteredUsers =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase();

            return users.filter(
                (user) => {
                    if (
                        user.status &&
                        user.status !== "ACTIVE"
                    ) {
                        return false;
                    }

                    /*
                     * Don't show users already
                     * assigned to this department.
                     */
                    if (
                        existingMemberIds.has(
                            user.id
                        )
                    ) {
                        return false;
                    }

                    const fullName =
                        `${user.firstName || ""} ${
                            user.lastName || ""
                        }`
                            .trim()
                            .toLowerCase();

                    const email =
                        user.email
                            ?.toLowerCase() ||
                        "";

                    return (
                        !query ||
                        fullName.includes(
                            query
                        ) ||
                        email.includes(
                            query
                        )
                    );
                }
            );
        }, [
            users,
            existingMemberIds,
            searchQuery,
        ]);


    /*
     * ==================================================
     * SELECTED COUNT
     * ==================================================
     */

    const selectedCount =
        selectedUserIds.size;


    /*
     * ==================================================
     * TOGGLE USER
     * ==================================================
     */

    function handleToggleUser(
        userId
    ) {
        if (
            !userId ||
            isSubmitting
        ) {
            return;
        }

        setSelectedUserIds(
            (previous) => {
                const next =
                    new Set(
                        previous
                    );

                if (
                    next.has(
                        userId
                    )
                ) {
                    next.delete(
                        userId
                    );
                } else {
                    next.add(
                        userId
                    );
                }

                return next;
            }
        );
    }


    /*
     * ==================================================
     * SELECT ALL FILTERED USERS
     * ==================================================
     */

    function handleSelectAll() {
        if (
            isSubmitting ||
            filteredUsers.length === 0
        ) {
            return;
        }

        setSelectedUserIds(
            (previous) => {
                const next =
                    new Set(
                        previous
                    );

                filteredUsers.forEach(
                    (user) => {
                        if (user?.id) {
                            next.add(
                                user.id
                            );
                        }
                    }
                );

                return next;
            }
        );
    }


    /*
     * ==================================================
     * CLEAR ALL
     * ==================================================
     */

    function handleClearAll() {
        if (isSubmitting) {
            return;
        }

        setSelectedUserIds(
            new Set()
        );
    }


    /*
     * ==================================================
     * ADD SELECTED MEMBERS
     *
     * addDepartmentMember() currently accepts
     * one user ID, so we execute the existing API
     * operation for every selected user.
     *
     * Promise.allSettled() allows successful
     * additions to remain successful even if one
     * user fails.
     * ==================================================
     */

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (
            selectedUserIds.size === 0
        ) {
            setError(
                "Please select at least one user."
            );

            return;
        }

        try {
            setIsSubmitting(true);

            setError("");

            const selectedIds =
                Array.from(
                    selectedUserIds
                );

            const results =
                await Promise.allSettled(
                    selectedIds.map(
                        (userId) =>
                            addDepartmentMember(
                                department.id,
                                userId
                            )
                    )
                );

            const successfulIds =
                [];

            const failedIds =
                [];

            results.forEach(
                (result, index) => {
                    const userId =
                        selectedIds[
                            index
                        ];

                    if (
                        result.status ===
                        "fulfilled"
                    ) {
                        successfulIds.push(
                            userId
                        );
                    } else {
                        failedIds.push(
                            userId
                        );
                    }
                }
            );


            /*
             * Everything succeeded.
             */

            if (
                failedIds.length === 0
            ) {
                await onAdded();

                return;
            }


            /*
             * Some succeeded and some failed.
             */

            if (
                successfulIds.length > 0
            ) {
                setSelectedUserIds(
                    new Set(
                        failedIds
                    )
                );

                setError(
                    `${successfulIds.length} member${
                        successfulIds.length === 1
                            ? ""
                            : "s"
                    } added successfully. ${
                        failedIds.length
                    } could not be added. Please try again.`
                );

                return;
            }


            /*
             * Everything failed.
             */

            setError(
                "None of the selected users could be added. Please try again."
            );

        } catch (err) {
            console.error(
                "Failed to add department members:",
                err
            );

            setError(
                err?.message ||
                "Unable to add department members."
            );

        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Modal
            title="Add Department Members"
            subtitle={`Select one or more active users to add to ${department.name}.`}
            icon={UserPlus}
            onClose={onClose}
            isSubmitting={isSubmitting}
        >

            <form
                onSubmit={handleSubmit}
            >

                <div
                    className="
                        space-y-4
                        p-5
                    "
                >

                    {error && (
                        <ModalError
                            message={error}
                        />
                    )}


                    <UserSearchInput
                        value={searchQuery}
                        onChange={
                            setSearchQuery
                        }
                        placeholder="Search active users..."
                        disabled={
                            isSubmitting
                        }
                    />


                    {/* ==================================================
                        SELECTION CONTROLS
                    ================================================== */}

                    {!isLoading &&
                        filteredUsers.length >
                            0 && (
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            rounded-full
                                            bg-blue-600/10
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-medium
                                            text-blue-500
                                        "
                                    >
                                        {selectedCount}{" "}
                                        selected
                                    </span>


                                    <span
                                        className="
                                            text-xs
                                            text-[var(--bms-text-muted)]
                                        "
                                    >
                                        {filteredUsers.length}{" "}
                                        available
                                    </span>

                                </div>


                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            handleSelectAll
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                        className="
                                            text-xs
                                            font-medium
                                            text-blue-500
                                            transition
                                            hover:text-blue-600
                                            disabled:opacity-50
                                        "
                                    >
                                        Select All
                                    </button>


                                    <span
                                        className="
                                            text-[var(--bms-border)]
                                        "
                                    >
                                        |
                                    </span>


                                    <button
                                        type="button"
                                        onClick={
                                            handleClearAll
                                        }
                                        disabled={
                                            isSubmitting ||
                                            selectedCount ===
                                                0
                                        }
                                        className="
                                            text-xs
                                            font-medium
                                            text-[var(--bms-text-secondary)]
                                            transition
                                            hover:text-[var(--bms-text)]
                                            disabled:opacity-50
                                        "
                                    >
                                        Clear
                                    </button>

                                </div>

                            </div>
                        )}


                    {/* ==================================================
                        USER LIST
                    ================================================== */}

                    {isLoading ? (
                        <LoadingUsers />
                    ) : filteredUsers.length === 0 ? (
                        <EmptyUsers
                            message="No eligible users found."
                        />
                    ) : (
                        <MultiUserSelectionList
                            users={
                                filteredUsers
                            }
                            selectedUserIds={
                                selectedUserIds
                            }
                            onToggle={
                                handleToggleUser
                            }
                            disabled={
                                isSubmitting
                            }
                        />
                    )}

                </div>


                <ModalFooter
                    onClose={onClose}
                    isSubmitting={
                        isSubmitting
                    }
                    submitLabel={
                        selectedCount > 0
                            ? `Add ${selectedCount} Member${
                                  selectedCount ===
                                  1
                                      ? ""
                                      : "s"
                              }`
                            : "Add Members"
                    }
                    submitIcon={UserPlus}
                    submitDisabled={
                        selectedCount === 0
                    }
                />

            </form>

        </Modal>
    );
}


/*
 * ==================================================
 * MULTI USER SELECTION LIST
 * ==================================================
 */

function MultiUserSelectionList({
    users,
    selectedUserIds,
    onToggle,
    disabled,
}) {
    return (
        <div
            className="
                max-h-80
                space-y-2
                overflow-y-auto
                pr-1
            "
        >

            {users.map(
                (user) => {
                    const isSelected =
                        selectedUserIds.has(
                            user.id
                        );

                    const fullName =
                        `${user.firstName || ""} ${
                            user.lastName || ""
                        }`.trim();

                    return (
                        <button
                            key={
                                user.id
                            }
                            type="button"
                            onClick={() =>
                                onToggle(
                                    user.id
                                )
                            }
                            disabled={
                                disabled
                            }
                            aria-pressed={
                                isSelected
                            }
                            className={`
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-lg
                                border
                                p-3
                                text-left
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                ${
                                    isSelected
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-[var(--bms-border)] hover:bg-[var(--bms-surface-soft)]"
                                }
                            `}
                        >

                            {/* CHECKBOX */}

                            <div
                                className={`
                                    flex
                                    h-5
                                    w-5
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-md
                                    border
                                    transition
                                    ${
                                        isSelected
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-[var(--bms-border)] bg-[var(--bms-surface)]"
                                    }
                                `}
                            >

                                {isSelected && (
                                    <CheckCircle2
                                        size={14}
                                        strokeWidth={
                                            2.5
                                        }
                                    />
                                )}

                            </div>


                            <Avatar
                                user={
                                    user
                                }
                            />


                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-medium
                                        text-[var(--bms-text)]
                                    "
                                >
                                    {fullName ||
                                        "Unknown User"}
                                </p>


                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-xs
                                        text-[var(--bms-text-muted)]
                                    "
                                >
                                    {user.email ||
                                        "No email"}
                                </p>

                            </div>


                            {isSelected && (
                                <span
                                    className="
                                        shrink-0
                                        text-xs
                                        font-medium
                                        text-blue-500
                                    "
                                >
                                    Selected
                                </span>
                            )}

                        </button>
                    );
                }
            )}

        </div>
    );
}


/*
 * ==================================================
 * CONFIRM REMOVE MODAL
 *
 * Used for:
 *
 * 1. Removing department head
 * 2. Removing department member
 *
 * This completely replaces window.confirm().
 * ==================================================
 */

function ConfirmRemoveModal({
    type,
    memberName,
    isRemoving,
    onCancel,
    onConfirm,
}) {
    const isHead =
        type === "head";


    useEffect(() => {
        function handleKeyDown(
            event
        ) {
            if (
                event.key === "Escape" &&
                !isRemoving
            ) {
                onCancel();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        isRemoving,
        onCancel,
    ]);


    return (
        <div
            className="
                fixed
                inset-0
                z-[70]
                flex
                items-center
                justify-center
                bg-black/60
                p-4
                backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-assignment-title"
            aria-describedby="remove-assignment-description"
            onMouseDown={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !isRemoving
                ) {
                    onCancel();
                }
            }}
        >

            <div
                className="
                    w-full
                    max-w-md
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                    shadow-2xl
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        flex
                        items-start
                        gap-4
                        border-b
                        border-[var(--bms-border)]
                        px-5
                        py-5
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-red-500/10
                            text-red-500
                        "
                    >
                        <AlertTriangle
                            size={22}
                        />
                    </div>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <h2
                            id="remove-assignment-title"
                            className="
                                text-base
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            {isHead
                                ? "Remove Department Head"
                                : "Remove Department Member"}
                        </h2>


                        <p
                            className="
                                mt-1
                                text-xs
                                leading-5
                                text-[var(--bms-text-muted)]
                            "
                        >
                            Please confirm this action.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            isRemoving
                        }
                        aria-label="Close confirmation dialog"
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-[var(--bms-text-muted)]
                            transition
                            hover:bg-[var(--bms-surface-soft)]
                            hover:text-[var(--bms-text)]
                            disabled:opacity-50
                        "
                    >
                        <X
                            size={18}
                        />
                    </button>

                </div>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div
                    className="
                        px-5
                        py-5
                    "
                >

                    <p
                        id="remove-assignment-description"
                        className="
                            text-sm
                            leading-6
                            text-[var(--bms-text-secondary)]
                        "
                    >

                        Are you sure you want to{" "}

                        <span
                            className="
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            {isHead
                                ? "remove"
                                : "remove"}
                        </span>{" "}

                        <span
                            className="
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            "{memberName}"
                        </span>

                        {isHead
                            ? " as the department head?"
                            : " from this department?"}

                    </p>


                    <div
                        className="
                            mt-4
                            rounded-lg
                            border
                            border-red-500/20
                            bg-red-500/5
                            px-4
                            py-3
                        "
                    >

                        <p
                            className="
                                text-xs
                                leading-5
                                text-red-500
                            "
                        >
                            {isHead
                                ? "The user will no longer be assigned as the head of this department."
                                : "The user will no longer be a member of this department."}
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div
                    className="
                        flex
                        flex-col-reverse
                        gap-2
                        border-t
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface-soft)]
                        px-5
                        py-4
                        sm:flex-row
                        sm:justify-end
                    "
                >

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            isRemoving
                        }
                        className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-[var(--bms-border)]
                            px-4
                            text-xs
                            font-medium
                            text-[var(--bms-text-secondary)]
                            transition
                            hover:bg-[var(--bms-surface)]
                            hover:text-[var(--bms-text)]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            isRemoving
                        }
                        className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-red-600
                            px-5
                            text-xs
                            font-medium
                            text-white
                            transition
                            hover:bg-red-700
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {isRemoving ? (
                            <>
                                <Loader2
                                    size={15}
                                    className="
                                        animate-spin
                                    "
                                />

                                Removing...
                            </>
                        ) : (
                            <>
                                <UserMinus
                                    size={15}
                                />

                                {isHead
                                    ? "Remove Head"
                                    : "Remove Member"}
                            </>
                        )}

                    </button>

                </div>

            </div>

        </div>
    );
}


/*
 * ==================================================
 * CONFIRM DELETE DEPARTMENT MODAL
 * ==================================================
 */

function ConfirmDeleteModal({
    departmentName,
    isDeleting,
    onCancel,
    onConfirm,
}) {
    useEffect(() => {
        function handleKeyDown(
            event
        ) {
            if (
                event.key === "Escape" &&
                !isDeleting
            ) {
                onCancel();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        isDeleting,
        onCancel,
    ]);


    return (
        <div
            className="
                fixed
                inset-0
                z-[60]
                flex
                items-center
                justify-center
                bg-black/60
                p-4
                backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-department-title"
            aria-describedby="delete-department-description"
            onMouseDown={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !isDeleting
                ) {
                    onCancel();
                }
            }}
        >

            <div
                className="
                    w-full
                    max-w-md
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                    shadow-2xl
                "
            >

                <div
                    className="
                        flex
                        items-start
                        gap-4
                        border-b
                        border-[var(--bms-border)]
                        px-5
                        py-5
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-red-500/10
                            text-red-500
                        "
                    >
                        <AlertTriangle
                            size={22}
                        />
                    </div>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <h2
                            id="delete-department-title"
                            className="
                                text-base
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            Delete Department
                        </h2>


                        <p
                            className="
                                mt-1
                                text-xs
                                leading-5
                                text-[var(--bms-text-muted)]
                            "
                        >
                            This action cannot be undone.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            isDeleting
                        }
                        aria-label="Close confirmation dialog"
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-[var(--bms-text-muted)]
                            transition
                            hover:bg-[var(--bms-surface-soft)]
                            hover:text-[var(--bms-text)]
                            disabled:opacity-50
                        "
                    >
                        <X
                            size={18}
                        />
                    </button>

                </div>


                <div
                    className="
                        px-5
                        py-5
                    "
                >

                    <p
                        id="delete-department-description"
                        className="
                            text-sm
                            leading-6
                            text-[var(--bms-text-secondary)]
                        "
                    >
                        Are you sure you want to permanently
                        delete{" "}

                        <span
                            className="
                                font-semibold
                                text-[var(--bms-text)]
                            "
                        >
                            "{departmentName}"
                        </span>
                        ?
                    </p>


                    <div
                        className="
                            mt-4
                            rounded-lg
                            border
                            border-red-500/20
                            bg-red-500/5
                            px-4
                            py-3
                        "
                    >

                        <p
                            className="
                                text-xs
                                leading-5
                                text-red-500
                            "
                        >
                            All department information associated
                            with this department will be permanently
                            removed.
                        </p>

                    </div>

                </div>


                <div
                    className="
                        flex
                        flex-col-reverse
                        gap-2
                        border-t
                        border-[var(--bms-border)]
                        bg-[var(--bms-surface-soft)]
                        px-5
                        py-4
                        sm:flex-row
                        sm:justify-end
                    "
                >

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            isDeleting
                        }
                        className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-[var(--bms-border)]
                            px-4
                            text-xs
                            font-medium
                            text-[var(--bms-text-secondary)]
                            transition
                            hover:bg-[var(--bms-surface)]
                            hover:text-[var(--bms-text)]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            isDeleting
                        }
                        className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-red-600
                            px-5
                            text-xs
                            font-medium
                            text-white
                            transition
                            hover:bg-red-700
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {isDeleting ? (
                            <>
                                <Loader2
                                    size={15}
                                    className="
                                        animate-spin
                                    "
                                />

                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2
                                    size={15}
                                />

                                Delete Department
                            </>
                        )}

                    </button>

                </div>

            </div>

        </div>
    );
}


/*
 * ==================================================
 * GENERIC MODAL
 * ==================================================
 */

function Modal({
    title,
    subtitle,
    icon: Icon,
    onClose,
    isSubmitting,
    children,
}) {
    useEffect(() => {
        function handleKeyDown(
            event
        ) {
            if (
                event.key === "Escape" &&
                !isSubmitting
            ) {
                onClose();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        onClose,
        isSubmitting,
    ]);


    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                p-4
                backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !isSubmitting
                ) {
                    onClose();
                }
            }}
        >

            <div
                className="
                    max-h-[90vh]
                    w-full
                    max-w-lg
                    overflow-y-auto
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface)]
                    shadow-2xl
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--bms-border)]
                        px-5
                        py-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-600/10
                                text-blue-500
                            "
                        >
                            <Icon
                                size={19}
                            />
                        </div>


                        <div>

                            <h2
                                className="
                                    text-sm
                                    font-semibold
                                    text-[var(--bms-text)]
                                "
                            >
                                {title}
                            </h2>


                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-[var(--bms-text-muted)]
                                "
                            >
                                {subtitle}
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            isSubmitting
                        }
                        aria-label="Close"
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-[var(--bms-text-muted)]
                            transition
                            hover:bg-[var(--bms-surface-soft)]
                            hover:text-[var(--bms-text)]
                            disabled:opacity-50
                        "
                    >
                        <X
                            size={18}
                        />
                    </button>

                </div>


                {children}

            </div>

        </div>
    );
}


/*
 * ==================================================
 * MODAL FOOTER
 * ==================================================
 */

function ModalFooter({
    onClose,
    isSubmitting,
    submitLabel,
    submitIcon: SubmitIcon,
    submitDisabled = false,
}) {
    return (
        <div
            className="
                flex
                flex-col-reverse
                gap-2
                border-t
                border-[var(--bms-border)]
                bg-[var(--bms-surface-soft)]
                px-5
                py-4
                sm:flex-row
                sm:justify-end
            "
        >

            <button
                type="button"
                onClick={
                    onClose
                }
                disabled={
                    isSubmitting
                }
                className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[var(--bms-border)]
                    px-4
                    text-xs
                    font-medium
                    text-[var(--bms-text-secondary)]
                    transition
                    hover:bg-[var(--bms-surface)]
                    hover:text-[var(--bms-text)]
                    disabled:opacity-50
                "
            >
                Cancel
            </button>


            <button
                type="submit"
                disabled={
                    isSubmitting ||
                    submitDisabled
                }
                className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-blue-600
                    px-5
                    text-xs
                    font-medium
                    text-white
                    transition
                    hover:bg-blue-700
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >

                {isSubmitting ? (
                    <>
                        <Loader2
                            size={15}
                            className="
                                animate-spin
                            "
                        />

                        Processing...
                    </>
                ) : (
                    <>
                        <SubmitIcon
                            size={15}
                        />

                        {submitLabel}
                    </>
                )}

            </button>

        </div>
    );
}


/*
 * ==================================================
 * USER SEARCH INPUT
 * ==================================================
 */

function UserSearchInput({
    value,
    onChange,
    placeholder,
    disabled,
}) {
    return (
        <div className="relative">

            <Search
                size={16}
                className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[var(--bms-text-muted)]
                "
            />


            <input
                type="search"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={
                    placeholder
                }
                disabled={
                    disabled
                }
                className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-[var(--bms-border)]
                    bg-[var(--bms-surface-soft)]
                    pl-9
                    pr-3
                    text-sm
                    text-[var(--bms-text)]
                    outline-none
                    placeholder:text-[var(--bms-text-muted)]
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                "
            />

        </div>
    );
}


/*
 * ==================================================
 * SINGLE USER SELECTION LIST
 *
 * Used by Assign Department Head.
 * ==================================================
 */

function UserSelectionList({
    users,
    selectedUserId,
    onSelect,
}) {
    return (
        <div
            className="
                max-h-72
                space-y-2
                overflow-y-auto
                pr-1
            "
        >

            {users.map(
                (user) => {
                    const isSelected =
                        selectedUserId ===
                        user.id;

                    const fullName =
                        `${user.firstName || ""} ${
                            user.lastName || ""
                        }`.trim();

                    return (
                        <button
                            key={
                                user.id
                            }
                            type="button"
                            onClick={() =>
                                onSelect(
                                    user.id
                                )
                            }
                            className={`
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-lg
                                border
                                p-3
                                text-left
                                transition
                                ${
                                    isSelected
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-[var(--bms-border)] hover:bg-[var(--bms-surface-soft)]"
                                }
                            `}
                        >

                            <Avatar
                                user={
                                    user
                                }
                            />


                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-medium
                                        text-[var(--bms-text)]
                                    "
                                >
                                    {fullName ||
                                        "Unknown User"}
                                </p>


                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-xs
                                        text-[var(--bms-text-muted)]
                                    "
                                >
                                    {user.email ||
                                        "No email"}
                                </p>

                            </div>


                            {isSelected && (
                                <CheckCircle2
                                    size={18}
                                    className="
                                        text-blue-500
                                    "
                                />
                            )}

                        </button>
                    );
                }
            )}

        </div>
    );
}


/*
 * ==================================================
 * LOADING USERS
 * ==================================================
 */

function LoadingUsers() {
    return (
        <div
            className="
                flex
                min-h-40
                items-center
                justify-center
            "
        >
            <Loader2
                size={22}
                className="
                    animate-spin
                    text-blue-500
                "
            />
        </div>
    );
}


/*
 * ==================================================
 * EMPTY USERS
 * ==================================================
 */

function EmptyUsers({
    message,
}) {
    return (
        <div
            className="
                rounded-lg
                bg-[var(--bms-surface-soft)]
                p-6
                text-center
            "
        >

            <Users
                size={28}
                className="
                    mx-auto
                    text-[var(--bms-text-muted)]
                "
            />


            <p
                className="
                    mt-2
                    text-xs
                    text-[var(--bms-text-secondary)]
                "
            >
                {message}
            </p>

        </div>
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
    children,
}) {
    return (
        <div>

            <label
                className="
                    mb-2
                    block
                    text-xs
                    font-medium
                    text-[var(--bms-text-secondary)]
                "
            >

                {label}

                {required && (
                    <span
                        className="
                            ml-1
                            text-red-500
                        "
                    >
                        *
                    </span>
                )}

            </label>

            {children}

        </div>
    );
}


/*
 * ==================================================
 * MODAL ERROR
 * ==================================================
 */

function ModalError({
    message,
}) {
    return (
        <div
            className="
                rounded-lg
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-xs
                text-red-500
            "
        >
            {message}
        </div>
    );
}


/*
 * ==================================================
 * INFO ITEM
 * ==================================================
 */

function InfoItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div
            className="
                rounded-lg
                bg-[var(--bms-surface-soft)]
                p-4
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                <Icon
                    size={15}
                    className="
                        text-[var(--bms-text-muted)]
                    "
                />


                <span
                    className="
                        text-xs
                        text-[var(--bms-text-muted)]
                    "
                >
                    {label}
                </span>

            </div>


            <p
                className="
                    mt-2
                    truncate
                    text-sm
                    font-semibold
                    text-[var(--bms-text)]
                "
            >
                {value}
            </p>

        </div>
    );
}


/*
 * ==================================================
 * AVATAR
 * ==================================================
 */

function Avatar({
    user,
}) {
    const initials =
        `${user?.firstName?.[0] || ""}${
            user?.lastName?.[0] || ""
        }`.toUpperCase();

    return (
        <div
            className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-blue-600/10
                text-xs
                font-semibold
                text-blue-500
            "
        >

            {user?.avatarUrl ? (
                <img
                    src={
                        user.avatarUrl
                    }
                    alt=""
                    className="
                        h-full
                        w-full
                        object-cover
                    "
                />
            ) : (
                initials || "U"
            )}

        </div>
    );
}


/*
 * ==================================================
 * DEPARTMENT STATUS
 * ==================================================
 */

function DepartmentStatus({
    isActive,
}) {
    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-xs
                font-medium
                ${
                    isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-gray-500/10 text-gray-500"
                }
            `}
        >

            {isActive ? (
                <CheckCircle2
                    size={12}
                />
            ) : (
                <XCircle
                    size={12}
                />
            )}

            {isActive
                ? "Active"
                : "Inactive"}

        </span>
    );
}