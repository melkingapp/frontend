import { Wrench } from "lucide-react";
import moment from "moment-jalaali";

export default function ServiceItem({ service, onSelect = () => {}, index = 0 }) {
    const iconBg =
        index % 2 === 0
            ? "bg-melkingDarkBlue text-white"
            : "bg-melkingGold text-melkingDarkBlue";

    // Add base URL if the URL is relative
    const getFullUrl = (url) => {
        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        // Add the backend base URL
        const getBaseURL = () => {
            if (import.meta.env.VITE_API_BASE_URL) {
                return import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
            }
            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                return isLocalhost ? 'http://localhost:8000' : 'http://171.22.25.201:9000';
            }
            return 'http://localhost:8000';
        };
        const baseURL = getBaseURL();
        return `${baseURL}${url}`;
    };

    return (
        <div
            onClick={() => onSelect && onSelect(service)}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
        >
            {/* آیکون */}
            <div className={`flex-shrink-0 p-3 rounded-full ${iconBg} flex items-center justify-center`}>
                <Wrench size={24} />
            </div>

            {/* محتوا */}
            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                <h3 className="text-base font-bold text-melkingDarkBlue truncate sm:whitespace-normal">
                    {service.title || service.subject}
                </h3>
                <p className="text-sm text-gray-700 break-words">{service.description || service.content}</p>

                {/* Show attachment thumbnail if exists */}
                {(service.attachment_url || service.attachmentUrl || service.attachment) && (
                    <div className="mt-2">
                        <img
                            src={getFullUrl(service.attachment_url || service.attachmentUrl || service.attachment)}
                            alt="پیوست"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {service.target && (
                    <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1
              ${service.target === "resident"
                                ? "bg-blue-100 text-blue-800"
                                : service.target === "owner"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                            }
            `}
                    >
                        {service.target === "resident"
                            ? "ساکن"
                            : service.target === "owner"
                                ? "مالک"
                                : "ساکن و مالک"}
                    </span>
                )}
            </div>

            {/* تاریخ */}
            <span className="text-xs text-gray-400 whitespace-nowrap mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                {moment(service.created_at || service.createdAt).format("jYYYY/jMM/jDD")}
            </span>
        </div>
    );
}
