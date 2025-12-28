import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    DollarSign, 
    FileText, 
    Image as ImageIcon,
    Eye,
    Building2,
    Filter,
    RefreshCw,
    ChevronLeft,
    Plus,
    Home
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { 
    fetchExtraPaymentRequests
} from "../../../manager/finance/store/slices/extraPaymentSlice";
import { selectSelectedResidentBuilding, selectApprovedBuildings } from "../../../resident/building/residentBuildingSlice";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { useAllApprovedUnits } from "../../../resident/building/hooks/useApprovedRequests";
import { formatNumber } from "../../../../shared/utils/helper";
import ExtraPaymentRequestForm from "../components/ExtraPaymentRequestForm";

moment.loadPersian({ dialect: "persian-modern" });

export default function ExtraPaymentRequests() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const residentBuilding = useSelector(selectSelectedResidentBuilding);
    const managerBuilding = useSelector(selectSelectedBuilding);
    const approvedBuildings = useSelector(selectApprovedBuildings);
    const allApprovedUnits = useAllApprovedUnits();
    const { requests, loading, error } = useSelector((state) => state.extraPayment);

    // Try to find building with building_id from approvedBuildings or allApprovedUnits
    const building = useMemo(() => {
        // First try manager building
        if (managerBuilding?.building_id || managerBuilding?.id) {
            return managerBuilding;
        }
        
        // Then try to find resident building with building_id from approvedBuildings or allApprovedUnits
        if (residentBuilding) {
            // Try to find matching building from approvedBuildings that has building_id
            const matchingBuilding = approvedBuildings.find(b => {
                if (b.building_id || b.id) {
                    return (
                        (b.building_id || b.id) === (residentBuilding.building_id || residentBuilding.id) ||
                        b.building_code === residentBuilding.building_code ||
                        b.title === residentBuilding.title
                    );
                }
                return false;
            });
            if (matchingBuilding && (matchingBuilding.building_id || matchingBuilding.id)) {
                return matchingBuilding;
            }
            
            // Try to find from allApprovedUnits
            const matchingUnit = allApprovedUnits.find(b => {
                if (b.building_id) {
                    return (
                        b.building_id === residentBuilding.building_id ||
                        b.building_code === residentBuilding.building_code ||
                        b.title === residentBuilding.title ||
                        // Extract building_id from residentBuilding.id if it's a string like "2-5"
                        (residentBuilding.id && typeof residentBuilding.id === 'string' && 
                         residentBuilding.id.split('-')[0] === b.building_id.toString())
                    );
                }
                return false;
            });
            if (matchingUnit && matchingUnit.building_id) {
                return matchingUnit;
            }
        }
        
        // Fallback: try first building from approvedBuildings or allApprovedUnits
        if (approvedBuildings.length > 0 && approvedBuildings[0].building_id) {
            return approvedBuildings[0];
        }
        if (allApprovedUnits.length > 0 && allApprovedUnits[0].building_id) {
            return allApprovedUnits[0];
        }
        
        // Last fallback to residentBuilding or managerBuilding
        return residentBuilding || managerBuilding;
    }, [residentBuilding, managerBuilding, approvedBuildings, allApprovedUnits]);

    const [statusFilter, setStatusFilter] = useState("all");
    const [imagePreview, setImagePreview] = useState(null);
    const [showExtraPaymentForm, setShowExtraPaymentForm] = useState(false);

    // Extract building_id
    const buildingId = useMemo(() => {
        if (!building) return null;
        if (building.building_id !== undefined && building.building_id !== null && building.building_id !== 'undefined') {
            const parsed = typeof building.building_id === 'number' 
                ? building.building_id 
                : parseInt(building.building_id);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
        if (building.id && typeof building.id === 'number') {
            return building.id;
        }
        return null;
    }, [building]);

    useEffect(() => {
        if (buildingId) {
            loadRequests();
        }
    }, [buildingId, statusFilter]);

    const loadRequests = () => {
        if (buildingId) {
            dispatch(fetchExtraPaymentRequests({
                buildingId: buildingId,
                filters: statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}
            }));
        }
    };

    const openImagePreview = (imageUrl) => {
        // اگر URL کامل نیست، BASE_URL را اضافه می‌کنیم
        const MEDIA_URL = 'http://171.22.25.201:9000';
        const fullUrl = imageUrl?.startsWith('http') 
            ? imageUrl 
            : `${MEDIA_URL}${imageUrl}`;
        setImagePreview(fullUrl);
    };

    const closeImagePreview = () => {
        setImagePreview(null);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: {
                icon: Clock,
                color: "bg-yellow-100 text-yellow-800",
                text: "در انتظار تایید"
            },
            approved: {
                icon: CheckCircle,
                color: "bg-green-100 text-green-800",
                text: "تایید شده"
            },
            rejected: {
                icon: XCircle,
                color: "bg-red-100 text-red-800",
                text: "رد شده"
            }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon size={16} />
                {badge.text}
            </span>
        );
    };

    if (!building) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-slate-50">
                <div className="text-center p-8">
                    <Building2 size={64} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-3">
                        لطفاً ابتدا یک ساختمان انتخاب کنید
                    </h3>
                    <p className="text-slate-500 text-lg">
                        برای مشاهده درخواست‌های پرداخت اضافی، ابتدا ساختمان مورد نظر را انتخاب کنید
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:gap-6">
                    {/* Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/resident")}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md hover:from-white hover:to-gray-50 active:scale-95 transition-all duration-200 font-medium"
                        >
                            <Home size={18} className="text-gray-600" />
                            داشبورد
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md hover:from-white hover:to-gray-50 active:scale-95 transition-all duration-200 font-medium"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                            بازگشت
                        </button>
                        <button
                            onClick={() => setShowExtraPaymentForm(true)}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={18} />
                            ثبت درخواست جدید
                        </button>
                    </div>

                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="p-2 md:p-3 lg:p-4 bg-blue-100 rounded-xl md:rounded-2xl flex-shrink-0">
                            <DollarSign className="text-blue-600" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 md:mb-2">
                                درخواست‌های پرداخت اضافی من
                            </h1>
                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                                <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                                <span className="text-sm md:text-base lg:text-lg font-medium truncate">
                                    {building.title}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">فیلتر وضعیت:</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {["all", "pending", "approved", "rejected"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        statusFilter === status
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {status === "all" && "همه"}
                                    {status === "pending" && "در انتظار"}
                                    {status === "approved" && "تایید شده"}
                                    {status === "rejected" && "رد شده"}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={loadRequests}
                            disabled={loading}
                            className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                            <span>بروزرسانی</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Requests List */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-500">در حال بارگذاری...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">درخواستی یافت نشد</p>
                        <button
                            onClick={() => setShowExtraPaymentForm(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            ثبت درخواست جدید
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {requests.map((request) => (
                            <div
                                key={request.request_id}
                                className="p-4 md:p-6 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Main Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        {request.title}
                                                    </h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                                                    {request.unit && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">واحد:</span>
                                                            <span>واحد {request.unit.unit_number}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">مبلغ:</span>
                                                        <span className="font-bold text-slate-900">
                                                            {formatNumber(request.amount)} تومان
                                                        </span>
                                                    </div>
                                                    {request.payment_date && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">تاریخ پرداخت:</span>
                                                            <span>
                                                                {moment(request.payment_date).format("jYYYY/jMM/jDD")}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">تاریخ ثبت:</span>
                                                        <span>
                                                            {moment(request.created_at).format("jYYYY/jMM/jDD HH:mm")}
                                                        </span>
                                                    </div>
                                                    {request.manager_approved_at && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">تاریخ تایید/رد:</span>
                                                            <span>
                                                                {moment(request.manager_approved_at).format("jYYYY/jMM/jDD HH:mm")}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {request.manager_approved_by && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">تایید شده توسط:</span>
                                                            <span>{request.manager_approved_by}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {request.description && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-slate-600">
                                                            <span className="font-medium">توضیحات:</span> {request.description}
                                                        </p>
                                                    </div>
                                                )}
                                                {request.rejection_reason && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-red-600">
                                                            <span className="font-medium">دلیل رد:</span> {request.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        {request.attachment_url && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => openImagePreview(request.attachment_url)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                >
                                                    <ImageIcon size={18} />
                                                    <span className="text-sm font-medium">مشاهده تصویر فیش</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {imagePreview && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">تصویر فیش</h3>
                            <button
                                onClick={closeImagePreview}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <XCircle size={24} className="text-slate-500" />
                            </button>
                        </div>
                        <img
                            src={imagePreview}
                            alt="فیش پرداخت"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Extra Payment Request Form Modal */}
            <ExtraPaymentRequestForm
                isOpen={showExtraPaymentForm}
                onClose={() => setShowExtraPaymentForm(false)}
                onSuccess={() => {
                    setShowExtraPaymentForm(false);
                    loadRequests(); // Refresh the list after successful submission
                }}
            />
        </div>
    );
}

