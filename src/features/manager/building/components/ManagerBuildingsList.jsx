import { useEffect } from "react";
import { Building } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchBuildings,
    setSelectedBuilding,
} from "../buildingSlice";
import { fetchCurrentFundBalance, selectCurrentFundBalance } from "../../finance/store/slices/financeSlice";

export default function ManagerBuildingsList() {
    const dispatch = useDispatch();
    const buildings = useSelector((state) => state.building.data);
    const userPhone = useSelector((state) => state.auth.user?.phone_number || state.auth.user?.phone);
    const userId = useSelector((state) => state.auth.user?.id);
    const selectedBuildingId = useSelector((state) => state.building.selectedBuildingId);
    const currentFundBalance = useSelector(selectCurrentFundBalance);

    const myBuildings = buildings.filter((b) => {
        // Check if manager phone matches
        const managerPhone = b.manager?.phone_number || b.manager?.phone;
        if (managerPhone && userPhone && managerPhone === userPhone) {
            return true;
        }
        // Fallback: check if manager ID matches current user ID
        if (userId && (b.manager?.id === userId || b.manager === userId)) {
            return true;
        }
        // If manager data is missing but building exists, include it (edge case)
        // This handles cases where building was just created and manager data might not be fully loaded
        return false;
    });

    useEffect(() => {
        dispatch(fetchBuildings());
    }, [dispatch]);

    useEffect(() => {
        if (myBuildings.length === 1 && !selectedBuildingId) {
            // Auto-select first building if only one exists and none is selected
            dispatch(setSelectedBuilding(myBuildings[0].building_id || myBuildings[0].id));
        } else if (myBuildings.length > 1 && !selectedBuildingId) {
            // Auto-select first building if multiple exist and none is selected
            dispatch(setSelectedBuilding(myBuildings[0].building_id || myBuildings[0].id));
        }
    }, [myBuildings, dispatch, selectedBuildingId]);

    // Fetch current fund balance only for selected building
    useEffect(() => {
        if (selectedBuildingId) {
            dispatch(fetchCurrentFundBalance(selectedBuildingId));
        }
    }, [dispatch, selectedBuildingId]);

    if (!myBuildings.length) {
        return (
            <p className="text-center text-gray-500 mt-10">
                ساختمانی برای نمایش وجود ندارد.
            </p>
        );
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">ساختمان‌های شما</h2>

            {myBuildings.length > 1 && (
                <p className="text-sm text-gray-600">
                    لطفاً یکی از ساختمان‌های زیر را انتخاب کنید:
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                {myBuildings.map((building, index) => {
                    const buildingId = building.building_id || building.id;
                    const isSelected = buildingId === selectedBuildingId;

                    return (
                        <div
                            key={buildingId || `building-${index}`}
                            onClick={() => dispatch(setSelectedBuilding(buildingId))}
                            className={`relative rounded-xl shadow-md p-4 pt-20 overflow-visible group cursor-pointer transition
                                ${isSelected
                                    ? "bg-yellow-100 shadow-yellow-400 border-2 border-yellow-400"
                                    : "bg-white hover:shadow-lg"}
                            `}
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 p-3 rounded-full text-white shadow-md">
                                <Building size={28} />
                            </div>

                            <div className="flex flex-col items-center text-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {building.title}
                                </h3>

                                {building.building_code && (
                                    <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-mono">
                                        کد: {building.building_code}
                                    </div>
                                )}

                                <p className="text-sm text-gray-600">
                                    موجودی صندوق:{" "}
                                    <span className="font-bold text-gray-900">
                                        {(() => {
                                            const buildingId = building.building_id || building.id;
                                            const isSelectedBuilding = buildingId === selectedBuildingId;
                                            const balance = isSelectedBuilding && currentFundBalance?.current_balance !== undefined 
                                                ? currentFundBalance.current_balance 
                                                : building.fund_balance || 0;
                                            return balance.toLocaleString("fa-IR");
                                        })()} تومان
                                    </span>
                                </p>

                                <span className="text-xs px-2 py-1 mt-1 rounded-full bg-gray-100 text-gray-600">
                                    نقش شما: مدیر ساختمان
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}