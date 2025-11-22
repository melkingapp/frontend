import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import RequestBase from "./RequestBase";
import { fetchBuildings } from "../../../building/buildingSlice";

export default function RequestSummary() {
    const dispatch = useDispatch();
    const limit = 4;
    const { requests } = useSelector(state => state.requests);
    const { selectedBuildingId, data: buildings } = useSelector(state => state.building);

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
            <RequestBase buildingId={buildingId} limit={limit} />

            {requests && requests.length > limit && (
                <div className="mt-4 border-t pt-4 flex justify-end">
                    <Link to="/manager/unit-management/requests"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline font-medium transition"
                    >
                        <ChevronLeft size={16} />
                        مشاهده همه درخواست ها
                    </Link>
                </div>
            )}
        </div>
    )
}
