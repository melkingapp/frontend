import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembershipRequests } from "../membershipSlice";
import MembershipRequestForm from "../components/MembershipRequestForm";
import MembershipRequestDetailsModal from "../components/MembershipRequestDetailsModal";
import { 
  Plus, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  Calendar,
  Home,
  Users,
  Car,
  AlertCircle
} from "lucide-react";
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
    // Legacy support for old status values
    approved: { 
      icon: CheckCircle, 
      color: "bg-green-100 text-green-800", 
      text: "تایید شده" 
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

const MembershipRequestCard = ({ request, onViewDetails }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{request.building_title}</h3>
          <p className="text-sm text-gray-600">واحد {request.unit_number} - طبقه {request.floor}</p>
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">تاریخ ارسال</p>
          <p className="text-sm font-medium">{moment(request.created_at).format('jYYYY/jMM/jDD')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Building size={16} className="text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">کد ساختمان</p>
          <p className="text-sm font-medium font-mono">{request.building_code}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Eye size={16} className="text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">نقش</p>
          <p className="text-sm font-medium">{request.role === 'resident' ? 'ساکن' : 'مالک'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Home size={16} className="text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">متراژ</p>
          <p className="text-sm font-medium">{request.area ? `${request.area} متر مربع` : 'نامشخص'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Users size={16} className="text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">تعداد نفر</p>
          <p className="text-sm font-medium">{request.resident_count || 'نامشخص'}</p>
        </div>
      </div>
    </div>
    
    {/* پارکینگ */}
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <Car size={16} className="text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">پارکینگ</p>
          <p className="text-sm font-medium">
            {request.has_parking ? 
              `دارد (${request.parking_count || 0} عدد)` : 
              'ندارد'
            }
          </p>
        </div>
      </div>
    </div>

    {request.rejection_reason && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-red-700">
          <strong>دلیل رد:</strong> {request.rejection_reason}
        </p>
      </div>
    )}

    <div className="flex justify-end">
      <button
        onClick={() => onViewDetails(request)}
        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Eye size={16} />
        مشاهده جزئیات
      </button>
    </div>
  </div>
);

export default function MembershipRequestsPage() {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.membership);
  const { user } = useSelector(state => state.auth);
  
  console.log("🔍 MembershipRequestsPage render:", { requests, loading, error });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    console.log("🔍 MembershipRequestsPage: Fetching membership requests...");
    console.log("🔍 Current user:", user);
    
    // اگر کاربر مالک است، از API مخصوص مالک استفاده کن
    if (user?.role === 'owner') {
      dispatch(fetchMembershipRequests({ owner_id: user.id }));
    } else {
      dispatch(fetchMembershipRequests());
    }
  }, [dispatch, user]);

  const handleRefresh = () => {
    // اگر کاربر مالک است، از API مخصوص مالک استفاده کن
    if (user?.role === 'owner') {
      dispatch(fetchMembershipRequests({ owner_id: user.id }));
    } else {
      dispatch(fetchMembershipRequests());
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

  const handleFormClose = () => {
    setIsFormOpen(false);
    // Refresh the list after form submission
    if (user?.role === 'owner') {
      dispatch(fetchMembershipRequests({ owner_id: user.id }));
    } else {
      dispatch(fetchMembershipRequests());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری درخواست‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <XCircle size={20} />
          <h3 className="font-semibold">خطا در بارگذاری</h3>
        </div>
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            درخواست‌های عضویت من
          </h1>
          <p className="text-gray-600">
            مدیریت درخواست‌های عضویت شما در ساختمان‌های مختلف
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            بروزرسانی
          </button>
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            درخواست جدید
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
                {requests.filter(r => r.status === 'pending').length}
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
              <p className="text-sm text-gray-600">تایید شده</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'approved' || r.status === 'owner_approved' || r.status === 'manager_approved').length}
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
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Building size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              هنوز درخواستی ارسال نکرده‌اید
            </h3>
            <p className="text-gray-500 mb-6">
              برای عضویت در ساختمان، درخواست جدید ارسال کنید
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={20} />
              ارسال درخواست جدید
            </button>
          </div>
        ) : (
          requests.map((request) => (
            <MembershipRequestCard
              key={request.request_id}
              request={request}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <MembershipRequestForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
      
      <MembershipRequestDetailsModal
        request={selectedRequest}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}

