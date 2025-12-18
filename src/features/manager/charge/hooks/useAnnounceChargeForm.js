import { useState, useEffect } from "react";
import { STORAGE_KEY } from "../constants/chargeTypes";
import { DEFAULT_FORM_DATA } from "../constants/defaultValues";

/**
 * Get initial form state from localStorage or return default state
 */
const getInitialFormState = () => {
  const defaultFormData = DEFAULT_FORM_DATA;

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        currentStep: parsedData.currentStep || 1,
        formData: {
          ...defaultFormData,
          ...(parsedData.formData || {}),
          // Ensure payerType is always a string (convert from array if needed)
          payerType: parsedData.formData && parsedData.formData.payerType
            ? Array.isArray(parsedData.formData.payerType)
              ? parsedData.formData.payerType[0] || ''
              : parsedData.formData.payerType || ''
            : '',
        },
        validationErrors: parsedData.validationErrors || {},
      };
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  return {
    currentStep: 1,
    formData: defaultFormData,
    validationErrors: {},
  };
};

/**
 * Custom hook for managing announce charge form state
 * @param {Object} numberFormatHooks - Object containing number format hooks
 * @returns {Object} - Form state and handlers
 */
export function useAnnounceChargeForm(numberFormatHooks = {}) {
  const initialState = getInitialFormState();
  const [currentStep, setCurrentStep] = useState(initialState.currentStep);
  const [formData, setFormData] = useState(initialState.formData);
  const [validationErrors, setValidationErrors] = useState(initialState.validationErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedChargeType, setExpandedChargeType] = useState(null);
  const [formulas, setFormulas] = useState([]);
  const [isLoadingFormulas, setIsLoadingFormulas] = useState(false);
  const [isCreatingNewFormula, setIsCreatingNewFormula] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToSave = {
        formData,
        currentStep,
        validationErrors,
        amountInput: numberFormatHooks.amountInput?.value,
        baseAmountInput: numberFormatHooks.baseAmountInput?.value,
        perPersonAmountInput: numberFormatHooks.perPersonAmountInput?.value,
        perAreaAmountInput: numberFormatHooks.perAreaAmountInput?.value,
        perParkingAmountInput: numberFormatHooks.perParkingAmountInput?.value,
        perStorageAreaAmountInput: numberFormatHooks.perStorageAreaAmountInput?.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, [
    formData,
    currentStep,
    validationErrors,
    numberFormatHooks.amountInput?.value,
    numberFormatHooks.baseAmountInput?.value,
    numberFormatHooks.perPersonAmountInput?.value,
    numberFormatHooks.perAreaAmountInput?.value,
    numberFormatHooks.perParkingAmountInput?.value,
    numberFormatHooks.perStorageAreaAmountInput?.value,
  ]);

  // Restore number format hooks from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.amountInput && numberFormatHooks.amountInput) {
          numberFormatHooks.amountInput.setValue(parsedData.amountInput);
        }
        if (parsedData.baseAmountInput && numberFormatHooks.baseAmountInput) {
          numberFormatHooks.baseAmountInput.setValue(parsedData.baseAmountInput);
        }
        if (parsedData.perPersonAmountInput && numberFormatHooks.perPersonAmountInput) {
          numberFormatHooks.perPersonAmountInput.setValue(parsedData.perPersonAmountInput);
        }
        if (parsedData.perAreaAmountInput && numberFormatHooks.perAreaAmountInput) {
          numberFormatHooks.perAreaAmountInput.setValue(parsedData.perAreaAmountInput);
        }
        if (parsedData.perParkingAmountInput && numberFormatHooks.perParkingAmountInput) {
          numberFormatHooks.perParkingAmountInput.setValue(parsedData.perParkingAmountInput);
        }
        if (parsedData.perStorageAreaAmountInput && numberFormatHooks.perStorageAreaAmountInput) {
          numberFormatHooks.perStorageAreaAmountInput.setValue(parsedData.perStorageAreaAmountInput);
        }
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Clear chargeType when changing chargeCategory
      ...(field === 'chargeCategory' && { chargeType: '' })
    }));
  };

  const resetForm = () => {
    const defaultFormData = DEFAULT_FORM_DATA;

    setFormData(defaultFormData);
    setCurrentStep(1);
    setExpandedChargeType(null);
    setIsCreatingNewFormula(false);
    setValidationErrors({});

    // Reset number format hooks
    if (numberFormatHooks.amountInput) numberFormatHooks.amountInput.setValue('');
    if (numberFormatHooks.baseAmountInput) numberFormatHooks.baseAmountInput.setValue('');
    if (numberFormatHooks.perPersonAmountInput) numberFormatHooks.perPersonAmountInput.setValue('');
    if (numberFormatHooks.perAreaAmountInput) numberFormatHooks.perAreaAmountInput.setValue('');
    if (numberFormatHooks.perParkingAmountInput) numberFormatHooks.perParkingAmountInput.setValue('');
    if (numberFormatHooks.perStorageAreaAmountInput) numberFormatHooks.perStorageAreaAmountInput.setValue('');

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    // State
    currentStep,
    formData,
    validationErrors,
    isSubmitting,
    expandedChargeType,
    formulas,
    isLoadingFormulas,
    isCreatingNewFormula,
    
    // Setters
    setCurrentStep,
    setFormData,
    setValidationErrors,
    setIsSubmitting,
    setExpandedChargeType,
    setFormulas,
    setIsLoadingFormulas,
    setIsCreatingNewFormula,
    
    // Handlers
    handleInputChange,
    resetForm,
  };
}

