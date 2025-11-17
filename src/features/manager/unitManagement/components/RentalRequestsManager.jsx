import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Button from '../../../../shared/components/shared/feedback/Button';
import { 
  fetchRequests, 
  updateRequestStatus,
  clearError
} from '../slices/requestsSlice';
import { 
  User, 
  Building, 
  Home, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Calendar,
  Eye,
  UserCheck
} from 'lucide-react';

const RentalRequestsManager = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.requests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Removed success effect since clearSuccess doesn't exist in requestsSlice

  const handleApprove = async (requestId) => {
    try {
      await dispatch(updateRequestStatus({ 
        buildingId: null, // This might need to be adjusted based on your logic
        requestId, 
        statusData: { status: 'approved' }
      })).unwrap();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error('لطفاً دلیل رد درخواست را وارد کنید');
      return;
    }

    try {
      await dispatch(updateRequestStatus({ 
        buildingId: null, // This might need to be adjusted based on your logic
        requestId, 
        statusData: { status: 'rejected', rejectionReason }
      })).unwrap();
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_owner': { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار تایید مالک', icon: Clock },
      'pending_manager': { color: 'bg-blue-100 text-blue-800', text: 'در انتظار تایید مدیر', icon: Clock },
      'approved': { color: 'bg-green-100 text-green-800', text: 'تایید شده', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'رد شده', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['pending_owner'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const RequestCard = ({ request }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{request.tenant_full_name}</h3>
            <p className="text-sm text-gray-600">درخواست اجاره واحد {request.unit_number}</p>
          </div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building className="w-4 h-4" />
          <span>ساختمان: {request.building_title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Home className="w-4 h-4" />
          <span>واحد: {request.unit_number}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{request.tenant_phone_number}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(request.created_at)}</span>
        </div>
      </div>

      {request.message && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">پیام مستاجر:</p>
              <p className="text-sm text-gray-600">{request.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedRequest(request);
            setShowDetailsModal(true);
          }}
          className="flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          جزئیات
        </Button>

        {request.status === 'pending_manager' && (
          <>
            <Button
              variant="success"
              size="sm"
              onClick={() => handleApprove(request.request_id)}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              تایید
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setSelectedRequest(request);
                setShowDetailsModal(true);
              }}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              رد
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const RequestDetailsModal = () => {
    if (!selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">جزئیات درخواست اجاره</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                بستن
              </Button>
            </div>

            <div className="space-y-6">
              {/* اطلاعات مستاجر */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">اطلاعات مستاجر</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">نام و نام خانوادگی</p>
                    <p className="font-medium">{selectedRequest.tenant_full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">شماره تماس</p>
                    <p className="font-medium">{selectedRequest.tenant_phone_number}</p>
                  </div>
                </div>
              </div>

              {/* اطلاعات ساختمان و واحد */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">اطلاعات ساختمان و واحد</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">نام ساختمان</p>
                    <p className="font-medium">{selectedRequest.building_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">شماره واحد</p>
                    <p className="font-medium">{selectedRequest.unit_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">کد ساختمان</p>
                    <p className="font-medium">{selectedRequest.building_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاریخ درخواست</p>
                    <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* پیام مستاجر */}
              {selectedRequest.message && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">پیام مستاجر</h3>
                  </div>
                  <p className="text-gray-700">{selectedRequest.message}</p>
                </div>
              )}

              {/* وضعیت درخواست */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">وضعیت درخواست</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* فرم رد درخواست */}
              {selectedRequest.status === 'pending_manager' && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">رد درخواست</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        دلیل رد درخواست
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="دلیل رد درخواست را وارد کنید..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* دکمه‌های عملیات */}
            {selectedRequest.status === 'pending_manager' && (
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => {
                    handleApprove(selectedRequest.request_id);
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  تایید درخواست
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => {
                    handleReject(selectedRequest.request_id);
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  رد درخواست
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">درخواست‌های اجاره</h2>
          <p className="text-gray-600 mt-1">درخواست‌های اجاره منتظر تایید مدیر</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <Building className="w-4 h-4" />
          {requests.length} درخواست
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">خطا</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Success message removed since success state doesn't exist in requestsSlice */}

      {requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">هیچ درخواست اجاره‌ای ندارید</h3>
              <p className="text-gray-600">هنوز هیچ درخواست اجاره‌ای منتظر تایید مدیر نیست.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <RequestCard key={request.request_id} request={request} />
          ))}
        </div>
      )}

      {showDetailsModal && <RequestDetailsModal />}
    </div>
  );
};

export default RentalRequestsManager;