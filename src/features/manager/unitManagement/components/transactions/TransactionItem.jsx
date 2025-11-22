import { Calendar } from "lucide-react";
import { formatJalaliDate, getPersianType, getPersianStatus, getTypeIcon } from "../../../../../shared/utils";

// getTypeIcon is now imported from utils

export default function TransactionItem({ transaction }) {
    // getPersianStatus and getPersianType are now imported from utils

    const getStatusClass = (status) => {
        // Convert to Persian first
        const persianStatus = getPersianStatus(status);
        
        switch (persianStatus) {
            case "منتظر پرداخت":
                return "bg-yellow-100 text-yellow-800";
            case "پرداخت شده":
                return "bg-emerald-100 text-emerald-800";
            case "سررسید گذشته":
                return "bg-orange-100 text-orange-800";
            case "لغو شده":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // formatDate is now formatJalaliDate from utils

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border rounded-2xl shadow-md bg-white hover:shadow-xl transition duration-300">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-2">
                    {getTypeIcon(transaction.type || transaction.category)}
                </div>
                <span className="font-semibold text-gray-900 text-lg">
                    {getPersianType(transaction.title || transaction.category) || "تراکنش"}
                </span>
                <span className="text-gray-700 text-base">
                    {transaction.amount ? transaction.amount.toLocaleString() : 0} تومان
                </span>
            </div>
            <div className="flex gap-3 mt-3 sm:mt-0 items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(transaction.status)}`}>
                    {getPersianStatus(transaction.status) || "نامشخص"}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatJalaliDate(transaction.date || transaction.created_at)}
                </span>
            </div>
        </div>
    );
}
