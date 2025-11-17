import { Wrench, X } from "lucide-react";
import DocumentViewer from "../../../../../shared/components/shared/display/DocumentViewer";
import moment from "moment-jalaali";

export default function ServiceModal({ service, onClose }) {
    if (!service) return null;

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn p-6 relative"
                onClick={handleContentClick}
            >
                <button
                    onClick={onClose}
                    aria-label="بستن"
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-melkingDarkBlue text-white w-12 h-12 flex items-center justify-center rounded-full shadow">
                        <Wrench size={24} />
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-melkingDarkBlue text-lg">{service.title || service.subject}</p>
                        <p className="text-sm text-gray-500">
                            {moment(service.created_at || service.createdAt).format("jYYYY/jMM/jDD HH:mm")}
                        </p>
                        {service.target && (
                            <span
                                className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full
                                                            ${service.target === "resident"
                                        ? "bg-blue-100 text-blue-800"
                                        : service.target === "owner"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-purple-100 text-purple-800"}
                                    `} >
                                {service.target === "resident"
                                    ? "ساکن"
                                    : service.target === "owner"
                                        ? "مالک"
                                        : "ساکن و مالک"}
                            </span>
                        )}
                    </div>


                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-melkingDarkBlue mb-2">توضیحات کوتاه</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                        {service.description || 'توضیحی ارائه نشده است.'}
                    </p>
                    
                    {service.longDesc && (
                        <>
                            <h3 className="text-lg font-semibold text-melkingDarkBlue mb-2">توضیحات کامل</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {service.longDesc}
                            </p>
                        </>
                    )}
                </div>

                {(service.attachment_url || service.attachmentUrl || service.attachment) && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-melkingDarkBlue mb-2">پیوست</h3>
                        <div className="flex justify-end">
                            <DocumentViewer documentUrl={service.attachment_url || service.attachmentUrl || service.attachment} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


