import { ChevronLeft } from "lucide-react";
import TransactionsBase from "../components/TransactionsBase";
import { useNavigate } from "react-router-dom";

export default function TransactionsPage() {
    const navigate = useNavigate();

    return (
        <div className="p-2 space-y-6">
            <div className="flex justify-end">
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

            {/* لیست تراکنش‌ها */}
            <TransactionsBase />
        </div>
    );
}
