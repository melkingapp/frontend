/* eslint-disable no-unused-vars */
import CheckboxGroup from "../../../../../shared/components/shared/inputs/CheckboxGroup";
import RadioGroup from "../../../../../shared/components/shared/inputs/RadioGroup";
import SelectField from "../../../../../shared/components/shared/inputs/SelectField";
import InputField from "../../../../../shared/components/shared/inputs/InputField";
import UploadFileInput from "../../../../../shared/components/shared/inputs/UploadFileInput";
import { formatNumber } from "../../../../../shared/utils/helper";

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
    uploadedFiles,
    onFilesChange,
    onSubmit,
    onCancel,
    isLoading = false,
    isEditing = false,
}) {
    return (
        <>
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
                <InputField
                    label="مبلغ کل"
                    name="amount"
                    type="text"
                    value={formatNumber(form.amount)}
                    onChange={onAmountChange}
                    placeholder="مثلاً 2,500,000"
                    inputClassName={errors.amount ? "border-red-500" : ""}
                    error={errors.amount}
                />
                {/* توضیح نحوه تقسیم */}
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        💡 <strong>نحوه تقسیم:</strong> این مبلغ بین واحدهای انتخاب شده تقسیم می‌شود
                    </p>
                    {form.amount && form.target && (
                        <p className="text-xs text-blue-600 mt-1">
                            مبلغ هر واحد: {formatNumber(Math.floor(form.amount / (form.target === 'all' ? unitsList.length : form.selectedUnits.length)))} تومان
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
                <SelectField
                    label="نحوه تخصیص"
                    name="distribution"
                    value={form.distribution}
                    onChange={onChange}
                    options={distributionMethods}
                    error={errors.distribution}
                />
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