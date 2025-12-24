import { Building2, Users, MapPin, Calendar, CheckCircle, Home, Car } from "lucide-react";
import { useSelector } from "react-redux";
import { selectSelectedResidentBuilding } from "../residentBuildingSlice";
import { useApprovedRequests } from "../hooks/useApprovedRequests";

export default function ResidentBuildingCard() {
    const approvedRequests = useApprovedRequests();
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    
    // Get the request for the selected building/unit, or fallback to first approved request
    let displayRequest = null;
    
    if (selectedBuilding && selectedBuilding.building_id) {
        // Find request that matches the selected building and unit
        displayRequest = approvedRequests.find(req => 
            req.building && req.building === selectedBuilding.building_id && 
            req.unit_number === selectedBuilding.unit_info?.unit_number
        );
        
        // If no exact match, find by building ID only
        if (!displayRequest) {
            displayRequest = approvedRequests.find(req => 
                req.building && req.building === selectedBuilding.building_id
            );
        }
        
        // If still no match, try to find by ID
        if (!displayRequest && selectedBuilding.id) {
            const buildingId = selectedBuilding.id.split('-')[0];
            displayRequest = approvedRequests.find(req => 
                req.building && req.building.toString() === buildingId
            );
        }
    }
    
    // If no selected building or building_id is undefined, use first approved request
    if (!displayRequest && approvedRequests.length > 0) {
        displayRequest = approvedRequests[0];
    }
    
    // If still no display request, show message
    if (!displayRequest) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2" />
                    <p>لطفاً ابتدا واحد مورد نظر خود را انتخاب کنید</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Building2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {displayRequest.building_title}
                        </h2>
                        <p className="text-sm text-gray-600">
                            کد ساختمان: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-melkingDarkBlue">
                                {displayRequest.building_code}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">عضو تایید شده</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Home className="w-5 h-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-600">واحد</p>
                        <p className="font-semibold text-gray-800">{displayRequest.unit_number}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-600">طبقه</p>
                        <p className="font-semibold text-gray-800">{displayRequest.floor}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Home className="w-5 h-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-600">متراژ</p>
                        <p className="font-semibold text-gray-800">
                            {displayRequest.area ? `${displayRequest.area} متر مربع` : 'نامشخص'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-600">تعداد نفر</p>
                        <p className="font-semibold text-gray-800">{displayRequest.resident_count || 'نامشخص'}</p>
                    </div>
                </div>
            </div>

            {/* اطلاعات اضافی */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-600">نقش</p>
                        <p className="font-semibold text-gray-800">
                            {displayRequest.role === 'resident' ? 'ساکن' : 'مالک'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                        <p className="text-sm text-gray-600">تاریخ تایید</p>
                        <p className="font-semibold text-gray-800">
                            {displayRequest.approved_at ? 
                                new Date(displayRequest.approved_at).toLocaleDateString('fa-IR') : 
                                'نامشخص'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* پارکینگ */}
            {displayRequest.has_parking && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Car className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-sm text-blue-600">پارکینگ</p>
                        <p className="font-semibold text-blue-800">
                            {displayRequest.parking_count || 0} عدد پارکینگ
                        </p>
                    </div>
                </div>
            )}


            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="text-sm font-medium text-green-800">
                            خوش آمدید! شما به عنوان عضو تایید شده این ساختمان به تمام اطلاعات و خدمات دسترسی دارید.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
