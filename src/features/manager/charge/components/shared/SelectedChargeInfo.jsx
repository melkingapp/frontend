import { chargeCategories, chargeTypes } from "../../constants/chargeTypes";

/**
 * Component to display selected charge category and type information
 */
export default function SelectedChargeInfo({ chargeCategory, chargeType }) {
  const category = chargeCategories.find(cat => cat.id === chargeCategory);
  const type = chargeTypes.find(t => t.id === chargeType);

  if (!category || !type) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{category.icon}</span>
        <div>
          <p className="font-medium text-blue-800">{category.title}</p>
          <p className="text-sm text-blue-600">
            {chargeCategory === 'current'
              ? 'شارژ‌های ماهانه، عادی و روزمره'
              : 'شارژ‌های مربوط به هزینه‌های عمرانی و ساختمانی'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{type.icon}</span>
        <div>
          <p className="font-medium text-blue-800">نحوه محاسبه: {type.title}</p>
          <p className="text-sm text-blue-600 mt-1">{type.description}</p>
        </div>
      </div>
    </div>
  );
}

