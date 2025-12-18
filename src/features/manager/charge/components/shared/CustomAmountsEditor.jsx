import RadioGroup from "../../../../../shared/components/shared/inputs/RadioGroup";
import { formatNumber } from "../../utils/numberFormat";

/**
 * Component for editing custom charge amounts for each unit
 */
export default function CustomAmountsEditor({
  formData,
  validationErrors,
  unitOptions,
  onInputChange,
}) {
  const handleUnitToggle = (unitId, enabled) => {
    const newCustomAmounts = { ...formData.customAmounts };
    if (enabled) {
      newCustomAmounts[unitId] = { enabled: true, amount: '' };
    } else {
      delete newCustomAmounts[unitId];
    }
    onInputChange('customAmounts', newCustomAmounts);
  };

  const handleAmountChange = (unitId, value) => {
    // Allow typing with basic formatting
    let inputValue = value;

    // Only allow numbers and commas
    if (!/^[\d,]*$/.test(inputValue)) {
      inputValue = inputValue.replace(/[^\d,]/g, '');
    }

    const newCustomAmounts = { ...formData.customAmounts };
    newCustomAmounts[unitId] = {
      ...newCustomAmounts[unitId],
      amount: inputValue
    };
    onInputChange('customAmounts', newCustomAmounts);
  };

  const handleAmountBlur = (unitId) => {
    // Format when user finishes typing
    const currentValue = formData.customAmounts[unitId]?.amount || '';
    const formattedValue = formatNumber(currentValue);
    if (formattedValue !== currentValue) {
      const newCustomAmounts = { ...formData.customAmounts };
      newCustomAmounts[unitId] = {
        ...newCustomAmounts[unitId],
        amount: formattedValue
      };
      onInputChange('customAmounts', newCustomAmounts);
    }
  };

  const totalAmount = Object.values(formData.customAmounts)
    .filter(unit => unit.enabled && unit.amount)
    .reduce((sum, unit) => {
      const amount = parseFloat(unit.amount.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0);

  const enabledUnitsCount = Object.values(formData.customAmounts).filter(unit => unit.enabled).length;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">مبالغ شارژ برای هر واحد</h3>

      {/* Total Amount Display */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
          <span className="text-xs sm:text-sm font-medium text-gray-700">مجموع مبالغ:</span>
          <span className="text-base sm:text-lg font-bold text-green-600">
            {totalAmount.toLocaleString('fa-IR')} تومان
          </span>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
          {enabledUnitsCount} واحد فعال
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
        {unitOptions.map((unit) => {
          const unitData = formData.customAmounts[unit.value] || { enabled: false, amount: '' };

          return (
            <div key={unit.value} className="bg-white p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    checked={unitData.enabled}
                    onChange={(e) => handleUnitToggle(unit.value, e.target.checked)}
                    className="rounded w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="font-medium text-gray-800 text-xs sm:text-sm">{unit.label}</span>
                </div>
              </div>

              {unitData.enabled && (
                <div>
                  <input
                    type="text"
                    value={unitData.amount}
                    onChange={(e) => handleAmountChange(unit.value, e.target.value)}
                    onBlur={() => handleAmountBlur(unit.value)}
                    placeholder="مبلغ (تومان)"
                    className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors[`customAmount_${unit.value}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors[`customAmount_${unit.value}`] && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors[`customAmount_${unit.value}`]}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Title, Payer Type, Description for Custom Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
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
    </div>
  );
}

