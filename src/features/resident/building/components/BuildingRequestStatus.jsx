import { useEffect, useState, useRef } from "react";
import { Clock, CheckCircle, CheckCircle2, XCircle, Building2, Calendar, RefreshCw, Home, Users, Car } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { 
    setSelectedBuilding, 
    fetchApprovedBuildingsDetails,
    selectResidentBuildingLoading,
    selectResidentBuildingError
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
            const result = await dispatch(fetchMembershipRequests()).unwrap();
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
    }, [requests.length, dispatch]); // Only depend on requests length, not the full requests array


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
                return null; // Return null for unknown statuses
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 rounded-xl"></div>
                        <div className="h-32 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="text-center text-gray-500 mt-6">
                        <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium">در حال بارگذاری درخواست‌ها...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-red-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">خطا در بارگذاری</h2>
                    </div>
                </div>
                <div className="p-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">خطا در بارگذاری درخواست‌ها</p>
                        <p className="text-sm text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            تلاش مجدد
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">وضعیت و پیگیری درخواست‌ها</h2>
                    </div>
                </div>
                <div className="p-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
                            <Building2 className="w-10 h-10 text-indigo-500" />
                        </div>
                        <p className="text-gray-700 font-semibold text-lg mb-2">هنوز درخواستی ارسال نکرده‌اید</p>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            برای ارسال درخواست عضویت در ساختمان، از فرم بالا استفاده کنید و اطلاعات واحد خود را وارد نمایید.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-gray-800">وضعیت و پیگیری درخواست‌ها</h2>
                            {requests.some(req => req.status === 'pending') && (
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm animate-pulse">
                                    {requests.filter(req => req.status === 'pending').length} در انتظار تایید
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی'}
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {(() => {
                    // Filter out requests with unknown status
                    const validStatuses = ['pending', 'owner_approved', 'manager_approved', 'rejected', 'approved', 'suggested'];
                    const validRequests = requests.filter(req => {
                        const status = req.status;
                        return status && validStatuses.includes(status);
                    });
                    
                    // Group requests by building_code and unit_number
                    const requestsByKey = {};
                    validRequests.forEach(req => {
                        const key = `${req.building_code}-${req.unit_number}`;
                        if (!requestsByKey[key]) {
                            requestsByKey[key] = [];
                        }
                        requestsByKey[key].push(req);
                    });
                    
                    // For each group, keep only the best request:
                    // Priority: manager_approved > owner_approved > approved > pending > rejected > suggested
                    const uniqueRequests = Object.values(requestsByKey).map(group => {
                        const statusPriority = {
                            'manager_approved': 1,
                            'owner_approved': 2,
                            'approved': 3,
                            'pending': 4,
                            'suggested': 5,
                            'rejected': 6
                        };
                        
                        // Sort by priority, then by date (most recent first)
                        group.sort((a, b) => {
                            const priorityA = statusPriority[a.status] || 999;
                            const priorityB = statusPriority[b.status] || 999;
                            
                            if (priorityA !== priorityB) {
                                return priorityA - priorityB;
                            }
                            
                            // Same priority, get most recent
                            return new Date(b.created_at) - new Date(a.created_at);
                        });
                        
                        return group[0]; // Return the best one
                    });
                    
                    return uniqueRequests.map((request, index) => {
                        const statusText = getStatusText(request.status);
                        // Skip if status is unknown (shouldn't happen after filtering, but just in case)
                        if (!statusText) return null;
                        
                        return (
                    <div 
                        key={request.request_id} 
                        className="group border-2 border-gray-200 hover:border-indigo-300 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-2.5 bg-white rounded-lg shadow-sm border border-gray-100">
                                    {getStatusIcon(request.status)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                                        {request.building_title}
                                    </h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1">
                                            <Building2 size={14} className="text-gray-400" />
                                            کد: {request.building_code}
                                        </span>
                                        <span className="text-gray-300">|</span>
                                        <span>واحد {request.unit_number}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>طبقه {request.floor}</span>
                                    </p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 shadow-sm ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                            </span>
                        </div>

                        {/* اطلاعات واحد */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 bg-white/60 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/80 p-2 rounded-lg">
                                <Home size={18} className="text-indigo-500" />
                                <span className="font-medium">متراژ: <span className="text-gray-600">{request.area ? `${request.area} متر مربع` : 'نامشخص'}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/80 p-2 rounded-lg">
                                <Users size={18} className="text-indigo-500" />
                                <span className="font-medium">تعداد نفر: <span className="text-gray-600">{request.resident_count || 'نامشخص'}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/80 p-2 rounded-lg">
                                <Car size={18} className="text-indigo-500" />
                                <span className="font-medium">پارکینگ: <span className="text-gray-600">{request.has_parking ? `دارد (${request.parking_count || 0} عدد)` : 'ندارد'}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/80 p-2 rounded-lg">
                                <Building2 size={18} className="text-indigo-500" />
                                <span className="font-medium">نقش: <span className="text-gray-600">{request.role === 'resident' ? 'ساکن' : 'مالک'}</span></span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">ارسال: <span className="text-gray-500">{formatDate(request.created_at)}</span></span>
                            </div>
                            {request.approved_at && (
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-green-500" />
                                    <span className="font-medium text-green-700">تایید: <span className="text-green-600">{formatDate(request.approved_at)}</span></span>
                                </div>
                            )}
                        </div>

                        {(request.status === 'approved' || request.status === 'owner_approved' || request.status === 'manager_approved') && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-r-4 border-green-500 rounded-lg shadow-sm">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-600" />
                                    تبریک! درخواست شما تایید شد. حالا می‌توانید به اطلاعات ساختمان دسترسی داشته باشید.
                                </p>
                            </div>
                        )}

                        {request.status === 'rejected' && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-r-4 border-red-500 rounded-lg shadow-sm">
                                <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                                    <XCircle size={18} className="text-red-600" />
                                    متأسفانه درخواست شما رد شد. در صورت نیاز با مدیر ساختمان تماس بگیرید.
                                </p>
                            </div>
                        )}
                    </div>
                        );
                    }).filter(Boolean); // Remove null entries
                })()}
            </div>
        </div>
    );
}

