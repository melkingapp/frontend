import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import ExpenseAllocationView from "./ExpenseAllocationView";
import useClickOutside from "../../../../../../shared/hooks/useClickOutside";
import { addExpenseType } from "../../../store/slices/expenseTypesSlice";
import { fetchBuildingUnits } from "../../../../building/buildingSlice";
import { selectBuildingUnits } from "../../../../building/buildingSlice";

// This will be populated from building units

const paymentTargets = [
    { value: "all", label: "همه واحدها" },
    { value: "full", label: "واحدهای پر" },
    { value: "empty", label: "واحدهای خالی" },
    { value: "custom", label: "برخی واحدها" },
];

const allocationMethods = [
    { value: "owner", label: "مالک" },
    { value: "resident", label: "ساکن" },
];

const distributionMethods = [
    { value: "equal", label: "مساوی" },
    { value: "per_person", label: "بر اساس تعداد نفر" },
    { value: "area", label: "بر اساس متراژ" },
    { value: "parking", label: "بر اساس تعداد پارکینگ" },
    { value: "custom", label: "دلخواه" },
];

const paymentMethods = [
    { value: "direct", label: "مستقیم" },
    { value: "from_fund", label: "موجودی صندوق" },
];

function validate(form, customUnitCosts, filteredUnits, target, selectedUnits) {
    const errors = {};

    if (!form.type) errors.type = "این فیلد نمی‌تواند خالی باشد.";
    if (form.type === "AddExpenseType" && !form.customType)
        errors.customType = "لطفاً نوع هزینه دلخواه را وارد کنید.";

    if (!form.expenseName || form.expenseName.trim() === "") {
        errors.expenseName = "نام هزینه الزامی است.";
    }

    if (!form.target) errors.target = "این فیلد نمی‌تواند خالی باشد.";

    // بررسی مقدار amount
    const amountStr = form.amount.toString().replace(/,/g, "").trim();
    const numericAmount = parseFloat(amountStr);
    if (!amountStr) {
        errors.amount = "این فیلد نمی‌تواند خالی باشد.";
    } else if (isNaN(numericAmount) || numericAmount <= 0) {
        errors.amount = "لطفاً مبلغ معتبر وارد کنید.";
    }

    if (!form.allocation) errors.allocation = "این فیلد نمی‌تواند خالی باشد.";
    if (!form.distribution) errors.distribution = "این فیلد نمی‌تواند خالی باشد.";

    // بررسی تاریخ مهلت پرداخت
    if (!form.billDue) {
        errors.billDue = "تاریخ مهلت پرداخت الزامی است.";
    } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const billDueDate = new Date(form.billDue);
        billDueDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.ceil((billDueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 7) {
            errors.billDue = "تاریخ مهلت پرداخت باید حداقل 7 روز از امروز باشد.";
        }
    }

    if (form.target === "custom" && form.selectedUnits.length === 0)
        errors.selectedUnits = "حداقل یک واحد باید انتخاب شود.";

    // بررسی custom_unit_costs برای توزیع دلخواه
    if (form.distribution === "custom") {
        // تعیین واحدهای هدف
        let targetUnits = [];
        if (target === "all") {
            targetUnits = filteredUnits;
        } else if (target === "custom") {
            targetUnits = filteredUnits.filter(unit => selectedUnits.includes(unit.value));
        } else {
            targetUnits = filteredUnits;
        }

        // بررسی اینکه برای همه واحدها مبلغ تعریف شده باشد
        const missingUnits = targetUnits.filter(unit => {
            const unitId = unit.unit?.units_id || unit.unit?.id || unit.value;
            const cost = customUnitCosts[String(unitId)];
            return !cost || cost === "" || parseFloat(cost) <= 0;
        });

        if (missingUnits.length > 0) {
            errors.customUnitCosts = `لطفاً مبلغ را برای همه واحدها وارد کنید. واحدهای بدون مبلغ: ${missingUnits.map(u => u.label).join(", ")}`;
        } else {
            // بررسی اینکه مجموع مبالغ برابر مبلغ کل باشد
            const totalCosts = targetUnits.reduce((sum, unit) => {
                const unitId = unit.unit?.units_id || unit.unit?.id || unit.value;
                const cost = parseFloat(customUnitCosts[String(unitId)] || 0);
                return sum + (isNaN(cost) ? 0 : cost);
            }, 0);

            const totalAmount = parseFloat(amountStr) || 0;
            const difference = Math.abs(totalCosts - totalAmount);
            
            // اجازه خطای کوچک (کمتر از 1 تومان) برای مشکلات محاسباتی اعشار
            if (difference > 1) {
                errors.customUnitCosts = `مجموع مبالغ واحدها (${totalCosts.toLocaleString()} تومان) باید برابر مبلغ کل (${totalAmount.toLocaleString()} تومان) باشد. تفاوت: ${difference.toLocaleString()} تومان`;
            }
        }
    }

    return errors;
}


function generateValue(label) {
    return label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^\w]/g, "") + "_" + Date.now(); // یکتا
}

export default function AddExpenseModal({ isOpen, onClose, onSubmit, isLoading = false, buildingId, editingExpense }) {
    const dispatch = useDispatch();
    const expenseTypes = useSelector((state) => state.expenseTypes.expenseTypes);
    const buildingUnits = useSelector((state) => {
        const units = selectBuildingUnits(state, buildingId);
        return units;
    }, (a, b) => {
        if (!a && !b) return true;
        if (!a || !b) return false;
        return a.length === b.length && a.every((unit, index) => unit.id === b[index]?.id);
    });

    // محاسبه تاریخ پیش‌فرض مهلت پرداخت (7 روز بعد)
    const getDefaultBillDue = () => {
        const today = new Date();
        const billDueDate = new Date(today);
        billDueDate.setDate(today.getDate() + 7);
        return billDueDate.toISOString().split('T')[0]; // فرمت YYYY-MM-DD
    };

    const [form, setForm] = useState({
        type: "",
        customType: "",
        expenseName: "",
        amount: "",
        target: "all",
        selectedUnits: [],
        allocation: "",
        distribution: "equal",
        paymentMethod: "direct",
        billDue: getDefaultBillDue(),
        description: "",
    });
    const [customUnitCosts, setCustomUnitCosts] = useState({}); // { "unitId": "amount" }
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [showAllocation, setShowAllocation] = useState(false); // برای نمایش تخصیص بعد از ثبت
    const [allocationData, setAllocationData] = useState(null); // داده‌های تخصیص از بکند

    const modalRef = useRef(null);
    useClickOutside(modalRef, () => { if (isOpen) onClose(); });

    // بررسی allocationData بعد از ثبت
    useEffect(() => {
        if (editingExpense?.allocationData && isOpen) {
            setAllocationData(editingExpense.allocationData);
            setShowAllocation(true);
        }
    }, [editingExpense?.allocationData, isOpen]);

    // پر کردن فرم با مقادیر expense در حالت ویرایش
    useEffect(() => {
        if (editingExpense && isOpen && !editingExpense.allocationData) {
            // Mapping از transaction به form
            const typeMapping = {
                'water': 'water_bill',
                'electricity': 'electricity_bill',
                'gas': 'gas_bill',
                'maintenance': 'repair',
                'cleaning': 'cleaning',
                'security': 'security',
                'camera': 'camera',
                'parking': 'parking',
                'purchases': 'purchases',
                'charge': 'charge',
                'other': 'other',
            };

            const mappedType = typeMapping[editingExpense.bill_type] || editingExpense.bill_type;
            
            // تعیین target بر اساس unit_count
            let target = "all";
            if (editingExpense.unit_count === buildingUnits?.length) {
                target = "all";
            } else if (editingExpense.unit_count > 0) {
                target = "custom";
            }

            // تعیین allocation (فقط یکی: ساکن یا مالک)
            let allocation = '';
            if (editingExpense.allocation === 'both') {
                // اگر both بود، به صورت پیش‌فرض مالک انتخاب می‌شود
                allocation = 'owner';
            } else if (editingExpense.allocation) {
                allocation = editingExpense.allocation;
            }

            // تبدیل تاریخ مهلت پرداخت از editingExpense
            let billDue = getDefaultBillDue();
            if (editingExpense.bill_due) {
                billDue = editingExpense.bill_due;
            } else if (editingExpense.due_date) {
                billDue = editingExpense.due_date;
            }

            setForm({
                type: mappedType,
                customType: "",
                expenseName: editingExpense.expense_name || "",
                amount: editingExpense.amount?.toString() || "",
                target: target,
                selectedUnits: editingExpense.selectedUnits || [],
                allocation: allocation,
                distribution: editingExpense.distribution_method || "equal",
                paymentMethod: editingExpense.payment_method || "direct",
                billDue: billDue,
                description: editingExpense.description || "",
            });
        } else if (!isOpen) {
            // Reset form وقتی modal بسته میشه
            setForm({
                type: "",
                customType: "",
                expenseName: "",
                amount: "",
                target: "all",
                selectedUnits: [],
                allocation: "",
                distribution: "equal",
                paymentMethod: "direct",
                billDue: getDefaultBillDue(),
                description: "",
            });
            setCustomUnitCosts({});
            setUploadedFiles([]);
        }
    }, [editingExpense, isOpen, buildingUnits]);

    // Fetch building units when modal opens
    useEffect(() => {
        if (isOpen && buildingId) {
            dispatch(fetchBuildingUnits(buildingId))
                .then((result) => {
                })
                .catch((error) => {
                    console.error("🔥 Fetch building units error:", error);
                });
        }
    }, [isOpen, buildingId, dispatch]);

    // Filter units based on target selection
    useEffect(() => {
        
        if (!buildingUnits || !Array.isArray(buildingUnits) || buildingUnits.length === 0) {
            setFilteredUnits([]);
            return;
        }

        const unitsList = buildingUnits.map(unit => ({
            value: unit.unit_number || unit.id,
            label: `واحد ${unit.unit_number || unit.id}`,
            isOccupied: unit.is_occupied || unit.occupied || false,
            unit: unit
        }));


        switch (form.target) {
            case "full":
                setFilteredUnits(unitsList.filter(unit => unit.isOccupied));
                break;
            case "empty":
                setFilteredUnits(unitsList.filter(unit => !unit.isOccupied));
                break;
            case "custom":
                setFilteredUnits(unitsList);
                break;
            case "all":
            default:
                setFilteredUnits(unitsList);
                break;
        }
    }, [buildingUnits?.length, form.target]);

    useEffect(() => {
        if (!isOpen) {
            setForm({
                type: "",
                customType: "",
                expenseName: "",
                amount: "",
                target: "all",
                selectedUnits: [],
                allocation: "",
                distribution: "equal",
                paymentMethod: "direct",
                billDue: getDefaultBillDue(),
                description: "",
            });
            setCustomUnitCosts({});
            setUploadedFiles([]);
            setErrors({});
            setShowAllocation(false);
            setAllocationData(null);
        }
    }, [isOpen]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleAmountChange = useCallback((e) => {
        const rawValue = e.target.value.replace(/,/g, "");
        if (!isNaN(rawValue)) setForm((prev) => ({ ...prev, amount: rawValue }));
    }, []);

    const handleCheckboxChange = useCallback((value) => {
        setForm((prev) => ({
            ...prev,
            selectedUnits: prev.selectedUnits.includes(value)
                ? prev.selectedUnits.filter((u) => u !== value)
                : [...prev.selectedUnits, value],
        }));
    }, []);

    const handleCustomUnitCostChange = useCallback((unitId, value) => {
        const numericValue = value.replace(/,/g, "");
        setCustomUnitCosts(prev => ({
            ...prev,
            [unitId]: numericValue
        }));
    }, []);

    // به‌روزرسانی مبالغ custom
    const handleUpdateAllocation = useCallback(async (sharedBillId, updatedCosts) => {
        // تبدیل به فرمت مورد نیاز API
        const formattedCosts = {};
        Object.keys(updatedCosts).forEach(unitId => {
            const cost = parseFloat(updatedCosts[unitId]);
            if (!isNaN(cost) && cost > 0) {
                formattedCosts[String(unitId)] = cost;
            }
        });

        // ارسال به API برای update
        await onSubmit({
            shared_bill_id: sharedBillId,
            distribution_method: 'custom',
            custom_unit_costs: JSON.stringify(formattedCosts)
        }, true); // true = isUpdate
    }, [onSubmit]);

    // ثبت هزینه
    const handleSubmit = useCallback(() => {
        // تعیین واحدهای هدف برای validation
        let targetUnits = [];
        if (form.target === "all") {
            targetUnits = filteredUnits;
        } else if (form.target === "custom") {
            targetUnits = filteredUnits.filter(unit => form.selectedUnits.includes(unit.value));
        } else {
            targetUnits = filteredUnits;
        }

        const validationErrors = validate(form, customUnitCosts, filteredUnits, form.target, form.selectedUnits);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        let finalType = form.type;
        let finalValue = form.type;

        if (form.type === "AddExpenseType") {
            finalType = form.customType;
            finalValue = generateValue(finalType);
            dispatch(addExpenseType({ value: finalValue, label: finalType }));
        }

        // allocation حالا یک مقدار واحد است (owner یا resident)
        const finalAllocation = form.allocation;

        // تبدیل customUnitCosts به فرمت مورد نیاز API (string keys, numeric values)
        const formattedCustomCosts = {};
        Object.keys(customUnitCosts).forEach(unitId => {
            const cost = parseFloat(customUnitCosts[unitId]);
            if (!isNaN(cost) && cost > 0) {
                formattedCustomCosts[unitId] = cost;
            }
        });

        onSubmit({ 
            ...form, 
            type: finalType, 
            value: finalValue, 
            allocation: finalAllocation, 
            files: uploadedFiles,
            customUnitCosts: form.distribution === "custom" ? formattedCustomCosts : undefined
        });
    }, [form, onSubmit, uploadedFiles, dispatch, customUnitCosts, filteredUnits]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
                <div className="flex items-center justify-between mb-5 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingExpense ? 'ویرایش هزینه' : 'ثبت هزینه'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="بستن"
                    >
                        <X className="w-6 h-6 text-gray-500 hover:text-red-500" />
                    </button>
                </div>
                {showAllocation && allocationData ? (
                    <ExpenseAllocationView
                        allocationData={allocationData}
                        onUpdate={handleUpdateAllocation}
                        onClose={() => {
                            setShowAllocation(false);
                            setAllocationData(null);
                            // بعد از بستن allocation، modal را ببند و refresh کن
                            onClose();
                        }}
                        isLoading={isLoading}
                    />
                ) : (
                    <ExpenseForm
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                        onAmountChange={handleAmountChange}
                        onCheckboxChange={handleCheckboxChange}
                        unitsList={filteredUnits}
                        expenseTypes={[...expenseTypes, { value: "AddExpenseType", label: "افزودن نوع هزینه" }]} // فقط برای UI اضافه شده
                        paymentTargets={paymentTargets}
                        allocationMethods={allocationMethods}
                        distributionMethods={distributionMethods}
                        paymentMethods={paymentMethods}
                        customUnitCosts={customUnitCosts}
                        onCustomUnitCostChange={handleCustomUnitCostChange}
                        uploadedFiles={uploadedFiles}
                        onFilesChange={setUploadedFiles}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isLoading}
                        isEditing={!!editingExpense}
                        hasPayments={editingExpense?.payment_status_counts?.paid > 0 || editingExpense?.payment_status_counts?.awaiting_manager > 0 || editingExpense?.status === 'paid'}
                    />
                )}
            </div>
        </div>
    );
}