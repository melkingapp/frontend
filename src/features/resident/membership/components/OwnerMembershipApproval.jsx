import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Building, 
  Phone,
  MapPin,
  Users,
  Calendar,
  Edit
} from 'lucide-react';
import { 
  fetchMembershipRequests, 
  approveMembershipRequestByOwner, 
  rejectMembershipRequest,
  editMembershipRequest,
  selectMembershipRequests,
  selectMembershipLoading,
  selectMembershipError,
  selectMembershipApproveLoading,
  selectMembershipRejectLoading
} from '../../../membership/membershipSlice';
import { toast } from 'sonner';

const StatusBadge = ({ status }) => {
  const config = {
    pending: { 
      text: 'در انتظار تأیید مالک', 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Clock size={16} />
    },
    owner_approved: { 
      text: 'تأیید شده توسط مالک', 
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <CheckCircle size={16} />
    },
    manager_approved: { 
      text: 'تأیید شده توسط مدیر', 
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle size={16} />
    },
    rejected: { 
      text: 'رد شده', 
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle size={16} />
    }
  };

  const { text, className, icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${className}`}>
      {icon}
      {text}
    </span>
  );
};

const RequestCard = ({ request, onApprove, onReject, onViewDetails, onEdit, approveLoading, rejectLoading }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{request.full_name}</h3>
            <p className="text-sm text-gray-600">{request.phone_number}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building size={16} />
          <span>ساختمان: {request.building_title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>واحد {request.unit_number} - طبقه {request.floor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} />
          <span>{request.resident_count} نفر</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{new Date(request.created_at).toLocaleDateString('fa-IR')}</span>
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(request.request_id)}
            disabled={approveLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle size={16} />
            {approveLoading ? 'در حال تأیید...' : 'تأیید'}
          </button>
          <button
            onClick={() => onReject(request.request_id)}
            disabled={rejectLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle size={16} />
            {rejectLoading ? 'در حال رد...' : 'رد'}
          </button>
          <button
            onClick={() => onEdit(request)}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onViewDetails(request)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>
      )}

      {request.status === 'owner_approved' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            ✅ این درخواست توسط شما تأیید شده و برای تأیید نهایی به مدیر ارسال شده است.
          </p>
        </div>
      )}

      {request.status === 'manager_approved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            🎉 این درخواست کاملاً تأیید شده و مستاجر به سیستم دسترسی پیدا کرده است.
          </p>
        </div>
      )}

      {request.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            ❌ این درخواست رد شده است.
            {request.rejection_reason && (
              <span className="block mt-1 font-medium">دلیل: {request.rejection_reason}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

const RequestDetailsModal = ({ request, isOpen, onClose }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">جزئیات درخواست عضویت</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* اطلاعات شخصی */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات شخصی</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">نام و نام خانوادگی</label>
                  <p className="text-gray-900 font-medium">{request.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">شماره تماس</label>
                  <p className="text-gray-900 font-medium">{request.phone_number}</p>
                </div>
              </div>
            </div>

            {/* اطلاعات واحد */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات واحد</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">ساختمان</label>
                  <p className="text-gray-900 font-medium">{request.building_title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">شماره واحد</label>
                  <p className="text-gray-900 font-medium">{request.unit_number}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">طبقه</label>
                  <p className="text-gray-900 font-medium">{request.floor}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">متراژ</label>
                  <p className="text-gray-900 font-medium">{request.area} متر مربع</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">تعداد نفر</label>
                  <p className="text-gray-900 font-medium">{request.resident_count} نفر</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">پارکینگ</label>
                  <p className="text-gray-900 font-medium">
                    {request.has_parking ? `${request.parking_count} عدد` : 'ندارد'}
                  </p>
                </div>
              </div>
            </div>

            {/* وضعیت درخواست */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">وضعیت درخواست</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={request.status} />
                </div>
                {request.owner_approved_at && (
                  <div className="text-sm text-gray-600">
                    تأیید شده توسط مالک: {new Date(request.owner_approved_at).toLocaleString('fa-IR')}
                  </div>
                )}
                {request.manager_approved_at && (
                  <div className="text-sm text-gray-600">
                    تأیید شده توسط مدیر: {new Date(request.manager_approved_at).toLocaleString('fa-IR')}
                  </div>
                )}
                {request.rejected_at && (
                  <div className="text-sm text-gray-600">
                    رد شده در: {new Date(request.rejected_at).toLocaleString('fa-IR')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditRequestModal = ({ request, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: request?.full_name || '',
    phone_number: request?.phone_number || '',
    unit_number: request?.unit_number || '',
    floor: request?.floor || '',
    area: request?.area || '',
    resident_count: request?.resident_count || 1,
    has_parking: request?.has_parking || false,
    parking_count: request?.parking_count || 0,
  });

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(request.request_id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">ویرایش درخواست عضویت</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شماره واحد</label>
                <input
                  type="text"
                  value={formData.unit_number}
                  onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">طبقه</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متراژ (متر مربع)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تعداد نفر</label>
                <input
                  type="number"
                  min="1"
                  value={formData.resident_count}
                  onChange={(e) => setFormData({ ...formData, resident_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.has_parking}
                    onChange={(e) => setFormData({ ...formData, has_parking: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">پارکینگ دارد</span>
                </label>
              </div>
              {formData.has_parking && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تعداد پارکینگ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.parking_count}
                    onChange={(e) => setFormData({ ...formData, parking_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ذخیره تغییرات
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function OwnerMembershipApproval() {
  const dispatch = useDispatch();
  const requests = useSelector(selectMembershipRequests);
  const loading = useSelector(selectMembershipLoading);
  const error = useSelector(selectMembershipError);
  const approveLoading = useSelector(selectMembershipApproveLoading);
  const rejectLoading = useSelector(selectMembershipRejectLoading);
  const { user } = useSelector(state => state.auth);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // دریافت درخواست‌های عضویت برای مالک
    dispatch(fetchMembershipRequests({ status: statusFilter === 'all' ? null : statusFilter }));
  }, [dispatch, statusFilter]);

  const handleApprove = async (requestId) => {
    const request = requests.find(r => r.request_id === requestId);
    const isEdited = request?.has_been_edited;
    
    const confirmMessage = isEdited 
      ? 'آیا از تأیید این درخواست عضویت اطمینان دارید؟ این درخواست ویرایش شده و برای تأیید نهایی به مدیر ارسال خواهد شد.'
      : 'آیا از تأیید این درخواست عضویت اطمینان دارید؟';
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await dispatch(approveMembershipRequestByOwner(requestId)).unwrap();
        
        if (result?.auto_approved) {
          toast.success('درخواست عضویت تأیید شد و عضو ساختمان شدید');
        } else {
          toast.success('درخواست عضویت تأیید شد و برای تأیید نهایی به مدیر ارسال شد');
        }
        
        // بروزرسانی لیست
        dispatch(fetchMembershipRequests({ status: statusFilter === 'all' ? null : statusFilter }));
      } catch (error) {
        console.error('Error approving request:', error);
        toast.error('خطا در تأیید درخواست: ' + error);
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
        dispatch(fetchMembershipRequests({ status: statusFilter === 'all' ? null : statusFilter }));
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

  const handleEdit = (request) => {
    setRequestToEdit(request);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setRequestToEdit(null);
  };

  const handleSaveEdit = async (requestId, formData) => {
    try {
      await dispatch(editMembershipRequest({ requestId, requestData: formData })).unwrap();
      toast.success('درخواست عضویت با موفقیت ویرایش شد');
      setIsEditOpen(false);
      setRequestToEdit(null);
      // بروزرسانی لیست
      dispatch(fetchMembershipRequests({ status: statusFilter === 'all' ? null : statusFilter }));
    } catch (error) {
      console.error('Error editing request:', error);
      toast.error('خطا در ویرایش درخواست: ' + error);
    }
  };

  // فیلتر درخواست‌ها بر اساس ساختمان‌های مالک
  const ownerApprovedRequests = requests.filter(req => 
    (req.status === 'approved' || req.status === 'owner_approved' || req.status === 'manager_approved') && 
    req.role === 'owner' && 
    req.user === user?.id
  );
  const ownerBuildingIds = ownerApprovedRequests.map(req => req.building);
  
  const userBuildings = user?.buildings || [];
  const userBuildingIds = userBuildings.map(building => building.building_id);
  
  const allOwnerBuildingIds = [...new Set([...ownerBuildingIds, ...userBuildingIds])];
  
  // فیلتر درخواست‌ها بر اساس وضعیت و ساختمان‌های مالک
  const filteredRequests = requests.filter(request => {
    // فیلتر بر اساس وضعیت
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    
    // فیلتر بر اساس ساختمان‌های مالک
    const buildingMatch = allOwnerBuildingIds.includes(request.building);
    
    return statusMatch && buildingMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">درخواست‌های عضویت مستاجر</h1>
          <p className="text-gray-600 mt-1">درخواست‌های عضویت برای واحدهای شما</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          همه ({requests.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'pending' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          در انتظار ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('owner_approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'owner_approved' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          تأیید شده ({requests.filter(r => r.status === 'owner_approved').length})
        </button>
        <button
          onClick={() => setStatusFilter('manager_approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'manager_approved' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          تکمیل شده ({requests.filter(r => r.status === 'manager_approved').length})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
        </div>
      )}

      {/* Requests List */}
      {!loading && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <User size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {statusFilter === 'all' ? 'هیچ درخواستی یافت نشد' : `هیچ درخواست ${statusFilter} یافت نشد`}
              </h3>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'هنوز هیچ درخواست عضویتی برای واحدهای شما ارسال نشده است.'
                  : 'درخواستی با این وضعیت وجود ندارد.'
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.request_id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                approveLoading={approveLoading}
                rejectLoading={rejectLoading}
              />
            ))
          )}
        </div>
      )}

      {/* Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />

      {/* Edit Modal */}
      <EditRequestModal
        request={requestToEdit}
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
