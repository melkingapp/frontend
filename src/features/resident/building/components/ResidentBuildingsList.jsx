import { useEffect, useState } from "react";
import { Building, CheckCircle, RefreshCw, Home, Users, Car } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
    selectMembershipLoading,
    fetchMembershipRequests,
} from "../../../membership/membershipSlice";
import { selectSelectedResidentBuilding, setSelectedBuilding } from "../residentBuildingSlice";
import { useAllApprovedUnits } from "../hooks/useApprovedRequests";
import { useBuildingAutoSelection, useBuildingValidation } from "../hooks/useBuildingSelection";

export default function ResidentBuildingsList() {
    const dispatch = useDispatch();
    const loading = useSelector(selectMembershipLoading);
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const buildings = useAllApprovedUnits();

    useBuildingAutoSelection(buildings);
    useBuildingValidation(buildings, selectedBuilding);

    useEffect(() => {
        dispatch(fetchMembershipRequests());
    }, [dispatch]);

    // Auto-refresh every 30 seconds for pending requests
    useEffect(() => {
        const requests = buildings.map(b => ({ status: 'approved' })); // Simplified check
        const hasPendingRequests = requests.some(req => req.status === 'pending');
        if (!hasPendingRequests) return;

        const interval = setInterval(() => {
            dispatch(fetchMembershipRequests());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [dispatch, buildings]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchMembershipRequests()).unwrap();
        } catch (error) {
            console.error('Error refreshing requests:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (buildings.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        هنوز در ساختمانی عضو نیستید
                    </h3>
                    <p className="text-sm text-gray-600">
                        برای عضویت در ساختمان، ابتدا درخواست عضویت ارسال کنید
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Building className="w-6 h-6 text-melkingDarkBlue" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        واحدهای عضویت شده
                    </h2>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                        {buildings.length} واحد
                    </span>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing || loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-melkingDarkBlue hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
                </button>
            </div>

            <div className="space-y-3">
                {buildings.map((building, index) => (
                    <div
                        key={building.id || `building-${building.building_id}-${building.unit_info?.unit_number}-${index}`}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            selectedBuilding?.building_id === building.building_id ||
                            selectedBuilding?.id === building.id
                                ? 'border-melkingDarkBlue bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => dispatch(setSelectedBuilding(building))}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {building.title} - واحد {building.unit_info?.unit_number || 'نامشخص'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        کد ساختمان: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-melkingDarkBlue">
                                            {building.building_code}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">
                                    {building.unit_info?.role === 'resident' ? 'ساکن' : 'مالک'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    تایید شده
                                </div>
                            </div>
                        </div>
                        
                        {/* اطلاعات واحد */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Home size={16} className="text-gray-500" />
                                    <span>واحد {building.unit_info?.unit_number || 'نامشخص'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building size={16} className="text-gray-500" />
                                    <span>طبقه {building.unit_info?.floor || 'نامشخص'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Home size={16} className="text-gray-500" />
                                    <span>{building.unit_info?.area ? `${building.unit_info.area} متر مربع` : 'نامشخص'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={16} className="text-gray-500" />
                                    <span>{building.unit_info?.resident_count || 'نامشخص'} نفر</span>
                                </div>
                            </div>
                            {building.unit_info?.has_parking && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <Car size={16} className="text-gray-500" />
                                    <span>پارکینگ: {building.unit_info?.parking_count || 0} عدد</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
