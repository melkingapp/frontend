import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { chargeCategories, chargeTypes } from "../../constants/chargeTypes";

/**
 * Step 1: Charge Type and Calculation Method Selection
 */
export default function Step1ChargeTypeSelection({
  formData,
  validationErrors,
  expandedChargeType,
  onCategorySelect,
  onChargeTypeSelect,
  onToggleExpansion,
  onNextStep,
}) {
  return (
    <div>
      {/* Charge Category Selection */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
          <FileText size={18} className="sm:w-5 sm:h-5" />
          نوع شارژ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {chargeCategories.map((category) => (
            <div
              key={category.id}
              className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                formData.chargeCategory === category.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : validationErrors.chargeCategory
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{category.icon}</div>
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">{category.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 leading-relaxed">
                  {category.id === 'current'
                    ? 'شارژ‌های ماهانه، عادی و روزمره مانند شارژ نگهبانی، نظافت، آب، برق و سایر هزینه‌های جاری'
                    : 'شارژ‌های مربوط به هزینه‌های عمرانی، تعمیرات اساسی، نوسازی و سایر هزینه‌های ساختمانی'}
                </p>
              </div>
            </div>
          ))}
        </div>
        {validationErrors.chargeCategory && (
          <p className="text-red-500 text-xs sm:text-sm mt-1.5 sm:mt-2">{validationErrors.chargeCategory}</p>
        )}
      </div>

      {/* Calculation Method Selection - Only show after category is selected */}
      {formData.chargeCategory && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
            <FileText size={18} className="sm:w-5 sm:h-5" />
            انتخاب نحوه محاسبه
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 items-start">
            {chargeTypes.map((chargeType) => (
              <div
                key={chargeType.id}
                className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all self-start ${
                  formData.chargeType === chargeType.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : validationErrors.chargeType
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onChargeTypeSelect(chargeType.id)}
              >
                <div className="text-center mb-2 sm:mb-3">
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{chargeType.icon}</div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">{chargeType.title}</h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(chargeType.id);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors py-1"
                >
                  توضیحات
                  {expandedChargeType === chargeType.id ? (
                    <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                  ) : (
                    <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                  )}
                </button>

                {expandedChargeType === chargeType.id && (
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-md">
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {chargeType.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onNextStep}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              مرحله بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

