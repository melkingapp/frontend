import { useState } from "react";

export default function UnitTransactionsSummary({
  unitTransactions,
  unitStatusFilter,
  onStatusFilterChange,
}) {
  if (!unitTransactions) return null;

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-melkingDarkBlue">
            💳
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-blue-950 text-base sm:text-lg">
              خلاصه گردش مالی این واحد
            </h3>
            <p className="text-[11px] sm:text-xs text-blue-700 mt-0.5">
              وضعیت کلی بدهی و پرداخت‌های این واحد در این بازه
            </p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="inline-flex items-center bg-white/80 rounded-xl border border-blue-100 shadow-sm overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className={`px-3 py-1.5 transition-colors ${
              unitStatusFilter === "all"
                ? "bg-melkingDarkBlue text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            همه
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("unpaid")}
            className={`px-3 py-1.5 border-x border-blue-100 transition-colors ${
              unitStatusFilter === "unpaid"
                ? "bg-red-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            پرداخت‌نشده
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("paid")}
            className={`px-3 py-1.5 transition-colors ${
              unitStatusFilter === "paid"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            پرداخت‌شده
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
        <div className="bg-white/90 rounded-xl p-3 border border-blue-100 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-[11px] sm:text-xs">کل فاکتورها</span>
            <span className="text-xs text-blue-500 font-medium">تعداد</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-gray-900 text-lg">
              {unitTransactions.summary?.total_invoices || 0}
            </span>
            <span className="text-[11px] text-gray-500">مورد</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            مجموع:{" "}
            <span className="font-semibold text-gray-900">
              {(unitTransactions.summary?.total_amount || 0).toLocaleString("fa-IR")} تومان
            </span>
          </div>
        </div>
        <div className="bg-white/90 rounded-xl p-3 border border-emerald-100 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-[11px] sm:text-xs">جمع پرداخت‌ها</span>
            <span className="text-xs text-emerald-500 font-medium">ورودی</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-emerald-700 text-lg">
              {(unitTransactions.summary?.total_paid || 0).toLocaleString("fa-IR")}
            </span>
            <span className="text-[11px] text-gray-500">تومان</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            پرداخت‌شده توسط این واحد
          </div>
        </div>
        <div className="bg-white/90 rounded-xl p-3 border border-rose-100 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-[11px] sm:text-xs">مانده بدهی</span>
            <span className="text-xs text-rose-500 font-medium">خروجی</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-rose-700 text-lg">
              {(unitTransactions.summary?.total_remaining || 0).toLocaleString("fa-IR")}
            </span>
            <span className="text-[11px] text-gray-500">تومان</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            مبلغی که هنوز برای این واحد باز است
          </div>
        </div>
        <div className="bg-white/90 rounded-xl p-3 border border-indigo-100 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-[11px] sm:text-xs">صورتحساب‌های مشترک</span>
            <span className="text-xs text-indigo-500 font-medium">مشترک</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-indigo-700 text-lg">
              {(unitTransactions.invoices || unitTransactions.transactions || []).filter(
                (tx) => tx.is_shared_expense
              ).length}
            </span>
            <span className="text-[11px] text-gray-500">مورد</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            فاکتورهای سهم این واحد از هزینه‌های مشترک
          </div>
        </div>
      </div>
    </div>
  );
}

