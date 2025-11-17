import { useEffect, useRef, useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import UnitRequestItem from "./modalItem/UnitRequestItem";
import UnitTransactionItem from "./modalItem/UnitTransactionItem";
import EditableCard from "../../../../../shared/components/shared/display/EditableCard";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUnit, deleteUnit } from "../../slices/unitsSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";

export default function UnitDetailsModal({ unit, isOpen, onClose }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedBuilding = useSelector(selectSelectedBuilding);
    const { updateLoading, deleteLoading } = useSelector(state => state.units);
    const modalRef = useRef(null);
    const initialTxCount = 4;
    const maxTxVisible = 8;
    const [visibleTxCount, setVisibleTxCount] = useState(initialTxCount);
    const [editingOwner, setEditingOwner] = useState(false);
    const [editingTenant, setEditingTenant] = useState(false);
    const [ownerData, setOwnerData] = useState({});
    const [tenantData, setTenantData] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (unit) {
            // اگر مدال در حالت ویرایش باز شده باشه
            if (unit.editMode) {
                setEditingOwner(true);
            }
        }
    }, [unit]);

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEditingOwner(false);
            setEditingTenant(false);
            setShowDeleteConfirm(false);
            setOwnerData({});
            setTenantData({});
        }
    }, [isOpen]);

    useEffect(() => {
        if (unit) {
            setOwnerData({
                name: unit.full_name || unit.owner_name || '',
                phone: unit.phone_number || '',
                area: unit.area || '',
                role: unit.role || '',
                owner_type: unit.owner_type || '',
                resident_count: unit.resident_count || 1,
                rental_status: unit.rental_status || 'available',
            });
            setTenantData({
                name: unit.tenant_full_name || unit.resident_name || '',
                phone: unit.tenant_phone_number || '',
            });
        }
    }, [unit]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!isOpen || !unit) return null;

    const handleShowMoreTx = () => setVisibleTxCount((prev) => Math.min(prev + 4, maxTxVisible));
    const handleShowLessTx = () => setVisibleTxCount(initialTxCount);
    const sortedTx = unit.transactions
        ? [...unit.transactions].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
        : [];
    const txToShow = sortedTx.slice(0, visibleTxCount);

    const goToUnitTransactionsPage = () => {
        navigate("/manager/unit-management/transactions", { state: { unitNumber: unit.unitNumber } });
    };

    const handleSaveOwner = async () => {
        if (!unit || !selectedBuilding) return;
        
        try {
            console.log("🔥 Saving owner data:", ownerData);
            await dispatch(updateUnit({
                buildingId: selectedBuilding.building_id || selectedBuilding.id,
                unitId: unit.units_id || unit.id,
                unitData: {
                    full_name: ownerData.name,
                    phone_number: ownerData.phone,
                    area: ownerData.area,
                    resident_count: ownerData.resident_count,
                    role: ownerData.role,
                    owner_type: ownerData.owner_type,
                    rental_status: ownerData.rental_status,
                    // فیلدهای قدیمی برای سازگاری
                    owner_name: ownerData.name,
                }
            })).unwrap();
            
            setEditingOwner(false);
            console.log("✅ Owner data saved successfully");
        } catch (error) {
            console.error("❌ Error saving owner data:", error);
        }
    };

    const handleSaveTenant = async () => {
        if (!unit || !selectedBuilding) return;
        
        try {
            console.log("🔥 Saving tenant data:", tenantData);
            await dispatch(updateUnit({
                buildingId: selectedBuilding.building_id || selectedBuilding.id,
                unitId: unit.units_id || unit.id,
                unitData: {
                    tenant_full_name: tenantData.name,
                    tenant_phone_number: tenantData.phone,
                    // فیلدهای قدیمی برای سازگاری
                    resident_name: tenantData.name
                }
            })).unwrap();
            
            setEditingTenant(false);
            console.log("✅ Tenant data saved successfully");
        } catch (error) {
            console.error("❌ Error saving tenant data:", error);
        }
    };

    const handleDeleteUnit = async () => {
        if (!unit || !selectedBuilding) return;
        
        try {
            console.log("🔥 Deleting unit:", unit.units_id || unit.id);
            await dispatch(deleteUnit({
                buildingId: selectedBuilding.building_id || selectedBuilding.id,
                unitId: unit.units_id || unit.id
            })).unwrap();
            
            console.log("✅ Unit deleted successfully");
            toast.success('واحد با موفقیت حذف شد');
            onClose(); // بستن مدال
        } catch (error) {
            console.error("❌ Error deleting unit:", error);
            toast.error('خطا در حذف واحد: ' + error);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={handleClickOutside}
        >
            <div
                ref={modalRef}
                className="relative bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 transform transition-all duration-300 scale-100 hover:scale-105"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-4">
                    اطلاعات واحد <span className="text-melkingDarkBlue">{unit.unit_number || unit.units_id}</span>
                </h2>

                <div className="overflow-y-auto custom-scroll max-h-[70vh] pr-2">
                    {/* Owner Card */}
                    <EditableCard
                        title={`مالک ${ownerData.role === 'owner' ? (ownerData.owner_type === 'landlord' ? '(دارای مستاجر)' : '(مقیم)') : ''}`}
                        data={ownerData}
                        setData={setOwnerData}
                        isEditing={editingOwner}
                        setIsEditing={setEditingOwner}
                        onSave={handleSaveOwner}
                        loading={updateLoading}
                        fields={[
                            { key: "name", label: "نام و نام خانوادگی" },
                            { key: "phone", label: "شماره تماس" },
                            { key: "area", label: "مساحت (متر مربع)" },
                            { key: "resident_count", label: "تعداد نفر", type: "number" },
                            { 
                                key: "role", 
                                label: "نقش",
                                options: [
                                    { value: "owner", label: "مالک" },
                                    { value: "tenant", label: "مستاجر" }
                                ]
                            },
                            { 
                                key: "owner_type", 
                                label: "نوع مالک",
                                options: [
                                    { value: "resident", label: "مالک مقیم" },
                                    { value: "landlord", label: "دارای مستاجر" }
                                ]
                            },
                            { 
                                key: "rental_status", 
                                label: "وضعیت اجاره",
                                options: [
                                    { value: "available", label: "آماده اجاره" },
                                    { value: "waiting_tenant", label: "منتظر مستاجر" },
                                    { value: "rented", label: "اجاره داده شده" },
                                    { value: "occupied", label: "اشغال شده" }
                                ]
                            }
                        ]}
                        colorClass="bg-gradient-to-r from-emerald-50 to-emerald-100"
                    />

                    {/* Tenant Card */}
                    {(unit.tenant_full_name || unit.resident_name) && (
                        <EditableCard
                            title="مستاجر"
                            data={tenantData}
                            setData={setTenantData}
                            isEditing={editingTenant}
                            setIsEditing={setEditingTenant}
                            onSave={handleSaveTenant}
                            loading={updateLoading}
                            fields={[
                                { key: "name", label: "نام و نام خانوادگی" },
                                { key: "phone", label: "شماره تماس" }
                            ]}
                            colorClass="bg-gradient-to-r from-blue-50 to-blue-100"
                        />
                    )}

                    {/* Open Requests */}
                    {unit.openRequests?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3 text-gray-800 text-lg">درخواست‌های باز</h3>
                            {unit.openRequests.map((req) => (
                                <UnitRequestItem
                                    key={req.id}
                                    request={req}
                                    onApprove={(id) => console.log("درخواست پذیرفته شد:", id)}
                                    onReject={(id) => console.log("درخواست رد شد:", id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Recent Transactions */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3 text-gray-800 text-lg">تراکنش‌های اخیر</h3>
                        {unit.transactions?.length > 0 ? (
                            txToShow.map((tx) => <UnitTransactionItem key={tx.id} transaction={tx} />)
                        ) : (
                            <p className="text-gray-500 text-sm">این واحد تراکنشی انجام نداده است.</p>
                        )}

                        {unit.transactions?.length > 0 && visibleTxCount < Math.min(unit.transactions.length, maxTxVisible) && (
                            <button onClick={handleShowMoreTx} className="text-sm text-blue-600 mt-2 hover:underline">
                                مشاهده بیشتر
                            </button>
                        )}

                        {unit.transactions?.length > initialTxCount && visibleTxCount > initialTxCount && (
                            <button onClick={handleShowLessTx} className="text-sm text-gray-600 mt-1 hover:underline">
                                مشاهده کمتر
                            </button>
                        )}

                        <button onClick={goToUnitTransactionsPage} className="block mt-2 text-sm text-gray-700 hover:underline">
                            مشاهده همه تراکنش‌ها
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="px-4 py-2 rounded-full bg-gray-100 font-medium shadow-sm text-gray-700">
                        {unit.resident_count || 1} نفر
                    </span>
                    
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleteLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        <Trash2 size={16} />
                        حذف واحد
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">تایید حذف واحد</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            آیا مطمئن هستید که می‌خواهید واحد <span className="font-semibold text-gray-900">{unit.unit_number || unit.units_id}</span> را حذف کنید؟
                            <br />
                            <span className="text-red-600 font-medium">این عمل قابل بازگشت نیست!</span>
                        </p>
                        
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleDeleteUnit}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {deleteLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        در حال حذف...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        حذف واحد
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}