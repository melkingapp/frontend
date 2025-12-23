import { X, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "تایید حذف",
    message,
    itemName,
    itemDetails,
    isLoading = false,
}) {
    // برای بستن با ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && !isLoading) onClose?.();
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                    onClick={isLoading ? undefined : onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    این عمل قابل بازگشت نیست
                                </p>
                            </div>
                            {!isLoading && (
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X size={24} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white px-6 py-6">
                        <div className="space-y-4">
                            {message && (
                                <p className="text-base text-gray-700">
                                    {message}
                                </p>
                            )}
                            
                            {itemName && (
                                <p className="text-base text-gray-700">
                                    آیا از حذف <span className="font-bold text-gray-900">"{itemName}"</span> اطمینان دارید؟
                                </p>
                            )}

                            {itemDetails && (
                                <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle size={20} className="text-amber-600" />
                                        </div>
                                        <div className="mr-3">
                                            <p className="text-sm text-amber-800">
                                                {itemDetails}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-all duration-200"
                        >
                            انصراف
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 border-2 border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    در حال حذف...
                                </>
                            ) : (
                                "حذف"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

