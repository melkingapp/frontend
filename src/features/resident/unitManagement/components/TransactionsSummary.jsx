import { ChevronLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TransactionsSummary() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">تراکنش‌ها</h2>
                <button
                    onClick={() => navigate("/resident/unit-management/transactions")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                     text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm
                     hover:shadow-md hover:from-white hover:to-gray-50
                     active:scale-95 transition-all duration-200 font-medium"
                >
                    <Eye size={20} className="text-gray-600" />
                    مشاهده تراکنش‌ها
                </button>
            </div>
            
            <div className="text-sm text-gray-600">
                <p>در این بخش می‌توانید تراکنش‌های مالی واحدهای خود را مشاهده کنید.</p>
                <p className="mt-2">شامل پرداخت‌ها، دریافت‌ها و سایر تراکنش‌های مالی.</p>
            </div>
        </div>
    );
}
