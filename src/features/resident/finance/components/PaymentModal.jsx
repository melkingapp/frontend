import { useState } from "react";
import { X, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { toast } from "sonner";
import { payBill } from "../../../../shared/services/billingService";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function PaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen || !invoice) {
    return null;
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const paymentData = {
        invoice_id: invoice.invoice_id,
        amount: invoice.amount,
        payment_method: paymentMethod,
      };

      const response = await payBill(paymentData);

      if (response.success) {
        toast.success("درخواست پرداخت با موفقیت ثبت شد");
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        onClose();
      } else {
        toast.error(response.message || "خطا در پردازش پرداخت");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "خطا در پردازش پرداخت");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تایید پرداخت</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Invoice Details */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-2">اطلاعات فاکتور</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">دسته‌بندی:</span>
                <span className="font-semibold">{invoice.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">واحد:</span>
                <span className="font-semibold">{invoice.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">سررسید:</span>
                <span className="font-semibold">
                  {moment(invoice.due_date).format("jYYYY/jMM/jDD")}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="text-gray-900 font-bold">مبلغ:</span>
                <span className="text-lg font-bold text-blue-600">
                  {invoice.amount.toLocaleString()} تومان
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              روش پرداخت
            </p>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="mr-3">
                  <span className="font-semibold text-gray-900">
                    💳 پرداخت آنلاین
                  </span>
                  <p className="text-xs text-gray-500">
                    پرداخت از طریق درگاه آنلاین
                  </p>
                </span>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="mr-3">
                  <span className="font-semibold text-gray-900">
                    📸 کارت به کارت
                  </span>
                  <p className="text-xs text-gray-500">
                    کارت به کارت و ارسال فیش
                  </p>
                </span>
              </label>
            </div>
          </div>

          {/* Warning */}
          {invoice.is_overdue && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700">
                ⚠️ این فاکتور سررسید گذشته دارد. لطفاً در اسرع وقت پرداخت کنید.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            disabled={isLoading}
          >
            لغو
          </button>
          <button
            onClick={() => {
              if (!showConfirm) {
                setShowConfirm(true);
              } else {
                handlePayment();
              }
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                درحال پردازش...
              </>
            ) : showConfirm ? (
              <>
                <CheckCircle size={18} />
                تایید نهایی
              </>
            ) : (
              "ادامه"
            )}
          </button>
        </div>

        {/* Confirmation Message */}
        {showConfirm && (
          <div className="bg-yellow-50 border-t border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">
              ✓ آیا می‌خواهید برای پرداخت {invoice.amount.toLocaleString()} تومان
              تایید کنید؟
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
