import { useState, useEffect } from "react";
import { Building2, ChevronDown, Eye, Home, Users, Car } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMembershipRequests } from "../../../membership/membershipSlice";
import { selectSelectedResidentBuilding, setSelectedBuilding } from "../residentBuildingSlice";
import { useApprovedBuildings } from "../hooks/useApprovedRequests";
import { useBuildingAutoSelection, useBuildingValidation } from "../hooks/useBuildingSelection";

export default function BuildingSelector() {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const buildings = useApprovedBuildings();

    useBuildingAutoSelection(buildings);
    useBuildingValidation(buildings, selectedBuilding);

    // Fetch membership requests when component mounts
    useEffect(() => {
        dispatch(fetchMembershipRequests());
    }, [dispatch]);

    if (buildings.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="text-center text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2" />
                    <p>هنوز عضو هیچ ساختمانی نیستید</p>
                    <p className="text-sm mt-2">برای عضویت در ساختمان، از فرم درخواست عضویت استفاده کنید</p>
                </div>
            </div>
        );
    }

    const handleBuildingSelect = (building) => {
        dispatch(setSelectedBuilding(building));
        setDropdownOpen(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-melkingDarkBlue" />
                <h3 className="text-lg font-semibold text-gray-800">
                    انتخاب واحد عضو شده
                </h3>
            </div>
            
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <div className="text-right">
                            <p className="font-medium text-gray-800">
                                {selectedBuilding ? `${selectedBuilding.title} - واحد ${selectedBuilding.unit_info?.unit_number || 'نامشخص'}` : 'انتخاب واحد'}
                            </p>
                            {selectedBuilding && (
                                <div className="text-sm text-gray-600">
                                    <p>کد ساختمان: {selectedBuilding.building_code}</p>
                                    <p className="text-xs text-gray-500">
                                        طبقه {selectedBuilding.unit_info?.floor || 'نامشخص'} • {selectedBuilding.unit_info?.role === 'resident' ? 'ساکن' : 'مالک'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {buildings.map((building) => (
                            <button
                                key={building.id}
                                onClick={() => handleBuildingSelect(building)}
                                className={`w-full flex items-center gap-3 p-4 text-right hover:bg-gray-50 transition-colors ${
                                    selectedBuilding && selectedBuilding.id === building.id
                                        ? 'bg-blue-50 border-r-4 border-blue-500'
                                        : ''
                                }`}
                            >
                                <Building2 className="w-5 h-5 text-gray-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                        {building.title} - واحد {building.unit_info?.unit_number || 'نامشخص'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        کد ساختمان: {building.building_code}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        طبقه {building.unit_info?.floor || 'نامشخص'} • {building.unit_info?.role === 'resident' ? 'ساکن' : 'مالک'}
                                    </p>
                                </div>
                                {selectedBuilding && selectedBuilding.id === building.id && (
                                    <Eye className="w-4 h-4 text-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedBuilding && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-800">
                            در حال مشاهده اطلاعات: <strong>{selectedBuilding.title} - واحد {selectedBuilding.unit_info?.unit_number || 'نامشخص'}</strong>
                        </p>
                    </div>
                    
                    {/* اطلاعات واحد */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Home size={16} className="text-gray-500" />
                            <span>{selectedBuilding.unit_info?.area ? `${selectedBuilding.unit_info.area} متر مربع` : 'نامشخص'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users size={16} className="text-gray-500" />
                            <span>{selectedBuilding.unit_info?.resident_count || 'نامشخص'} نفر</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Building2 size={16} className="text-gray-500" />
                            <span>{selectedBuilding.unit_info?.role === 'resident' ? 'ساکن' : 'مالک'}</span>
                        </div>
                        {selectedBuilding.unit_info?.has_parking && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Car size={16} className="text-gray-500" />
                                <span>{selectedBuilding.unit_info?.parking_count || 0} پارکینگ</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
