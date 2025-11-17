import { useState, useEffect } from "react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import RequestItem from "../../../manager/unitManagement/components/requests/RequestItem";
import { fetchRequests } from "../../../manager/unitManagement/slices/requestsSlice";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";

export default function RequestsBase({ requests: propRequests, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { requests: reduxRequests, loading, error } = useSelector(state => state.requests);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxRequests.length > 0 ? reduxRequests : (propRequests || []);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    // Fetch requests when component mounts
    useEffect(() => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            dispatch(fetchRequests(selectedBuilding.building_id || selectedBuilding.id));
        }
    }, [dispatch, selectedBuilding]);

    const handleRefresh = () => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            dispatch(fetchRequests(selectedBuilding.building_id || selectedBuilding.id));
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
                <h2 className="text-xl font-semibold text-gray-900">درخواست‌ها</h2>
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                    <FileText className="w-5 h-5 text-green-500 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-green-900">اطلاعات</h3>
                        <p className="text-sm text-green-700 mt-1">
                            در این بخش می‌توانید درخواست‌های ارسالی و دریافتی خود را مشاهده کنید.
                            شامل درخواست‌های تعمیرات، خدمات و سایر موارد.
                        </p>
                    </div>
                </div>
            </div>

            {/* Requests List */}
            {displayed.length === 0 ? (
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ درخواستی یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ درخواستی برای این ساختمان ثبت نشده است.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((request) => (
                        <RequestItem
                            key={request.request_id || request.id}
                            request={request}
                            onClick={() => setSelectedRequest(request)}
                        />
                    ))}
                </div>
            )}

            {/* Request Detail - No modal available */}
        </div>
    );
}
