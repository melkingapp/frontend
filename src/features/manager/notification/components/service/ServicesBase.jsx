import { useState, useEffect } from "react";
import { Wrench, Loader2, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ServiceItem from "./ServiceItem";
import ServiceModal from "./ServiceModal";
import CreateServiceModal from "./CreateServiceModal";
import { fetchBuildingServices, createService } from "../../slices/servicesSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import { fetchUnits } from "../../../unitManagement/slices/unitsSlice";

export default function ServicesBase({ services: propServices, limit }) {
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { services: reduxServices, loading, error } = useSelector(state => state.services);
    const unitsState = useSelector(state => state.units);
    const buildingUnits = unitsState?.units || [];
    const [selectedService, setSelectedService] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxServices.length > 0 ? reduxServices : (propServices || []);
    
    // Sort by created_at (from API) or createdAt (from props)
    const sorted = [...dataSource].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA;
    });
    
    const displayedServices = limit ? sorted.slice(0, limit) : sorted;

    // Fetch services and units when component mounts
    useEffect(() => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            const buildingId = selectedBuilding.building_id || selectedBuilding.id;
            console.log("🔥 ServicesBase - Fetching services for building:", buildingId);
            
            // Fetch services
            dispatch(fetchBuildingServices(buildingId))
                .then((result) => {
                    console.log("🔥 ServicesBase - Fetch services result:", result);
                })
                .catch((error) => {
                    console.error("🔥 ServicesBase - Fetch services error:", error);
                });
            
            // Fetch units (units slice stores the latest building's units in a flat array)
            dispatch(fetchUnits(buildingId))
                .then((result) => {
                    console.log("🔥 ServicesBase - Fetch units result:", result);
                })
                .catch((error) => {
                    console.error("🔥 ServicesBase - Fetch units error:", error);
                });
        }
    }, [dispatch, selectedBuilding?.building_id, selectedBuilding?.id]);

    const handleRefresh = () => {
        if (selectedBuilding?.building_id || selectedBuilding?.id) {
            const buildingId = selectedBuilding.building_id || selectedBuilding.id;
            dispatch(fetchBuildingServices(buildingId));
            dispatch(fetchUnits(buildingId));
        }
    };

    const handleCreateService = async (serviceData) => {
        if (!selectedBuilding?.building_id && !selectedBuilding?.id) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }

        // Check if we have units for this building
        if (!buildingUnits || buildingUnits.length === 0) {
            toast.error("هیچ واحدی برای این ساختمان یافت نشد. لطفاً ابتدا واحد ایجاد کنید.");
            return;
        }

        try {
            console.log("🔥 Creating service with data:", serviceData);
            console.log("🔥 Available units:", buildingUnits);
            
            // Use the first available unit
            const firstUnit = buildingUnits[0];
            const unitId = firstUnit.id || firstUnit.units_id;
            
            // Map frontend data to backend format
            const backendData = {
                title: serviceData.title,
                description: serviceData.description,
                longDesc: serviceData.longDesc,
                service_type: serviceData.service_type || 'maintenance',
                unit_id: unitId,
                target: serviceData.target,
                contact: serviceData.contact,
                attachment: serviceData.attachment
            };

            console.log("🔥 Backend data:", backendData);

            await dispatch(createService({
                buildingId: selectedBuilding.building_id || selectedBuilding.id,
                serviceData: backendData
            })).unwrap();
            toast.success("سرویس با موفقیت ایجاد شد!");
            
            // Refresh the services list
            dispatch(fetchBuildingServices(selectedBuilding.building_id || selectedBuilding.id));
        } catch (error) {
            console.error("🔥 Error creating service:", error);
            toast.error(error || "خطا در ایجاد سرویس");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <Wrench className="text-melkingDarkBlue" size={20} />
                    خدمات ساختمان
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
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition flex items-center gap-2"
                    >
                        <Wrench size={18} />
                        ایجاد خدمات
                    </button>
                </div>
            </div>

            {loading && displayedServices.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری خدمات</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayedServices.length === 0 ? (
                <p className="text-gray-400 text-sm">خدمتی موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayedServices.map((service, idx) => (
                        <ServiceItem
                            key={service.id || service.request_id}
                            index={idx}
                            service={service}
                            onSelect={setSelectedService}
                        />
                    ))}
                </div>
            )}

            <ServiceModal
                service={selectedService}
                onClose={() => setSelectedService(null)}
            />
            <CreateServiceModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateService}
            />
        </div>
    );
}
