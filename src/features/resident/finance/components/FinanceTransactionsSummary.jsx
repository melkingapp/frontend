import { ChevronLeft, Eye, CreditCard, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { selectCurrentFundBalance } from "../../../manager/finance/store/slices/financeSlice";
import CountUp from "react-countup";

export default function FinanceTransactionsSummary() {
    const navigate = useNavigate();
    const building = useSelector(selectSelectedBuilding);
    const currentFundBalance = useSelector(selectCurrentFundBalance);
    
    // Get financial data
    const balance = currentFundBalance?.current_balance || building?.fund_balance || 0;
    
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">گردش مالی</h2>
                <button
                    onClick={() => navigate("/resident/finance-reports")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                     text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                     hover:shadow-md hover:from-white hover:to-gray-50
                     active:scale-95 transition-all duration-200 font-medium"
                >
                    <Eye size={20} className="text-gray-600" />
                    مشاهده جزئیات
                </button>
            </div>
            
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* موجودی صندوق */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">موجودی صندوق</p>
                            <p className="text-2xl font-bold">
                                <CountUp end={balance} separator="," /> ریال
                            </p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-200" />
                    </div>
                </div>
                
                {/* وضعیت مالی */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">وضعیت مالی</p>
                            <p className="text-lg font-semibold">
                                {balance > 0 ? "مثبت" : balance < 0 ? "منفی" : "متوازن"}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-200" />
                    </div>
                </div>
            </div>
            
            <div className="text-sm text-gray-600">
                <p>در این بخش می‌توانید تمام تراکنش‌های مالی ساختمان را مشاهده کنید.</p>
                <p className="mt-2">توجه: امکان ثبت هزینه و بررسی پرداخت فقط برای مدیر ساختمان در دسترس است.</p>
            </div>
        </div>
    );
}
