import React from "react";

/* eslint-disable react-hooks/exhaustive-deps */
import { Home, Calendar, Check, X, Loader2, ImageIcon } from "lucide-react";
import { getPersianType, getTypeIcon } from "../../../../../../shared/utils";
import DocumentViewer from "../../../../../../shared/components/shared/display/DocumentViewer";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { approvePayment, rejectPayment, fetchPendingPayments } from "../../../store/slices/paymentsSlice";

moment.loadPersian({ dialect: "persian-modern" });

/**
 * PaymentItem (Pro)
 * — کارت جمع‌وجور، حرفه‌ای و ریسپانسیو برای آیتم پرداخت
 * — تمرکز روی چگالی اطلاعات + سلسله‌مراتب بصری واضح
 * — دکمه‌های اکشن در دسترس، نمایش فاکتور در Modal/Inline
 */


// ⚡ Bolt Performance Optimization
// 💡 What: Wrapped PaymentItem in React.memo
// 🎯 Why: This component is rendered in the payment list and contains complex internal state and memoized values. Preventing unnecessary re-renders of list items avoids recalculating these values when the parent list updates.
// 📊 Impact: Improves scrolling performance and reduces render time for long lists of payments.
// 🔬 Measurement: Use React DevTools Profiler to measure the render time of the PaymentsList component when approving or rejecting a payment.
const PaymentItem = React.memo(function PaymentItem({ payment, buildingId }) {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.payments.loading);
  const [isProcessing, setIsProcessing] = useState(false);

  // getTypeIcon is now imported from utils

  // getPersianType is now imported from utils

  const roleStyle = useMemo(() => {
    const isOwner = payment?.role === "مالک";
    return isOwner
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  }, [payment?.role]);

  const handleApprove = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      console.log("🔥 Approving payment:", payment.id);
      await dispatch(approvePayment(payment.id)).unwrap();
      toast.success("پرداخت با موفقیت پذیرفته شد!");
      
      // Refresh the payments list after approval
      if (buildingId) {
        dispatch(fetchPendingPayments({ buildingId, status: 'pending' }));
      }
    } catch (error) {
      console.error("🔥 Payment approval error:", error);
      toast.error(error || "خطا در تایید پرداخت");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing) return;
    
    const reason = prompt("دلیل رد پرداخت (اختیاری):");
    if (reason === null) return; // User cancelled
    
    setIsProcessing(true);
    
    try {
      console.log("🔥 Rejecting payment:", payment.id, "Reason:", reason);
      await dispatch(rejectPayment({ 
        paymentId: payment.id, 
        reason: reason || '' 
      })).unwrap();
      toast.error("پرداخت رد شد!");
      
      // Refresh the payments list after rejection
      if (buildingId) {
        dispatch(fetchPendingPayments({ buildingId, status: 'pending' }));
      }
    } catch (error) {
      console.error("🔥 Payment rejection error:", error);
      toast.error(error || "خطا در رد پرداخت");
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedDate = useMemo(() => {
    try {
      return moment(payment?.createdAt).format("jYYYY/jMM/jDD · HH:mm");
    } catch {
      return "—";
    }
  }, [payment?.createdAt]);

  const avatarColors = [
    "bg-pink-100 text-pink-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-rose-100 text-rose-700",
  ];

  const avatarColor = useMemo(() => {
    const k = Number.isFinite(payment?.id) ? payment.id : 0;
    return avatarColors[k % avatarColors.length];
  }, [payment?.id]);


  return (
    <article
      className="group relative overflow-hidden rounded-2xl my-4 bg-gray-50 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
      dir="rtl"
    >
      {/* نوار بالا: نام + نقش + عنوان + تاریخ */}
      <header className="grid grid-cols-12 items-center gap-3 md:gap-4">
        {/* پروفایل و نقش */}
        <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
          <div className={`size-10 shrink-0 rounded-full grid place-items-center font-bold ${avatarColor}`}>
            {payment?.name?.[0] || "?"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="truncate text-sm md:text-base font-semibold text-gray-900">
                {payment?.name || "—"}
              </h3>
              {payment?.role && (
                <span className={`hidden sm:inline px-2 py-0.5 rounded-full text-xs ${roleStyle}`}>
                  {payment.role}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Home size={14} className="shrink-0" /> واحد {payment?.unit ?? "—"}
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-gray-200" />
              <span className="flex items-center gap-1.5 text-gray-500">
                <Calendar size={12} className="shrink-0" /> {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* عنوان پرداخت */}
        <div className="col-span-12 md:col-span-4 min-w-0">
          <div className="flex items-center gap-2">
            {getTypeIcon(payment?.title)}
            <p className="truncate text-sm md:text-[15px] text-gray-700 font-medium">
              {getPersianType(payment?.title) || "—"}
            </p>
          </div>
        </div>

        {/* اکشن‌ها */}
        <div className="col-span-12 md:col-span-3 items-center justify-start md:justify-end gap-2 md:gap-2.5 hidden sm:flex">
          {payment?.status === 'paid' ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs md:text-sm text-green-700">
              <Check size={16} />
              تایید شده
            </span>
          ) : payment?.status === 'cancelled' ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs md:text-sm text-red-700">
              <X size={16} />
              رد شده
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs md:text-sm text-white hover:bg-emerald-700 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                پذیرش
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500 px-3 py-1.5 text-xs md:text-sm text-red-600 hover:bg-red-50 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                رد
              </button>
            </>
          )}
        </div>
      </header>

      {/* جداکننده ظریف */}
      <div className="mt-3 md:mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent hidden sm:flex" />

      {/* توضیحات پرداخت */}
      {payment?.description && (
        <div className="pt-3 md:pt-4 px-3 md:px-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium mb-1">توضیحات پرداخت:</p>
            <p className="text-sm text-blue-700">{payment.description}</p>
          </div>
        </div>
      )}

      {/* شناسه پرداخت */}
      {payment?.payment_reference && (
        <div className="pt-2 px-3 md:px-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">شناسه پرداخت:</span> {payment.payment_reference}
          </div>
        </div>
      )}

      {/* عکس رسید پرداخت */}
      <div className="pt-3 md:pt-4 px-3 md:px-4">
        {payment?.invoice ? (
          <DocumentViewer documentUrl={payment.invoice} title={`عکس رسید پرداخت ${getPersianType(payment?.title) ?? ""}`} />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-500">عکس رسید پرداخت آپلود نشده است</p>
          </div>
        )}
      </div>

      <div className="col-span-12 md:col-span-3 items-center justify-start md:justify-end gap-2 md:gap-2.5 mt-4 flex sm:hidden">
        {payment?.status === 'paid' ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs md:text-sm text-green-700">
            <Check size={16} />
            تایید شده
          </span>
        ) : payment?.status === 'cancelled' ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs md:text-sm text-red-700">
            <X size={16} />
            رد شده
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs md:text-sm text-white hover:bg-emerald-700 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              پذیرش
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500 px-3 py-1.5 text-xs md:text-sm text-red-600 hover:bg-red-50 active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              رد
            </button>
          </>
        )}
      </div>

      {/* نوار پایین فقط در موبایل: نقش به صورت Badge برای صرفه‌جویی در فضا در بالا مخفی شده بود */}
      {payment?.role && (
        <footer className="mt-2 sm:hidden">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${roleStyle}`}>{payment.role}</span>
        </footer>
      )}

      {/* افکت فوکوس کارت */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-emerald-500/0 group-focus-within:ring-2 group-hover:ring-1 group-hover:ring-gray-100" />
    </article>
  );
});

export default PaymentItem;
