
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

const SIZES = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
    xlarge: "max-w-2xl",
    fullscreen: "max-w-full h-full m-0 rounded-none",
};

export default function Modal({
    isOpen,
    onClose,
    icon,
    title,
    description,
    actionText = "باشه",
    onAction,
    size = "small",
    footer,
    children,
    closeOnOverlayClick = true,
    showCloseButton = true,
}) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    // برای بستن با ESC و focus trap
    useEffect(() => {
        if (!isOpen) return;

        // Save previous focus
        previousFocusRef.current = document.activeElement;

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose?.();
        };

        // Focus trap
        const handleTab = (e) => {
            if (!modalRef.current) return;
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener("keydown", handleEsc);
        document.addEventListener("keydown", handleTab);

        // Focus first element
        setTimeout(() => {
            const firstFocusable = modalRef.current?.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }, 100);

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.removeEventListener("keydown", handleTab);
            // Restore previous focus
            previousFocusRef.current?.focus();
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = SIZES[size] || SIZES.small;
    const isFullscreen = size === "fullscreen";

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeOnOverlayClick ? onClose : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
        >
            <div
                ref={modalRef}
                className={`bg-white ${sizeClasses} ${isFullscreen ? "" : "rounded-2xl"} shadow-xl relative transition-all duration-300 ${
                    isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition z-10"
                        onClick={onClose}
                        aria-label="بستن"
                    >
                        <X size={20} />
                    </button>
                )}

                <div className={isFullscreen ? "h-full overflow-y-auto p-6" : "p-6"}>
                    {icon && <div className="text-[#1C2E4E] mb-3 text-center">{icon}</div>}

                    {title && (
                        <h2 id="modal-title" className="text-lg font-bold text-gray-800 mb-2 text-center">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p id="modal-description" className="text-sm text-gray-500 mb-5 leading-relaxed text-center">
                            {description}
                        </p>
                    )}

                    {children && <div className="mb-5">{children}</div>}

                    {footer ? (
                        footer
                    ) : (
                        onAction && (
                            <button
                                className="w-full bg-[#1C2E4E] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#15253e] transition"
                                onClick={() => {
                                    onAction?.();
                                    onClose?.();
                                }}
                            >
                                {actionText}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
