/**
 * Default values for charge form
 */
export const DEFAULT_FORM_DATA = {
  chargeCategory: '',
  chargeType: '',
  title: '',
  description: '',
  amount: '',
  dueDate: '',
  payerType: '',
  targetUnits: 'all',
  selectedUnits: [],
  customAmounts: {},
  autoSchedule: {
    enabled: false,
    dayOfMonth: '',
    endDate: '',
  },
  formulaName: '',
  selectedFormulaId: null,
  formulaParams: {
    baseAmount: '',
    perPerson: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
    perArea: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
    perParking: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
    perStorageArea: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
  },
};

/**
 * Default formula parameters
 */
export const DEFAULT_FORMULA_PARAMS = {
  baseAmount: '',
  perPerson: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
  perArea: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
  perParking: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
  perStorageArea: { enabled: false, amount: '', conditionValue: '', conditionType: 'more_than' },
};

