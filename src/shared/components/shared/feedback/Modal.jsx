/* eslint-disable react-hooks/exhaustive-deps */
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function Modal({
    isOpen,
    onClose,
    icon,
    title,
    description,
    actionText = "باشه",
    onAction,
}) {
    // برای بستن با ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl text-center relative">
                <button
                    className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                {icon && <div className="text-[#1C2E4E] mb-3">{icon}</div>}

                {title && (
                    <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
                )}
                {description && (
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">{description}</p>
                )}

                <button
                    className="w-full bg-[#1C2E4E] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#15253e] transition"
                    onClick={() => {
                        onAction?.();
                        onClose?.();
                    }}
                >
                    {actionText}
                </button>
            </div>
        </div>,
        document.body
    );
}
