import { Plus } from "lucide-react";

/**
 * Component for selecting an existing formula or creating a new one
 */
export default function FormulaSelector({
  formulas,
  isLoadingFormulas,
  onFormulaSelect,
  onCreateNew,
}) {
  if (isLoadingFormulas) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">انتخاب یا ساخت فرمول</h3>
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">در حال بارگذاری فرمول‌ها...</p>
        </div>
      </div>
    );
  }

  if (formulas.length > 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">انتخاب یا ساخت فرمول</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formulas.map((formula) => (
              <div
                key={formula.id}
                onClick={() => onFormulaSelect(formula.id)}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{formula.name}</h4>
                    {formula.description && (
                      <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onCreateNew}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            تعریف فرمول جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">انتخاب یا ساخت فرمول</h3>
      <div className="text-center py-4">
        <p className="text-gray-600 mb-4">هنوز فرمولی تعریف نشده است</p>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <Plus size={18} />
          تعریف اولین فرمول
        </button>
      </div>
    </div>
  );
}

