import { HomeIcon, HousePlus, Loader2, RefreshCw, Upload } from "lucide-react";
import UnitItem from "./UnitItem";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateUnitModal from "./CreateUnitModal";
import UnitDetailsModal from "./UnitDetailsModal";
import BulkUnitImportModal from "../../../buildings/components/BulkUnitImportModal";
import { fetchUnits } from "../../slices/unitsSlice";

export default function UnitBase({ limit, showCreateButton = true, buildingId = null }) {
    const dispatch = useDispatch();
    const { units: reduxUnits, loading, error } = useSelector(state => state.units);
    const { selectedBuildingId, data: buildings } = useSelector(state => state.building);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Use Redux data if available, otherwise fall back to props
    const dataSource = (reduxUnits || []).filter(unit => unit != null);
    const displayedUnits = limit ? dataSource.slice(0, limit) : dataSource;

    useEffect(() => {
        console.log("🔥 UnitBase - Fetching units for buildingId:", buildingId);
        if (buildingId) {
            dispatch(fetchUnits(buildingId))
                .then((result) => {
                    console.log("🔥 UnitBase - Fetch units result:", result);
                    console.log("🔥 UnitBase - Units in result:", result.payload);
                })
                .catch((error) => {
                    console.error("🔥 UnitBase - Fetch units error:", error);
                });
        }
    }, [dispatch, buildingId]);

    const handleRefresh = () => {
        dispatch(fetchUnits(buildingId));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <HomeIcon className="text-melkingDarkBlue" size={20} />
                    مدیریت واحدها
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
                    {showCreateButton && (
                        <>
                            <button
                                onClick={() => setIsBulkImportOpen(true)}
                                className="px-4 py-2 border border-melkingDarkBlue text-melkingDarkBlue rounded-lg hover:bg-melkingDarkBlue hover:text-white transition flex items-center gap-2"
                            >
                                <Upload size={18} />
                                وارد کردن گروهی
                            </button>
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition flex items-center gap-2"
                            >
                                <HousePlus size={18} />
                                ایجاد واحد
                            </button>
                        </>
                    )}
                </div>
            </div>

            {loading && displayedUnits.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری واحدها</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayedUnits.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">واحدی موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayedUnits.map((unit, index) => {
                        if (!unit) return null;
                        return (
                            <UnitItem key={unit.units_id || unit.id || index} unit={unit}
                                onSelect={setSelectedUnit}
                                onEdit={(unit) => setSelectedUnit({ ...unit, editMode: true })} />
                        );
                    })}
                </div>
            )}

            {limit && dataSource.length > limit && (
                <p className="text-sm text-gray-500 mt-2">
                    {`نمایش ${limit} مورد از ${dataSource.length} واحد`}
                </p>
            )}

            <UnitDetailsModal
                unit={selectedUnit}
                isOpen={!!selectedUnit}
                onClose={() => setSelectedUnit(null)}
            />
            <CreateUnitModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                buildingId={buildingId}
            />

            <BulkUnitImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                buildingId={buildingId}
                buildingTitle={buildings?.find(b => b.building_id === buildingId)?.title || 'ساختمان'}
                onImportSuccess={() => dispatch(fetchUnits(buildingId))}
            />
        </div>
    );
}