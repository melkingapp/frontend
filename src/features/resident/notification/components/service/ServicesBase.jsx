import { useState, useEffect, useCallback } from "react";
import { Bell, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ServiceItem from "../../../../manager/notification/components/service/ServiceItem";
import ServiceModal from "../../../../manager/notification/components/service/ServiceModal";
import { fetchBuildingServices } from "../../../../manager/notification/slices/servicesSlice";
import { selectSelectedResidentBuilding } from "../../../building/residentBuildingSlice";

export default function ServicesBase({ services: propServices, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedResidentBuilding);
    const { services: reduxServices, loading, error } = useSelector(state => state.services);
    const [selectedService, setSelectedService] = useState(null);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxServices.length > 0 ? reduxServices : (propServices || []);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayed = limit ? sorted.slice(0, limit) : sorted;

    const resolveBuildingId = useCallback(() => {
        const raw = selectedBuilding?.building_id ?? selectedBuilding?.id;
        if (!raw) return undefined;
        if (typeof raw === 'string') {
            const match = raw.match(/\d+/);
            if (match && match[0]) {
                const asNum = Number(match[0]);
                return Number.isFinite(asNum) ? asNum : match[0];
            }
            return raw;
        }
        return raw;
    }, [selectedBuilding]);

    // Fetch services when component mounts
    useEffect(() => {
        const bId = resolveBuildingId();
        if (bId !== undefined && bId !== null && bId !== '') {
            dispatch(fetchBuildingServices(bId));
        }
    }, [dispatch, selectedBuilding, resolveBuildingId]);

    const handleRefresh = () => {
        const bId = resolveBuildingId();
        if (bId !== undefined && bId !== null && bId !== '') {
            dispatch(fetchBuildingServices(bId));
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
                <h2 className="text-xl font-semibold text-gray-900">خدمات ساختمانی</h2>
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
                    <Bell className="w-5 h-5 text-green-500 mt-0.5 ml-2" />
                    <div>
                        <h3 className="text-sm font-medium text-green-900">اطلاعات</h3>
                        <p className="text-sm text-green-700 mt-1">
                            در این بخش می‌توانید خدمات ارائه شده در ساختمان را مشاهده کنید.
                            امکان ایجاد خدمت جدید فقط برای مدیر ساختمان در دسترس است.
                        </p>
                    </div>
                </div>
            </div>

            {/* Services List */}
                    {displayed.length === 0 ? (
                <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ خدمتی یافت نشد</h3>
                    <p className="text-gray-600">هنوز هیچ خدمتی برای این ساختمان ثبت نشده است.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((service) => (
                        <ServiceItem
                            key={service.service_id || service.id}
                            service={service}
                            onSelect={() => setSelectedService(service)}
                        />
                    ))}
                </div>
            )}

            {/* Service Detail Modal */}
            {selectedService && (
                <ServiceModal
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </div>
    );
}
