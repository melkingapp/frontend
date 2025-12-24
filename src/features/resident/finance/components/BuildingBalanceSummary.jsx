import { ChevronLeft, Eye, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { selectCurrentFundBalance } from "../../../manager/finance/store/slices/financeSlice";
import CountUp from "react-countup";

export default function BuildingBalanceSummary() {
    const navigate = useNavigate();
    const building = useSelector(selectSelectedBuilding);
    const currentFundBalance = useSelector(selectCurrentFundBalance);
    
    // Get financial data
    const balance = currentFundBalance?.current_balance || building?.fund_balance || 0;
    
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">بیلان مالی</h2>
                <button
                    onClick={() => navigate("/resident/finance/balance")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                     text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                     hover:shadow-md hover:from-white hover:to-gray-50
                     active:scale-95 transition-all duration-200 font-medium"
                >
                    <Eye size={20} className="text-gray-600" />
                    مشاهده بیلان
                </button>
            </div>
            
            {/* Financial Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* موجودی فعلی */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">موجودی فعلی</p>
                            <p className="text-2xl font-bold">
                                <CountUp end={balance} separator="," /> ریال
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-200" />
                    </div>
                </div>
                
                {/* وضعیت مالی */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm">وضعیت مالی</p>
                            <p className="text-lg font-semibold">
                                {balance > 0 ? "مثبت" : balance < 0 ? "منفی" : "متوازن"}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-200" />
                    </div>
                </div>
                
                {/* آخرین به‌روزرسانی */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">آخرین به‌روزرسانی</p>
                            <p className="text-lg font-semibold">
                                {new Date().toLocaleDateString('fa-IR')}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-200" />
                    </div>
                </div>
            </div>
            
            <div className="text-sm text-gray-600">
                <p>در این بخش می‌توانید بیلان کامل مالی ساختمان را مشاهده کنید.</p>
                <p className="mt-2">شامل موجودی فعلی، وضعیت مالی و اطلاعات تکمیلی.</p>
            </div>
        </div>
    );
}
