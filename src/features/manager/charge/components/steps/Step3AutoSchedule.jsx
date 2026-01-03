import { Calendar } from "lucide-react";
import PersianDatePicker from "../../../../../shared/components/shared/inputs/PersianDatePicker";
import moment from "moment-jalaali";

/**
 * Step 3: Auto Schedule Configuration
 */
export default function Step3AutoSchedule({
  formData,
  validationErrors,
  onInputChange,
  onPrevStep,
  onNextStep,
}) {
  const autoSchedule = formData.autoSchedule || {
    enabled: false,
    dayOfMonth: '',
    endDate: '',
  };

  const handleAutoScheduleChange = (field, value) => {
    onInputChange('autoSchedule', {
      ...autoSchedule,
      [field]: value
    });
  };

  const handleAutoScheduleToggle = (enabled) => {
    onInputChange('autoSchedule', {
      ...autoSchedule,
      enabled
    });
  };

  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
        <Calendar size={18} className="sm:w-5 sm:h-5" />
        برنامه‌ریزی خودکار شارژ
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* Due Date (day of month only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مهلت پرداخت (روز ماه) *
          </label>
          <select
            value={formData.dueDate || ''}
            onChange={(e) => onInputChange('dueDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
              validationErrors.dueDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">انتخاب روز مهلت پرداخت</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          {validationErrors.dueDate && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.dueDate}</p>
          )}
        </div>

        {/* Auto Schedule Toggle */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">فعال‌سازی برنامه‌ریزی خودکار</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">شارژ به صورت خودکار هر ماه در روز تعیین شده محاسبه و اعمال شود</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSchedule.enabled}
                onChange={(e) => handleAutoScheduleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>

          {autoSchedule.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Day of Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  روز ماه *
                </label>
                <select
                  value={autoSchedule.dayOfMonth || ''}
                  onChange={(e) => handleAutoScheduleChange('dayOfMonth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    validationErrors.dayOfMonth ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">انتخاب روز</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {validationErrors.dayOfMonth && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.dayOfMonth}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">هر ماه در این روز شارژ محاسبه و اعمال می‌شود</p>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ پایان *
                </label>
                <PersianDatePicker
                  value={autoSchedule.endDate}
                  onChange={(date) => {
                    // date is now already a string in YYYY/MM/DD format (Jalaali)
                    // thanks to the handleChange in PersianDatePicker
                    if (date && typeof date === 'string') {
                      handleAutoScheduleChange('endDate', date);
                    }
                  }}
                  placeholder="انتخاب تاریخ پایان"
                  className={`w-full ${
                    validationErrors.endDate ? 'border-red-500 bg-red-50' : ''
                  }`}
                />
                {validationErrors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">تا این تاریخ برنامه‌ریزی خودکار فعال خواهد بود</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <button
            onClick={onPrevStep}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
          >
            مرحله قبلی
          </button>
          <button
            onClick={onNextStep}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium order-1 sm:order-2"
          >
            مرحله بعدی
          </button>
        </div>
      </div>
    </div>
  );
}

