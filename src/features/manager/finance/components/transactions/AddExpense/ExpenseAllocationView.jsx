import { useState, useEffect } from "react";
import { formatNumber } from "../../../../../../shared/utils/helper";
import { CheckCircle, ArrowRight, Edit2, Save, X } from "lucide-react";
import InputField from "../../../../../../shared/components/shared/inputs/InputField";
import { getPersianType } from "../../../../../../shared/utils/typeUtils";

export default function ExpenseAllocationView({ allocationData, onUpdate, onClose, isLoading = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCosts, setEditedCosts] = useState({});
    const [errors, setErrors] = useState({});

    const { 
        shared_bill_id, 
        expense_type, 
        expense_name,
        total_amount, 
        distribution_method, 
        payment_method,
        unit_allocations = [],
        custom_unit_costs = null
    } = allocationData;

    const isCustom = distribution_method === 'custom';
    const canEdit = isCustom && !isLoading;

    const distributionLabels = {
        equal: "مساوی",
        per_person: "بر اساس تعداد نفر",
        area: "بر اساس متراژ",
        parking: "بر اساس تعداد پارکینگ",
        custom: "دلخواه"
    };

    // مقداردهی اولیه editedCosts
    useEffect(() => {
        if (isCustom && custom_unit_costs) {
            const initialCosts = {};
            unit_allocations.forEach(unit => {
                initialCosts[String(unit.unit_id)] = custom_unit_costs[String(unit.unit_id)] || unit.amount;
            });
            setEditedCosts(initialCosts);
        }
    }, [isCustom, custom_unit_costs, unit_allocations]);

    const handleCostChange = (unitId, value) => {
        const rawValue = value.replace(/,/g, "");
        if (!isNaN(rawValue) || rawValue === "") {
            setEditedCosts(prev => ({
                ...prev,
                [String(unitId)]: rawValue
            }));
        }
    };

    const handleSave = () => {
        // Validation
        const totalCosts = Object.values(editedCosts).reduce((sum, cost) => {
            const numCost = parseFloat(cost || 0);
            return sum + (isNaN(numCost) ? 0 : numCost);
        }, 0);

        const difference = Math.abs(totalCosts - total_amount);
        if (difference > 1) {
            setErrors({ total: `مجموع مبالغ (${formatNumber(totalCosts)}) باید برابر مبلغ کل (${formatNumber(total_amount)}) باشد. تفاوت: ${formatNumber(difference)}` });
            return;
        }

        setErrors({});
        onUpdate(shared_bill_id, editedCosts);
    };

    const totalCalculated = unit_allocations.reduce((sum, unit) => sum + unit.amount, 0);

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">هزینه با موفقیت ثبت شد</h3>
                </div>
                <p className="text-sm text-green-700">
                    توزیع هزینه بین واحدها به شرح زیر است:
                </p>
            </div>

            {/* اطلاعات کلی */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">نام هزینه:</span>
                    <span className="font-semibold">{expense_name || getPersianType(expense_type)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">نوع هزینه:</span>
                    <span className="font-semibold">{getPersianType(expense_type)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">مبلغ کل:</span>
                    <span className="font-semibold text-lg text-blue-600">{formatNumber(total_amount)} تومان</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">نحوه تقسیم:</span>
                    <span className="font-semibold">{distributionLabels[distribution_method] || distribution_method}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">روش پرداخت:</span>
                    <span className="font-semibold">{payment_method === "direct" ? "مستقیم" : "از شارژ"}</span>
                </div>
            </div>

            {/* لیست واحدها و مبالغ */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">توزیع هزینه بین واحدها:</h4>
                    {canEdit && (
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    setIsEditing(false);
                                    setErrors({});
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className="px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition flex items-center gap-2"
                        >
                            {isEditing ? (
                                <>
                                    <X className="w-4 h-4" />
                                    انصراف
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4" />
                                    ویرایش مبالغ
                                </>
                            )}
                        </button>
                    )}
                </div>
                {errors.total && (
                    <div className="p-3 bg-red-50 border-b border-red-200">
                        <p className="text-red-600 text-sm">{errors.total}</p>
                    </div>
                )}
                <div className="divide-y max-h-96 overflow-y-auto">
                    {unit_allocations.map((unit, index) => {
                        const isEditable = isEditing && isCustom;
                        const currentAmountRaw = isEditable 
                            ? (editedCosts[String(unit.unit_id)] || "")
                            : null;
                        const currentAmount = isEditable 
                            ? (currentAmountRaw ? parseFloat(currentAmountRaw) : 0)
                            : unit.amount;

                        return (
                            <div key={unit.unit_id || index} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">واحد {unit.unit_number}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isEditable ? (
                                            <div className="flex items-center gap-2">
                                                <InputField
                                                    name={`cost_${unit.unit_id}`}
                                                    type="text"
                                                    value={currentAmountRaw ? formatNumber(parseFloat(currentAmountRaw)) : ""}
                                                    onChange={(e) => handleCostChange(unit.unit_id, e.target.value)}
                                                    inputClassName="w-32"
                                                />
                                                <span className="text-sm text-gray-500">تومان</span>
                                            </div>
                                        ) : (
                                            <div className="text-left">
                                                <div className="font-bold text-lg text-blue-600">
                                                    {formatNumber(Math.round(unit.amount))} تومان
                                                </div>
                                                {total_amount > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {unit.percentage?.toFixed(1) || ((unit.amount / total_amount) * 100).toFixed(1)}%
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">مجموع:</span>
                        <span className="font-bold text-xl text-green-600">
                            {formatNumber(Math.round(totalCalculated))} تومان
                        </span>
                    </div>
                    {isEditing && isCustom && (
                        <div className="mt-2 pt-2 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">مجموع ویرایش شده:</span>
                                <span className="font-semibold text-lg text-orange-600">
                                    {formatNumber(Math.round(Object.values(editedCosts).reduce((sum, cost) => {
                                        const numCost = parseFloat(cost || 0);
                                        return sum + (isNaN(numCost) ? 0 : numCost);
                                    }, 0)))} تومان
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex justify-end gap-3 border-t pt-4">
                {isEditing && isCustom ? (
                    <>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setErrors({});
                            }}
                            disabled={isLoading}
                            className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            انصراف
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        بستن
                    </button>
                )}
            </div>
        </div>
    );
}

