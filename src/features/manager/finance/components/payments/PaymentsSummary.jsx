import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PaymentBase from "./PaymentBase";
import { ChevronLeft } from "lucide-react";
import { selectSelectedBuilding } from "../../../building/buildingSlice";

export default function PaymentsSummary() {
    const limit = 4;
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { payments } = useSelector(state => state.payments);
    
    // Get building ID from selected building
    const buildingId = selectedBuilding?.building_id || selectedBuilding?.id || null;

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <PaymentBase buildingId={buildingId} limit={limit} />

            {payments && payments.length > limit && (
                <div className="mt-4 border-t pt-4 flex justify-end">
                    <Link
                        to="/manager/finance/payments"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline font-medium transition"
                    >
                        <ChevronLeft size={16} />
                        مشاهده همه پرداخت‌ها
                    </Link>
                </div>
            )}
        </div>
    );
}
