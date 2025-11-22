import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchMembershipRequests, approveMembershipRequestByManager, rejectMembershipRequest } from "../membershipSlice";
import { selectSelectedBuilding } from "../../manager/building/buildingSlice";
import MembershipRequestDetailsModal from "../components/MembershipRequestDetailsModal";
import MembershipToUnitConverter from "../components/MembershipToUnitConverter";
import ManagerMembershipApproval from "../components/ManagerMembershipApproval";
import { 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  User,
  Home,
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

const MembershipRequestCard = ({ request, onViewDetails, onApprove, onReject }) => {
  const { approveLoading, rejectLoading } = useSelector(state => state.membership);
  
  const handleApprove = () => {
    onApprove(request);
  };

  const handleReject = () => {
    const reason = window.prompt('دلیل رد درخواست را وارد کنید:');
    if (reason && reason.trim()) {
      onReject(request.request_id, reason.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{request.full_name}</h3>
            <p className="text-sm text-gray-600">{request.building_title}</p>
          </div>
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>کد ساختمان:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{request.building_code}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(request)}
            className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={16} />
            جزئیات
          </button>
          
          {(request.status === 'pending' || request.status === 'owner_approved') && (
            <>
              <button
                onClick={handleApprove}
                disabled={approveLoading}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <CheckCircle size={16} />
                {request.status === 'owner_approved' ? 'تایید نهایی' : 'تایید'}
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <XCircle size={16} />
                رد
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ManagerMembershipPage() {
  const dispatch = useDispatch();
  const { requests, loading, error, count } = useSelector(state => state.membership);
  const selectedBuilding = useSelector(selectSelectedBuilding);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  useEffect(() => {
    // همیشه همه درخواست‌ها را از سرور بگیر و فیلتر در frontend اعمال کن
    dispatch(fetchMembershipRequests());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchMembershipRequests());
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setIsConverterOpen(true);
  };

  const handleReject = async (requestId, reason) => {
    try {
      await dispatch(rejectMembershipRequest({ requestId, rejectionReason: reason })).unwrap();
      // Refresh the list
      dispatch(fetchMembershipRequests({ status: 'owner_approved' }));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('خطا در رد درخواست: ' + error);
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

  const handleCloseConverter = () => {
    setIsConverterOpen(false);
    setSelectedRequest(null);
  };

  const handleConverterSuccess = (unitResult) => {
    console.log("✅ Unit created and membership approved:", unitResult);
    // Refresh the list
    dispatch(fetchMembershipRequests());
    toast.success('درخواست عضویت تایید شد و واحد ایجاد شد');
  };

  // فیلتر براساس ساختمان انتخاب شده (برای آمار)
  const selectedBuildingId = selectedBuilding?.building_id || selectedBuilding?.id;
  const buildingFilteredRequests = requests.filter(request => {
    if (!selectedBuildingId) return false;
    const requestBuildingId = request.building_id || request.building;
    return requestBuildingId && requestBuildingId.toString() === selectedBuildingId.toString();
  });

  // فیلتر کامل (ساختمان + وضعیت + جستجو)
  const filteredRequests = buildingFilteredRequests.filter(request => {
    // فیلتر براساس وضعیت
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // فیلتر براساس جستجو
    const matchesSearch = searchTerm === '' || 
      request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.building_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.unit_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
            مدیریت درخواست‌های عضویت
          </h1>
          <p className="text-gray-600">
            {selectedBuildingId 
              ? `بررسی و تایید درخواست‌های عضویت ساکنان و مالکان - ${selectedBuilding?.title || 'ساختمان انتخاب شده'}`
              : 'لطفاً ابتدا یک ساختمان انتخاب کنید'}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          بروزرسانی
        </button>
      </div>


      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">فیلترها</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">همه</option>
              <option value="pending">در انتظار تایید</option>
              <option value="approved">تایید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در نام، ساختمان یا شماره واحد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {selectedBuildingId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">در انتظار تایید</p>
                <p className="text-2xl font-bold text-gray-900">
                  {buildingFilteredRequests.filter(r => r.status === 'pending').length}
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
                  {buildingFilteredRequests.filter(r => r.status === 'approved' || r.status === 'owner_approved' || r.status === 'manager_approved').length}
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
                  {buildingFilteredRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Requests */}
      <div className="space-y-4">
        {!selectedBuildingId ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-12 text-center">
            <div className="text-yellow-400 mb-4">
              <Building size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              لطفاً ابتدا یک ساختمان انتخاب کنید
            </h3>
            <p className="text-yellow-700">
              برای مشاهده درخواست‌های عضویت، لطفاً از منوی بالا یک ساختمان انتخاب کنید.
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Building size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              درخواستی یافت نشد
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'هیچ درخواستی با این جستجو یافت نشد' : `برای ساختمان "${selectedBuilding?.title || 'انتخاب شده'}" هنوز درخواست عضویتی ارسال نشده است`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <MembershipRequestCard
              key={request.request_id}
              request={request}
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>

      {/* Details Modal */}
      <MembershipRequestDetailsModal
        request={selectedRequest}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />

      {/* Converter Modal */}
      <MembershipToUnitConverter
        membershipRequest={selectedRequest}
        isOpen={isConverterOpen}
        onClose={handleCloseConverter}
        onSuccess={handleConverterSuccess}
      />
    </div>
  );
}

