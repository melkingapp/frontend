
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Building2, Sparkles, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import MembershipRequestForm from "../../features/membership/components/MembershipRequestForm";
import BuildingRequestStatus from "../../features/resident/building/components/BuildingRequestStatus";
import Button from "../../shared/components/shared/feedback/Button";
import { fetchSuggestedRequests } from "../../features/membership/membershipSlice";
import { useResidentUnitData } from "../../features/resident/building/hooks/useResidentUnitData";
import SuggestedRequestsList from "../../features/membership/components/SuggestedRequestsList";
import SuggestedRequestsTable from "../../features/membership/components/SuggestedRequestsTable";

// Wrapper component for the membership request form
function MembershipRequestFormWrapper() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <div className="text-center">
        <button
          onClick={() => setIsFormOpen(true)}
          className="group relative w-full bg-gradient-to-r from-[#1C2E4E] to-[#2C4A7A] hover:from-[#2C4A7A] hover:to-[#1C2E4E] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-lg">ارسال درخواست عضویت کامل</span>
          <Sparkles size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>
        <p className="text-sm text-gray-600 mt-3 flex items-center justify-center gap-1">
          <Info size={14} className="text-gray-400" />
          برای عضویت در ساختمان، فرم کامل را پر کنید
        </p>
      </div>
      
      <MembershipRequestForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </>
  );
}

export default function ResidentDashboard() {
  const dispatch = useDispatch();
  const [showSuggestedRequestsList, setShowSuggestedRequestsList] = useState(false);
  const { user } = useSelector((state) => state.auth);
  // Use hook to get membership requests (prevents duplicate fetches)
  const { membershipRequests } = useResidentUnitData();
  const approvedRequests = membershipRequests.filter(req => 
    req.status === 'approved' || 
    req.status === 'owner_approved' || 
    req.status === 'manager_approved'
  );

  // Load suggested requests when component mounts
  useEffect(() => {
    dispatch(fetchSuggestedRequests());
  }, [dispatch]);
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#1C2E4E] via-[#2C4A7A] to-[#1C2E4E] rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 size={28} className="text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  خوش آمدید {user?.full_name || user?.username || 'کاربر عزیز'} 👋
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  پنل مدیریت واحد و ساختمان شما
                </p>
              </div>
            </div>
            
            {approvedRequests.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CheckCircle2 size={18} className="text-green-300" />
                  <span className="text-sm font-medium">
                    {approvedRequests.length} ساختمان فعال
                  </span>
                </div>
                {membershipRequests.some(req => req.status === 'pending') && (
                  <div className="flex items-center gap-2 bg-yellow-500/30 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">
                      {membershipRequests.filter(req => req.status === 'pending').length} درخواست در انتظار
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* جدول درخواست‌های عضویت پیشنهادی از طرف مدیر - بالای همه چیز */}
        <SuggestedRequestsTable />

        {/* درخواست عضویت در ساختمان جدید */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                درخواست عضویت در ساختمان جدید
              </h2>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            {/* راهنمای کاربر */}
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0 mt-0.5">
                  <Info size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    <strong className="text-blue-800">راهنما:</strong> برای عضویت در ساختمان، فرم کامل شامل اطلاعات واحد، نقش، پارکینگ و سایر جزئیات را پر کنید. 
                    پس از تایید درخواست توسط مدیر، واحد شما در سیستم ثبت و به تمام اطلاعات ساختمان دسترسی خواهید داشت.
                  </p>
                </div>
              </div>
            </div>
            
            <MembershipRequestFormWrapper />
          </div>
        </div>

        {/* لیست درخواست‌های suggested */}
        {showSuggestedRequestsList && (
          <SuggestedRequestsList
            isOpen={showSuggestedRequestsList}
            onClose={() => setShowSuggestedRequestsList(false)}
          />
        )}

        {/* وضعیت درخواست‌ها */}
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <BuildingRequestStatus />
        </div>
      </div>
    </div>
  );
}
