/**
 * FinanceTableRow Component
 * 
 * نمایش ردیف تراکنش مالی با تفکیک وضعیت‌ها:
 * - systemStatus: وضعیت سیستم (تکمیل شده، در انتظار، ناموفق)
 * - payment_status: وضعیت پرداخت ساکنین (همه پرداخت کردند، X از Y پرداخت کردند)
 */

import { Crown, Edit2, Trash2, User, Building2 } from "lucide-react";
import { formatJalaliDate, getPersianType, getPersianStatus, getStatusColor } from "../../../../../../shared/utils";

export default function FinanceTableRow({ transaction, onSelect, onEdit, onDelete, isManager = false, isUnitView = false }) {
    // getStatusColor and formatJalaliDate are now imported from utils

    // بررسی اینکه آیا این یک پرداخت اضافی است
    const isExtraPayment = transaction.category === 'extra_payment' || 
                          transaction.expense_type === 'extra_payment' ||
                          transaction.bill_type === 'extra_payment' ||
                          (typeof transaction.id === 'string' && transaction.id.startsWith('extra_payment_'));

    // Safe data extraction with fallbacks
    // ستون «عنوان» (یا توضیح) تا حد امکان متن خام تراکنش را نشان می‌دهد
    const rawTitle = transaction.title || transaction.description || null;
    // ترتیب اولویت برای نوع هزینه: bill_type > expense_type > category_display > type > transaction_type
    // category را حذف کردیم چون معمولاً 'shared_bill' است که دسته‌بندی است نه نوع هزینه
    // bill_type اولویت دارد چون نوع واقعی هزینه را نشان می‌دهد (water_bill, electricity_bill, etc)
    const typeKey =
        transaction.bill_type ||
        transaction.expense_type ||
        transaction.category_display ||
        transaction.type ||
        transaction.transaction_type ||
        null;
    // Always get Persian type, even if typeKey is null (will return the original value or null)
    const typeLabel = typeKey ? getPersianType(typeKey, transaction) : (rawTitle ? getPersianType(rawTitle, transaction) : null);

    let title = rawTitle;
    if (!title) {
        title = typeLabel || 'بدون عنوان';
    }
    // ستون «نام هزینه» برای نام رسمی/نوع هزینه (از بک‌اند)
    const expenseName =
        transaction.expense_name ||
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

    // اگر پرداخت اضافی است، ظاهر متفاوتی نمایش بده
    if (isExtraPayment) {
        const unitInfo = transaction.unit ? `واحد ${transaction.unit.unit_number}` : (transaction.user?.full_name || 'کاربر');
        const userInfo = transaction.user?.full_name || '—';
        
        return (
            <div className="relative w-full mb-2">
                <button
                    className="grid grid-cols-5 gap-2 items-center text-sm text-right w-full rounded-xl p-3 bg-gradient-to-r from-blue-50 to-indigo-50 shadow hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 transition-all"
                    onClick={() => onSelect(transaction)}
                >
                    {/* ستون ۱: نوع هزینه */}
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-blue-900 truncate">
                            پرداخت اضافی
                        </span>
                    </div>
                    {/* ستون ۲: اطلاعات کاربر و واحد */}
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-melkingDarkBlue truncate text-xs">
                            {transaction.title || '—'}
                        </span>
                        <span className="text-xs text-gray-600 truncate">
                            {unitInfo} - {userInfo}
                        </span>
                    </div>
                    <span className="font-bold text-blue-700">{typeof amount === 'number' ? amount.toLocaleString('fa-IR') : '0'}</span>
                    <span className="text-xs text-gray-600">{date}</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <Building2 size={14} />
                        پرداخت کاربر
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full mb-2">
            <button
                className="grid grid-cols-5 gap-2 items-center text-sm text-right w-full rounded-xl p-3 bg-white shadow hover:bg-gray-50 border"
                onClick={() => onSelect(transaction)}
            >
                {/* ستون ۱: نوع هزینه (همیشه typeLabel) */}
                <span className="font-medium truncate">
                    {typeLabel || title || 'بدون نوع'}
                </span>
                {/* ستون ۲: نام هزینه */}
                <span className="font-semibold text-melkingDarkBlue truncate">
                    {expenseName || title || '—'}
                </span>
                <span>{typeof amount === 'number' ? amount.toLocaleString('fa-IR') : '0'}</span>
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