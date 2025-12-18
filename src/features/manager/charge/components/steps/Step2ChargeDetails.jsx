import { FileText } from "lucide-react";
import SelectedChargeInfo from "../shared/SelectedChargeInfo";
import FormulaSelector from "../shared/FormulaSelector";
import FormulaNameInput from "../shared/FormulaNameInput";
import FormulaParameters from "../shared/FormulaParameters";
import CustomAmountsEditor from "../shared/CustomAmountsEditor";
import RegularFormFields from "../shared/RegularFormFields";

/**
 * Step 2: Charge Details
 * This step includes formula selection, parameters, custom amounts, and regular form fields
 */
export default function Step2ChargeDetails({
  formData,
  validationErrors,
  formulas,
  isLoadingFormulas,
  isCreatingNewFormula,
  unitOptions,
  numberFormatHooks,
  onInputChange,
  onFormulaSelect,
  onCreateNewFormula,
  onFormulaParamChange,
  onToggleFormulaParam,
  onBackToFormulaList,
  onPrevStep,
  onNextStep,
  onResetToStep1,
}) {
  const showFormulaSelector = formData.chargeType === 'formula' && !isCreatingNewFormula && !formData.selectedFormulaId;
  const showFormulaNameInput = formData.chargeType === 'formula' && isCreatingNewFormula;
  const showFormulaParameters = (formData.chargeType === 'formula' && (formData.selectedFormulaId || isCreatingNewFormula)) || formData.chargeCategory === 'construction';
  const showCustomAmounts = formData.chargeType === 'custom';
  const showRegularFields = formData.chargeType === 'fixed';

  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
        <FileText size={18} className="sm:w-5 sm:h-5" />
        جزئیات اعلام شارژ
      </h2>

      {/* Selected Charge Info */}
      <SelectedChargeInfo
        chargeCategory={formData.chargeCategory}
        chargeType={formData.chargeType}
      />

      {/* Formula Selector */}
      {showFormulaSelector && (
        <FormulaSelector
          formulas={formulas}
          isLoadingFormulas={isLoadingFormulas}
          onFormulaSelect={onFormulaSelect}
          onCreateNew={onCreateNewFormula}
        />
      )}

      {/* Formula Name Input */}
      {showFormulaNameInput && (
        <FormulaNameInput
          formulaName={formData.formulaName}
          validationError={validationErrors.formulaName}
          onChange={(value) => onInputChange('formulaName', value)}
          onBack={onBackToFormulaList}
        />
      )}

      {/* Formula Parameters */}
      {showFormulaParameters && (
        <FormulaParameters
          formData={formData}
          validationErrors={validationErrors}
          numberFormatHooks={numberFormatHooks}
          unitOptions={unitOptions}
          onInputChange={onInputChange}
          onFormulaParamChange={onFormulaParamChange}
          onToggleFormulaParam={onToggleFormulaParam}
        />
      )}

      {/* Custom Amounts Editor */}
      {showCustomAmounts && (
        <CustomAmountsEditor
          formData={formData}
          validationErrors={validationErrors}
          unitOptions={unitOptions}
          onInputChange={onInputChange}
        />
      )}

      {/* Regular Form Fields */}
      {showRegularFields && (
        <RegularFormFields
          formData={formData}
          validationErrors={validationErrors}
          unitOptions={unitOptions}
          amountInput={numberFormatHooks.amountInput}
          onInputChange={onInputChange}
        />
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-2 sm:order-1">
          <button
            onClick={onPrevStep}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
          >
            مرحله قبلی
          </button>
          <button
            onClick={onResetToStep1}
            className="w-full sm:w-auto px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-xs sm:text-sm"
            title="بازگشت به انتخاب نوع شارژ و پاک کردن همه داده‌ها"
          >
            ↺ بازگشت به ابتدا
          </button>
        </div>
        <button
          onClick={onNextStep}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium order-1 sm:order-2"
        >
          مرحله بعدی
        </button>
      </div>
    </div>
  );
}

