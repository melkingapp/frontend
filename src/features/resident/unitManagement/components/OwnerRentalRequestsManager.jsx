import { useState, useEffect } from "react";
import { Home, User, Phone, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders, API_CONFIG } from "../../../../config/api";

export default function OwnerRentalRequestsManager() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const authToken = localStorage.getItem('access_token');

    useEffect(() => {
        fetchRentalRequests();
    }, []);

    const fetchRentalRequests = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RENTAL_REQUESTS_OWNER), {
                headers: getAuthHeaders(authToken)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setRequests(data.requests || []);
        } catch (err) {
            setError(err.message);
            toast.error('خطا در دریافت درخواست‌های اجاره');
        } finally {
            setLoading(false);
        }
    };

    const handleOwnerAction = async (requestId, action, reason = '') => {
        setLoading(true);
        
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RENTAL_REQUEST_OWNER_ACTION(requestId)), {
                method: 'PATCH',
                headers: getAuthHeaders(authToken),
                body: JSON.stringify({ action, reason })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            toast.success(data.message);
            fetchRentalRequests();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending_owner':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'pending_manager':
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending_owner':
                return 'در انتظار تایید مالک';
            case 'pending_manager':
                return 'در انتظار تایید مدیر';
            case 'approved':
                return 'تایید شده';
            case 'rejected':
                return 'رد شده';
            default:
                return 'نامشخص';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_owner':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending_manager':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">درخواست‌های اجاره برای واحدهای من</h2>
                <button
                    onClick={fetchRentalRequests}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    بروزرسانی
                </button>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="text-center py-8">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواست اجاره‌ای یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ درخواست اجاره‌ای برای واحدهای شما ارسال نشده است.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.request_id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            درخواست اجاره #{request.request_id}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span className="mr-1">{getStatusText(request.status)}</span>
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Home className="w-4 h-4" />
                                            <span>ساختمان: {request.building_title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>واحد: {request.unit_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>مستاجر: {request.tenant_full_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{request.tenant_phone_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>تاریخ: {new Date(request.created_at).toLocaleDateString('fa-IR')}</span>
                                        </div>
                                    </div>

                                    {request.message && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700">{request.message}</p>
                                        </div>
                                    )}

                                    {request.owner_rejection_reason && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-700">
                                                <strong>دلیل رد شما:</strong> {request.owner_rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {request.status === 'pending_owner' && (
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => handleOwnerAction(request.request_id, 'approve')}
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            تایید
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('دلیل رد درخواست (اختیاری):');
                                                if (reason !== null) {
                                                    handleOwnerAction(request.request_id, 'reject', reason);
                                                }
                                            }}
                                            disabled={loading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            رد
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}
        </div>
    );
}
