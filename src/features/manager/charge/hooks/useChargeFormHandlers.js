import { useCallback } from "react";
import { toast } from "sonner";
import { validateStep } from "../utils/chargeValidation";
import { prepareChargeAllocations } from "../utils/chargeAllocation";
import { steps, STORAGE_KEY } from "../constants/chargeTypes";
import { DEFAULT_FORMULA_PARAMS } from "../constants/defaultValues";

/**
 * Custom hook for charge form handlers
 */
export const useChargeFormHandlers = ({
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
}) => {
  const {
    amountInput,
    baseAmountInput,
    perPersonAmountInput,
    perAreaAmountInput,
    perParkingAmountInput,
    perStorageAreaAmountInput,
  } = numberFormatHooks;

  const resetNumberFormatHooks = useCallback(() => {
    amountInput?.setValue('');
    baseAmountInput?.setValue('');
    perPersonAmountInput?.setValue('');
    perAreaAmountInput?.setValue('');
    perParkingAmountInput?.setValue('');
    perStorageAreaAmountInput?.setValue('');
  }, [amountInput, baseAmountInput, perPersonAmountInput, perAreaAmountInput, perParkingAmountInput, perStorageAreaAmountInput]);

  const handleChargeTypeSelect = useCallback((chargeTypeId) => {
    setFormData(prev => ({
      ...prev,
      chargeType: chargeTypeId,
      amount: '',
      targetUnits: 'all',
      selectedUnits: [],
      customAmounts: {},
      formulaName: '',
      selectedFormulaId: null,
      formulaParams: DEFAULT_FORMULA_PARAMS,
    }));

    resetNumberFormatHooks();
    setIsCreatingNewFormula(false);
    setValidationErrors({});
  }, [setFormData, resetNumberFormatHooks, setIsCreatingNewFormula, setValidationErrors]);

  const handleFormulaSelect = useCallback((formulaId) => {
    const selectedFormula = formulas.find(f => f.id === formulaId);
    if (selectedFormula) {
      setFormData(prev => ({
        ...prev,
        selectedFormulaId: formulaId,
        formulaName: selectedFormula.name,
        formulaParams: selectedFormula.params || prev.formulaParams,
      }));

      // Load formula values into number format hooks
      if (selectedFormula.params) {
        if (selectedFormula.params.baseAmount) {
          baseAmountInput?.setValue(selectedFormula.params.baseAmount);
        }
        if (selectedFormula.params.perPerson?.amount) {
          perPersonAmountInput?.setValue(selectedFormula.params.perPerson.amount);
        }
        if (selectedFormula.params.perArea?.amount) {
          perAreaAmountInput?.setValue(selectedFormula.params.perArea.amount);
        }
        if (selectedFormula.params.perParking?.amount) {
          perParkingAmountInput?.setValue(selectedFormula.params.perParking.amount);
        }
        if (selectedFormula.params.perStorageArea?.amount) {
          perStorageAreaAmountInput?.setValue(selectedFormula.params.perStorageArea.amount);
        }
      }

      setIsCreatingNewFormula(false);
    }
  }, [formulas, setFormData, baseAmountInput, perPersonAmountInput, perAreaAmountInput, perParkingAmountInput, perStorageAreaAmountInput, setIsCreatingNewFormula]);

  const handleCreateNewFormula = useCallback(() => {
    setIsCreatingNewFormula(true);
    setFormData(prev => ({
      ...prev,
      selectedFormulaId: null,
      formulaName: '',
      formulaParams: DEFAULT_FORMULA_PARAMS,
    }));

    baseAmountInput?.setValue('');
    perPersonAmountInput?.setValue('');
    perAreaAmountInput?.setValue('');
    perParkingAmountInput?.setValue('');
    perStorageAreaAmountInput?.setValue('');
  }, [setIsCreatingNewFormula, setFormData, baseAmountInput, perPersonAmountInput, perAreaAmountInput, perParkingAmountInput, perStorageAreaAmountInput]);

  const handleBackToFormulaList = useCallback(() => {
    setIsCreatingNewFormula(false);
    setFormData(prev => ({ ...prev, formulaName: '', selectedFormulaId: null }));
  }, [setIsCreatingNewFormula, setFormData]);

  const handleFormulaParamChange = useCallback((paramKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      formulaParams: {
        ...prev.formulaParams,
        [paramKey]: {
          ...prev.formulaParams[paramKey],
          [field]: value
        }
      }
    }));
  }, [setFormData]);

  const toggleFormulaParam = useCallback((paramKey) => {
    setFormData(prev => ({
      ...prev,
      formulaParams: {
        ...prev.formulaParams,
        [paramKey]: {
          ...prev.formulaParams[paramKey],
          enabled: !prev.formulaParams[paramKey].enabled
        }
      }
    }));
  }, [setFormData]);

  const handleNextStep = useCallback(() => {
    const errors = validateStep(currentStep, formData, numberFormatHooks);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    setValidationErrors({});
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  }, [currentStep, formData, numberFormatHooks, setValidationErrors, setCurrentStep]);

  const handlePrevStep = useCallback(() => {
    const newStep = Math.max(currentStep - 1, 1);

    if (newStep === 1) {
      setFormData(prev => ({
        ...prev,
        chargeType: '',
        amount: '',
        targetUnits: 'all',
        selectedUnits: [],
        customAmounts: {},
        autoSchedule: {
          enabled: false,
          dayOfMonth: '',
          endDate: '',
        },
        formulaParams: DEFAULT_FORMULA_PARAMS,
      }));

      resetNumberFormatHooks();
      setIsCreatingNewFormula(false);
      setValidationErrors({});
    }

    setCurrentStep(newStep);
  }, [currentStep, setFormData, resetNumberFormatHooks, setIsCreatingNewFormula, setValidationErrors, setCurrentStep]);

  const handleResetToStep1 = useCallback(() => {
    resetForm();
    setExpandedChargeType(null);
  }, [resetForm, setExpandedChargeType]);

  const toggleChargeTypeExpansion = useCallback((chargeTypeId) => {
    setExpandedChargeType(expandedChargeType === chargeTypeId ? null : chargeTypeId);
  }, [expandedChargeType, setExpandedChargeType]);

  const handleSubmit = useCallback(async () => {
    // Validate all steps
    let allErrors = {};
    for (let step = 1; step <= steps.length; step++) {
      const stepErrors = validateStep(step, formData, numberFormatHooks);
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      const firstError = Object.values(allErrors)[0];
      toast.error(firstError);
      return;
    }

    setValidationErrors({});

    if (!building) {
      toast.error('لطفاً ابتدا ساختمان انتخاب کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save new formula if created
      if (formData.chargeType === 'formula' && isCreatingNewFormula && formData.formulaName) {
        const newFormula = {
          name: formData.formulaName,
          params: {
            baseAmount: baseAmountInput?.rawValue,
            perPerson: formData.formulaParams.perPerson,
            perArea: formData.formulaParams.perArea,
            perParking: formData.formulaParams.perParking,
            perStorageArea: formData.formulaParams.perStorageArea,
          },
          // TODO: Save to API
        };
        console.log('New formula to save:', newFormula);
      }

      // Prepare charge allocations
      const chargeAllocations = prepareChargeAllocations(formData, buildingUnits);

      // Prepare final charge data
      const chargeData = {
        ...formData,
        buildingId: building.building_id || building.id,
        chargeAllocations: chargeAllocations,
        metadata: {
          totalUnits: Object.keys(chargeAllocations).length,
          ownerCharges: Object.values(chargeAllocations).filter(a => a.actualPayer === 'owner').length,
          residentCharges: Object.values(chargeAllocations).filter(a => a.actualPayer === 'resident').length,
        }
      };

      console.log('Charge announcement data:', chargeData);
      console.log('Charge allocations per unit:', chargeAllocations);

      toast.success('اعلام شارژ با موفقیت ثبت شد');

      localStorage.removeItem(STORAGE_KEY);
      resetForm();
      setExpandedChargeType(null);

    } catch (error) {
      console.error('Error announcing charge:', error);
      toast.error('خطا در اعلام شارژ');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    numberFormatHooks,
    building,
    buildingUnits,
    isCreatingNewFormula,
    baseAmountInput,
    setValidationErrors,
    setIsSubmitting,
    resetForm,
    setExpandedChargeType,
  ]);

  const handleNewAnnouncement = useCallback(() => {
    resetForm();
    setExpandedChargeType(null);
  }, [resetForm, setExpandedChargeType]);

  return {
    handleChargeTypeSelect,
    handleFormulaSelect,
    handleCreateNewFormula,
    handleBackToFormulaList,
    handleFormulaParamChange,
    toggleFormulaParam,
    handleNextStep,
    handlePrevStep,
    handleResetToStep1,
    toggleChargeTypeExpansion,
    handleSubmit,
    handleNewAnnouncement,
  };
};

