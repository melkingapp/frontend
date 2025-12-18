/**
 * Component for entering new formula name
 */
export default function FormulaNameInput({
  formulaName,
  validationError,
  onChange,
  onBack,
}) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">تعریف فرمول جدید</h3>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← بازگشت به لیست فرمول‌ها
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نام فرمول *
        </label>
        <input
          type="text"
          value={formulaName || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="مثال: فرمول شارژ ماهانه"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
            validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {validationError && (
          <p className="text-red-500 text-sm mt-1">{validationError}</p>
        )}
      </div>
    </div>
  );
}

