import React from "react";
import {
    FaExclamationTriangle,
    FaTimes,
    FaTrash,
} from "react-icons/fa";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    danger = true,
}) => {
    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-black/50
                px-4
                py-6
                backdrop-blur-sm
            "
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
        >
            <div
                className="
                    relative
                    w-full
                    max-w-md
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                    dark:border-slate-700
                    dark:bg-slate-900
                "
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close confirmation dialog"
                    className="
                        absolute
                        right-4
                        top-4
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        dark:hover:bg-slate-800
                        dark:hover:text-slate-200
                    "
                >
                    <FaTimes />
                </button>

                {/* Content */}
                <div className="px-6 pb-6 pt-7">
                    {/* Icon */}
                    <div
                        className={`
                            mx-auto
                            mb-5
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            ${
                                danger
                                    ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            }
                        `}
                    >
                        {danger ? (
                            <FaExclamationTriangle className="text-xl" />
                        ) : (
                            <FaExclamationTriangle className="text-xl" />
                        )}
                    </div>

                    {/* Title */}
                    <h2
                        id="confirm-modal-title"
                        className="
                            text-center
                            text-xl
                            font-bold
                            text-slate-900
                            dark:text-white
                        "
                    >
                        {title}
                    </h2>

                    {/* Message */}
                    <p
                        id="confirm-modal-description"
                        className="
                            mx-auto
                            mt-3
                            max-w-sm
                            text-center
                            text-sm
                            leading-6
                            text-slate-600
                            dark:text-slate-400
                        "
                    >
                        {message}
                    </p>

                    {/* Actions */}
                    <div
                        className="
                            mt-7
                            flex
                            flex-col-reverse
                            gap-3
                            sm:flex-row
                            sm:justify-center
                        "
                    >
                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="
                                inline-flex
                                min-h-[44px]
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-slate-300
                                bg-white
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                dark:border-slate-600
                                dark:bg-slate-800
                                dark:text-slate-200
                                dark:hover:bg-slate-700
                            "
                        >
                            {cancelText}
                        </button>

                        {/* Confirm */}
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`
                                inline-flex
                                min-h-[44px]
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                ${
                                    danger
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <span
                                        className="
                                            h-4
                                            w-4
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-white/40
                                            border-t-white
                                        "
                                    />

                                    Processing...
                                </>
                            ) : (
                                <>
                                    {danger && <FaTrash />}
                                    {confirmText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;