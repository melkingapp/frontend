import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Button from "../../../../shared/components/shared/feedback/Button";

export default function ResidentRequestsManager({ buildingId }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingRequest, setProcessingRequest] = useState(null);

    const fetchRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const getApiBaseURL = () => {
                if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                    return isLocalhost ? 'http://localhost:8000/api/v1' : 'http://171.22.25.201:9000/api/v1';
                }
                return 'http://localhost:8000/api/v1';
            };
            const response = await fetch(`${getApiBaseURL()}/buildings/${buildingId}/resident-requests/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setRequests(data.requests || []);
            } else {
                setError(data.error || 'خطا در دریافت درخواست‌ها');
            }
        } catch (error) {
            console.error('خطا در دریافت درخواست‌ها:', error);
            setError('خطا در دریافت درخواست‌ها');
        } finally {
            setLoading(false);
        }
    }, [buildingId]);

    useEffect(() => {
        if (buildingId) {
            fetchRequests();
        }
    }, [buildingId, fetchRequests]);

    const handleRequestAction = async (requestId, status) => {
        setProcessingRequest(requestId);
        
        try {
            const token = localStorage.getItem('access_token');
            const getApiBaseURL = () => {
                if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                    return isLocalhost ? 'http://localhost:8000/api/v1' : 'http://171.22.25.201:9000/api/v1';
                }
                return 'http://localhost:8000/api/v1';
            };
            const response = await fetch(`${getApiBaseURL()}/buildings/resident-requests/${requestId}/update-status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (response.ok) {
                // به‌روزرسانی لیست درخواست‌ها
                setRequests(prev => 
                    prev.map(req => 
                        req.request_id === requestId 
                            ? { ...req, status, approved_at: data.request.approved_at }
                            : req
                    )
                );
            } else {
                toast.error(data.error || 'خطا در به‌روزرسانی وضعیت');
            }
        } catch (error) {
            console.error('خطا در به‌روزرسانی وضعیت:', error);
            toast.error('خطا در به‌روزرسانی وضعیت');
        } finally {
            setProcessingRequest(null);
        }
    };

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
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-red-600">
                    <XCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>{error}</p>
                    <Button 
                        size="medium" 
                        color="darkBlue"
                        onClick={fetchRequests}
                        className="mt-4"
                    >
                        تلاش مجدد
                    </Button>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2" />
                    <p>هیچ درخواست عضویتی دریافت نشده است</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-melkingDarkBlue" />
                <h2 className="text-xl font-bold text-gray-800">درخواست‌های عضویت ساکنان</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                    {requests.length} درخواست
                </span>
            </div>

            <div className="space-y-4">
                {requests.map((request) => (
                    <div key={request.request_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(request.status)}
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {request.resident_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {request.resident_phone}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                            </span>
                        </div>

                        {request.message && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">پیام ساکن:</p>
                                        <p className="text-sm text-gray-600">{request.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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

                        {request.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button
                                    size="small"
                                    color="green"
                                    onClick={() => handleRequestAction(request.request_id, 'approved')}
                                    loading={processingRequest === request.request_id}
                                    disabled={processingRequest === request.request_id}
                                >
                                    <CheckCircle className="w-4 h-4 ml-1" />
                                    تایید
                                </Button>
                                <Button
                                    size="small"
                                    color="red"
                                    onClick={() => handleRequestAction(request.request_id, 'rejected')}
                                    loading={processingRequest === request.request_id}
                                    disabled={processingRequest === request.request_id}
                                >
                                    <XCircle className="w-4 h-4 ml-1" />
                                    رد
                                </Button>
                            </div>
                        )}

                        {(request.status === 'approved' || request.status === 'owner_approved' || request.status === 'manager_approved') && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    ✅ این درخواست تایید شده است. ساکن حالا به اطلاعات ساختمان دسترسی دارد.
                                </p>
                            </div>
                        )}

                        {request.status === 'rejected' && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    ❌ این درخواست رد شده است.
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
