/**
 * BalanceDetailsModal Component
 * 
 * تفکیک وضعیت‌ها:
 * - وضعیت سیستم: وضعیت فنی تراکنش (تکمیل شده، در انتظار، ناموفق)
 * - وضعیت پرداخت ساکنین: وضعیت پرداخت واقعی ساکنین (همه پرداخت کردند، X از Y پرداخت کردند)
 * 
 * مثال:
 * - وضعیت سیستم: "تکمیل شده"
 * - وضعیت پرداخت ساکنین: "2 از 3 پرداخت کردند"
 */

import { 
  X, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  Download,
  Eye
} from "lucide-react";
import moment from "moment-jalaali";
import { formatNumber } from "../../../../../shared/utils/helper";
import { getPersianType, getPersianDistributionMethod } from "../../../../../shared/utils/typeUtils";
// import Modal from "../../../../../shared/components/shared/feedback/Modal";

moment.loadPersian({ dialect: "persian-modern" });

export default function BalanceDetailsModal({ transaction, onClose }) {
  if (!transaction) {
    return null;
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    try {
      return moment(dateString).format("jYYYY/jMM/jDD - HH:mm");
    } catch {
      return dateString;
    }
  };

  const getTransactionTypeInfo = (type) => {
    const typeInfo = {
      'income': { label: 'درآمد', color: 'text-green-600', bgColor: 'bg-green-50', icon: <ArrowUpRight size={16} /> },
      'expense': { label: 'هزینه', color: 'text-red-600', bgColor: 'bg-red-50', icon: <ArrowDownRight size={16} /> },
      'transfer': { label: 'انتقال', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: <CreditCard size={16} /> },
      'charge': { label: 'شارژ', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: <Clock size={16} /> },
      'maintenance': { label: 'تعمیرات', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: <Clock size={16} /> },
      'utility': { label: 'قبض', color: 'text-cyan-600', bgColor: 'bg-cyan-50', icon: <Clock size={16} /> },
      'other': { label: 'سایر', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: <DollarSign size={16} /> }
    };
    return typeInfo[type] || typeInfo['other'];
  };

  const typeInfo = getTransactionTypeInfo(transaction.type);

  const handleDownloadAttachment = () => {
    if (transaction.attachment_url) {
      const link = document.createElement('a');
      link.href = transaction.attachment_url;
      link.download = `attachment-${transaction.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
              {typeInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                جزئیات تراکنش
              </h2>
              <p className="text-sm text-gray-500">
                شناسه: {transaction.id || "—"}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>


        {/* Transaction Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موضوع
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-medium">
                    {getPersianType(transaction.subject) || transaction.subject || "بدون عنوان"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع تراکنش
                </label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                    {typeInfo.icon}
                    {typeInfo.label}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ
                </label>
                <div className={`p-3 rounded-lg ${transaction.amount > 0 ? 'bg-green-50' : transaction.amount < 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`flex items-center gap-2 text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : transaction.amount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {transaction.amount > 0 ? <ArrowUpRight size={20} /> : transaction.amount < 0 ? <ArrowDownRight size={20} /> : <DollarSign size={20} />}
                    {formatNumber(Math.abs(transaction.amount || 0))} تومان
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ و زمان
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar size={16} />
                    <span>{formatDateTime(transaction.date) || transaction.date || "—"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وضعیت سیستم
                </label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status === 'completed' ? 'تکمیل شده' :
                     transaction.status === 'pending' ? 'در انتظار' :
                     transaction.status === 'failed' ? 'ناموفق' :
                     'نامشخص'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مانده بعد از تراکنش
                </label>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                    <DollarSign size={20} />
                    {formatNumber(transaction.balance_after || transaction.balance || 0)} تومان
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">
                {transaction.description || "بدون توضیحات"}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                انتخاب واحدها
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">
                  {transaction.unit_selection || "همه واحدها"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نحوه تقسیم
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">
                  {getPersianDistributionMethod(transaction.distribution_method) || "بر اساس تعداد نفر"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت پرداخت ساکنین
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">
                  {transaction.payment_status || "تکمیل شده"}
                </p>
              </div>
            </div>

            {transaction.reference_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره مرجع
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-mono">
                    {transaction.reference_number}
                  </p>
                </div>
              </div>
            )}

            {transaction.payment_method && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  روش پرداخت
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">
                    {transaction.payment_method}
                  </p>
                </div>
              </div>
            )}

            {transaction.created_by && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ثبت شده توسط
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <p className="text-gray-900">
                      {transaction.created_by}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {transaction.building_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ساختمان
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-500" />
                    <p className="text-gray-900">
                      {transaction.building_name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attachment */}
          {transaction.attachment_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پیوست
              </label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        فایل پیوست
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.attachment_url.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDownloadAttachment}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    دانلود
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            بستن
          </button>
          
          {transaction.attachment_url && (
            <button
              onClick={handleDownloadAttachment}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              دانلود پیوست
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
