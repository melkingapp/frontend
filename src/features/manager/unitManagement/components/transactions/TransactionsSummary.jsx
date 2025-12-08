import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import TransactionsBase from "./TransactionsBase";
import { fetchBuildings } from "../../../building/buildingSlice";

export default function TransactionsSummary() {
    const dispatch = useDispatch();
    const limit = 4;
    const { transactions } = useSelector(state => state.transactions);
    const { selectedBuildingId, data: buildings, loading: buildingsLoading } = useSelector(state => state.building);

    // Get building ID from selected building or first building
    const buildingId = selectedBuildingId || (buildings && buildings.length > 0 ? buildings[0].building_id : null);

    // Fetch buildings if not available
    useEffect(() => {
        if (!buildings || buildings.length === 0) {
            dispatch(fetchBuildings());
        }
    }, [dispatch, buildings]);

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <TransactionsBase buildingId={buildingId} limit={limit} />

            {transactions && transactions.length > limit && (
                <div className="mt-4 border-t pt-4 flex justify-end">
                    <Link to="/manager/unit-management/transactions"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline font-medium transition"
                    >
                        <ChevronLeft size={16} />
                        مشاهده همه تراکنش ها
                    </Link>
                </div>
            )}
        </div>
    )
}
