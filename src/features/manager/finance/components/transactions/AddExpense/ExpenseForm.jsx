/* eslint-disable no-unused-vars */
import CheckboxGroup from "../../../../../../shared/components/shared/inputs/CheckboxGroup";
import RadioGroup from "../../../../../../shared/components/shared/inputs/RadioGroup";
import SelectField from "../../../../../../shared/components/shared/inputs/SelectField";
import InputField from "../../../../../../shared/components/shared/inputs/InputField";
import UploadFileInput from "../../../../../../shared/components/shared/inputs/UploadFileInput";
import PersianDateInput from "../../../../../../shared/components/shared/inputs/PersianDateInput";
import { formatNumber } from "../../../../../../shared/utils/helper";

export default function ExpenseForm({
    form,
    errors,
    onChange,
    onAmountChange,
    onCheckboxChange,
    unitsList,
    expenseTypes,
    paymentTargets,
    distributionMethods,
    allocationMethods,
    paymentMethods,
    customUnitCosts = {},
    onCustomUnitCostChange,
    uploadedFiles,
    onFilesChange,
    onSubmit,
    onPreview,
    onCancel,
    isLoading = false,
    isEditing = false,
    hasPayments = false,
}) {
    return (
        <>
            <div className="mb-6">
                <InputField
                    label="نام هزینه"
                    name="expenseName"
                    value={form.expenseName || ""}
                    onChange={onChange}
                    placeholder="مثلاً تعمیرات آسانسور، خرید لامپ..."
                    inputClassName={errors.expenseName ? "border-red-500" : ""}
                    error={errors.expenseName}
                />
            </div>

            <SelectField
                label="نوع هزینه"
                name="type"
                value={form.type}
                onChange={onChange}
                options={expenseTypes}
                error={errors.type}
            />

            {form.type === "AddExpenseType" && (
                <InputField
                    label="نوع هزینه دلخواه"
                    name="customType"
                    value={form.customType || ""}
                    onChange={onChange}
                    placeholder="نوع هزینه خود را وارد کنید..."
                    inputClassName={errors.customType ? "border-red-500" : ""}
                    error={errors.customType}
                />
            )}
            {/* اقلام خریدنی */}
            {form.type === "purchases" && (
                <InputField
                    label="نوع قلم"
                    name="customType"   // یا هر فیلدی که میخوای برای ارسال به API استفاده بشه
                    value={form.customType || ""}
                    onChange={onChange}
                    placeholder="مثلاً لامپ، شیرآلات..."
                    inputClassName={errors.customType ? "border-red-500" : ""}
                    error={errors.customType}
                />
            )}

            <div className="mb-6">
                {hasPayments && isEditing && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            ⚠️ امکان ویرایش مبلغ وجود ندارد زیرا حداقل یک واحد پرداخت انجام داده است
                        </p>
                    </div>
                )}
                <InputField
                    label="مبلغ کل"
                    name="amount"
                    type="text"
                    value={formatNumber(form.amount)}
                    onChange={onAmountChange}
                    placeholder="مثلاً 2,500,000"
                    inputClassName={errors.amount ? "border-red-500" : ""}
                    error={errors.amount}
                    disabled={hasPayments && isEditing}
                />
                {/* توضیح نحوه تقسیم */}
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        💡 <strong>نحوه تقسیم:</strong> این مبلغ بین واحدهای انتخاب شده تقسیم می‌شود
                    </p>
                    {form.amount && form.target && (
                        <p className="text-xs text-blue-600 mt-1">
                            مبلغ هر واحد: {formatNumber(Math.floor(form.amount / unitsList.length))} تومان
                        </p>
                    )}
                </div>
            </div>

            <RadioGroup
                label="پرداخت توسط"
                name="target"
                options={paymentTargets}
                value={form.target}
                onChange={onChange}
                error={errors.target}
            />

            {/* انتخاب واحدها در صورت انتخاب custom */}
            {form.target === "custom" && (
                <CheckboxGroup
                    label="انتخاب واحدها:"
                    options={unitsList}
                    selectedValues={form.selectedUnits}
                    onChange={onCheckboxChange}
                    error={errors.selectedUnits}
                />
            )}

            <div className="mb-6">
                {hasPayments && isEditing && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            ⚠️ امکان ویرایش نحوه تقسیم وجود ندارد زیرا حداقل یک واحد پرداخت انجام داده است
                        </p>
                    </div>
                )}
                <SelectField
                    label="نحوه تخصیص"
                    name="distribution"
                    value={form.distribution}
                    onChange={onChange}
                    options={distributionMethods}
                    error={errors.distribution}
                    disabled={hasPayments && isEditing}
                />
                
                {/* ✅ اضافه شد: هشدارهای برای روش‌های توزیع نامناسب */}
                {form.distribution === "per_person" && unitsList && (
                    (() => {
                        const totalResidents = unitsList.reduce((sum, unit) => {
                            return sum + (unit.resident_count || 0);
                        }, 0);
                        return totalResidents === 0 ? (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    ⚠️ <strong>هشدار:</strong> تمام واحدهای انتخاب‌شده خالی هستند. مبلغ به صورت مساوی تقسیم خواهد شد.
                                </p>
                            </div>
                        ) : null;
                    })()
                )}
                
                {form.distribution === "parking" && unitsList && (
                    (() => {
                        const totalParking = unitsList.reduce((sum, unit) => {
                            return sum + (unit.parking_count || 0);
                        }, 0);
                        return totalParking === 0 ? (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    ⚠️ <strong>هشدار:</strong> هیچ واحدی پارکینگ ندارد. مبلغ به صورت مساوی تقسیم خواهد شد.
                                </p>
                            </div>
                        ) : null;
                    })()
                )}
                
                {form.distribution === "custom" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        {hasPayments && isEditing && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700">
                                    ⚠️ امکان ویرایش مبالغ اختصاصی واحدها وجود ندارد زیرا حداقل یک واحد پرداخت انجام داده است
                                </p>
                            </div>
                        )}
                        <p className="text-sm font-semibold text-blue-800 mb-3">
                            💰 تعیین مبلغ برای هر واحد:
                        </p>
                        {errors.customUnitCosts && (
                            <p className="text-red-500 text-sm mb-3">{errors.customUnitCosts}</p>
                        )}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 py-1">
                            {(() => {
                                // تعیین واحدهای هدف
                                let targetUnits = [];
                                if (form.target === "all") {
                                    targetUnits = unitsList;
                                } else if (form.target === "custom") {
                                    targetUnits = unitsList.filter(unit => form.selectedUnits.includes(unit.value));
                                } else {
                                    targetUnits = unitsList;
                                }

                                // محاسبه مجموع مبالغ
                                const totalCosts = targetUnits.reduce((sum, unit) => {
                                    const unitId = unit.unit?.units_id || unit.unit?.id || unit.value;
                                    const cost = parseFloat(customUnitCosts[String(unitId)] || 0);
                                    return sum + (isNaN(cost) ? 0 : cost);
                                }, 0);

                                const totalAmount = parseFloat(form.amount.toString().replace(/,/g, "") || 0);
                                const difference = totalCosts - totalAmount;
                                const isEqual = Math.abs(difference) <= 1; // اجازه خطای کوچک

                                return (
                                    <>
                                        {targetUnits.map((unit) => {
                                            // استفاده از units_id واقعی برای کلید
                                            const unitId = unit.unit?.units_id || unit.unit?.id || unit.value;
                                            const currentCost = customUnitCosts[String(unitId)] || "";

                                            return (
                                                <div key={unitId} className="flex items-center gap-3 py-1">
                                                    <label className="text-sm text-gray-700 min-w-[100px] flex-shrink-0">
                                                        {unit.label}:
                                                    </label>
                                                    <div className="flex-1 min-w-0">
                                                        <InputField
                                                            name={`customCost_${unitId}`}
                                                            type="text"
                                                            value={formatNumber(currentCost)}
                                                            onChange={(e) => {
                                                                const rawValue = e.target.value.replace(/,/g, "");
                                                                if (!isNaN(rawValue) || rawValue === "") {
                                                                    onCustomUnitCostChange(String(unitId), rawValue);
                                                                }
                                                            }}
                                                            placeholder="مبلغ واحد"
                                                            disabled={hasPayments && isEditing}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500 flex-shrink-0">تومان</span>
                                                </div>
                                            );
                                        })}
                                        {/* نمایش مجموع و مقایسه با مبلغ کل */}
                                        {targetUnits.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-blue-300">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700 font-medium">مجموع مبالغ واحدها:</span>
                                                    <span className={`font-semibold ${isEqual ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {formatNumber(totalCosts)} تومان
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                    <span className="text-gray-700 font-medium">مبلغ کل:</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {formatNumber(totalAmount)} تومان
                                                    </span>
                                                </div>
                                                {!isEqual && totalAmount > 0 && (
                                                    <div className={`flex items-center justify-between text-xs mt-2 p-2 rounded ${difference > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                        <span>تفاوت:</span>
                                                        <span className="font-semibold">
                                                            {difference > 0 ? '+' : ''}{formatNumber(Math.abs(difference))} تومان
                                                        </span>
                                                    </div>
                                                )}
                                                {isEqual && totalAmount > 0 && (
                                                    <div className="flex items-center justify-center text-xs mt-2 p-2 rounded bg-green-100 text-green-700">
                                                        <span>✓ مجموع مبالغ با مبلغ کل برابر است</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        <p className="text-xs text-blue-600 mt-3">
                            💡 مبلغ هر واحد را به صورت جداگانه وارد کنید. مجموع باید برابر مبلغ کل باشد.
                        </p>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <RadioGroup
                    label="مسئول پرداخت"
                    name="allocation"
                    options={allocationMethods}
                    value={Array.isArray(form.allocation) ? form.allocation[0] || '' : form.allocation || ''}
                    onChange={(e) => {
                        onChange({ target: { name: 'allocation', value: e.target.value } });
                    }}
                    error={errors.allocation}
                />
            </div>

            <div className="mb-6">
                <RadioGroup
                    label="روش پرداخت"
                    name="paymentMethod"
                    options={paymentMethods}
                    value={form.paymentMethod || "direct"}
                    onChange={onChange}
                    error={errors.paymentMethod}
                />
            </div>

            <div className="mb-6">
                <PersianDateInput
                    label="مهلت پرداخت"
                    value={form.billDue || ""}
                    onChange={(date) => {
                        onChange({ target: { name: 'billDue', value: date } });
                    }}
                    placeholder="تاریخ مهلت پرداخت را انتخاب کنید"
                />
                {errors.billDue && (
                    <p className="text-red-500 text-xs mt-1">{errors.billDue}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    💡 تاریخ مهلت پرداخت باید حداقل 7 روز از امروز باشد
                </p>
            </div>

            <div className="mb-6">
                <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    توضیحات
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="توضیحات اضافه..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                />
            </div>

            <UploadFileInput label="فایل پیوست" onFilesChange={onFilesChange} />

            <div className="flex justify-end gap-3 border-t pt-4">
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    انصراف
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-melkingDarkBlue text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading 
                        ? (isEditing ? "در حال ویرایش..." : "در حال ثبت...") 
                        : (isEditing ? "ویرایش هزینه" : "ثبت هزینه")
                    }
                </button>
            </div>
        </>
    );
}