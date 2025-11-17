/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus } from "lucide-react";
import ResidentBuildingsList from "../../features/resident/building/components/ResidentBuildingsList";
import ResidentBuildingCard from "../../features/resident/building/components/ResidentBuildingCard";
import MembershipRequestForm from "../../features/membership/components/MembershipRequestForm";
import BuildingRequestStatus from "../../features/resident/building/components/BuildingRequestStatus";
import BuildingSelector from "../../features/resident/building/components/BuildingSelector";
import Button from "../../shared/components/shared/feedback/Button";
import { 
  selectSelectedResidentBuilding,
  selectApprovedBuildings,
  selectResidentRequests,
  fetchApprovedBuildings
} from "../../features/resident/building/residentBuildingSlice";
import { 
  selectMembershipRequests,
  fetchMembershipRequests
} from "../../features/membership/membershipSlice";

// Wrapper component for the membership request form
function MembershipRequestFormWrapper() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <div className="text-center">
        <Button
          size="large"
          color="darkBlue"
          onClick={() => setIsFormOpen(true)}
          className="w-full"
        >
          <Plus size={20} className="ml-2" />
          ارسال درخواست عضویت کامل
        </Button>
        <p className="text-sm text-gray-500 mt-2">
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
  const selectedBuilding = useSelector(selectSelectedResidentBuilding);
  const approvedBuildings = useSelector(selectApprovedBuildings);
  const requests = useSelector(selectResidentRequests);
  const membershipRequests = useSelector(selectMembershipRequests);
  
  // Load data when component mounts
  useEffect(() => {
    console.log('🔍 DashboardResident - Loading data...');
    dispatch(fetchMembershipRequests());
    dispatch(fetchApprovedBuildings());
  }, [dispatch]);
  
  // Check for approved membership requests (more reliable than approvedBuildings)
  const approvedRequests = membershipRequests.filter(req => 
    req.status === 'approved' || 
    req.status === 'owner_approved' || 
    req.status === 'manager_approved'
  );
  
  const hasBuilding = approvedBuildings.length > 0 || approvedRequests.length > 0; // Show if user is member of any building
  const hasMultipleBuildings = approvedBuildings.length > 1 || approvedRequests.length > 1;
  const hasRequests = requests.length > 0;
  const hasMembershipRequests = membershipRequests.length > 0;
  
  
  return (
    <div className="p-4 space-y-6">
      {/* نمایش ساختمان‌های عضو شده */}
      {hasBuilding && (
        <div>
          <ResidentBuildingCard />
        </div>
      )}
      
      {hasMultipleBuildings && (
        <div>
          <ResidentBuildingsList />
        </div>
      )}
      
      {/* انتخاب ساختمان برای مشاهده اطلاعات */}
      {hasBuilding && (
        <BuildingSelector />
      )}

      {/* درخواست عضویت در ساختمان جدید */}
      <div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            درخواست عضویت در ساختمان جدید
          </h2>
          
          {/* راهنمای کاربر */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>راهنما:</strong> برای عضویت در ساختمان، فرم کامل شامل اطلاعات واحد، نقش، پارکینگ و سایر جزئیات را پر کنید. 
              پس از تایید درخواست توسط مدیر، واحد شما در سیستم ثبت و به تمام اطلاعات ساختمان دسترسی خواهید داشت.
            </p>
          </div>
          
          <MembershipRequestFormWrapper />
        </div>
      </div>

      {/* وضعیت درخواست‌ها */}
      <div>
        <BuildingRequestStatus />
      </div>
    </div>
  );
}
