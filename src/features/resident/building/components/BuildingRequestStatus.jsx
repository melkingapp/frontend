import { useEffect, useState, useRef } from "react";
import { Clock, CheckCircle, XCircle, Building2, Calendar, RefreshCw, Home, Users, Car } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { 
    setSelectedBuilding, 
    fetchApprovedBuildingsDetails,
    selectResidentBuildingLoading: _selectResidentBuildingLoading,
    selectResidentBuildingError: _selectResidentBuildingError
} from "../residentBuildingSlice";
import { 
    fetchMembershipRequests,
    selectMembershipRequests,
    selectMembershipLoading,
    selectMembershipError
} from "../../../membership/membershipSlice";

export default function BuildingRequestStatus() {
    const dispatch = useDispatch();
    const requests = useSelector(selectMembershipRequests);
    const loading = useSelector(selectMembershipLoading);
    const error = useSelector(selectMembershipError);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const previousRequestsRef = useRef([]);

    useEffect(() => {
        // Always fetch requests when component mounts
        dispatch(fetchMembershipRequests());
    }, [dispatch]);

    // Auto-refresh every 30 seconds for pending requests
    useEffect(() => {
        const hasPendingRequests = requests.some(req => req.status === 'pending');
        if (!hasPendingRequests) return;

        const interval = setInterval(() => {
            dispatch(fetchMembershipRequests());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [dispatch, requests]);

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

    // Check for status changes and show notifications
    useEffect(() => {
        const previousRequests = previousRequestsRef.current;
        
        if (previousRequests.length > 0 && requests.length > 0) {
            // Check for status changes
            requests.forEach(currentRequest => {
                const previousRequest = previousRequests.find(
                    prev => prev.request_id === currentRequest.request_id
                );
                
                if (previousRequest && previousRequest.status !== currentRequest.status) {
                    if (currentRequest.status === 'approved' || currentRequest.status === 'owner_approved' || currentRequest.status === 'manager_approved') {
                        toast.success(`🎉 درخواست عضویت شما در ساختمان ${currentRequest.building_title} تایید شد!`, {
                            duration: 5000,
                            description: 'حالا می‌توانید به اطلاعات ساختمان دسترسی داشته باشید.'
                        });
                    } else if (currentRequest.status === 'rejected') {
                        toast.error(`درخواست عضویت شما در ساختمان ${currentRequest.building_title} رد شد.`, {
                            duration: 5000,
                            description: 'در صورت نیاز با مدیر ساختمان تماس بگیرید.'
                        });
                    }
                }
            });
        }
        
        // Update previous requests
        previousRequestsRef.current = [...requests];
    }, [requests]);

    // Auto-select approved building (only once when requests change)
    useEffect(() => {
        const approvedRequest = requests.find(req => 
            req.status === 'approved' || 
            req.status === 'owner_approved' || 
            req.status === 'manager_approved'
        );
        if (approvedRequest && approvedRequest.building) {
            console.log('Auto-selecting approved building:', approvedRequest.building);
            // Fetch building details and set as selected
            dispatch(fetchApprovedBuildingsDetails([approvedRequest.building]))
                .then((result) => {
                    console.log('Auto-select result:', result);
                    if (result.payload && result.payload.length > 0) {
                        dispatch(setSelectedBuilding(result.payload[0]));
                    }
                })
                .catch(error => {
                    console.error('Error fetching building details:', error);
                });
        }
    }, [requests, dispatch]);


    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'owner_approved':
                return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case 'manager_approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            // Legacy support for old status values
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'در انتظار تایید مالک';
            case 'owner_approved':
                return 'تایید شده توسط مالک';
            case 'manager_approved':
                return 'تایید شده توسط مدیر';
            case 'rejected':
                return 'رد شده';
            // Legacy support for old status values
            case 'approved':
                return 'تایید شده';
            default:
                return 'نامشخص';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'owner_approved':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'manager_approved':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'rejected':
                return 'bg-red-50 border-red-200 text-red-800';
            // Legacy support for old status values
            case 'approved':
                return 'bg-green-50 border-green-200 text-green-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
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
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="text-center text-gray-500 mt-4">
                    <p>در حال بارگذاری درخواست‌ها...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-red-600">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>خطا در بارگذاری درخواست‌ها: {error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2" />
                    <p>هنوز درخواستی ارسال نکرده‌اید</p>
                    <p className="text-sm mt-2">برای ارسال درخواست عضویت، از فرم بالا استفاده کنید</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-melkingDarkBlue" />
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-800">وضعیت و پیگیری درخواست‌ها</h2>
                        {requests.some(req => req.status === 'pending') && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                {requests.filter(req => req.status === 'pending').length} در انتظار تایید مدیر
                            </span>
                        )}
                    </div>
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

            <div className="space-y-4">
                {requests.map((request) => (
                    <div key={request.request_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(request.status)}
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {request.building_title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        کد ساختمان: {request.building_code} | واحد {request.unit_number} - طبقه {request.floor}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                            </span>
                        </div>

                        {/* اطلاعات واحد */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Home size={16} className="text-gray-500" />
                                <span>متراژ: {request.area ? `${request.area} متر مربع` : 'نامشخص'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users size={16} className="text-gray-500" />
                                <span>تعداد نفر: {request.resident_count || 'نامشخص'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Car size={16} className="text-gray-500" />
                                <span>پارکینگ: {request.has_parking ? `دارد (${request.parking_count || 0} عدد)` : 'ندارد'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 size={16} className="text-gray-500" />
                                <span>نقش: {request.role === 'resident' ? 'ساکن' : 'مالک'}</span>
                            </div>
                        </div>


                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>ارسال: {formatDate(request.created_at)}</span>
                            </div>
                            {request.approved_at && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>تایید: {formatDate(request.approved_at)}</span>
                                </div>
                            )}
                        </div>

                        {(request.status === 'approved' || request.status === 'owner_approved' || request.status === 'manager_approved') && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    🎉 تبریک! درخواست شما تایید شد. حالا می‌توانید به اطلاعات ساختمان دسترسی داشته باشید.
                                </p>
                            </div>
                        )}

                        {request.status === 'rejected' && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    متأسفانه درخواست شما رد شد. در صورت نیاز با مدیر ساختمان تماس بگیرید.
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

