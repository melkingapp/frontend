/**
 * FinanceTableRow Component
 * 
 * نمایش ردیف تراکنش مالی با تفکیک وضعیت‌ها:
 * - systemStatus: وضعیت سیستم (تکمیل شده، در انتظار، ناموفق)
 * - payment_status: وضعیت پرداخت ساکنین (همه پرداخت کردند، X از Y پرداخت کردند)
 */

import { memo } from "react";
import { Crown } from "lucide-react";
import { formatJalaliDate, getPersianType, getPersianStatus, getStatusColor } from "../../../../../shared/utils";

const FinanceTableRow = memo(({ transaction, onSelect }) => {
    // getStatusColor and formatJalaliDate are now imported from utils

    // Safe data extraction with fallbacks
    const rawTitle = transaction.title || transaction.description || transaction.category || 'بدون عنوان';
    const title = getPersianType(rawTitle);
    const amount = transaction.amount || transaction.total_amount || 0;
    const date = formatJalaliDate(transaction.date || transaction.billing_date || transaction.issue_date);
    const systemStatus = getPersianStatus(transaction.status || 'نامشخص'); // وضعیت سیستم

    return (
        <button
            className="grid grid-cols-4 gap-2 items-center text-sm text-right w-full mb-2 rounded-xl p-3 bg-white shadow hover:bg-gray-50 border"
            onClick={() => onSelect(transaction)}
        >
            <span className="font-medium truncate">{title}</span>
            <span>{typeof amount === 'number' ? amount.toLocaleString() : '0'}</span>
            <span className="text-xs">{date}</span>
            <span className={`font-semibold ${getStatusColor(systemStatus)} flex items-center gap-1`}>
                {systemStatus === "ممتاز" && <Crown size={16} />}
                {systemStatus}
            </span>
        </button>
    );
});

FinanceTableRow.displayName = 'FinanceTableRow';

export default FinanceTableRow;
