import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import useClickOutside from "../../../../../shared/hooks/useClickOutside";
import { addExpenseType } from "../../slices/expenseTypesSlice";
import { fetchBuildingUnits } from "../../../building/buildingSlice";
import { selectBuildingUnits } from "../../../building/buildingSlice";

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
];

function validate(form) {
    const errors = {};

    if (!form.type) errors.type = "این فیلد نمی‌تواند خالی باشد.";
    if (form.type === "AddExpenseType" && !form.customType)
        errors.customType = "لطفاً نوع هزینه دلخواه را وارد کنید.";

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

    if (form.target === "custom" && form.selectedUnits.length === 0)
        errors.selectedUnits = "حداقل یک واحد باید انتخاب شود.";

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

    const [form, setForm] = useState({
        type: "",
        customType: "",
        amount: "",
        target: "all",
        selectedUnits: [],
        allocation: "",
        distribution: "equal",
        description: "",
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [filteredUnits, setFilteredUnits] = useState([]);

    const modalRef = useRef(null);
    useClickOutside(modalRef, () => { if (isOpen) onClose(); });

    // پر کردن فرم با مقادیر expense در حالت ویرایش
    useEffect(() => {
        if (editingExpense && isOpen) {
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

            setForm({
                type: mappedType,
                customType: "",
                amount: editingExpense.amount?.toString() || "",
                target: target,
                selectedUnits: editingExpense.selectedUnits || [],
                allocation: allocation,
                distribution: editingExpense.distribution_method || "equal",
                description: editingExpense.description || "",
            });
        } else if (!isOpen) {
            // Reset form وقتی modal بسته میشه
            setForm({
                type: "",
                customType: "",
                amount: "",
                target: "all",
                selectedUnits: [],
                allocation: "",
                distribution: "equal",
                description: "",
            });
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
                amount: "",
                target: "all",
                selectedUnits: [],
                allocation: "",
                distribution: "equal",
                description: "",
            });
            setUploadedFiles([]);
            setErrors({});
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

    const handleSubmit = useCallback(() => {
        const validationErrors = validate(form);
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

        onSubmit({ ...form, type: finalType, value: finalValue, allocation: finalAllocation, files: uploadedFiles });
        onClose();
    }, [form, onSubmit, onClose, uploadedFiles, dispatch]);

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
                    uploadedFiles={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={isLoading}
                    isEditing={!!editingExpense}
                />
            </div>
        </div>
    );
}