import { User } from "lucide-react";
import moment from "moment-jalaali";
import { getBaseUrl } from "../../../../../shared/utils/apiConfig";

export default function LetterItem({ letter, index, onSelect }) {
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
        const baseURL = getBaseUrl();
        return `${baseURL}${url}`;
    };

    return (
        <div
            onClick={() => onSelect(letter)}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg cursor-pointer 
                 transition-all duration-200 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-100"
        >
            <div
                className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 transition-all duration-200 ${iconBg} hover:scale-105`}
            >
                <User size={28} />
            </div>

            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-melkingDarkBlue truncate">
                        {letter.subject || letter.title}
                    </h3>
                </div>
                <p className="text-sm text-gray-700 font-medium truncate">
                    {letter.created_by?.full_name || letter.author}
                </p>
                <p className="text-sm text-gray-600 break-words">
                    {letter.content || letter.description}
                </p>

                {/* Show attachment thumbnail if exists */}
                {(letter.attachment_url || letter.attachmentUrl) && (
                    <div className="mt-2">
                        <img
                            src={getFullUrl(letter.attachment_url || letter.attachmentUrl)}
                            alt="پیوست"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {letter.role && (
                    <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1
                        ${letter.role === "resident"
                                ? "bg-blue-100 text-blue-800"
                                : letter.role === "owner"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                            }`}
                    >
                        {letter.role_display || 
                         (letter.role === "resident"
                            ? "ساکن"
                            : letter.role === "owner"
                                ? "مالک"
                                : "ساکن و مالک")}
                    </span>
                )}
            </div>

            <span className="text-xs text-gray-400 whitespace-nowrap mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                {moment(letter.created_at || letter.createdAt).format("jYYYY/jMM/jDD")}
            </span>
        </div>
    );
}
