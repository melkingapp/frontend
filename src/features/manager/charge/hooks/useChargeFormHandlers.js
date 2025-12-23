import { useCallback } from "react";
import { toast } from "sonner";
import { validateStep } from "../utils/chargeValidation";
import { prepareChargeAllocations } from "../utils/chargeAllocation";
import { steps, STORAGE_KEY } from "../constants/chargeTypes";
import { DEFAULT_FORMULA_PARAMS } from "../constants/defaultValues";
import { announceCharge, createChargeFormula } from "../../../../shared/services/billingService";

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
      // آماده‌سازی پارامترهای فرمول برای استفاده مشترک در ذخیره فرمول و ارسال به بکند
      let formulaParamsForApi = {};
      if (formData.chargeType === 'formula' || formData.chargeCategory === 'construction') {
        formulaParamsForApi = {
          baseAmount: parseFloat(baseAmountInput?.rawValue || 0),
          perPerson: {
            enabled: formData.formulaParams.perPerson?.enabled || false,
            amount: formData.formulaParams.perPerson?.enabled
              ? parseFloat(perPersonAmountInput?.rawValue || 0)
              : 0,
            conditionType: formData.formulaParams.perPerson?.conditionType || 'always',
            conditionValue: formData.formulaParams.perPerson?.conditionValue
              ? parseFloat(formData.formulaParams.perPerson.conditionValue)
              : null,
          },
          perArea: {
            enabled: formData.formulaParams.perArea?.enabled || false,
            amount: formData.formulaParams.perArea?.enabled
              ? parseFloat(perAreaAmountInput?.rawValue || 0)
              : 0,
            conditionType: formData.formulaParams.perArea?.conditionType || 'always',
            conditionValue: formData.formulaParams.perArea?.conditionValue
              ? parseFloat(formData.formulaParams.perArea.conditionValue)
              : null,
          },
          perParking: {
            enabled: formData.formulaParams.perParking?.enabled || false,
            amount: formData.formulaParams.perParking?.enabled
              ? parseFloat(perParkingAmountInput?.rawValue || 0)
              : 0,
            conditionType: formData.formulaParams.perParking?.conditionType || 'always',
            conditionValue: formData.formulaParams.perParking?.conditionValue
              ? parseFloat(formData.formulaParams.perParking.conditionValue)
              : null,
          },
          perStorageArea: {
            enabled: formData.formulaParams.perStorageArea?.enabled || false,
            amount: formData.formulaParams.perStorageArea?.enabled
              ? parseFloat(perStorageAreaAmountInput?.rawValue || 0)
              : 0,
            conditionType: formData.formulaParams.perStorageArea?.conditionType || 'always',
            conditionValue: formData.formulaParams.perStorageArea?.conditionValue
              ? parseFloat(formData.formulaParams.perStorageArea.conditionValue)
              : null,
          },
        };
      }

      // ذخیره فرمول جدید در صورت نیاز
      if (formData.chargeType === 'formula' && isCreatingNewFormula && formData.formulaName) {
        try {
          const formulaData = {
            building_id: building.building_id || building.id,
            name: formData.formulaName,
            base_amount: formulaParamsForApi.baseAmount,
            params: formulaParamsForApi,
          };

          const formulaResponse = await createChargeFormula(formulaData);
          toast.success(formulaResponse.message || 'فرمول با موفقیت ذخیره شد');
          
          // Update formData with the new formula ID
          setFormData(prev => ({
            ...prev,
            selectedFormulaId: formulaResponse.formula_id,
            isCreatingNewFormula: false,
          }));
        } catch (error) {
          console.error('Error saving formula:', error);
          const errorMessage = error.response?.data?.error || error.message || 'خطا در ذخیره فرمول';
          toast.error(errorMessage);
          // ادامه ثبت شارژ حتی اگر ذخیره فرمول شکست بخورد
        }
      }

      // Determine target units
      let targetUnitsList = [];
      if (formData.targetUnits === 'all') {
        targetUnitsList = buildingUnits;
      } else if (formData.targetUnits === 'occupied') {
        targetUnitsList = buildingUnits.filter(unit => unit.is_occupied);
      } else if (formData.targetUnits === 'empty') {
        targetUnitsList = buildingUnits.filter(unit => !unit.is_occupied);
      } else if (formData.targetUnits === 'custom' && formData.selectedUnits) {
        targetUnitsList = buildingUnits.filter(unit => 
          formData.selectedUnits.includes(unit.id || unit.units_id)
        );
      }

      // Calculate total amount based on charge type (برای نمایش و validation)
      let totalAmount = 0;

      if (formData.chargeType === 'fixed') {
        // Fixed amount: multiply by number of units
        const amount = parseFloat(amountInput?.rawValue || 0);
        totalAmount = amount * targetUnitsList.length;
      } else if (formData.chargeType === 'custom') {
        // Custom amounts: sum of all custom amounts
        totalAmount = Object.values(formData.customAmounts || {})
          .filter(unit => unit.enabled && unit.amount)
          .reduce((sum, unit) => {
            const amount = parseFloat(String(unit.amount).replace(/,/g, '')) || 0;
            return sum + amount;
          }, 0);
      } else if (formData.chargeType === 'formula' || formData.chargeCategory === 'construction') {
        // Formula-based: calculate for each unit
        if (!formulaParamsForApi || Object.keys(formulaParamsForApi).length === 0) {
          // اگر formulaParamsForApi تعریف نشده، از formData استفاده کن
          formulaParamsForApi = {
            baseAmount: parseFloat(baseAmountInput?.rawValue || 0),
            perPerson: { enabled: false, amount: 0 },
            perArea: { enabled: false, amount: 0 },
            perParking: { enabled: false, amount: 0 },
            perStorageArea: { enabled: false, amount: 0 },
          };
        }
        const baseAmount = formulaParamsForApi.baseAmount || 0;
        const perPersonAmount = (formulaParamsForApi.perPerson?.enabled && formulaParamsForApi.perPerson?.amount) ? formulaParamsForApi.perPerson.amount : 0;
        const perAreaAmount = (formulaParamsForApi.perArea?.enabled && formulaParamsForApi.perArea?.amount) ? formulaParamsForApi.perArea.amount : 0;
        const perParkingAmount = (formulaParamsForApi.perParking?.enabled && formulaParamsForApi.perParking?.amount) ? formulaParamsForApi.perParking.amount : 0;
        const perStorageAreaAmount = (formulaParamsForApi.perStorageArea?.enabled && formulaParamsForApi.perStorageArea?.amount) ? formulaParamsForApi.perStorageArea.amount : 0;

        // Calculate total for all units
        totalAmount = targetUnitsList.reduce((sum, unit) => {
          let unitAmount = baseAmount;
          
          // Check conditions and add per-person amount
          if (perPersonAmount > 0 && formData.formulaParams.perPerson?.enabled) {
            const conditionType = formData.formulaParams.perPerson?.conditionType || 'always';
            const conditionValue = parseFloat(formData.formulaParams.perPerson?.conditionValue || 0);
            const residentCount = unit.resident_count || 0;
            
            if (conditionType === 'always' || 
                (conditionType === 'more_than' && residentCount > conditionValue) ||
                (conditionType === 'less_than' && residentCount < conditionValue) ||
                (conditionType === 'equal' && residentCount === conditionValue)) {
              unitAmount += perPersonAmount * residentCount;
            }
          }

          // Check conditions and add per-area amount
          if (perAreaAmount > 0 && formData.formulaParams.perArea?.enabled) {
            const conditionType = formData.formulaParams.perArea?.conditionType || 'always';
            const conditionValue = parseFloat(formData.formulaParams.perArea?.conditionValue || 0);
            const area = parseFloat(unit.area || 0);
            
            if (conditionType === 'always' || 
                (conditionType === 'more_than' && area > conditionValue) ||
                (conditionType === 'less_than' && area < conditionValue) ||
                (conditionType === 'equal' && area === conditionValue)) {
              unitAmount += perAreaAmount * area;
            }
          }

          // Check conditions and add per-parking amount
          if (perParkingAmount > 0 && formData.formulaParams.perParking?.enabled) {
            const conditionType = formData.formulaParams.perParking?.conditionType || 'always';
            const conditionValue = parseFloat(formData.formulaParams.perParking?.conditionValue || 0);
            const parkingCount = unit.parking_count || 0;
            
            if (conditionType === 'always' || 
                (conditionType === 'more_than' && parkingCount > conditionValue) ||
                (conditionType === 'less_than' && parkingCount < conditionValue) ||
                (conditionType === 'equal' && parkingCount === conditionValue)) {
              unitAmount += perParkingAmount * parkingCount;
            }
          }

          // Check conditions and add per-storage-area amount
          if (perStorageAreaAmount > 0 && formData.formulaParams.perStorageArea?.enabled) {
            const conditionType = formData.formulaParams.perStorageArea?.conditionType || 'always';
            const conditionValue = parseFloat(formData.formulaParams.perStorageArea?.conditionValue || 0);
            const storageArea = parseFloat(unit.storage_area || 0);
            
            if (conditionType === 'always' || 
                (conditionType === 'more_than' && storageArea > conditionValue) ||
                (conditionType === 'less_than' && storageArea < conditionValue) ||
                (conditionType === 'equal' && storageArea === conditionValue)) {
              unitAmount += perStorageAreaAmount * storageArea;
            }
          }

          return sum + unitAmount;
        }, 0);
      }

      // Prepare custom amounts for API
      let customAmountsForApi = {};
      if (formData.chargeType === 'custom' && formData.customAmounts) {
        Object.entries(formData.customAmounts).forEach(([unitId, unitData]) => {
          if (unitData.enabled && unitData.amount) {
            const unit = buildingUnits.find(u => (u.id || u.units_id) === parseInt(unitId));
            const actualUnitId = unit?.units_id || unitId;
            const amount = parseFloat(String(unitData.amount).replace(/,/g, '')) || 0;
            customAmountsForApi[String(actualUnitId)] = amount;
          }
        });
      }

      // Prepare selected units for API
      let selectedUnitsForApi = [];
      if (formData.targetUnits === 'custom' && formData.selectedUnits) {
        selectedUnitsForApi = formData.selectedUnits.map(unitId => {
          const unit = buildingUnits.find(u => (u.id || u.units_id) === unitId);
          return unit?.units_id || unitId;
        });
      }

      // Prepare API data for announce_charge endpoint
      const apiData = {
        building_id: building.building_id || building.id,
        category: formData.chargeCategory || 'current', // current or construction
        charge_type: formData.chargeType || 'fixed', // fixed, formula, or custom
        title: formData.title || '',
        payer_type: formData.payerType || 'owner', // resident or owner
        target_units: formData.targetUnits || 'all', // all, occupied, empty, custom
        selected_units: selectedUnitsForApi,
        due_day_of_month: parseInt(formData.dueDate) || 15,
        description: formData.description || '',
      };

      // Add fixed_amount for fixed charge type
      if (formData.chargeType === 'fixed') {
        apiData.fixed_amount = parseFloat(amountInput?.rawValue || 0);
      }

      // Add formula data for formula charge type
      if (formData.chargeType === 'formula' || formData.chargeCategory === 'construction') {
        if (formData.selectedFormulaId) {
          apiData.formula_id = formData.selectedFormulaId;
        }
        if (isCreatingNewFormula && formData.formulaName) {
          apiData.formula_name = formData.formulaName;
        }
        apiData.formula_params = formulaParamsForApi;
      }

      // Add custom_amounts for custom charge type
      if (formData.chargeType === 'custom' && Object.keys(customAmountsForApi).length > 0) {
        apiData.custom_amounts = customAmountsForApi;
      }

      // Add auto_schedule if enabled and end_date is a valid non-empty string
      if (formData.autoSchedule?.enabled && formData.autoSchedule?.endDate) {
        apiData.auto_schedule = {
          enabled: true,
          day_of_month: parseInt(formData.autoSchedule.dayOfMonth) || 1,
          // Backend expects ISO date string (YYYY-MM-DD)
          end_date: formData.autoSchedule.endDate,
        };
      }

      // Call API
      const response = await announceCharge(apiData);

      toast.success(response.message || 'اعلام شارژ با موفقیت ثبت شد');

      localStorage.removeItem(STORAGE_KEY);
      resetForm();
      setExpandedChargeType(null);
      setCurrentStep(1);

    } catch (error) {
      console.error('Error announcing charge:', error);
      const errorMessage = error.response?.data?.error || error.message || 'خطا در اعلام شارژ';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    numberFormatHooks,
    building,
    buildingUnits,
    isCreatingNewFormula,
    amountInput,
    baseAmountInput,
    perPersonAmountInput,
    perAreaAmountInput,
    perParkingAmountInput,
    perStorageAreaAmountInput,
    setValidationErrors,
    setIsSubmitting,
    resetForm,
    setExpandedChargeType,
    setCurrentStep,
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

