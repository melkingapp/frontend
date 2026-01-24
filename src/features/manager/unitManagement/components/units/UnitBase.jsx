import { HomeIcon, HousePlus, Loader2, RefreshCw, Upload, FileText, Download } from "lucide-react";
import UnitItem from "./UnitItem";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateUnitModal from "./CreateUnitModal";
import UnitDetailsModal from "./UnitDetailsModal";
import BulkUnitImportModal from "../../../../buildings/components/BulkUnitImportModal";
import { fetchUnits } from "../../slices/unitsSlice";
import { exportCompleteReports } from "../../../../../shared/services/billingService";
import { toast } from "sonner";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function UnitBase({ limit, showCreateButton = true, buildingId = null }) {
    const dispatch = useDispatch();
    const { units: reduxUnits, loading, error } = useSelector(state => state.units);
    const { selectedBuildingId, data: buildings } = useSelector(state => state.building);
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Use Redux data if available, otherwise fall back to props
    // Use useMemo to prevent re-calculations on every render
    const dataSource = useMemo(() => (reduxUnits || []).filter(unit => unit != null), [reduxUnits]);
    const displayedUnits = useMemo(() => limit ? dataSource.slice(0, limit) : dataSource, [limit, dataSource]);

    // Grouping units logic memoized to avoid recalculation on every render
    const sortedUnits = useMemo(() => {
        // گروه‌بندی واحدها: واحدهای owner و tenant مرتبط
        const ownerUnits = new Map();
        const tenantUnits = [];

        displayedUnits.forEach((unit) => {
            if (!unit) return;

            if (unit.role === 'tenant') {
                // واحدهای tenant را جدا نگه دار
                tenantUnits.push(unit);
            } else if (unit.role === 'owner' || !unit.role) {
                // واحدهای owner را با شماره واحد به عنوان کلید نگه دار
                const key = unit.unit_number || unit.units_id;
                ownerUnits.set(key, unit);
            }
        });

        // نمایش واحدها: ابتدا owner ها (با tenant اگر داشته باشند)، سپس tenant های جداگانه
        const result = [];

        // واحدهای owner را اضافه کن
        ownerUnits.forEach((ownerUnit) => {
            result.push(ownerUnit);
        });

        // واحدهای tenant جداگانه را اضافه کن (که owner ندارند)
        tenantUnits.forEach((tenantUnit) => {
            const ownerUnitKey = tenantUnit.unit_number || tenantUnit.units_id;
            // اگر owner برای این tenant وجود ندارد، آن را اضافه کن
            if (!ownerUnits.has(ownerUnitKey)) {
                result.push(tenantUnit);
            }
        });

        return result;
    }, [displayedUnits]);

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

    const handleEdit = useCallback((unit) => {
        setSelectedUnit({ ...unit, editMode: true });
    }, []);

    const handleExportMembersReport = async () => {
        const currentBuildingId = buildingId || selectedBuildingId || selectedBuilding?.building_id || selectedBuilding?.id;
        if (!currentBuildingId) {
            toast.error("لطفاً ابتدا یک ساختمان انتخاب کنید");
            return;
        }

        setIsExporting(true);
        try {
            const currentYear = moment().jYear();
            const blob = await exportCompleteReports(currentBuildingId, currentYear, null);

            // ایجاد فایل اکسل
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const buildingTitle = selectedBuilding?.title || buildings?.find(b => (b.building_id || b.id) === currentBuildingId)?.title || 'building';
            const safeBuildingName = buildingTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
            a.download = `Building-Reports-${safeBuildingName}-${moment().format('YYYYMMDD')}.xlsx`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success("گزارش‌های کامل با موفقیت export شدند");
        } catch (error) {
            console.error("Error exporting reports:", error);
            toast.error("خطا در export گزارش‌ها");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <HomeIcon className="text-melkingDarkBlue" size={20} />
                    مدیریت واحدها
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        بروزرسانی
                    </button>
                    
                    {(buildingId || selectedBuildingId || selectedBuilding) && (
                        <button
                            onClick={handleExportMembersReport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} className={isExporting ? "animate-pulse" : ""} />
                            <span className="whitespace-nowrap">گزارش اعضا</span>
                        </button>
                    )}
                    
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
                    {sortedUnits.map((unit, index) => {
                        if (!unit) return null;
                        return (
                            <UnitItem key={unit.units_id || unit.id || index} unit={unit}
                                onSelect={setSelectedUnit}
                                onEdit={handleEdit} />
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