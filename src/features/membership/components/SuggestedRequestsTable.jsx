import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Building2, 
  User, 
  Home,
  Calendar,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  selectUnitData,
  selectUnitsData,
  selectUnitLoading,
  selectMembershipRequests,
  fetchUnitByPhone,
  createMembershipRequest,
  rejectSuggestedMembershipRequest,
  fetchMembershipRequests,
  clearUnitData
} from '../membershipSlice';
import { fetchApprovedBuildings, selectApprovedBuildings } from '../../resident/building/residentBuildingSlice';
import MembershipRequestForm from './MembershipRequestForm';

// Modal برای رد درخواست
function RejectModal({ isOpen, onClose, onReject, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onReject(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          رد درخواست عضویت
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              دلیل رد (اختیاری)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="دلیل رد درخواست را وارد کنید..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              رد کردن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// کامپوننت Status Badge
function StatusBadge({ status }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار تایید' },
    suggested: { color: 'bg-blue-100 text-blue-800', text: 'پیشنهادی' },
  };
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}

// کامپوننت Role Badge
function RoleBadge({ role }) {
  const roleConfig = {
    owner: { color: 'bg-purple-100 text-purple-800', text: 'مالک' },
    resident: { color: 'bg-green-100 text-green-800', text: 'مستاجر' },
    tenant: { color: 'bg-green-100 text-green-800', text: 'مستاجر' },
  };
  const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-800', text: role };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}

export default function SuggestedRequestsTable() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const unitData = useSelector(selectUnitData);
  const unitsData = useSelector(selectUnitsData);
  const loading = useSelector(selectUnitLoading);
  const membershipRequests = useSelector(selectMembershipRequests);
  const approvedBuildings = useSelector(selectApprovedBuildings);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // شماره تلفن کاربر
  const effectivePhoneNumber = useMemo(() =>
    user?.phone_number || user?.username || '',
    [user?.phone_number, user?.username]
  );

  // بارگذاری اطلاعات واحد با همان endpoint که فرم استفاده می‌کند
  useEffect(() => {
    if (effectivePhoneNumber) {
      dispatch(fetchUnitByPhone(effectivePhoneNumber));
    }
  }, [dispatch, effectivePhoneNumber]);

  // فیلتر کردن درخواست‌های suggested که باید نمایش داده شوند
  // فقط درخواست‌هایی که کاربر هنوز برای آن ساختمان تایید نشده باشد
  const sortedRequests = useMemo(() => {
    if (!unitsData || unitsData.length === 0) return [];
    
    return unitsData.filter(request => {
      // چک کن که آیا کاربر قبلاً درخواست تایید شده برای این ساختمان داره یا نه
      const hasApprovedRequest = membershipRequests.some(req => {
        const buildingCodeMatch = req.building_code === request.building_code;
        const buildingIdMatch = (req.building_id === request.building_id) || 
                                (req.building === request.building_id) ||
                                (req.building_id === request.building_id);
        const statusMatch = req.status === 'approved' || 
                          req.status === 'owner_approved' || 
                          req.status === 'manager_approved';
        return (buildingCodeMatch || buildingIdMatch) && statusMatch;
      });

      // چک کن که آیا کاربر قبلاً از طریق BuildingUser برای این ساختمان عضو شده یا نه
      const hasApprovedBuilding = approvedBuildings.some(building => {
        const buildingCodeMatch = building.building_code === request.building_code;
        const buildingIdMatch = (building.building_id === request.building_id) || 
                                (building.id === request.building_id) ||
                                (building.building_id === request.building_id);
        return buildingCodeMatch || buildingIdMatch;
      });

      // فقط درخواست‌هایی که هنوز تایید نشده‌اند را نمایش بده
      if (hasApprovedRequest || hasApprovedBuilding) {
        return false;
      }
      
      // فقط درخواست‌های suggested را نمایش بده (is_suggested === true یا request_id وجود دارد)
      return request.is_suggested === true || request.request_id;
    }).sort((a, b) => {
      // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول)
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });
  }, [unitsData, membershipRequests, approvedBuildings]);

  const handleRefresh = () => {
    if (effectivePhoneNumber) {
      dispatch(fetchUnitByPhone(effectivePhoneNumber));
    }
  };

  const handleEditClick = (request) => {
    setSelectedRequest(request);
    setShowEditForm(true);
  };

  const handleApprove = async (request) => {
    setProcessingId(request.request_id);
    try {
      // ارسال درخواست تایید با همان داده‌ها
      const payload = {
        building_code: request.building_code,
        full_name: request.full_name,
        phone_number: request.phone_number,
        unit_number: request.unit_number,
        floor: request.floor,
        area: request.area,
        resident_count: request.resident_count || 1,
        role: request.role === 'tenant' ? 'resident' : request.role,
        owner_type: request.owner_type || null,
        owner_full_name: request.owner_full_name || null,
        owner_phone_number: request.owner_phone_number || null,
        tenant_full_name: request.tenant_full_name || null,
        tenant_phone_number: request.tenant_phone_number || null,
        has_parking: request.has_parking || false,
        parking_count: request.parking_count || 0,
      };

      await dispatch(createMembershipRequest(payload)).unwrap();
      
      toast.success('درخواست عضویت با موفقیت تایید شد');
      
      // به‌روزرسانی لیست‌ها
      await Promise.all([
        dispatch(fetchApprovedBuildings()),
        dispatch(fetchMembershipRequests())
      ]);
      
      // بارگذاری مجدد درخواست‌های suggested برای به‌روزرسانی لیست
      if (effectivePhoneNumber) {
        await dispatch(fetchUnitByPhone(effectivePhoneNumber));
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : (error?.message || 'خطا در تایید درخواست');
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (request) => {
    setRequestToReject(request);
    setShowRejectModal(true);
  };

  const handleReject = async (reason) => {
    if (!requestToReject) return;
    
    setProcessingId(requestToReject.request_id);
    try {
      await dispatch(rejectSuggestedMembershipRequest({
        requestId: requestToReject.request_id,
        rejectionReason: reason
      })).unwrap();

      toast.success('درخواست عضویت رد شد');
      setShowRejectModal(false);
      setRequestToReject(null);
      
      // بارگذاری مجدد درخواست‌های suggested برای به‌روزرسانی لیست
      if (effectivePhoneNumber) {
        await dispatch(fetchUnitByPhone(effectivePhoneNumber));
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : (error?.message || 'خطا در رد درخواست');
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFormClose = () => {
    setShowEditForm(false);
    setSelectedRequest(null);
    // پاک کردن و بارگذاری مجدد داده‌ها پس از بستن فرم
    dispatch(clearUnitData());
    // بارگذاری مجدد برای چک کردن وضعیت جدید
    if (effectivePhoneNumber) {
      setTimeout(() => {
        dispatch(fetchUnitByPhone(effectivePhoneNumber));
      }, 500);
    }
  };

  // اگر درخواستی نیست، چیزی نمایش نده
  if (!sortedRequests || sortedRequests.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* هدر */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <AlertCircle size={22} className="text-yellow-200" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">
                  درخواست‌های عضویت در انتظار تایید
                </h3>
                <p className="text-blue-100 text-sm font-medium">
                  {sortedRequests.length} درخواست از طرف مدیر ساختمان
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="بروزرسانی"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* جدول */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ساختمان
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  واحد
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  نام
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  نقش
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  تاریخ
                </th>
                <th className="px-5 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRequests.map((request, index) => {
                const isProcessing = processingId === request.request_id;
                
                return (
                  <tr 
                    key={request.request_id}
                    className={`group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${index === 0 ? 'bg-blue-50/30' : 'bg-white'}`}
                  >
                    {/* ساختمان */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {request.building_title}
                          </div>
                          <div className="text-xs text-gray-500">
                            کد: {request.building_code}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* واحد */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            واحد {request.unit_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            طبقه {request.floor} - {request.area} متر
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* نام */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <div className="font-medium text-gray-900 text-sm">
                          {request.full_name}
                        </div>
                      </div>
                    </td>

                    {/* نقش */}
                    <td className="px-4 py-4">
                      <RoleBadge role={request.role} />
                    </td>

                    {/* تاریخ */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(request.created_at).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </td>

                    {/* عملیات */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* دکمه ویرایش */}
                        <button
                          onClick={() => handleEditClick(request)}
                          disabled={isProcessing}
                          className="p-2.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                          title="ویرایش و تایید"
                        >
                          <Edit3 size={18} />
                        </button>

                        {/* دکمه تایید */}
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={isProcessing}
                          className="p-2.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110 flex items-center gap-1"
                          title="تایید"
                        >
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </button>

                        {/* دکمه رد */}
                        <button
                          onClick={() => handleRejectClick(request)}
                          disabled={isProcessing}
                          className="p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                          title="رد کردن"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* راهنما */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Info size={16} className="text-blue-500 flex-shrink-0" />
            <span>برای ویرایش اطلاعات روی دکمه ویرایش کلیک کنید. تایید مستقیم بدون تغییر اطلاعات نیز امکان‌پذیر است.</span>
          </p>
        </div>
      </div>

      {/* فرم ویرایش */}
      {showEditForm && selectedRequest && (
        <MembershipRequestForm
          isOpen={showEditForm}
          onClose={handleFormClose}
        />
      )}

      {/* Modal رد درخواست */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRequestToReject(null);
        }}
        onReject={handleReject}
        loading={processingId === requestToReject?.request_id}
      />
    </>
  );
}

