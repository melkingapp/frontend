import { ChevronLeft, Home } from "lucide-react";
import BuildingBalanceBase from "../components/BuildingBalanceBase";
import { useNavigate } from "react-router-dom";

export default function BuildingBalancePage() {
    const navigate = useNavigate();

    return (
        <div className="p-4 space-y-6">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/resident")}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300
                         text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                         hover:shadow-md hover:from-white hover:to-gray-50
                         active:scale-95 transition-all duration-200 font-medium"
                    >
                        <Home size={18} className="text-gray-600" />
                        داشبورد
                    </button>
                </div>
                
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

            {/* Page Title */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">بیلان مالی ساختمان</h1>
                <p className="text-gray-600">مشاهده وضعیت کامل مالی ساختمان و جزئیات موجودی</p>
            </div>

            {/* بیلان مالی */}
            <BuildingBalanceBase />
        </div>
    );
}
