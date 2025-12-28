import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Image as ImageIcon,
  Filter,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { PaymentBase } from "../../components/payments/PaymentList";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import { 
  fetchExtraPaymentRequests, 
  approveExtraPaymentRequest, 
  rejectExtraPaymentRequest 
} from "../../store/slices/extraPaymentSlice";
import { fetchTransactions, fetchCurrentFundBalance } from "../../store/slices/financeSlice";
import { fetchPendingPayments } from "../../store/slices/paymentsSlice";
import { formatNumber } from "../../../../../shared/utils/helper";
import { API_CONFIG } from "../../../../../config/api";

moment.loadPersian({ dialect: "persian-modern" });

export default function PaymentsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedBuilding = useSelector(selectSelectedBuilding);
  const { requests, loading, error } = useSelector((state) => state.extraPayment);
  const { payments } = useSelector((state) => state.payments);
  
  // Get building ID from selected building
  const buildingId = selectedBuilding?.building_id || selectedBuilding?.id || null;
  
  // Count pending payments and extra payment requests
  const pendingPaymentsCount = payments?.filter(p => p.status === 'pending')?.length || 0;
  const pendingExtraPaymentsCount = requests?.filter(r => r.status === 'pending')?.length || 0;
  
  const [activeTab, setActiveTab] = useState("payments"); // "payments" or "extra-payments"
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (buildingId && activeTab === "extra-payments") {
      loadRequests();
    }
  }, [buildingId, statusFilter, activeTab]);

  // Load pending payments when payments tab is active
  useEffect(() => {
    if (buildingId && activeTab === "payments") {
      dispatch(fetchPendingPayments({ buildingId, status: 'pending' }));
    }
  }, [buildingId, activeTab, dispatch]);

  const loadRequests = () => {
    if (buildingId) {
      dispatch(fetchExtraPaymentRequests({
        buildingId: buildingId,
        filters: statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}
      }));
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await dispatch(approveExtraPaymentRequest(requestId)).unwrap();
      toast.success("درخواست با موفقیت تایید شد");
      loadRequests();
      // Refresh transactions and fund balance to show the new transaction
      if (buildingId) {
        dispatch(fetchTransactions({ building_id: buildingId }));
        dispatch(fetchCurrentFundBalance(buildingId));
      }
    } catch (error) {
      toast.error(error || "خطا در تایید درخواست");
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error("لطفاً دلیل رد را وارد کنید");
      return;
    }

    try {
      await dispatch(rejectExtraPaymentRequest({
        requestId,
        reason: rejectionReason
      })).unwrap();
      toast.success("درخواست با موفقیت رد شد");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      toast.error(error || "خطا در رد درخواست");
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setRejectionReason("");
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason("");
  };

  const openImagePreview = (imageUrl) => {
    const fullUrl = imageUrl?.startsWith('http') 
      ? imageUrl 
      : `${API_CONFIG.MEDIA_URL}${imageUrl}`;
    setImagePreview(fullUrl);
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
        text: "در انتظار تایید"
      },
      approved: {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
        text: "تایید شده"
      },
      rejected: {
        icon: XCircle,
        color: "bg-red-100 text-red-800",
        text: "رد شده"
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon size={16} />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="p-2 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("payments")}
            className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "payments"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            بررسی پرداخت
            {pendingPaymentsCount > 0 && (
              <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ${
                pendingPaymentsCount > 9 ? 'min-w-[24px] h-6 px-1.5' : 'w-6 h-6'
              }`}>
                {pendingPaymentsCount > 99 ? '99+' : pendingPaymentsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("extra-payments")}
            className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "extra-payments"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            درخواست‌های پرداخت اضافی
            {pendingExtraPaymentsCount > 0 && (
              <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ${
                pendingExtraPaymentsCount > 9 ? 'min-w-[24px] h-6 px-1.5' : 'w-6 h-6'
              }`}>
                {pendingExtraPaymentsCount > 99 ? '99+' : pendingExtraPaymentsCount}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                 text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                 hover:shadow-md hover:from-white hover:to-gray-50
                 active:scale-95 transition-all duration-200 font-medium"
        >
          <ChevronLeft size={20} className="text-gray-600" />
          بازگشت
        </button>
      </div>

      {activeTab === "payments" ? (
        <PaymentBase buildingId={buildingId} />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">فیلتر وضعیت:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status === "all" && "همه"}
                    {status === "pending" && "در انتظار"}
                    {status === "approved" && "تایید شده"}
                    {status === "rejected" && "رد شده"}
                  </button>
                ))}
              </div>
              <button
                onClick={loadRequests}
                disabled={loading}
                className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span>بروزرسانی</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Requests List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500">در حال بارگذاری...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">درخواستی یافت نشد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {requests.map((request) => (
                  <div
                    key={request.request_id}
                    className="p-4 md:p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Main Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900">
                                {request.title}
                              </h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                              {request.user && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">کاربر:</span>
                                  <span>{request.user.full_name || request.user.phone_number || "نامشخص"}</span>
                                </div>
                              )}
                              {request.unit && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">واحد:</span>
                                  <span>واحد {request.unit.unit_number}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-medium">مبلغ:</span>
                                <span className="font-bold text-slate-900">
                                  {formatNumber(request.amount)} تومان
                                </span>
                              </div>
                              {request.payment_date && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">تاریخ پرداخت:</span>
                                  <span>
                                    {moment(request.payment_date).format("jYYYY/jMM/jDD")}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-medium">تاریخ ثبت:</span>
                                <span>
                                  {moment(request.created_at).format("jYYYY/jMM/jDD HH:mm")}
                                </span>
                              </div>
                            </div>
                            {request.description && (
                              <div className="mt-2">
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">توضیحات:</span> {request.description}
                                </p>
                              </div>
                            )}
                            {request.rejection_reason && (
                              <div className="mt-2">
                                <p className="text-sm text-red-600">
                                  <span className="font-medium">دلیل رد:</span> {request.rejection_reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Image Preview */}
                        {request.attachment_url && (
                          <div className="mt-3">
                            <button
                              onClick={() => openImagePreview(request.attachment_url)}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <ImageIcon size={18} />
                              <span className="text-sm font-medium">مشاهده تصویر فیش</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                          <button
                            onClick={() => handleApprove(request.request_id)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                            <span>تایید</span>
                          </button>
                          <button
                            onClick={() => openRejectModal(request)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            <XCircle size={18} />
                            <span>رد</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">رد درخواست</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                دلیل رد (اختیاری)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="دلیل رد درخواست را وارد کنید..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                انصراف
              </button>
              <button
                onClick={() => handleReject(selectedRequest.request_id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                رد درخواست
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">تصویر فیش</h3>
              <button
                onClick={closeImagePreview}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <XCircle size={24} className="text-slate-500" />
              </button>
            </div>
            <img
              src={imagePreview}
              alt="فیش پرداخت"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
