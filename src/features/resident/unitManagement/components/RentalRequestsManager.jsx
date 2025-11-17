import { useState, useEffect } from "react";
import { Home, User, Phone, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders, API_CONFIG } from "../../../../config/api";

export default function RentalRequestsManager() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newRequest, setNewRequest] = useState({
        tenant_full_name: '',
        tenant_phone_number: '',
        building_code: '',
        unit_number: '',
        message: ''
    });

    const authToken = localStorage.getItem('access_token');

    useEffect(() => {
        fetchRentalRequests();
    }, []);

    const fetchRentalRequests = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RENTAL_REQUESTS_TENANT), {
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

    const createRentalRequest = async () => {
        if (!newRequest.tenant_full_name || !newRequest.tenant_phone_number || 
            !newRequest.building_code || !newRequest.unit_number) {
            toast.error('لطفاً تمام فیلدهای الزامی را پر کنید');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RENTAL_REQUESTS_CREATE), {
                method: 'POST',
                headers: getAuthHeaders(authToken),
                body: JSON.stringify(newRequest)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            toast.success('درخواست اجاره با موفقیت ارسال شد');
            setShowCreateForm(false);
            setNewRequest({
                tenant_full_name: '',
                tenant_phone_number: '',
                building_code: '',
                unit_number: '',
                message: ''
            });
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
                <h2 className="text-xl font-semibold text-gray-900">درخواست‌های اجاره من</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    درخواست اجاره جدید
                </button>
            </div>

            {/* Create Request Form */}
            {showCreateForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">درخواست اجاره جدید</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                نام و نام خانوادگی مستاجر *
                            </label>
                            <input
                                type="text"
                                value={newRequest.tenant_full_name}
                                onChange={(e) => setNewRequest({...newRequest, tenant_full_name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="علی احمدی"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                شماره تماس مستاجر *
                            </label>
                            <input
                                type="text"
                                value={newRequest.tenant_phone_number}
                                onChange={(e) => setNewRequest({...newRequest, tenant_phone_number: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="09987654321"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                کد ساختمان *
                            </label>
                            <input
                                type="text"
                                value={newRequest.building_code}
                                onChange={(e) => setNewRequest({...newRequest, building_code: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                شماره واحد *
                            </label>
                            <input
                                type="text"
                                value={newRequest.unit_number}
                                onChange={(e) => setNewRequest({...newRequest, unit_number: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                پیام اضافی
                            </label>
                            <textarea
                                value={newRequest.message}
                                onChange={(e) => setNewRequest({...newRequest, message: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                placeholder="من ساکن این واحد هستم"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={createRentalRequest}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            ارسال درخواست
                        </button>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            انصراف
                        </button>
                    </div>
                </div>
            )}

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="text-center py-8">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواست اجاره‌ای یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ درخواست اجاره‌ای ارسال نکرده‌اید.</p>
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
                                                <strong>دلیل رد مالک:</strong> {request.owner_rejection_reason}
                                            </p>
                                        </div>
                                    )}

                                    {request.manager_rejection_reason && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-700">
                                                <strong>دلیل رد مدیر:</strong> {request.manager_rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
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
