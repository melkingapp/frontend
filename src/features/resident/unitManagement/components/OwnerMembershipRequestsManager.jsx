import { useState, useEffect } from "react";
import { Building, User, Phone, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Home, Car, Users, Bug } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembershipRequests, approveMembershipRequestByOwner, rejectMembershipRequest } from "../../../membership/membershipSlice";
import membershipApi from "../../../../shared/services/membershipApi";
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

export default function OwnerMembershipRequestsManager() {
  const dispatch = useDispatch();
  const { requests, loading, error, approveLoading, rejectLoading } = useSelector(state => state.membership);
  const { user } = useSelector(state => state.auth);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);

  useEffect(() => {
    // دریافت درخواست‌های عضویت مخصوص مالک
    // مالک هم نقش resident دارد اما باید درخواست‌های عضویت ساکنان را ببیند
    console.log("🔍 OwnerMembershipRequestsManager useEffect - user:", user);
    
    // همیشه از API مخصوص مالک استفاده کن (چون این کامپوننت فقط برای مالک است)
    dispatch(fetchMembershipRequests({ owner_id: user.id }));
  }, [dispatch, user]);

  const handleApprove = async (requestId) => {
    try {
      await dispatch(approveMembershipRequestByOwner(requestId)).unwrap();
      toast.success('درخواست عضویت تایید شد و برای تایید نهایی به مدیر ارسال شد');
      // بروزرسانی لیست
      refreshRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('خطا در تایید درخواست: ' + error);
    }
  };

  const handleReject = async (requestId) => {
    setRejectingRequestId(requestId);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('لطفاً دلیل رد را وارد کنید');
      return;
    }

    try {
      await dispatch(rejectMembershipRequest({ 
        requestId: rejectingRequestId, 
        rejectionReason: rejectReason.trim() 
      })).unwrap();
      toast.success('درخواست عضویت رد شد');
      setRejectReason('');
      setRejectingRequestId(null);
      // بروزرسانی لیست
      refreshRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('خطا در رد درخواست: ' + error);
    }
  };

  const cancelReject = () => {
    setRejectReason('');
    setRejectingRequestId(null);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRequest(null);
  };

  const refreshRequests = () => {
    // همیشه از API مخصوص مالک استفاده کن
    dispatch(fetchMembershipRequests({ owner_id: user.id }));
  };

  // فیلتر درخواست‌هایی که مالک باید تایید کند
  // درخواست‌هایی که مربوط به ساختمان‌هایی هستند که مالک در آن‌ها واحد دارد
  
  // ابتدا ساختمان‌های مالک را از درخواست‌های خودش پیدا کن
  // مالک هم نقش resident دارد اما owner_type یا relationship متفاوت است
  const ownerApprovedRequests = requests.filter(req => 
    req.user === user?.id &&
    (req.role === 'owner' || (req.role === 'resident' && req.owner_type && ['landlord', 'resident'].includes(req.owner_type)))
  );
  const ownerBuildingIds = ownerApprovedRequests.map(req => req.building);
  
  // اگر ساختمان‌های مالک از user.buildings موجود باشد، از آن استفاده کن
  const userBuildings = user?.buildings || [];
  const userBuildingIds = userBuildings.map(building => building.building_id || building.id);
  
  // ترکیب هر دو منبع
  const allOwnerBuildingIds = [...new Set([...ownerBuildingIds, ...userBuildingIds])];
  
  // فیلتر درخواست‌هایی که مالک باید ببیند
  // فقط درخواست‌های ساکنان تایید شده توسط مالک
  const ownerRequests = requests.filter(request => {
    // فقط درخواست‌های ساکنان که توسط این مالک تایید شده‌اند
    return request.role === 'resident' && request.owner_approved_by === user?.id;
  });
  
  // Debug log
  console.log("🔍 OwnerMembershipRequestsManager - user:", user);
  console.log("🔍 OwnerMembershipRequestsManager - requests:", requests);
  console.log("🔍 OwnerMembershipRequestsManager - ownerApprovedRequests:", ownerApprovedRequests);
  console.log("🔍 OwnerMembershipRequestsManager - ownerBuildingIds:", ownerBuildingIds);
  console.log("🔍 OwnerMembershipRequestsManager - userBuildings:", userBuildings);
  console.log("🔍 OwnerMembershipRequestsManager - userBuildingIds:", userBuildingIds);
  console.log("🔍 OwnerMembershipRequestsManager - allOwnerBuildingIds:", allOwnerBuildingIds);
  console.log("🔍 OwnerMembershipRequestsManager - ownerRequests:", ownerRequests);
  
  // Debug: نمایش جزئیات درخواست‌ها
  console.log("🔍 Detailed requests analysis:");
  requests.forEach((req, index) => {
    console.log(`Request ${index}:`, {
      id: req.request_id,
      user: req.user,
      user_name: req.full_name,
      building: req.building,
      building_title: req.building_title,
      role: req.role,
      owner_type: req.owner_type,
      status: req.status,
      is_owner_request: req.user === user?.id && (req.role === 'owner' || (req.role === 'resident' && req.owner_type && ['landlord', 'resident'].includes(req.owner_type)))
    });
  });
  
  // Debug: نمایش درخواست‌های کاربر با جزئیات
  const userRequests = requests.filter(req => req.user === user?.id);
  console.log("🔍 User's own requests:", userRequests.map(req => ({
    id: req.request_id,
    building: req.building,
    building_title: req.building_title,
    role: req.role,
    owner_type: req.owner_type,
    status: req.status,
    unit_number: req.unit_number
  })));

  // Debug: نمایش تمام درخواست‌ها
  console.log("🔍 All requests:", requests.map(req => ({
    id: req.request_id,
    user: req.user,
    user_name: req.full_name,
    building: req.building,
    building_title: req.building_title,
    role: req.role,
    owner_type: req.owner_type,
    status: req.status,
    unit_number: req.unit_number
  })));

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
          <h2 className="text-xl font-semibold text-gray-900">درخواست‌های عضویت برای ساختمان‌های من</h2>
          <p className="text-sm text-gray-600 mt-1">
            بررسی و تایید درخواست‌های عضویت ساکنان در ساختمان‌های شما
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshRequests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">در انتظار تایید</p>
              <p className="text-2xl font-bold text-gray-900">
                {ownerRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">تایید شده توسط من</p>
              <p className="text-2xl font-bold text-gray-900">
                {ownerRequests.filter(r => r.owner_approved_by === user?.id).length}
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
                {ownerRequests.filter(r => r.status === 'manager_approved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {ownerRequests.length === 0 ? (
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواست عضویتی تایید نکرده‌اید</h3>
          <p className="text-gray-600">هنوز هیچ درخواست عضویتی توسط شما تایید نشده است.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ownerRequests.map((request) => (
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

                  {/* تاریخ تایید/رد */}
                  {request.status === 'owner_approved' && request.owner_approved_at && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                      <CheckCircle size={16} />
                      <span>تایید شده توسط شما در {moment(request.owner_approved_at).format('jYYYY/jMM/jDD HH:mm')}</span>
                    </div>
                  )}
                  
                  {request.status === 'manager_approved' && request.manager_approved_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                      <CheckCircle size={16} />
                      <span>تایید نهایی توسط مدیر در {moment(request.manager_approved_at).format('jYYYY/jMM/jDD HH:mm')}</span>
                    </div>
                  )}
                  
                  {request.status === 'rejected' && request.rejected_at && (
                    <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
                      <XCircle size={16} />
                      <span>رد شده در {moment(request.rejected_at).format('jYYYY/jMM/jDD HH:mm')}</span>
                      {request.rejection_reason && (
                        <span className="text-gray-600">- دلیل: {request.rejection_reason}</span>
                      )}
                    </div>
                  )}

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
                  
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.request_id)}
                        disabled={approveLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} />
                        تایید
                      </button>
                      
                      <button
                        onClick={() => handleReject(request.request_id)}
                        disabled={rejectLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                        رد
                      </button>
                    </>
                  )}
                  
                  {request.status === 'owner_approved' && (
                    <div className="text-center">
                      <p className="text-sm text-blue-600 font-medium">
                        در انتظار تایید مدیر
                      </p>
                    </div>
                  )}
                  
                  {request.status === 'manager_approved' && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ تایید شده توسط مدیر
                      </p>
                    </div>
                  )}
                  
                  {request.status === 'rejected' && (
                    <div className="text-center">
                      <p className="text-sm text-red-600 font-medium">
                        ❌ رد شده
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Reject Reason Form */}
              {rejectingRequestId === request.request_id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="text-sm font-medium text-red-800 mb-2">
                    دلیل رد درخواست:
                  </h5>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="دلیل رد درخواست را وارد کنید..."
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    rows={3}
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={confirmReject}
                      disabled={rejectLoading || !rejectReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {rejectLoading ? 'در حال رد...' : 'تایید رد'}
                    </button>
                    <button
                      onClick={cancelReject}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}