import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    AlertCircle,
    Info,
    X,
    AlertTriangle,
    Coffee,
} from "lucide-react";
import PropTypes from "prop-types";

/**
 * Toast Component
 * Displays a notification message with specific styling based on type.
 *
 * @component
 * @param {object} props
 * @param {string} props.id - Unique ID for the toast
 * @param {string} props.type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Title of the toast
 * @param {string} props.message - Message content
 * @param {function} props.onClose - Function to call when closing
 * @param {number} props.duration - Duration in ms before auto-close (default: 5000)
 */
const Toast = ({
    id,
    type = "info",
    title,
    message,
    onClose,
    duration = 5000,
}) => {
    // Auto-close timer
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    // Configuration based on type
    const config = {
        success: {
            icon: CheckCircle,
            bgColor: "bg-white",
            borderColor: "border-green-500",
            iconColor: "text-green-600",
            accentColor: "bg-green-50",
        },
        error: {
            icon: AlertCircle,
            bgColor: "bg-white",
            borderColor: "border-red-500",
            iconColor: "text-red-600",
            accentColor: "bg-red-50",
        },
        warning: {
            icon: AlertTriangle,
            bgColor: "bg-white",
            borderColor: "border-amber-500",
            iconColor: "text-amber-600",
            accentColor: "bg-amber-50",
        },
        info: {
            icon: Coffee, // Custom coffee icon for info
            bgColor: "bg-white",
            borderColor: "border-coffee-500",
            iconColor: "text-coffee-600",
            accentColor: "bg-coffee-50",
        },
    };

    const style = config[type] || config.info;
    const Icon = style.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
                relative w-full max-w-md pointer-events-auto
                ${style.bgColor} 
                border-l-4 ${style.borderColor}
                shadow-lg shadow-coffee-900/10 rounded-lg overflow-hidden
                flex p-4 gap-3 items-start
            `}
            role="alert"
        >
            {/* Icon Section */}
            <div className={`shrink-0 rounded-full p-2 ${style.accentColor}`}>
                <Icon size={20} className={style.iconColor} />
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 pt-0.5">
                {title && (
                    <h3 className="text-coffee-900 font-bold text-sm leading-5 mb-1">
                        {title}
                    </h3>
                )}
                <p className="text-coffee-600 text-sm leading-5 break-words">
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={() => onClose(id)}
                className="shrink-0 text-coffee-400 hover:text-coffee-700 hover:bg-coffee-50 rounded-lg p-1 transition-colors"
                aria-label="Close notification"
            >
                <X size={18} />
            </button>

            {/* Progress Bar (Optional visual flair) */}
            {duration > 0 && (
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: duration / 1000, ease: "linear" }}
                    className={`absolute bottom-0 left-0 h-1 ${style.borderColor.replace(
                        "border-",
                        "bg-"
                    )} opacity-20`}
                />
            )}
        </motion.div>
    );
};

Toast.propTypes = {
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "error", "warning", "info"]),
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
};

export default Toast;
