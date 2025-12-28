import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { X, Receipt, CreditCard, Calendar, Layers } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { getPersianType, getPersianStatus } from "../../../../../../shared/utils/typeUtils";
import { formatJalaliDate } from "../../../../../../shared/utils";
import { payBill } from "../../../store/slices/financeSlice";
import PaymentModal from "./PaymentModal";

export default function UnitFinancialDetailsModal({ isOpen, onClose, invoice, unitId }) {
  if (!invoice) return null;

  const raw = invoice.raw || invoice;

  const {
    title,
    expense_name,
    category,
    category_display,
    expense_type,
    type,
    total_amount,
    amount,
    issue_date,
    billing_date,
    bill_due,
    status,
    status_label,
    payments = [],
    shared_expense_info,
  } = raw;

  const displayTitle =
    expense_name ||
    shared_expense_info?.expense_name ||
    title ||
    getPersianType(expense_type || category_display || category || type || "هزینه", raw);

  const baseAmount = shared_expense_info?.total_amount ?? total_amount ?? 0;
  const unitShareAmount = shared_expense_info?.unit_share_amount ?? amount ?? total_amount ?? 0;
  const paidAmount = raw.paid_amount ?? 0;
  const remainingAmount = raw.remaining_amount ?? (baseAmount - paidAmount);

  const paymentMethodLabel = (() => {
    const pm = shared_expense_info?.payment_method;
    if (pm === "from_fund") return "از شارژ ساختمان";
    if (pm === "direct") return "مستقیم";
    if (pm === "online") return "آنلاین";
    if (pm === "card") return "کارت به کارت / دستگاه کارت‌خوان";
    return pm || "نامشخص";
  })();

  const distributionMethodLabel = (() => {
    const dm = shared_expense_info?.distribution_method;
    if (dm === "equal") return "تقسیم مساوی";
    if (dm === "per_person") return "بر اساس تعداد نفرات";
    if (dm === "area") return "بر اساس متراژ";
    if (dm === "parking") return "بر اساس تعداد پارکینگ";
    if (dm === "custom") return "سفارشی";
    return dm || "نامشخص";
  })();

  const statusText = getPersianStatus(status || status_label || "نامشخص");

  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const dispatch = useDispatch();

  const normalizedStatus = String(status || status_label || "").toLowerCase();
  const canPay =
    remainingAmount > 0 &&
    (normalizedStatus === "pending" ||
      normalizedStatus === "overdue" ||
      statusText === "منتظر پرداخت" ||
      statusText === "سررسید گذشته");

  const handlePaymentConfirm = async (paymentData) => {
    // اگر shared_bill داریم، باید شناسه قبض مشترک و unit_id را برای فلوی تایید مدیر بفرستیم
    const sharedBillId = shared_expense_info?.shared_bill_id;
    const billIdForApi = sharedBillId || raw.invoice_id;

    if (!billIdForApi) {
      toast.error("شناسه فاکتور/قبض برای پرداخت یافت نشد");
      return;
    }

    try {
      setIsPaying(true);

      const formData = new FormData();
      formData.append("bill_id", billIdForApi);
      // برای قبض‌های مشترک، حتماً unit_id را بفرستیم تا پرداخت فقط برای همان واحد ثبت شود
      if (sharedBillId && unitId) {
        formData.append("unit_id", unitId);
      }
      if (paymentData.description) {
        formData.append("description", paymentData.description);
      }
      if (paymentData.receiptImage) {
        formData.append("receipt_image", paymentData.receiptImage);
      }

      await dispatch(payBill(formData)).unwrap();
      toast.success("پرداخت با موفقیت ثبت شد و برای تایید مدیر ارسال شد");
      setShowPaymentModal(false);
    } catch (e) {
      console.error("Pay bill error (unit financial modal):", e);
      toast.error(typeof e === "string" ? e : "خطا در ثبت پرداخت");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white text-right shadow-2xl max-h-[90vh] flex flex-col">
              {/* Header - استایل تمیز و شبیه مدال گردش مالی */}
              <div className="flex justify-between items-center border-b px-5 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-melkingDarkBlue/10 via-melkingDarkBlue/5 to-white border border-melkingDarkBlue/15 shadow-sm">
                    <Receipt className="text-melkingDarkBlue" size={22} />
                  </div>
                  <div className="flex flex-col">
                    <Dialog.Title className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                      {displayTitle}
                    </Dialog.Title>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-[11px] px-2 py-0.5 text-gray-700">
                        {getPersianType(expense_type || category_display || category || type || "هزینه", raw)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-[11px] px-2 py-0.5 text-emerald-700 border border-emerald-100">
                        وضعیت: {statusText}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
                  aria-label="بستن"
                >
                  <X size={18} />
                </button>
              </div>

              {/* نوار پرداخت برای فاکتورهای منتظر پرداخت */}
              {canPay && (
                <div className="px-5 pt-3 pb-2 border-b bg-emerald-50/60">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    پرداخت این فاکتور
                  </button>
                </div>
              )}

              {/* Content - شبیه ساختار FinanceDetailsModal با پارامترهای مخصوص واحد */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm text-gray-700 flex-1">
                {/* گروه‌های اطلاعاتی اصلی */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border rounded-lg p-3">
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">💰 مبلغ کل هزینه</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {Number(baseAmount).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">🧩 سهم این واحد</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {Number(unitShareAmount).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">📅 تاریخ صدور</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {formatJalaliDate(issue_date || billing_date)}
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">📅 مهلت پرداخت</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {formatJalaliDate(bill_due)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border rounded-lg p-3">
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">📊 وضعیت فاکتور</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {statusText}
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">💳 روش پرداخت</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {paymentMethodLabel}
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">📊 روش تقسیم هزینه</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {distributionMethodLabel}
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">نوع هزینه</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {getPersianType(shared_expense_info?.expense_type || expense_type || category_display || category || type, raw)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border rounded-lg p-3">
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">مجموع پرداخت این واحد</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {Number(paidAmount).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="text-gray-500 text-xs">مانده این فاکتور برای واحد</span>
                      <span className="text-gray-800 mt-2 font-medium">
                        {Number(remainingAmount).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payments list - تمرکز روی اطلاعات پرداخت کاربر */}
                <div className="border border-gray-100 rounded-xl p-3 sm:p-4 bg-gray-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <CreditCard size={16} />
                      پرداخت‌ها
                    </h3>
                    <span className="text-xs text-gray-500">
                      {payments.length > 0
                        ? `${payments.length} پرداخت ثبت شده`
                        : "پرداختی ثبت نشده است"}
                    </span>
                  </div>

                  {payments.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">
                      هنوز هیچ پرداختی برای این فاکتور ثبت نشده است.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {payments.map((p) => (
                        <div
                          key={p.payment_id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 bg-white rounded-lg px-3 py-2 text-xs sm:text-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900">
                              {Number(p.amount || 0).toLocaleString("fa-IR")} تومان
                            </span>
                            <span className="text-gray-500">
                              تاریخ پرداخت:{" "}
                              <span className="font-medium">
                                {formatJalaliDate(p.date)}
                              </span>
                            </span>
                            {p.payment_reference && (
                              <span className="text-gray-500">
                                شناسه پرداخت:{" "}
                                <span className="font-mono text-[11px] sm:text-xs">
                                  {p.payment_reference}
                                </span>
                              </span>
                            )}
                            {p.description && (
                              <span className="text-gray-500 line-clamp-2">
                                توضیح: {p.description}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
                            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {getPersianStatus(p.status)}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {p.payment_method}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>

      {/* مدال پرداخت برای فاکتور واحد */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        transaction={{
          id: raw.invoice_id,
          title: displayTitle,
          amount: unitShareAmount,
        }}
        isPaying={isPaying}
      />
    </Transition>
  );
}

