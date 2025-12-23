import RadioGroup from "../../../../../shared/components/shared/inputs/RadioGroup";
import CheckboxGroup from "../../../../../shared/components/shared/inputs/CheckboxGroup";

/**
 * Component for editing formula parameters
 * This is a large component that includes all formula parameter fields
 */
export default function FormulaParameters({
  formData,
  validationErrors,
  numberFormatHooks,
  unitOptions,
  onInputChange,
  onFormulaParamChange,
  onToggleFormulaParam,
}) {
  const {
    baseAmountInput,
    perPersonAmountInput,
    perAreaAmountInput,
    perParkingAmountInput,
    perStorageAreaAmountInput,
  } = numberFormatHooks;

  const handleUnitSelection = (unitId) => {
    const newSelectedUnits = formData.selectedUnits.includes(unitId)
      ? formData.selectedUnits.filter(id => id !== unitId)
      : [...formData.selectedUnits, unitId];
    onInputChange('selectedUnits', newSelectedUnits);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        {formData.chargeType === 'construction' ? 'پارامترهای شارژ عمرانی' : 'پارامترهای فرمول شارژ'}
      </h3>
      {formData.chargeType === 'formula' && formData.formulaName && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">فرمول:</span> {formData.formulaName}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Base Amount */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">مبلغ ثابت شارژ</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">فعال</span>
              <input type="checkbox" checked={true} disabled={true} className="rounded" />
            </div>
          </div>
          <input
            type="text"
            value={baseAmountInput?.value || ''}
            onChange={(e) => baseAmountInput?.onChange(e.target.value)}
            placeholder="مبلغ ثابت پایه"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
              validationErrors.baseAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {validationErrors.baseAmount && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.baseAmount}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">این مبلغ به عنوان پایه به تمام واحدها اضافه می‌شود</p>
        </div>

        {/* Per Person */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">مبلغ به ازای هر نفر</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formData.formulaParams.perPerson.enabled ? 'فعال' : 'غیرفعال'}
              </span>
              <input
                type="checkbox"
                checked={formData.formulaParams.perPerson.enabled}
                onChange={() => onToggleFormulaParam('perPerson')}
                className="rounded"
              />
            </div>
          </div>
          {formData.formulaParams.perPerson.enabled && (
            <>
              <input
                type="text"
                value={perPersonAmountInput?.value || ''}
                onChange={(e) => perPersonAmountInput?.onChange(e.target.value)}
                placeholder="مبلغ به ازای هر نفر"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2 ${
                  validationErrors.perPersonAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.perPersonAmount && (
                <p className="text-red-500 text-sm mb-2">{validationErrors.perPersonAmount}</p>
              )}
              <div className="flex gap-2 items-center">
                <select
                  value={formData.formulaParams.perPerson.conditionType}
                  onChange={(e) => onFormulaParamChange('perPerson', 'conditionType', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="more_than">بیشتر از</option>
                  <option value="less_than">کمتر از</option>
                  <option value="always">همیشه اعمال شود</option>
                </select>
                {formData.formulaParams.perPerson.conditionType !== 'always' && (
                  <input
                    type="number"
                    value={formData.formulaParams.perPerson.conditionValue}
                    onChange={(e) => onFormulaParamChange('perPerson', 'conditionValue', e.target.value)}
                    placeholder="عدد"
                    className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.perPersonCondition ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                )}
              </div>
              {validationErrors.perPersonCondition && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.perPersonCondition}</p>
              )}
            </>
          )}
          <p className="text-xs text-gray-500 mt-2">مبلغ اضافی بر اساس تعداد ساکنان واحد</p>
        </div>

        {/* Per Area */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">مبلغ به ازای متراژ</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formData.formulaParams.perArea.enabled ? 'فعال' : 'غیرفعال'}
              </span>
              <input
                type="checkbox"
                checked={formData.formulaParams.perArea.enabled}
                onChange={() => onToggleFormulaParam('perArea')}
                className="rounded"
              />
            </div>
          </div>
          {formData.formulaParams.perArea.enabled && (
            <>
              <input
                type="text"
                value={perAreaAmountInput?.value || ''}
                onChange={(e) => perAreaAmountInput?.onChange(e.target.value)}
                placeholder="مبلغ به ازای هر متر مربع"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2 ${
                  validationErrors.perAreaAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.perAreaAmount && (
                <p className="text-red-500 text-sm mb-2">{validationErrors.perAreaAmount}</p>
              )}
              <div className="flex gap-2 items-center">
                <select
                  value={formData.formulaParams.perArea.conditionType}
                  onChange={(e) => onFormulaParamChange('perArea', 'conditionType', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="more_than">متراژ بیشتر از</option>
                  <option value="less_than">متراژ کمتر از</option>
                  <option value="always">همیشه اعمال شود</option>
                </select>
                {formData.formulaParams.perArea.conditionType !== 'always' && (
                  <input
                    type="number"
                    value={formData.formulaParams.perArea.conditionValue}
                    onChange={(e) => onFormulaParamChange('perArea', 'conditionValue', e.target.value)}
                    placeholder="متراژ"
                    className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.perAreaCondition ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                )}
              </div>
              {validationErrors.perAreaCondition && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.perAreaCondition}</p>
              )}
            </>
          )}
          <p className="text-xs text-gray-500 mt-2">مبلغ اضافی بر اساس متراژ واحد</p>
        </div>

        {/* Per Parking */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">مبلغ به ازای پارکینگ</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formData.formulaParams.perParking.enabled ? 'فعال' : 'غیرفعال'}
              </span>
              <input
                type="checkbox"
                checked={formData.formulaParams.perParking.enabled}
                onChange={() => onToggleFormulaParam('perParking')}
                className="rounded"
              />
            </div>
          </div>
          {formData.formulaParams.perParking.enabled && (
            <>
              <input
                type="text"
                value={perParkingAmountInput?.value || ''}
                onChange={(e) => perParkingAmountInput?.onChange(e.target.value)}
                placeholder="مبلغ به ازای هر پارکینگ"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2 ${
                  validationErrors.perParkingAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.perParkingAmount && (
                <p className="text-red-500 text-sm mb-2">{validationErrors.perParkingAmount}</p>
              )}
              <div className="flex gap-2 items-center">
                <select
                  value={formData.formulaParams.perParking.conditionType}
                  onChange={(e) => onFormulaParamChange('perParking', 'conditionType', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="more_than">تعداد پارکینگ بیشتر از</option>
                  <option value="less_than">تعداد پارکینگ کمتر از</option>
                  <option value="always">همیشه اعمال شود</option>
                </select>
                {formData.formulaParams.perParking.conditionType !== 'always' && (
                  <input
                    type="number"
                    value={formData.formulaParams.perParking.conditionValue}
                    onChange={(e) => onFormulaParamChange('perParking', 'conditionValue', e.target.value)}
                    placeholder="تعداد"
                    className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.perParkingCondition ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                )}
              </div>
              {validationErrors.perParkingCondition && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.perParkingCondition}</p>
              )}
            </>
          )}
          <p className="text-xs text-gray-500 mt-2">مبلغ اضافی بر اساس تعداد پارکینگ‌های واحد</p>
        </div>

        {/* Per Storage Area */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">مبلغ بر اساس متراژ انباری</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formData.formulaParams.perStorageArea.enabled ? 'فعال' : 'غیرفعال'}
              </span>
              <input
                type="checkbox"
                checked={formData.formulaParams.perStorageArea.enabled}
                onChange={() => onToggleFormulaParam('perStorageArea')}
                className="rounded"
              />
            </div>
          </div>
          {formData.formulaParams.perStorageArea.enabled && (
            <>
              <input
                type="text"
                value={perStorageAreaAmountInput?.value || ''}
                onChange={(e) => perStorageAreaAmountInput?.onChange(e.target.value)}
                placeholder="مبلغ به ازای هر متر مربع انباری"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2 ${
                  validationErrors.perStorageAreaAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.perStorageAreaAmount && (
                <p className="text-red-500 text-sm mb-2">{validationErrors.perStorageAreaAmount}</p>
              )}
              <div className="flex gap-2 items-center">
                <select
                  value={formData.formulaParams.perStorageArea.conditionType}
                  onChange={(e) => onFormulaParamChange('perStorageArea', 'conditionType', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="more_than">متراژ انباری بیشتر از</option>
                  <option value="less_than">متراژ انباری کمتر از</option>
                  <option value="always">همیشه اعمال شود</option>
                </select>
                {formData.formulaParams.perStorageArea.conditionType !== 'always' && (
                  <input
                    type="number"
                    value={formData.formulaParams.perStorageArea.conditionValue}
                    onChange={(e) => onFormulaParamChange('perStorageArea', 'conditionValue', e.target.value)}
                    placeholder="متراژ"
                    className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.perStorageAreaCondition ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                )}
              </div>
              {validationErrors.perStorageAreaCondition && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.perStorageAreaCondition}</p>
              )}
            </>
          )}
          <p className="text-xs text-gray-500 mt-2">مبلغ اضافی بر اساس متراژ انباری واحد</p>
        </div>

        {/* Title */}
        <div className="bg-white p-4 rounded-lg border md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان شارژ *
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="مثال: شارژ ماهانه آذر ۱۴۰۳"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
              validationErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.title && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
          )}
        </div>

        {/* Payer Type */}
        <div className="bg-white p-4 rounded-lg border">
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

        {/* Target Units - Hide for custom charge type */}
        {formData.chargeType !== 'custom' && (
          <div className="bg-white p-4 rounded-lg border">
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
        )}

        {/* Unit Selection for Custom Target */}
        {formData.targetUnits === 'custom' && formData.chargeType !== 'custom' && (
          <div className="bg-white p-4 rounded-lg border md:col-span-2">
            <CheckboxGroup
              label="انتخاب واحدها:"
              options={unitOptions}
              selectedValues={formData.selectedUnits}
              onChange={handleUnitSelection}
              error={validationErrors.selectedUnits}
            />
            {formData.selectedUnits.length > 0 && (
              <div className="mt-2 text-sm text-blue-600">
                {formData.selectedUnits.length} واحد انتخاب شده
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="bg-white p-4 rounded-lg border md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            توضیحات (اختیاری)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="توضیحات اضافی درباره شارژ..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

