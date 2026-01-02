import { useState } from "react";
import { useMembershipRequests } from "../hooks/useMembershipRequests";
import MembershipRequestForm from "../components/MembershipRequestForm";
import MembershipRequestDetailsModal from "../components/MembershipRequestDetailsModal";
import MembershipRequestCard from "../components/MembershipRequestCard";
import { Plus, Building, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function MembershipRequestsPage() {
  const { requests, loading, error, handleRefresh } = useMembershipRequests();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    handleRefresh();
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">درخواست‌های عضویت من</h1>
          <p className="text-gray-600">مدیریت درخواست‌های عضویت شما در ساختمان‌های مختلف</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            بروزرسانی
          </button>
          <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            درخواست جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg"><Clock size={20} className="text-yellow-600" /></div>
                  <div>
                      <p className="text-sm text-gray-600">در انتظار تایید</p>
                      <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending' || r.status === 'owner_approved').length}</p>
                  </div>
              </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><CheckCircle size={20} className="text-green-600" /></div>
                  <div>
                      <p className="text-sm text-gray-600">تایید شده</p>
                      <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'manager_approved' || r.status === 'approved').length}</p>
                  </div>
              </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg"><XCircle size={20} className="text-red-600" /></div>
                  <div>
                      <p className="text-sm text-gray-600">رد شده</p>
                      <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'rejected').length}</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Building size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">هنوز درخواستی ارسال نکرده‌اید</h3>
            <p className="text-gray-500 mb-6">برای عضویت در ساختمان، درخواست جدید ارسال کنید</p>
            <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
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

      <MembershipRequestForm isOpen={isFormOpen} onClose={handleFormClose} />
      <MembershipRequestDetailsModal request={selectedRequest} isOpen={isDetailsOpen} onClose={handleCloseDetails} />
    </div>
  );
}