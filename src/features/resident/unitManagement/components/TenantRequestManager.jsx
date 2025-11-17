import { useState, useEffect } from "react";
import { Home, User, Phone, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders, API_CONFIG } from "../../../../config/api";

export default function TenantRequestManager() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        if (authToken) {
            fetchRentalRequests();
        }
    }, [authToken]);

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
            toast.error('خطا در دریافت درخواست‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async () => {
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

            const result = await response.json();
            toast.success('درخواست اجاره با موفقیت ارسال شد');
            
            // Reset form
            setNewRequest({
                tenant_full_name: '',
                tenant_phone_number: '',
                building_code: '',
                unit_number: '',
                message: ''
            });
            setShowCreateForm(false);
            
            // Refresh requests
            fetchRentalRequests();
            
        } catch (err) {
            toast.error(`خطا در ارسال درخواست: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending_owner':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'pending_manager':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="mr-2">در حال بارگذاری...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Home className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">درخواست‌های اجاره من</h2>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    درخواست جدید
                </button>
            </div>

            {/* Create Request Form */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">درخواست اجاره جدید</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نام و نام خانوادگی *
                            </label>
                            <input
                                type="text"
                                value={newRequest.tenant_full_name}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, tenant_full_name: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="نام و نام خانوادگی"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                شماره تماس *
                            </label>
                            <input
                                type="tel"
                                value={newRequest.tenant_phone_number}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, tenant_phone_number: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="شماره تماس"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                کد ساختمان *
                            </label>
                            <input
                                type="text"
                                value={newRequest.building_code}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, building_code: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="کد ساختمان"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                شماره واحد *
                            </label>
                            <input
                                type="text"
                                value={newRequest.unit_number}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, unit_number: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="شماره واحد"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                پیام اضافی
                            </label>
                            <textarea
                                value={newRequest.message}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="پیام اضافی (اختیاری)"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleCreateRequest}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'در حال ارسال...' : 'ارسال درخواست'}
                        </button>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                        >
                            انصراف
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700">خطا: {error}</span>
                    </div>
                </div>
            )}

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="text-center py-8">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">هیچ درخواست اجاره‌ای ندارید</h3>
                    <p className="text-gray-400">برای درخواست اجاره یک واحد، روی دکمه "درخواست جدید" کلیک کنید</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.request_id} className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Home className="w-5 h-5 text-gray-500" />
                                            <span className="font-medium">واحد {request.unit_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-500" />
                                            <span>{request.building_title}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">نام: {request.tenant_full_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">تماس: {request.tenant_phone_number}</span>
                                        </div>
                                    </div>
                                    
                                    {request.message && (
                                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                            <p className="text-sm text-gray-700">{request.message}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            ارسال شده در: {new Date(request.created_at).toLocaleDateString('fa-IR')}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(request.status)}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                        {getStatusText(request.status)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Rejection Reason */}
                            {request.status === 'rejected' && (request.owner_rejection_reason || request.manager_rejection_reason) && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <strong>دلیل رد:</strong> {request.owner_rejection_reason || request.manager_rejection_reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
