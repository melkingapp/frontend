import { User, X } from "lucide-react";
import DocumentViewer from "../../../../../shared/components/shared/display/DocumentViewer";
import moment from "moment-jalaali";

export default function LetterModal({ letter, onClose }) {
    if (!letter) return null;

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
                        <User size={24} />
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-melkingDarkBlue text-lg">{letter.author || 'مدیر ساختمان'}</p>
                        <p className="text-sm text-gray-500">
                            {moment(letter.created_at || letter.createdAt).format("jYYYY/jMM/jDD HH:mm")}
                        </p>
                        {letter.role && (
                            <span
                                className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full
                                        ${letter.role === "resident"
                                        ? "bg-blue-100 text-blue-800"
                                        : letter.role === "manager"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-purple-100 text-purple-800"
                                    }
                                    `} >
                                {letter.role_display || (letter.role === "resident"
                                    ? "ساکن"
                                    : letter.role === "manager"
                                        ? "مدیر"
                                        : "هر دو")}
                            </span>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-bold text-melkingDarkBlue mb-4">{letter.subject || letter.title}</h2>

                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{letter.content || letter.longDesc}</p>
                {(letter.attachment_url || letter.attachmentUrl) && (
                    <div className="mt-6 flex justify-end">
                        <DocumentViewer documentUrl={letter.attachment_url || letter.attachmentUrl} />
                    </div>
                )}
            </div>
        </div>
    );
}