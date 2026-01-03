import moment from "moment-jalaali";

// Load Persian locale
moment.loadPersian({ dialect: "persian-modern" });

// Helper function to convert Persian digits to English
const persianToEnglish = (str) => {
  if (!str) return str;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = String(str);
  persianDigits.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), englishDigits[index]);
  });
  return result;
};

/**
 * Validate a specific step of the charge announcement form
 * @param {number} step - Step number (1-4)
 * @param {Object} formData - Form data object
 * @param {Object} numberFormatHooks - Object containing number format hooks
 * @returns {Object} - Object with validation errors
 */
export const validateStep = (step, formData, numberFormatHooks = {}) => {
  const errors = {};
  const autoSchedule = formData.autoSchedule || {
    enabled: false,
    dayOfMonth: '',
    endDate: '',
  };

  const {
    amountInput,
    baseAmountInput,
    perPersonAmountInput,
    perAreaAmountInput,
    perParkingAmountInput,
    perStorageAreaAmountInput
  } = numberFormatHooks;

  if (step === 1) {
    if (!formData.chargeCategory) {
      errors.chargeCategory = 'انتخاب نوع شارژ الزامی است';
    }
    if (!formData.chargeType) {
      errors.chargeType = 'انتخاب نحوه محاسبه الزامی است';
    }
  } else if (step === 2) {
    // Title validation
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'عنوان اعلام شارژ الزامی است';
    }

    // Payer type validation
    if (!formData.payerType) {
      errors.payerType = 'پرداخت‌کننده شارژ را مشخص کنید';
    }

    // Custom units validation
    if (formData.targetUnits === 'custom' && (!formData.selectedUnits || formData.selectedUnits.length === 0)) {
      errors.selectedUnits = 'حداقل یک واحد باید انتخاب شود';
    }

    // Amount validation based on charge type
    if (formData.chargeType === 'formula' || formData.chargeCategory === 'construction') {
      // Formula selection validation (only for formula type, not construction)
      if (formData.chargeType === 'formula') {
        if (!formData.selectedFormulaId && (!formData.formulaName || formData.formulaName.trim() === '')) {
          errors.formulaName = 'لطفاً یک فرمول انتخاب کنید یا نام فرمول جدید را وارد کنید';
        }
      }

      if (!baseAmountInput?.rawValue || isNaN(baseAmountInput.rawValue) || parseFloat(baseAmountInput.rawValue) <= 0) {
        errors.baseAmount = 'مبلغ ثابت پایه الزامی است';
      }

      // Validate enabled formula parameters
      if (formData.formulaParams.perPerson.enabled) {
        if (!perPersonAmountInput?.rawValue || isNaN(perPersonAmountInput.rawValue) || parseFloat(perPersonAmountInput.rawValue) <= 0) {
          errors.perPersonAmount = 'مبلغ به ازای هر نفر الزامی است';
        }
        if (formData.formulaParams.perPerson.conditionType !== 'always' && (!formData.formulaParams.perPerson.conditionValue || formData.formulaParams.perPerson.conditionValue === '')) {
          errors.perPersonCondition = 'شرط برای مبلغ به ازای هر نفر الزامی است';
        }
      }

      if (formData.formulaParams.perArea.enabled) {
        if (!perAreaAmountInput?.rawValue || isNaN(perAreaAmountInput.rawValue) || parseFloat(perAreaAmountInput.rawValue) <= 0) {
          errors.perAreaAmount = 'مبلغ به ازای متراژ الزامی است';
        }
        if (formData.formulaParams.perArea.conditionType !== 'always' && (!formData.formulaParams.perArea.conditionValue || formData.formulaParams.perArea.conditionValue === '')) {
          errors.perAreaCondition = 'شرط برای مبلغ به ازای متراژ الزامی است';
        }
      }

      if (formData.formulaParams.perParking.enabled) {
        if (!perParkingAmountInput?.rawValue || isNaN(perParkingAmountInput.rawValue) || parseFloat(perParkingAmountInput.rawValue) <= 0) {
          errors.perParkingAmount = 'مبلغ به ازای پارکینگ الزامی است';
        }
        if (formData.formulaParams.perParking.conditionType !== 'always' && (!formData.formulaParams.perParking.conditionValue || formData.formulaParams.perParking.conditionValue === '')) {
          errors.perParkingCondition = 'شرط برای مبلغ به ازای پارکینگ الزامی است';
        }
      }

      if (formData.formulaParams.perStorageArea.enabled) {
        if (!perStorageAreaAmountInput?.rawValue || isNaN(perStorageAreaAmountInput.rawValue) || parseFloat(perStorageAreaAmountInput.rawValue) <= 0) {
          errors.perStorageAreaAmount = 'مبلغ بر اساس متراژ انباری الزامی است';
        }
        if (formData.formulaParams.perStorageArea.conditionType !== 'always' && (!formData.formulaParams.perStorageArea.conditionValue || formData.formulaParams.perStorageArea.conditionValue === '')) {
          errors.perStorageAreaCondition = 'شرط برای مبلغ بر اساس متراژ انباری الزامی است';
        }
      }
    } else if (formData.chargeType === 'custom') {
      // For custom charge type, validate custom amounts
      const enabledUnits = Object.entries(formData.customAmounts).filter(([_, unit]) => unit.enabled);
      if (enabledUnits.length === 0) {
        errors.customAmounts = 'حداقل یک واحد باید فعال شود';
      } else {
        enabledUnits.forEach(([unitId, unit]) => {
          if (!unit.amount || unit.amount.trim() === '') {
            errors[`customAmount_${unitId}`] = 'مبلغ این واحد الزامی است';
          } else {
            const amount = parseFloat(unit.amount.replace(/,/g, ''));
            if (isNaN(amount) || amount <= 0) {
              errors[`customAmount_${unitId}`] = 'مبلغ باید عدد معتبر باشد';
            }
          }
        });
      }
    } else {
      // For other charge types, validate regular amount
      if (!amountInput?.rawValue || isNaN(amountInput.rawValue) || parseFloat(amountInput.rawValue) <= 0) {
        errors.amount = 'مبلغ شارژ الزامی است';
      }
    }
  } else if (step === 3) {
    // Due date validation (now in step 3)
    if (!formData.dueDate) {
      errors.dueDate = 'مهلت پرداخت الزامی است';
    }

    // Auto schedule validation
    if (autoSchedule.enabled) {
      if (!autoSchedule.dayOfMonth || autoSchedule.dayOfMonth === '') {
        errors.dayOfMonth = 'روز ماه الزامی است';
      } else {
        const day = parseInt(autoSchedule.dayOfMonth);
        if (day < 1 || day > 31) {
          errors.dayOfMonth = 'روز ماه باید بین ۱ تا ۳۱ باشد';
        }
      }

      if (!autoSchedule.endDate || autoSchedule.endDate === '') {
        errors.endDate = 'تاریخ پایان الزامی است';
      } else {
        try {
          // Convert Persian digits to English
          const englishDate = persianToEnglish(autoSchedule.endDate);
          
          // Parse as Jalaali date (format: YYYY/MM/DD)
          const endDate = moment(englishDate, 'jYYYY/jMM/jDD', true); // strict mode
          const today = moment(); // Today in Jalaali calendar
          
          if (!endDate.isValid()) {
            errors.endDate = 'فرمت تاریخ پایان نامعتبر است';
          } else if (endDate.isBefore(today, 'day')) {
            errors.endDate = 'تاریخ پایان باید در آینده باشد';
          }
        } catch (error) {
          console.error('Error validating endDate:', error);
          errors.endDate = 'خطا در بررسی تاریخ پایان';
        }
      }
    }
  }

  return errors;
};

