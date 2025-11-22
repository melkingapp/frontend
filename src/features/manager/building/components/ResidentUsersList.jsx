import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Users, User, Phone, Calendar, Building2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../../shared/components/shared/feedback/Button";
import {
    fetchBuildingResidents,
    updateResidentStatus,
    selectBuildingResidents,
    selectBuildingResidentsLoading,
    selectBuildingResidentsError,
    selectUpdatingResident
} from "../slices/buildingResidentsSlice";

export default function ResidentUsersList({ buildingId }) {
    const dispatch = useDispatch();
    const residents = useSelector(selectBuildingResidents);
    const loading = useSelector(selectBuildingResidentsLoading);
    const error = useSelector(selectBuildingResidentsError);
    const updatingResident = useSelector(selectUpdatingResident);

    useEffect(() => {
        if (buildingId) {
            dispatch(fetchBuildingResidents(buildingId));
        }
    }, [buildingId, dispatch]);

    const handleRemoveUser = async (requestId) => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این ساکن را از ساختمان حذف کنید؟')) {
            return;
        }

        try {
            await dispatch(updateResidentStatus({ 
                requestId, 
                status: 'rejected' 
            })).unwrap();
            
            toast.success('ساکن با موفقیت از ساختمان حذف شد');
        } catch (error) {
            toast.error(error || 'خطا در حذف ساکن');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-red-600">
                    <Building2 className="w-8 h-8 mx-auto mb-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (residents.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p>هیچ ساکن تایید شده‌ای وجود ندارد</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">ساکنان تایید شده</h2>
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                    {residents.length} ساکن
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {residents.map((user, index) => (
                    <div key={user.request_id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {user.resident_name && user.resident_name !== 'Resident User' 
                                            ? user.resident_name 
                                            : (user.resident_username || 'نام نامشخص')}
                                    </h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {user.resident_phone || 'شماره نامشخص'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700">تایید شده</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>عضویت: {formatDate(user.approved_at || user.created_at)}</span>
                            </div>
                            
                            {user.building_code && (
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    <span>کد ساختمان: {user.building_code}</span>
                                </div>
                            )}
                        </div>

                        {user.message && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    <span className="font-medium">پیام:</span> {user.message}
                                </p>
                            </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                                size="small"
                                color="red"
                                onClick={() => handleRemoveUser(user.request_id)}
                                loading={updatingResident === user.request_id}
                                disabled={updatingResident === user.request_id}
                                className="w-full"
                            >
                                <XCircle className="w-4 h-4 ml-1" />
                                حذف از ساختمان
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
