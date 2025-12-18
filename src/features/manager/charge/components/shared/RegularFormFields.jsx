import RadioGroup from "../../../../../shared/components/shared/inputs/RadioGroup";
import CheckboxGroup from "../../../../../shared/components/shared/inputs/CheckboxGroup";

/**
 * Regular form fields for fixed charge type
 */
export default function RegularFormFields({
  formData,
  validationErrors,
  unitOptions,
  amountInput,
  onInputChange,
}) {
  const handleUnitSelection = (unitId) => {
    const newSelectedUnits = formData.selectedUnits.includes(unitId)
      ? formData.selectedUnits.filter(id => id !== unitId)
      : [...formData.selectedUnits, unitId];
    onInputChange('selectedUnits', newSelectedUnits);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Title */}
      <div className="sm:col-span-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          عنوان اعلام شارژ *
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => onInputChange('title', e.target.value)}
          placeholder="مثال: شارژ ماهانه آذر ۱۴۰۳"
          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
            validationErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.title && (
          <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.title}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          مبلغ شارژ (تومان) *
        </label>
        <input
          type="text"
          value={amountInput?.value || ''}
          onChange={(e) => amountInput?.onChange(e.target.value)}
          placeholder="مثال: ۵۰۰,۰۰۰"
          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
            validationErrors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.amount && (
          <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.amount}</p>
        )}
      </div>

      {/* Payer Type */}
      <div>
        <RadioGroup
          label="پرداخت‌کننده شارژ *"
          name="payerType"
          options={[
            { value: 'resident', label: 'ساکن' },
            { value: 'owner', label: 'مالک' }
          ]}
          value={formData.payerType || ''}
          onChange={(e) => onInputChange('payerType', e.target.value)}
          error={validationErrors.payerType}
        />
      </div>

      {/* Target Units */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          واحدهای هدف
        </label>
        <select
          value={formData.targetUnits}
          onChange={(e) => onInputChange('targetUnits', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="all">تمام واحدها</option>
          <option value="occupied">واحدهای پر</option>
          <option value="empty">واحدهای خالی</option>
          <option value="custom">برخی واحدها</option>
        </select>
      </div>

      {/* Unit Selection for Custom Target */}
      {formData.targetUnits === 'custom' && (
        <div className="sm:col-span-2">
          <CheckboxGroup
            label="انتخاب واحدها:"
            options={unitOptions}
            selectedValues={formData.selectedUnits}
            onChange={handleUnitSelection}
            error={validationErrors.selectedUnits}
          />
          {formData.selectedUnits.length > 0 && (
            <div className="mt-2 text-xs sm:text-sm text-blue-600">
              {formData.selectedUnits.length} واحد انتخاب شده
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="sm:col-span-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          توضیحات (اختیاری)
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="توضیحات اضافی درباره شارژ..."
          rows={3}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}

