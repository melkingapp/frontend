import { useState, useEffect } from "react";
import { Building, User, Phone, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Home, Car, Users } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembershipRequests, approveMembershipRequestByManager, rejectMembershipRequest } from "../membershipSlice";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: "bg-yellow-100 text-yellow-800", 
      text: "در انتظار تایید مالک" 
    },
    owner_approved: { 
      icon: AlertCircle, 
      color: "bg-blue-100 text-blue-800", 
      text: "تایید شده توسط مالک" 
    },
    manager_approved: { 
      icon: CheckCircle, 
      color: "bg-green-100 text-green-800", 
      text: "تایید شده توسط مدیر" 
    },
    rejected: { 
      icon: XCircle, 
      color: "bg-red-100 text-red-800", 
      text: "رد شده" 
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.text}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const roleConfig = {
    resident: { color: "bg-blue-100 text-blue-800", text: "ساکن" },
    owner: { color: "bg-purple-100 text-purple-800", text: "مالک" },
  };

  const config = roleConfig[role] || roleConfig.resident;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

export default function ManagerMembershipApproval() {
  const dispatch = useDispatch();
  const { requests, loading, error, approveLoading, rejectLoading } = useSelector(state => state.membership);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    // دریافت درخواست‌های عضویت که مالک تایید کرده و منتظر تایید مدیر هستند
    dispatch(fetchMembershipRequests({ status: 'owner_approved' }));
  }, [dispatch]);

  const handleApprove = async (requestId) => {
    if (window.confirm('آیا از تایید نهایی این درخواست عضویت اطمینان دارید؟ این عمل باعث ایجاد واحد و دسترسی ساکن به سیستم می‌شود.')) {
      try {
        await dispatch(approveMembershipRequestByManager(requestId)).unwrap();
        toast.success('درخواست عضویت تایید شد و واحد ایجاد شد');
        // بروزرسانی لیست
        dispatch(fetchMembershipRequests({ status: 'owner_approved' }));
      } catch (error) {
        console.error('Error approving request:', error);
        toast.error('خطا در تایید درخواست: ' + error);
      }
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('دلیل رد درخواست را وارد کنید:');
    if (reason && reason.trim()) {
      try {
        await dispatch(rejectMembershipRequest({ requestId, rejectionReason: reason.trim() })).unwrap();
        toast.success('درخواست عضویت رد شد');
        // بروزرسانی لیست
        dispatch(fetchMembershipRequests({ status: 'owner_approved' }));
      } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('خطا در رد درخواست: ' + error);
      }
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRequest(null);
  };

  // فیلتر درخواست‌هایی که مالک تایید کرده و منتظر تایید مدیر هستند
  const pendingManagerRequests = requests.filter(request => 
    request.status === 'owner_approved'
  );

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">تایید نهایی درخواست‌های عضویت</h2>
          <p className="text-sm text-gray-600 mt-1">
            درخواست‌هایی که مالک تایید کرده و منتظر تایید نهایی مدیر هستند
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchMembershipRequests({ status: 'owner_approved' }))}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          بروزرسانی
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">منتظر تایید مدیر</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingManagerRequests.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">تایید شده توسط مدیر</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'manager_approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">رد شده</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {pendingManagerRequests.length === 0 ? (
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواستی یافت نشد</h3>
          <p className="text-gray-600">هیچ درخواست عضویتی منتظر تایید مدیر نیست.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingManagerRequests.map((request) => (
            <div
              key={request.request_id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.full_name}</h3>
                      <p className="text-sm text-gray-600">{request.building_title}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">واحد</p>
                        <p className="text-sm font-medium">{request.unit_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">طبقه</p>
                        <p className="text-sm font-medium">{request.floor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">نقش</p>
                        <RoleBadge role={request.role} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">تاریخ</p>
                        <p className="text-sm font-medium">{moment(request.created_at).format('jYYYY/jMM/jDD')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">شماره تماس</p>
                        <p className="text-sm font-medium">{request.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">تعداد نفر</p>
                        <p className="text-sm font-medium">{request.resident_count}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>کد ساختمان:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{request.building_code}</span>
                  </div>

                  {/* پارکینگ */}
                  {request.has_parking && (
                    <div className="flex items-center gap-2 mb-4">
                      <Car size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">پارکینگ</p>
                        <p className="text-sm font-medium">
                          دارد ({request.parking_count} عدد)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* اطلاعات مالک */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">
                      <strong>✅ تایید شده توسط مالک:</strong> این درخواست توسط مالک ساختمان تایید شده است.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Building size={16} />
                    جزئیات
                  </button>
                  
                  <button
                    onClick={() => handleApprove(request.request_id)}
                    disabled={approveLoading}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <CheckCircle size={16} />
                    تایید نهایی
                  </button>
                  
                  <button
                    onClick={() => handleReject(request.request_id)}
                    disabled={rejectLoading}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <XCircle size={16} />
                    رد
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">جزئیات درخواست عضویت</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">نام و نام خانوادگی</label>
                  <p className="text-sm text-gray-900">{selectedRequest.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">شماره تماس</label>
                  <p className="text-sm text-gray-900">{selectedRequest.phone_number}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ساختمان</label>
                  <p className="text-sm text-gray-900">{selectedRequest.building_title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">کد ساختمان</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedRequest.building_code}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">واحد</label>
                  <p className="text-sm text-gray-900">{selectedRequest.unit_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">طبقه</label>
                  <p className="text-sm text-gray-900">{selectedRequest.floor}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">متراژ</label>
                  <p className="text-sm text-gray-900">{selectedRequest.area} متر مربع</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">نقش</label>
                  <RoleBadge role={selectedRequest.role} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تعداد نفر</label>
                  <p className="text-sm text-gray-900">{selectedRequest.resident_count}</p>
                </div>
              </div>
              
              {selectedRequest.has_parking && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">پارکینگ</label>
                  <p className="text-sm text-gray-900">دارد ({selectedRequest.parking_count} عدد)</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">تاریخ ارسال</label>
                <p className="text-sm text-gray-900">{moment(selectedRequest.created_at).format('jYYYY/jMM/jDD HH:mm')}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <strong>✅ تایید شده توسط مالک:</strong> این درخواست توسط مالک ساختمان تایید شده است و منتظر تایید نهایی مدیر است.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}