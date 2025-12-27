import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import TransactionsBase from "./TransactionsBase";
import { fetchBuildings } from "../../../building/buildingSlice";

export default function TransactionsSummary() {
    const dispatch = useDispatch();
    const limit = 4;
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
            <TransactionsBase buildingId={buildingId} limit={limit} />
        </div>
    )
}
