import { useEffect, useRef, useState, useMemo } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import UnitRequestItem from "./modalItem/UnitRequestItem";
import UnitTransactionItem from "./modalItem/UnitTransactionItem";
import EditableCard from "../../../../../shared/components/shared/display/EditableCard";
import { useDispatch, useSelector } from "react-redux";
import { updateUnit, deleteUnit, fetchUnits } from "../../slices/unitsSlice";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import { getUnitFinancialTransactions } from "../../../../../shared/services/transactionsService";
import { getPersianType } from "../../../../../shared/utils/typeUtils";

export default function UnitDetailsModal({ unit, isOpen, onClose }) {
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
    const [financialTransactions, setFinancialTransactions] = useState([]);
    const [financialSummary, setFinancialSummary] = useState(null);
    const [loadingFinancial, setLoadingFinancial] = useState(false);

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
                unit_number: unit.unit_number || '',
                floor: unit.floor !== null && unit.floor !== undefined ? unit.floor : '',
                name: unit.full_name || unit.owner_name || '',
                phone: unit.phone_number || '',
                area: unit.area !== null && unit.area !== undefined ? unit.area : '',
                role: unit.role || '',
                owner_type: unit.owner_type || '',
                resident_count: unit.resident_count !== null && unit.resident_count !== undefined ? unit.resident_count : 1,
                rental_status: unit.rental_status || 'available',
                has_parking: unit.has_parking || false,
                parking_count: unit.parking_count || 0,
            });
            setTenantData({
                name: unit.tenant_full_name || unit.resident_name || '',
                phone: unit.tenant_phone_number || '',
            });
        }
    }, [unit]);

    // Fetch financial transactions when unit changes
    useEffect(() => {
        if (isOpen && unit && unit.units_id) {
            setLoadingFinancial(true);
            getUnitFinancialTransactions(unit.units_id)
                .then((response) => {
                    // Backend now returns { unit, invoices, summary }
                    console.log('[UnitDetailsModal] unit-financial-transactions response:', response);
                    if (response.invoices || response.transactions) {
                        setFinancialTransactions(response.invoices || response.transactions);
                    }
                    if (response.summary) {
                        setFinancialSummary(response.summary);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching financial transactions:', error);
                    toast.error('خطا در دریافت گردش مالی واحد');
                })
                .finally(() => {
                    setLoadingFinancial(false);
                });
        } else {
            setFinancialTransactions([]);
            setFinancialSummary(null);
        }
    }, [isOpen, unit]);

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

    const sortedTx = useMemo(() => {
        const transactionsToUse = financialTransactions.length > 0
            ? financialTransactions
            : (unit?.transactions || []);

        return transactionsToUse
            ? [...transactionsToUse].sort((a, b) => {
                const dateA = (a.date || a.issue_date) ? new Date(a.date || a.issue_date).getTime() : 0;
                const dateB = (b.date || b.issue_date) ? new Date(b.date || b.issue_date).getTime() : 0;
                return dateB - dateA;
            })
            : [];
    }, [financialTransactions, unit]);

    if (!isOpen || !unit) return null;

    const handleShowMoreTx = () => setVisibleTxCount((prev) => Math.min(prev + 4, maxTxVisible));
    const handleShowLessTx = () => setVisibleTxCount(initialTxCount);

    // در فرمت جدید API، فقط فاکتورها (invoices) برگردانده می‌شوند
    const expenseTransactions = sortedTx;
    const txToShow = expenseTransactions.slice(0, visibleTxCount);

    const handleOwnerDataChange = (newData) => {
        let updatedData = { ...newData };
        
        // اگر role به tenant تغییر کرد، owner_type و rental_status را پاک کن
        if (newData.role === 'tenant' && ownerData.role === 'owner') {
            updatedData.owner_type = '';
            updatedData.rental_status = 'available';
            // پاک کردن اطلاعات مستاجر
            setTenantData({
                name: '',
                phone: '',
            });
        }
        
        // اگر role به owner تغییر کرد و owner_type تنظیم نشده، پیش‌فرض بگذار
        if (newData.role === 'owner' && ownerData.role !== 'owner' && !newData.owner_type) {
            updatedData.owner_type = 'resident';
        }
        
        // اگر owner_type به empty تغییر کرد، tenant fields را پاک کن و resident_count را 0 کن
        if (newData.owner_type === 'empty' && ownerData.owner_type !== 'empty') {
            updatedData.resident_count = 0;
            // پاک کردن اطلاعات مستاجر
            setTenantData({
                name: '',
                phone: '',
            });
        }
        
        // اگر owner_type از empty به چیز دیگری تغییر کرد و resident_count 0 است، به 1 تغییر بده
        if (ownerData.owner_type === 'empty' && newData.owner_type !== 'empty' && (!newData.resident_count || newData.resident_count === 0)) {
            updatedData.resident_count = 1;
        }
        
        // اگر landlord به چیز دیگری تغییر کرد، tenant fields را پاک کن
        if (ownerData.owner_type === 'landlord' && newData.owner_type !== 'landlord') {
            setTenantData({
                name: '',
                phone: '',
            });
        }
        
        setOwnerData(updatedData);
    };

    const handleSaveOwner = async () => {
        if (!unit || !selectedBuilding) return;
        
        try {
            console.log("🔥 Saving owner data:", ownerData);
            
            // اگر owner_type به empty تغییر کرد، tenant fields را پاک کن
            const shouldClearTenant = ownerData.owner_type === 'empty';
            
            const updateData = {
                unit_number: ownerData.unit_number,
                floor: ownerData.floor ? parseInt(ownerData.floor, 10) : undefined,
                full_name: ownerData.name,
                phone_number: ownerData.phone,
                area: ownerData.area ? parseFloat(ownerData.area) : undefined,
                resident_count: ownerData.role === 'owner' && ownerData.owner_type === 'empty' 
                    ? 0 
                    : (ownerData.resident_count ? parseInt(ownerData.resident_count, 10) : undefined),
                role: ownerData.role,
                has_parking: ownerData.has_parking,
                parking_count: ownerData.has_parking ? (ownerData.parking_count ? parseInt(ownerData.parking_count, 10) : 0) : 0,
                // فیلدهای قدیمی برای سازگاری
                owner_name: ownerData.name,
            };
            
            // فقط وقتی role === "owner" باشد، owner_type و rental_status را ارسال کن
            if (ownerData.role === 'owner') {
                updateData.owner_type = ownerData.owner_type || '';
                updateData.rental_status = ownerData.rental_status || 'available';
            } else {
                // اگر role === "tenant" است، owner_type و rental_status را پاک کن
                updateData.owner_type = '';
                updateData.rental_status = 'available';
            }
            
            // اگر واحد خالی است یا landlord نیست، اطلاعات مستاجر را پاک کن
            if (shouldClearTenant || ownerData.owner_type !== 'landlord') {
                updateData.tenant_full_name = '';
                updateData.tenant_phone_number = '';
                updateData.resident_name = '';
            }
            
            await dispatch(updateUnit({
                buildingId: selectedBuilding.building_id || selectedBuilding.id,
                unitId: unit.units_id || unit.id,
                unitData: updateData
            })).unwrap();
            
            setEditingOwner(false);
            console.log("✅ Owner data saved successfully");
            // Refresh units list after successful update
            await dispatch(fetchUnits(selectedBuilding.building_id || selectedBuilding.id));
        } catch (error) {
            console.error("❌ Error saving owner data:", error);
            const errorMessage = typeof error === 'string' ? error : error?.message || 'خطا در به‌روزرسانی اطلاعات مالک';
            toast.error(errorMessage);
            throw error;
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
            // Refresh units list after successful update
            await dispatch(fetchUnits(selectedBuilding.building_id || selectedBuilding.id));
        } catch (error) {
            console.error("❌ Error saving tenant data:", error);
            const errorMessage = typeof error === 'string' ? error : error?.message || 'خطا در به‌روزرسانی اطلاعات مستاجر';
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleDeleteUnit = async () => {
        if (!unit || !selectedBuilding) return;
        
        const buildingId = selectedBuilding.building_id || selectedBuilding.id;
        const unitId = unit.units_id || unit.id;
        
        try {
            console.log("🔥 Deleting unit:", unitId);
            await dispatch(deleteUnit({
                buildingId: buildingId,
                unitId: unitId
            })).unwrap();
            
            console.log("✅ Unit deleted successfully");
            toast.success('واحد با موفقیت حذف شد');
            
            // Refresh the units list after deletion
            if (buildingId) {
                await dispatch(fetchUnits(buildingId));
            }
            
            onClose(); // بستن مدال
        } catch (error) {
            console.error("❌ Error deleting unit:", error);
            const errorMessage = typeof error === 'string' ? error : error?.message || 'خطا در حذف واحد';
            toast.error('خطا در حذف واحد: ' + errorMessage);
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
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span>اطلاعات </span>
                        <span className="text-melkingDarkBlue">واحد {unit.unit_number || unit.units_id}</span>
                        {unit.floor && (
                            <span className="text-gray-600">- طبقه {unit.floor}</span>
                        )}
                    </div>
                </h2>

                <div className="overflow-y-auto custom-scroll max-h-[70vh] pr-2">
                    {/* Owner Card - اطلاعات مالک */}
                    <EditableCard
                        title={ownerData.role === 'owner' 
                            ? `مالک ${ownerData.owner_type === 'landlord' ? '(دارای مستاجر)' : ownerData.owner_type === 'empty' ? '(خالی)' : '(مقیم)'}`
                            : ownerData.role === 'tenant' 
                                ? 'مالک' 
                                : 'اطلاعات واحد'}
                        data={ownerData}
                        setData={handleOwnerDataChange}
                        isEditing={editingOwner}
                        setIsEditing={setEditingOwner}
                        onSave={handleSaveOwner}
                        loading={updateLoading}
                        fields={[
                            { key: "unit_number", label: "شماره واحد" },
                            { key: "floor", label: "طبقه", type: "number" },
                            { key: "name", label: "نام و نام خانوادگی" },
                            { key: "phone", label: "شماره تماس" },
                            { key: "area", label: "مساحت (متر مربع)" },
                            { 
                                key: "resident_count", 
                                label: "تعداد نفر", 
                                type: "number",
                                disabled: ownerData.role === 'owner' && ownerData.owner_type === 'empty'
                            },
                            { 
                                key: "role", 
                                label: "نقش",
                                options: [
                                    { value: "owner", label: "مالک" },
                                    { value: "tenant", label: "مستاجر" }
                                ]
                            },
                            // نمایش owner_type فقط وقتی role === "owner"
                            ...(ownerData.role === "owner" ? [{
                                key: "owner_type", 
                                label: "نوع مالک",
                                options: [
                                    { value: "empty", label: "واحد خالی" },
                                    { value: "resident", label: "مالک مقیم" },
                                    { value: "landlord", label: "دارای مستاجر" }
                                ]
                            }] : []),
                            // نمایش rental_status فقط وقتی role === "owner"
                            ...(ownerData.role === "owner" ? [{
                                key: "rental_status", 
                                label: "وضعیت اجاره",
                                options: [
                                    { value: "available", label: "آماده اجاره" },
                                    { value: "waiting_tenant", label: "منتظر مستاجر" },
                                    { value: "rented", label: "اجاره داده شده" },
                                    { value: "occupied", label: "اشغال شده" }
                                ]
                            }] : []),
                            // پارکینگ
                            {
                                key: "has_parking",
                                label: "پارکینگ دارد",
                                type: "checkbox"
                            },
                            ...(ownerData.has_parking ? [{
                                key: "parking_count",
                                label: "تعداد پارکینگ",
                                type: "number"
                            }] : [])
                        ]}
                        colorClass="bg-gradient-to-r from-emerald-50 to-emerald-100"
                    />

                    {/* Tenant Card - وقتی role === "owner" && owner_type === "landlord" یا role === "tenant" */}
                    {((ownerData.role === "owner" && ownerData.owner_type === "landlord") || ownerData.role === "tenant") && (
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

                    {/* Financial Summary */}
                    {financialSummary && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <h3 className="font-semibold mb-3 text-gray-800 text-lg">خلاصه گردش مالی</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="text-gray-600">تعداد فاکتورها</div>
                                    <div className="text-lg font-bold text-gray-900">{financialSummary.total_invoices || 0}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {(financialSummary.total_amount || 0).toLocaleString('fa-IR')} تومان
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="text-gray-600">مجموع پرداخت‌های تایید شده</div>
                                    <div className="text-lg font-bold text-emerald-600">
                                        {(financialSummary.total_paid || 0).toLocaleString('fa-IR')} تومان
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {/* در فرمت جدید تعداد پرداخت‌ها به صورت جداگانه برگردانده نمی‌شود */}
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="text-gray-600">مانده بدهی‌ها</div>
                                    <div className="text-lg font-bold text-red-600">
                                        {(financialSummary.total_remaining || 0).toLocaleString('fa-IR')} تومان
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {/* مجموع بدهی‌ها */}
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="text-gray-600">صورتحساب‌های مشترک</div>
                                    <div className="text-lg font-bold text-indigo-600">
                                        {Array.isArray(financialTransactions)
                                            ? financialTransactions.filter(tx => tx.is_shared_expense).length
                                            : 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Transactions */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800 text-lg">گردش مالی واحد</h3>
                            {loadingFinancial && (
                                <Loader2 className="animate-spin text-gray-400" size={20} />
                            )}
                        </div>
                        {loadingFinancial ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                                <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                            </div>
                        ) : sortedTx.length > 0 ? (
                            <>
                                {txToShow.map((tx, index) => {
                                    // در فرمت جدید، هر آیتم یک فاکتور است و اگر هزینه مشترک باشد، اطلاعات آن در shared_expense_info است
                                    const expenseName =
                                        tx.shared_expense_info?.expense_name ||
                                        tx.description ||
                                        null;

                                    const persianTransactionType = getPersianType(tx.category || "");

                                    // مبلغ نمایش‌داده‌شده: سهم واحد از هزینه مشترک (اگر موجود باشد) یا کل مبلغ فاکتور
                                    const amount =
                                        tx.shared_expense_info?.unit_share_amount ??
                                        tx.total_amount ??
                                        0;

                                    const formattedTx = {
                                        id: tx.invoice_id,
                                        title: expenseName || persianTransactionType || tx.transaction_type || tx.type || "تراکنش",
                                        amount: amount,
                                        date: tx.issue_date,
                                        due_date: tx.shared_expense_info?.bill_due || tx.due_date || null,
                                        status: tx.status_label || tx.status || "نامشخص",
                                        type: "invoice",
                                        transaction_type: "invoice",
                                        expense_name: expenseName,
                                    };
                                    // Use invoice_id or id as primary key, fallback to index for uniqueness
                                    const uniqueKey = tx.invoice_id || tx.id || `transaction-${index}`;
                                    return <UnitTransactionItem key={uniqueKey} transaction={formattedTx} />;
                                })}

                                {sortedTx.length > 0 && visibleTxCount < Math.min(sortedTx.length, maxTxVisible) && (
                                    <button onClick={handleShowMoreTx} className="text-sm text-blue-600 mt-2 hover:underline">
                                        مشاهده بیشتر
                                    </button>
                                )}

                                {sortedTx.length > initialTxCount && visibleTxCount > initialTxCount && (
                                    <button onClick={handleShowLessTx} className="text-sm text-gray-600 mt-1 hover:underline">
                                        مشاهده کمتر
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-500 text-sm">این واحد تراکنشی انجام نداده است.</p>
                        )}
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