import { ChevronLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import RequestsBase from "../components/RequestsBase";
import RentalRequestsManager from "../components/RentalRequestsManager";
import OwnerRentalRequestsManager from "../components/OwnerRentalRequestsManager";
import OwnerRentalRequestsList from "../components/OwnerRentalRequestsList";
import OwnerMembershipRequestsManager from "../components/OwnerMembershipRequestsManager";
import RegularRequestsManager from "../components/RegularRequestsManager";
import TenantRequestManager from "../components/TenantRequestManager";
// import RentalReای 09questForm from "../components/RentalRequestForm";
// import BuildingSelector from "../../building/components/BuildingSelector";
import Button from "../../../../shared/components/shared/feedback/Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function RequestsPage() {
    const navigate = useNavigate();

    return (
        <div className="p-2 space-y-6">
            <div className="flex justify-between items-center">
                {/* دکمه درخواست اجاره غیرفعال شده - منطق جدید درخواست عضویت است */}
                {/* {user?.role !== 'owner' && (
                    <Button
                        variant="primary"
                        onClick={() => setShowRentalForm(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        درخواست اجاره جدید
                    </Button>
                )} */}
                
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                 text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                 hover:shadow-md hover:from-white hover:to-gray-50
                 active:scale-95 transition-all duration-200 font-medium"
                >
                    <ChevronLeft size={20} className="text-gray-600" />
                    بازگشت
                </button>
            </div>

            {/* فرم درخواست اجاره غیرفعال شده - منطق جدید درخواست عضویت است */}
            {/* {showRentalForm && user?.role !== 'owner' && (
                <RentalRequestForm 
                    onSuccess={handleRentalFormSuccess}
                    onCancel={() => setShowRentalForm(false)}
                />
            )} */}

            {/* انتخاب ساختمان برای مالکان - حذف شده چون درخواست مستقیماً به مدیر می‌رود */}
            {/* {user?.role === 'owner' && <BuildingSelector />} */}
            
            {/* درخواست‌های عادی */}
            <RegularRequestsManager />
            
            {/* راهنمای درخواست عضویت */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        راهنمای درخواست عضویت
                    </h3>
                    <p className="text-blue-700 mb-4">
                        برای عضویت در ساختمان، لطفاً از فرم درخواست عضویت در صفحه اصلی استفاده کنید.
                    </p>
                    <p className="text-sm text-blue-600">
                        پس از ارسال درخواست عضویت، مدیر آن را بررسی و تایید خواهد کرد.
                    </p>
                </div>
            </div>
            
            {/* درخواست‌های اجاره برای مالکان - غیرفعال شده چون مالک باید فقط درخواست‌های عضویت را ببیند */}
            {/* {user?.role === 'owner' && <OwnerRentalRequestsList />} */}
            
            {/* درخواست‌های اجاره برای مستاجران - غیرفعال شده چون منطق جدید درخواست عضویت است */}
            {/* {user?.role !== 'owner' && <RentalRequestsManager />} */}
            
            {/* مدیریت درخواست‌های اجاره توسط مستاجر - غیرفعال شده */}
            {/* {user?.role !== 'owner' && <TenantRequestManager />} */}
            
            {/* لیست درخواست‌های دیگر - غیرفعال شده */}
            {/* {user?.role !== 'owner' && <RequestsBase />} */}
            
        </div>
    );
}
