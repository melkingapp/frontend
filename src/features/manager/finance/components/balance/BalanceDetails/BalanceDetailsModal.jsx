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
  Eye,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useSelector } from "react-redux";
import moment from "moment-jalaali";
import { formatNumber } from "../../../../../../shared/utils/helper";
import { getPersianType, getPersianDistributionMethod } from "../../../../../../shared/utils/typeUtils";
// import Modal from "../../../../../shared/components/shared/feedback/Modal";

moment.loadPersian({ dialect: "persian-modern" });

export default function BalanceDetailsModal({ transaction, onClose, isManager, transactionDetails }) {
  const user = useSelector((state) => state.auth?.user);
  const isUserManager = isManager || user?.role === 'manager';
  if (!transaction) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    try {
      return moment(dateString).format("HH:mm");
    } catch {
      return "—";
    }
  };

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

          {/* Unit Payment Details - Only for Managers */}
          {isUserManager && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">جزئیات پرداخت واحدها</h3>
              </div>
              
              <div className="space-y-3">
                {((transaction.payments || transaction.unit_payments || transactionDetails?.unit_payments || transactionDetails?.incomes_list || [])).map((payment, index) => {
                  // Handle different data structures
                  const unitNumber = payment.unit_number || payment.unit_id || payment.unit?.unit_number || "—";
                  const amount = payment.amount || payment.payment_amount || payment.total_amount || 0;
                  const paymentDate = payment.payment_date || payment.date || payment.created_at || payment.issue_date;
                  const status = payment.status || payment.payment_status;
                  const paymentMethod = payment.payment_method;
                  
                  return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">شماره واحد</label>
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-gray-400" />
                          <p className="text-sm font-semibold text-gray-900">{unitNumber}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">مبلغ پرداخت</label>
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-gray-400" />
                          <p className="text-sm font-semibold text-gray-900">{formatNumber(amount)} ریال</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">تاریخ پرداخت</label>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <p className="text-sm text-gray-900">{formatDateTime(paymentDate) || "—"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">وضعیت</label>
                        <div className="flex items-center gap-2">
                          {status === 'paid' || payment.status === 'paid' ? (
                            <>
                              <CheckCircle size={14} className="text-green-500" />
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">پرداخت شده</span>
                            </>
                          ) : status === 'pending' || payment.status === 'pending' ? (
                            <>
                              <AlertCircle size={14} className="text-yellow-500" />
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">در انتظار</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="text-red-500" />
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">پرداخت نشده</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {paymentMethod && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">روش پرداخت</label>
                        <p className="text-sm text-gray-700">{paymentMethod}</p>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
              
              {((!transaction.payments || transaction.payments.length === 0) && 
                (!transaction.unit_payments || transaction.unit_payments.length === 0) && 
                (!transactionDetails?.unit_payments || transactionDetails.unit_payments.length === 0) &&
                (!transactionDetails?.incomes_list || transactionDetails.incomes_list.length === 0)) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <Users size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">هیچ اطلاعات پرداختی برای این تراکنش ثبت نشده است</p>
                </div>
              )}
            </div>
          )}

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
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <p className="text-gray-900 font-semibold">
                  {transaction.payment_status || transaction.payment_status_label || "تکمیل شده"}
                </p>
                {transaction.payment_status_counts && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'paid', label: 'پرداخت شده', color: 'text-green-700', bg: 'bg-green-50' },
                      { key: 'awaiting_manager', label: 'منتظر تایید مدیر', color: 'text-yellow-700', bg: 'bg-yellow-50' },
                      { key: 'pending', label: 'پرداخت نشده', color: 'text-red-700', bg: 'bg-red-50' },
                    ].map((item) => (
                      <div key={item.key} className={`p-2 rounded-lg text-center ${item.bg}`}>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className={`text-lg font-bold ${item.color}`}>
                          {transaction.payment_status_counts[item.key] || 0}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          از {transaction.payment_status_total || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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
