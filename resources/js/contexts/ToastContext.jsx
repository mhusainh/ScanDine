import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import Toast from "../components/ui/Toast";

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = "info", title, message, duration = 5000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, title, message, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const contextValue = {
        addToast,
        removeToast,
        // Helper functions for common types
        success: (message, title = "Success") => addToast({ type: "success", title, message }),
        error: (message, title = "Error") => addToast({ type: "error", title, message }),
        warning: (message, title = "Warning") => addToast({ type: "warning", title, message }),
        info: (message, title = "Info") => addToast({ type: "info", title, message }),
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {/* Toast Container */}
            {createPortal(
                <div 
                    className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 md:px-0 pointer-events-none"
                    aria-live="polite"
                >
                    <AnimatePresence mode="popLayout">
                        {toasts.map((toast) => (
                            <Toast
                                key={toast.id}
                                {...toast}
                                onClose={removeToast}
                            />
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
