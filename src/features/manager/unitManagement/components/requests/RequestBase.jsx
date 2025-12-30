import { FileText, Loader2, RefreshCw, Plus } from "lucide-react";
import RequestItem from "./RequestItem";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequests } from "../../slices/requestsSlice";
import CreateRequestModal from "./CreateRequestModal";

export default function RequestBase({ limit, buildingId = null }) {
    const dispatch = useDispatch();
    const { requests: reduxRequests, loading, error } = useSelector(state => state.requests);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxRequests || [];
    const displayedRequests = limit ? dataSource.slice(0, limit) : dataSource;

    useEffect(() => {
        // Only fetch if buildingId is available
        if (buildingId) {
            dispatch(fetchRequests(buildingId));
        }
    }, [dispatch, buildingId]);

    const handleRefresh = () => {
        dispatch(fetchRequests(buildingId));
    };

    const handleCreateSuccess = () => {
        // Refresh requests list after creating
        dispatch(fetchRequests(buildingId));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <FileText className="text-melkingDarkBlue" size={20} />
                    درخواست ها
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        بروزرسانی
                    </button>
                    {buildingId && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                        >
                            <Plus size={18} />
                            ایجاد درخواست
                        </button>
                    )}
                </div>
            </div>

            {!buildingId ? (
                <p className="text-gray-400 text-sm text-center py-8">لطفاً یک ساختمان انتخاب کنید.</p>
            ) : loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری درخواست‌ها</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayedRequests.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">درخواستی موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayedRequests.map((request) => (
                        <RequestItem key={request.id} request={request} />
                    ))}
                </div>
            )}

            {limit && dataSource.length > limit && (
                <p className="text-sm text-gray-500 mt-2">
                    {`نمایش ${limit} مورد از ${dataSource.length} درخواست`}
                </p>
            )}

            <CreateRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                buildingId={buildingId}
            />
        </div>
    )
}