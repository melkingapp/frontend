import { Check } from "lucide-react";
import moment from "moment-jalaali";
import { chargeTypes } from "../../constants/chargeTypes";

/**
 * Step 4: Confirmation and Submit
 * Displays summary of all entered data
 */
export default function Step4Confirmation({
  formData,
  numberFormatHooks,
  unitOptions,
  isSubmitting,
  building,
  onPrevStep,
  onSubmit,
}) {
  const {
    amountInput,
    baseAmountInput,
    perPersonAmountInput,
    perAreaAmountInput,
    perParkingAmountInput,
    perStorageAreaAmountInput,
  } = numberFormatHooks;

  const autoSchedule = formData.autoSchedule || {
    enabled: false,
    dayOfMonth: '',
    endDate: '',
  };

  const chargeType = chargeTypes.find(type => type.id === formData.chargeType);

  const getConditionText = (conditionType, conditionValue) => {
    if (conditionType === 'always') return '';
    const typeText = {
      'more_than': 'بیشتر از',
      'less_than': 'کمتر از',
      'equal': 'مساوی با'
    }[conditionType] || '';
    return `(${typeText} ${conditionValue})`;
  };

  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
        <Check size={18} className="sm:w-5 sm:h-5" />
        تایید و ارسال
      </h2>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm">نوع شارژ:</span>
          <span className="font-medium text-xs sm:text-sm text-left sm:text-right">{chargeType?.title || '---'}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm">عنوان:</span>
          <span className="font-medium text-xs sm:text-sm text-left sm:text-right break-words">{formData.title || '---'}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm">پرداخت‌کننده شارژ:</span>
          <span className="font-medium text-xs sm:text-sm text-left sm:text-right">
            {formData.payerType === 'resident'
              ? 'ساکن'
              : formData.payerType === 'owner'
              ? 'مالک'
              : '---'}
          </span>
        </div>

        {/* Formula/Construction Summary */}
        {(formData.chargeType === 'formula' || formData.chargeCategory === 'construction') && (
          <>
            {formData.chargeType === 'formula' && formData.formulaName && (
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="text-gray-600">نام فرمول:</span>
                <span className="font-medium text-blue-600">{formData.formulaName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">مبلغ ثابت پایه:</span>
              <span className="font-medium">{baseAmountInput?.value ? `${baseAmountInput.value} تومان` : '---'}</span>
            </div>
            {formData.formulaParams.perPerson.enabled && (
              <div className="flex justify-between">
                <span className="text-gray-600">مبلغ به ازای هر نفر:</span>
                <span className="font-medium text-sm">
                  {perPersonAmountInput?.value ? `${perPersonAmountInput.value} تومان` : '---'}
                  {formData.formulaParams.perPerson.conditionType !== 'always' && formData.formulaParams.perPerson.conditionValue && (
                    <span className="text-gray-500 mr-2">
                      {getConditionText(formData.formulaParams.perPerson.conditionType, formData.formulaParams.perPerson.conditionValue)}
                    </span>
                  )}
                </span>
              </div>
            )}
            {formData.formulaParams.perArea.enabled && (
              <div className="flex justify-between">
                <span className="text-gray-600">مبلغ به ازای متراژ:</span>
                <span className="font-medium text-sm">
                  {perAreaAmountInput?.value ? `${perAreaAmountInput.value} تومان` : '---'}
                  {formData.formulaParams.perArea.conditionType !== 'always' && formData.formulaParams.perArea.conditionValue && (
                    <span className="text-gray-500 mr-2">
                      ({formData.formulaParams.perArea.conditionType === 'more_than' ? 'متراژ بیشتر از' :
                        formData.formulaParams.perArea.conditionType === 'less_than' ? 'متراژ کمتر از' : 'متراژ مساوی با'} {formData.formulaParams.perArea.conditionValue})
                    </span>
                  )}
                </span>
              </div>
            )}
            {formData.formulaParams.perParking.enabled && (
              <div className="flex justify-between">
                <span className="text-gray-600">مبلغ به ازای پارکینگ:</span>
                <span className="font-medium text-sm">
                  {perParkingAmountInput?.value ? `${perParkingAmountInput.value} تومان` : '---'}
                  {formData.formulaParams.perParking.conditionType !== 'always' && formData.formulaParams.perParking.conditionValue && (
                    <span className="text-gray-500 mr-2">
                      ({formData.formulaParams.perParking.conditionType === 'more_than' ? 'تعداد پارکینگ بیشتر از' :
                        formData.formulaParams.perParking.conditionType === 'less_than' ? 'تعداد پارکینگ کمتر از' : 'تعداد پارکینگ مساوی با'} {formData.formulaParams.perParking.conditionValue})
                    </span>
                  )}
                </span>
              </div>
            )}
            {formData.formulaParams.perStorageArea.enabled && (
              <div className="flex justify-between">
                <span className="text-gray-600">مبلغ بر اساس متراژ انباری:</span>
                <span className="font-medium text-sm">
                  {perStorageAreaAmountInput?.value ? `${perStorageAreaAmountInput.value} تومان` : '---'}
                  {formData.formulaParams.perStorageArea.conditionType !== 'always' && formData.formulaParams.perStorageArea.conditionValue && (
                    <span className="text-gray-500 mr-2">
                      ({formData.formulaParams.perStorageArea.conditionType === 'more_than' ? 'متراژ انباری بیشتر از' :
                        formData.formulaParams.perStorageArea.conditionType === 'less_than' ? 'متراژ انباری کمتر از' : 'متراژ انباری مساوی با'} {formData.formulaParams.perStorageArea.conditionValue})
                    </span>
                  )}
                </span>
              </div>
            )}
          </>
        )}

        {/* Custom Amounts Summary */}
        {formData.chargeType === 'custom' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">مجموع مبالغ:</span>
              <span className="font-medium text-green-600">
                {Object.values(formData.customAmounts)
                  .filter(unit => unit.enabled && unit.amount)
                  .reduce((sum, unit) => {
                    const amount = parseFloat(unit.amount.replace(/,/g, '')) || 0;
                    return sum + amount;
                  }, 0)
                  .toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">واحدهای فعال:</span>
              <span className="font-medium">{Object.values(formData.customAmounts).filter(unit => unit.enabled).length} واحد</span>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-1.5 sm:mb-2 text-sm sm:text-base">جزئیات مبالغ هر واحد:</h4>
              <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-0.5">
                {Object.entries(formData.customAmounts)
                  .filter(([_, unit]) => unit.enabled)
                  .map(([unitId, unit]) => {
                    const unitName = unitOptions.find(opt => opt.value === unitId)?.label || `واحد ${unitId}`;
                    return (
                      <div key={unitId} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 truncate mr-2">{unitName}:</span>
                        <span className="font-medium whitespace-nowrap">{unit.amount ? `${unit.amount} تومان` : '---'}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* Fixed Amount Summary */}
        {formData.chargeType === 'fixed' && (
          <div className="flex justify-between">
            <span className="text-gray-600">مبلغ:</span>
            <span className="font-medium">{amountInput?.value ? `${amountInput.value} تومان` : '---'}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">مهلت پرداخت:</span>
          <span className="font-medium">
            {formData.dueDate ? `روز ${formData.dueDate} هر ماه` : '---'}
          </span>
        </div>

        <div>
          <div className="flex justify-between">
            <span className="text-gray-600">واحدهای هدف:</span>
            <span className="font-medium">
              {formData.targetUnits === 'all' ? 'تمام واحدها' :
               formData.targetUnits === 'occupied' ? 'واحدهای پر' :
               formData.targetUnits === 'empty' ? 'واحدهای خالی' :
               formData.targetUnits === 'custom' ? `${formData.selectedUnits.length} واحد انتخاب شده` : 'برخی واحدها'}
            </span>
          </div>
          {formData.targetUnits === 'custom' && formData.selectedUnits.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-1.5 sm:mb-2 text-xs sm:text-sm">واحدهای انتخاب شده:</h4>
              <div className="max-h-24 sm:max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-1.5">
                  {formData.selectedUnits.map(unitId => {
                    const unitName = unitOptions.find(opt => opt.value === unitId)?.label || `واحد ${unitId}`;
                    return (
                      <div key={unitId} className="bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs text-center truncate">
                        {unitName}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auto Schedule Summary */}
        <div className="pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-600 text-xs sm:text-sm">برنامه‌ریزی خودکار:</span>
            <span className="font-medium text-xs sm:text-sm">
              {autoSchedule.enabled ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          {autoSchedule.enabled && (
            <>
              <div className="flex justify-between items-center gap-2 mt-1.5 sm:mt-2">
                <span className="text-gray-600 text-xs sm:text-sm">روز ماه:</span>
                <span className="font-medium text-xs sm:text-sm">{autoSchedule.dayOfMonth || '---'}</span>
              </div>
              <div className="flex justify-between items-center gap-2 mt-1">
                <span className="text-gray-600 text-xs sm:text-sm">تاریخ پایان:</span>
                <span className="font-medium text-xs sm:text-sm">
                  {autoSchedule.endDate ? moment(autoSchedule.endDate).format('jYYYY/jMM/jDD') : '---'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
        <button
          onClick={onPrevStep}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
        >
          مرحله قبلی
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !building}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>در حال ثبت...</span>
            </>
          ) : (
            <>
              <Check size={14} className="sm:w-4 sm:h-4" />
              <span>ثبت شارژ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

