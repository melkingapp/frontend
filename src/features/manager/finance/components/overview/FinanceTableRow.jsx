/**
 * FinanceTableRow Component
 * 
 * نمایش ردیف تراکنش مالی با تفکیک وضعیت‌ها:
 * - systemStatus: وضعیت سیستم (تکمیل شده، در انتظار، ناموفق)
 * - payment_status: وضعیت پرداخت ساکنین (همه پرداخت کردند، X از Y پرداخت کردند)
 */

import { Crown, Edit2, Trash2 } from "lucide-react";
import { formatJalaliDate, getPersianType, getPersianStatus, getStatusColor } from "../../../../../shared/utils";

export default function FinanceTableRow({ transaction, onSelect, onEdit, onDelete, isManager = false }) {
    // getStatusColor and formatJalaliDate are now imported from utils

    // Safe data extraction with fallbacks
    // For unit transactions, use type/transaction_type, for building transactions use title
    const rawTitle = transaction.title || 
                     transaction.description || 
                     transaction.category || 
                     transaction.type ||
                     transaction.transaction_type ||
                     'بدون عنوان';
    const title = getPersianType(rawTitle);
    const expenseName = transaction.expense_name || 
                       transaction.expense_details?.expense_name || 
                       null;
    const amount = transaction.amount || transaction.total_amount || 0;
    const date = formatJalaliDate(
        transaction.date || 
        transaction.billing_date || 
        transaction.issue_date ||
        transaction.created_at
    );
    // اگر payment_method از شارژ باشه، وضعیت سیستم "برداشت از موجودی صندوق" باشه
    const systemStatus = transaction.payment_method === 'from_fund' 
        ? 'برداشت از موجودی صندوق'
        : getPersianStatus(transaction.status || transaction.status_label || 'نامشخص'); // وضعیت سیستم

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(transaction);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(transaction);
    };

    return (
        <div className="relative w-full mb-2">
            <button
                className="grid grid-cols-5 gap-2 items-center text-sm text-right w-full rounded-xl p-3 bg-white shadow hover:bg-gray-50 border"
                onClick={() => onSelect(transaction)}
            >
                <span className="font-medium truncate">{title}</span>
                <span className="font-semibold text-melkingDarkBlue truncate">{expenseName || '—'}</span>
                <span>{typeof amount === 'number' ? amount.toLocaleString() : '0'}</span>
                <span className="text-xs">{date}</span>
                <span className={`font-semibold ${getStatusColor(systemStatus)} flex items-center gap-1`}>
                    {systemStatus === "ممتاز" && <Crown size={16} />}
                    {systemStatus}
                </span>
            </button>
            {isManager && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white rounded-lg px-1">
                    <button
                        onClick={handleEdit}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ویرایش"
                    >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )}
        </div>
    );
}