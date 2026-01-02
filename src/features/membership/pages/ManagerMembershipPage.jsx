import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { rejectRequest } from "../membershipSlice";
import { useMembershipRequests } from "../hooks/useMembershipRequests";
import { selectSelectedBuilding } from "../../manager/building/buildingSlice";
import MembershipRequestDetailsModal from "../components/MembershipRequestDetailsModal";
import MembershipToUnitConverter from "../components/MembershipToUnitConverter";
import MembershipRequestCard from "../components/MembershipRequestCard";
import { Building, RefreshCw, Filter, Search, XCircle } from "lucide-react";

export default function ManagerMembershipPage() {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the custom hook for data fetching and state management
  const { requests, loading, error, handleRefresh } = useMembershipRequests();
  
  const selectedBuilding = useSelector(selectSelectedBuilding);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setIsConverterOpen(true);
  };

  const handleReject = async (requestId, reason) => {
    try {
      await dispatch(rejectRequest({ requestId, rejectionReason: reason, isSuggested: false })).unwrap();
      toast.success("درخواست با موفقیت رد شد.");
    } catch (err) {
      toast.error('خطا در رد درخواست: ' + (err || 'خطای ناشناخته'));
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

  const handleConverterSuccess = () => {
    handleRefresh();
    toast.success('درخواست عضویت تایید شد و واحد ایجاد شد');
  };

  const selectedBuildingId = selectedBuilding?.building_id || selectedBuilding?.id;
  const filteredRequests = (requests || []).filter(request => {
    if (!selectedBuildingId || (request.building_id || request.building)?.toString() !== selectedBuildingId.toString()) {
        return false;
    }
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.building_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.unit_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && requests.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">مدیریت درخواست‌های عضویت</h1>
          <p className="text-gray-600">
            {selectedBuildingId 
              ? `بررسی و تایید درخواست‌های عضویت برای ساختمان: ${selectedBuilding?.title || ''}`
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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">فیلترها</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">همه</option>
                    <option value="pending">در انتظار تایید</option>
                    <option value="owner_approved">تایید شده توسط مالک</option>
                    <option value="manager_approved">تایید شده توسط مدیر</option>
                    <option value="rejected">رد شده</option>
                </select>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
                <div className="relative">
                    <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="جستجو در نام، ساختمان یا شماره واحد..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {!selectedBuildingId ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-12 text-center">
            <Building size={48} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">لطفاً ابتدا یک ساختمان انتخاب کنید</h3>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Building size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">درخواستی یافت نشد</h3>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <MembershipRequestCard
              key={request.request_id}
              request={request}
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={true}
            />
          ))
        )}
      </div>

      <MembershipRequestDetailsModal request={selectedRequest} isOpen={isDetailsOpen} onClose={handleCloseDetails} />
      <MembershipToUnitConverter membershipRequest={selectedRequest} isOpen={isConverterOpen} onClose={handleCloseConverter} onSuccess={handleConverterSuccess} />
    </div>
  );
}

