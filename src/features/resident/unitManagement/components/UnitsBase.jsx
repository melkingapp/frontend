import { useState, useEffect } from "react";
import { Home, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import UnitItem from "../../../manager/unitManagement/components/units/UnitItem";
import UnitDetailsModal from "../../../manager/unitManagement/components/units/UnitDetailsModal";
import { fetchUnits } from "../../../manager/unitManagement/slices/unitsSlice";
import { fetchMembershipRequests } from "../../../membership/membershipSlice";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { selectMembershipRequests } from "../../../membership/membershipSlice";

export default function UnitsBase({ units: propUnits, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { units: reduxUnits, loading } = useSelector(state => state.units);
    const membershipRequests = useSelector(selectMembershipRequests);
    const user = useSelector(state => state.auth.user);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Get approved membership requests for the current user
    const approvedRequests = membershipRequests.filter(req => 
        req.status === 'manager_approved' && req.user === user?.id
    );

    // Create units from approved membership requests
    const membershipUnits = approvedRequests.map(request => ({
        units_id: request.unit_id || `req_${request.request_id}`,
        unit_number: request.unit_number,
        floor: request.floor,
        area: request.area,
        full_name: user?.full_name || user?.first_name + ' ' + user?.last_name,
        phone_number: user?.phone_number,
        role: request.role,
        owner_type: request.owner_type,
        tenant_full_name: request.tenant_full_name,
        tenant_phone_number: request.tenant_phone_number,
        has_parking: request.has_parking,
        parking_count: request.parking_count,
        resident_count: request.resident_count,
        building: {
            building_id: request.building,
            title: request.building_title
        }
    }));

    // اگر نقش کاربر ساکن است، فقط از درخواست‌های تایید شده خودش استفاده کن و هرگز همه واحدهای ساختمان را نشان نده
    const dataSource = user?.role === 'resident'
        ? membershipUnits
        : (membershipUnits.length > 0 ? membershipUnits : (reduxUnits.length > 0 ? reduxUnits : (propUnits || [])));
    
    // Sort by unit_number
    const sorted = [...dataSource].sort((a, b) => {
        return (a.unit_number || 0) - (b.unit_number || 0);
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    // Fetch membership requests for current user (ensures membershipUnits has data)
    useEffect(() => {
        dispatch(fetchMembershipRequests());
    }, [dispatch]);

    // Fetch units only for managers
    useEffect(() => {
        if (user?.role === 'manager' && (selectedBuilding?.building_id || selectedBuilding?.id)) {
            dispatch(fetchUnits(selectedBuilding.building_id || selectedBuilding.id));
        }
    }, [dispatch, selectedBuilding, user?.role]);

    const handleRefresh = () => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            dispatch(fetchUnits(selectedBuilding.building_id || selectedBuilding.id));
        }
    };

    if (loading && displayed.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">واحدهای من</h2>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 
                             hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    بروزرسانی
                </button>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Home className="w-5 h-5 text-blue-500 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">اطلاعات</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            در این بخش می‌توانید اطلاعات واحدهای متعلق به خود را مشاهده کنید.
                            شامل اطلاعات کامل واحد، وضعیت سکونت و جزئیات مالی.
                        </p>
                    </div>
                </div>
            </div>

            {/* Units List */}
            {displayed.length === 0 ? (
                <div className="text-center py-8">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ واحدی یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ واحدی برای این ساختمان ثبت نشده است.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayed.map((unit) => (
                        <UnitItem
                            key={unit.units_id || unit.id}
                            unit={unit}
                            onSelect={setSelectedUnit}
                        />
                    ))}
                </div>
            )}

            {/* Unit Detail Modal */}
            {selectedUnit && (
                <UnitDetailsModal
                    unit={selectedUnit}
                    onClose={() => setSelectedUnit(null)}
                />
            )}
        </div>
    );
}
