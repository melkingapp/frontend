import { useState, useEffect, useMemo } from "react";
import { Building2, ChevronDown, Eye, Home, Users, Car } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectMembershipRequests, fetchMembershipRequests } from "../../../membership/membershipSlice";
import { selectApprovedBuildings, selectSelectedResidentBuilding, setSelectedBuilding } from "../residentBuildingSlice";

export default function BuildingSelector() {
    const dispatch = useDispatch();
    const requests = useSelector(selectMembershipRequests);
    const approvedBuildings = useSelector(selectApprovedBuildings);
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch membership requests when component mounts
    useEffect(() => {
        dispatch(fetchMembershipRequests());
    }, [dispatch]);

    // Get buildings from approved requests (primary source)
    // This is more reliable than approvedBuildings which might be empty
    const approvedRequests = requests.filter(req => 
        req.status === 'approved' || 
        req.status === 'owner_approved' || 
        req.status === 'manager_approved'
    );
    
    // Create a unique entry for each unit (not just each building)
    // اگر کاربر هم مالک و هم ساکن است، فقط نقش مالک را نشان بده
    const buildings = useMemo(() => {
        // گروه‌بندی درخواست‌ها بر اساس ساختمان و واحد
        const unitGroups = {};
        
        approvedRequests.forEach(request => {
            const key = `${request.building}-${request.unit_number}`;
            if (!unitGroups[key]) {
                unitGroups[key] = [];
            }
            unitGroups[key].push(request);
        });
        
        // برای هر واحد، نقش مالک را اولویت بده
        const uniqueUnits = [];
        Object.values(unitGroups).forEach(requests => {
            // اگر نقش مالک وجود دارد، آن را انتخاب کن
            const ownerRequest = requests.find(req => req.role === 'owner');
            if (ownerRequest) {
                uniqueUnits.push(ownerRequest);
            } else {
                // در غیر این صورت، اولین درخواست را انتخاب کن
                uniqueUnits.push(requests[0]);
            }
        });
        
        return uniqueUnits.map((request, index) => ({
            id: `${request.building}-${request.unit_number}`, // Simple unique ID
            building_id: request.building,
            title: request.building_title,
            building_code: request.building_code,
            unit_info: {
                unit_number: request.unit_number,
                floor: request.floor,
                area: request.area,
                resident_count: request.resident_count,
                has_parking: request.has_parking,
                parking_count: request.parking_count,
                role: request.role
            }
        }));
    }, [approvedRequests]);

    // Auto-select first building if none selected (only once)
    useEffect(() => {
        if (buildings.length > 0 && !selectedBuilding) {
            // Check if this is the first time loading (no saved selection in localStorage)
            const savedBuilding = localStorage.getItem('selectedResidentBuilding');
            if (!savedBuilding) {
                dispatch(setSelectedBuilding(buildings[0]));
            }
        }
    }, [buildings.length, selectedBuilding, dispatch]);

    // Validate selected building against current buildings list
    useEffect(() => {
        if (selectedBuilding && buildings.length > 0) {
            // Check if selected building still exists in current buildings list
            const buildingExists = buildings.find(b => 
                b.id === selectedBuilding.id || 
                (b.building_id === selectedBuilding.building_id && 
                 b.unit_info?.unit_number === selectedBuilding.unit_info?.unit_number)
            );
            
            if (!buildingExists) {
                // Selected building no longer exists, try to find a similar one
                const similarBuilding = buildings.find(b => 
                    b.building_id === selectedBuilding.building_id
                );
                
                if (similarBuilding) {
                    // Found a building with same building_id, update selection
                    dispatch(setSelectedBuilding(similarBuilding));
                } else {
                    // No similar building found, clear selection
                    dispatch(setSelectedBuilding(null));
                }
            }
        }
    }, [buildings, selectedBuilding, dispatch]);

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
