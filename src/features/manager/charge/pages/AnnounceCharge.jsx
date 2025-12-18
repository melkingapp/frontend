import { useMemo } from "react";
import { Plus } from "lucide-react";
import FloatingActionButton from "../../../../shared/components/shared/feedback/FloatingActionButton";
import { useNumberFormat } from "../../../../shared/hooks/useNumberFormat";
import { useAnnounceChargeForm } from "../hooks/useAnnounceChargeForm";
import { useBuildingManagement } from "../hooks/useBuildingManagement";
import { useFormulas } from "../hooks/useFormulas";
import { useChargeFormHandlers } from "../hooks/useChargeFormHandlers";
import ChargeStepper, { getStepTitle } from "../components/shared/ChargeStepper";
import Step1ChargeTypeSelection from "../components/steps/Step1ChargeTypeSelection";
import Step2ChargeDetails from "../components/steps/Step2ChargeDetails";
import Step3AutoSchedule from "../components/steps/Step3AutoSchedule";
import Step4Confirmation from "../components/steps/Step4Confirmation";

export default function AnnounceCharge() {
  // Number formatting hooks
  const amountInput = useNumberFormat('');
  const baseAmountInput = useNumberFormat('');
  const perPersonAmountInput = useNumberFormat('');
  const perAreaAmountInput = useNumberFormat('');
  const perParkingAmountInput = useNumberFormat('');
  const perStorageAreaAmountInput = useNumberFormat('');

  // Memoize number format hooks object to prevent unnecessary re-renders
  const numberFormatHooks = useMemo(() => ({
    amountInput,
    baseAmountInput,
    perPersonAmountInput,
    perAreaAmountInput,
    perParkingAmountInput,
    perStorageAreaAmountInput,
  }), [amountInput, baseAmountInput, perPersonAmountInput, perAreaAmountInput, perParkingAmountInput, perStorageAreaAmountInput]);

  // Use custom hook for form state management
  const {
    currentStep,
    formData,
    validationErrors,
    isSubmitting,
    expandedChargeType,
    formulas,
    isLoadingFormulas,
    isCreatingNewFormula,
    setCurrentStep,
    setFormData,
    setValidationErrors,
    setIsSubmitting,
    setExpandedChargeType,
    setFormulas,
    setIsLoadingFormulas,
    setIsCreatingNewFormula,
    handleInputChange,
    resetForm,
  } = useAnnounceChargeForm(numberFormatHooks);

  // Use custom hook for building management
  const { building, buildingUnits } = useBuildingManagement();

  // Use custom hook for formulas management
  useFormulas(building, setIsLoadingFormulas, setFormulas);

  // Memoize unit options to prevent unnecessary recalculations
  const unitOptions = useMemo(() => 
    buildingUnits.map(unit => ({
      value: unit.id || unit.units_id,
      label: `واحد ${unit.unit_number || unit.number}`
    })),
    [buildingUnits]
  );

  // Use custom hook for all form handlers
  const handlers = useChargeFormHandlers({
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    validationErrors,
    setValidationErrors,
    expandedChargeType,
    setExpandedChargeType,
    isCreatingNewFormula,
    setIsCreatingNewFormula,
    formulas,
    numberFormatHooks,
    buildingUnits,
    building,
    resetForm,
    setIsSubmitting,
  });

  return (
    <div className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">اعلام شارژ</h1>
        <p className="text-sm sm:text-base text-gray-600">اعلام و اطلاع‌رسانی شارژ به ساکنان ساختمان</p>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm mb-4 sm:mb-6">
        <ChargeStepper
          currentStep={currentStep}
          formData={formData}
          getStepTitle={getStepTitle}
        />

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1ChargeTypeSelection
            formData={formData}
            validationErrors={validationErrors}
            expandedChargeType={expandedChargeType}
            onCategorySelect={(categoryId) => handleInputChange('chargeCategory', categoryId)}
            onChargeTypeSelect={handlers.handleChargeTypeSelect}
            onToggleExpansion={handlers.toggleChargeTypeExpansion}
            onNextStep={handlers.handleNextStep}
          />
        )}

        {currentStep === 2 && (
          <Step2ChargeDetails
            formData={formData}
            validationErrors={validationErrors}
            formulas={formulas}
            isLoadingFormulas={isLoadingFormulas}
            isCreatingNewFormula={isCreatingNewFormula}
            unitOptions={unitOptions}
            numberFormatHooks={numberFormatHooks}
            onInputChange={handleInputChange}
            onFormulaSelect={handlers.handleFormulaSelect}
            onCreateNewFormula={handlers.handleCreateNewFormula}
            onFormulaParamChange={handlers.handleFormulaParamChange}
            onToggleFormulaParam={handlers.toggleFormulaParam}
            onBackToFormulaList={handlers.handleBackToFormulaList}
            onPrevStep={handlers.handlePrevStep}
            onNextStep={handlers.handleNextStep}
            onResetToStep1={handlers.handleResetToStep1}
          />
        )}

        {currentStep === 3 && (
          <Step3AutoSchedule
            formData={formData}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onPrevStep={handlers.handlePrevStep}
            onNextStep={handlers.handleNextStep}
          />
        )}

        {currentStep === 4 && (
          <Step4Confirmation
            formData={formData}
            numberFormatHooks={numberFormatHooks}
            unitOptions={unitOptions}
            isSubmitting={isSubmitting}
            building={building}
            onPrevStep={handlers.handlePrevStep}
            onSubmit={handlers.handleSubmit}
          />
        )}

        {/* Info Section */}
        <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <h3 className="font-medium text-yellow-800 mb-1.5 sm:mb-2 text-sm sm:text-base">نکات مهم:</h3>
          <ul className="text-xs sm:text-sm text-yellow-700 space-y-0.5 sm:space-y-1">
            <li>• اعلام شارژ به تمام ساکنان واحدهای انتخاب شده ارسال خواهد شد</li>
            <li>• مهلت پرداخت باید حداقل ۷ روز از تاریخ اعلام باشد</li>
            <li>• در صورت نیاز به اصلاح، می‌توانید اعلام شارژ جدیدی ثبت کنید</li>
          </ul>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        color="bg-yellow-500"
        items={[
          {
            key: "new-announcement",
            label: "اعلام شارژ جدید",
            icon: <Plus className="w-4 h-4" />,
            onClick: handlers.handleNewAnnouncement
          },
        ]}
      />
    </div>
  );
}
