import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
    { value: "both", label: "هردو" },
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

export default function AddExpenseModal({ isOpen, onClose, onSubmit, isLoading = false, buildingId }) {
    console.log("🔥 AddExpenseModal props:", { isOpen, buildingId, isLoading });
    const dispatch = useDispatch();
    const expenseTypes = useSelector((state) => state.expenseTypes.expenseTypes);
    const buildingUnits = useSelector((state) => {
        console.log("🔥 Selector called with buildingId:", buildingId);
        const units = selectBuildingUnits(state, buildingId);
        console.log("🔥 Units from selector:", units);
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
        allocation: "both",
        distribution: "equal",
        description: "",
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [filteredUnits, setFilteredUnits] = useState([]);

    const modalRef = useRef(null);
    useClickOutside(modalRef, () => { if (isOpen) onClose(); });

    // Fetch building units when modal opens
    useEffect(() => {
        if (isOpen && buildingId) {
            console.log("🔥 Fetching building units for buildingId:", buildingId);
            dispatch(fetchBuildingUnits(buildingId))
                .then((result) => {
                    console.log("🔥 Fetch building units result:", result);
                    console.log("🔥 Units in result:", result.payload?.units);
                })
                .catch((error) => {
                    console.error("🔥 Fetch building units error:", error);
                });
        }
    }, [isOpen, buildingId, dispatch]);

    // Filter units based on target selection
    useEffect(() => {
        console.log("🔥 Building units in AddExpenseModal:", buildingUnits);
        console.log("🔥 Building units type:", typeof buildingUnits);
        console.log("🔥 Building units is array:", Array.isArray(buildingUnits));
        
        if (!buildingUnits || !Array.isArray(buildingUnits) || buildingUnits.length === 0) {
            console.log("🔥 No valid building units, setting empty array");
            setFilteredUnits([]);
            return;
        }

        const unitsList = buildingUnits.map(unit => ({
            value: unit.unit_number || unit.id,
            label: `واحد ${unit.unit_number || unit.id}`,
            isOccupied: unit.is_occupied || unit.occupied || false,
            unit: unit
        }));

        console.log("🔥 Units list created:", unitsList);

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
    }, [buildingUnits, form.target]);

    useEffect(() => {
        if (!isOpen) {
            setForm({
                type: "",
                customType: "",
                amount: "",
                target: "all",
                selectedUnits: [],
                allocation: "both",
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

        onSubmit({ ...form, type: finalType, value: finalValue, files: uploadedFiles });
        onClose();
    }, [form, onSubmit, onClose, uploadedFiles, dispatch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
                <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-3">ثبت هزینه</h2>
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
                />
            </div>
        </div>
    );
}