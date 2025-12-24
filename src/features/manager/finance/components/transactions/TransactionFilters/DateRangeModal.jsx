import { useState, useEffect } from "react";
import moment from "moment-jalaali";
import PersianDatePicker from "../../../../../../shared/components/shared/inputs/PersianDatePicker";

export default function DateRangeModal({ 
  isOpen, 
  onClose, 
  dateRange, 
  onApply, 
  onClear,
  oldestDate,
  newestDate 
}) {
  const [tempDateRange, setTempDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    if (isOpen) {
      if (dateRange) {
        setTempDateRange({ from: dateRange.from, to: dateRange.to });
      } else {
        const fromDate = oldestDate && oldestDate !== "-" ? moment(oldestDate).format('YYYY-MM-DD') : '';
        const toDate = newestDate && newestDate !== "-" ? moment(newestDate).format('YYYY-MM-DD') : '';
        setTempDateRange({ from: fromDate, to: toDate });
      }
    }
  }, [isOpen, dateRange, oldestDate, newestDate]);

  const handleFromDateChange = (date) => {
    let gregorianDate = '';
    if (date) {
      try {
        if (date.toDate) {
          const jsDate = date.toDate();
          gregorianDate = moment(jsDate).format('YYYY-MM-DD');
        } else if (date instanceof Date) {
          gregorianDate = moment(date).format('YYYY-MM-DD');
        } else if (typeof date === 'string') {
          const persianMoment = moment(date, 'jYYYY/jMM/jDD');
          if (persianMoment.isValid()) {
            gregorianDate = persianMoment.format('YYYY-MM-DD');
          } else {
            gregorianDate = moment(date).format('YYYY-MM-DD');
          }
        } else if (date.year && date.month && date.day) {
          const persianMoment = moment().jYear(date.year).jMonth(date.month.number - 1).jDate(date.day);
          gregorianDate = persianMoment.format('YYYY-MM-DD');
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
    setTempDateRange({ ...tempDateRange, from: gregorianDate });
  };

  const handleToDateChange = (date) => {
    let gregorianDate = '';
    if (date) {
      try {
        if (date.toDate) {
          const jsDate = date.toDate();
          gregorianDate = moment(jsDate).format('YYYY-MM-DD');
        } else if (date instanceof Date) {
          gregorianDate = moment(date).format('YYYY-MM-DD');
        } else if (typeof date === 'string') {
          const persianMoment = moment(date, 'jYYYY/jMM/jDD');
          if (persianMoment.isValid()) {
            gregorianDate = persianMoment.format('YYYY-MM-DD');
          } else {
            gregorianDate = moment(date).format('YYYY-MM-DD');
          }
        } else if (date.year && date.month && date.day) {
          const persianMoment = moment().jYear(date.year).jMonth(date.month.number - 1).jDate(date.day);
          gregorianDate = persianMoment.format('YYYY-MM-DD');
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
    setTempDateRange({ ...tempDateRange, to: gregorianDate });
  };

  const handleApply = () => {
    onApply(tempDateRange);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-gray-800">فیلتر بر اساس تاریخ</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              از تاریخ
            </label>
            <PersianDatePicker
              value={tempDateRange.from ? moment(tempDateRange.from).format('jYYYY/jMM/jDD') : ''}
              onChange={handleFromDateChange}
              placeholder="از تاریخ را انتخاب کنید"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تا تاریخ
            </label>
            <PersianDatePicker
              value={tempDateRange.to ? moment(tempDateRange.to).format('jYYYY/jMM/jDD') : ''}
              onChange={handleToDateChange}
              placeholder="تا تاریخ را انتخاب کنید"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApply}
            className="flex-1 bg-melkingGold text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            اعمال فیلتر
          </button>
          {dateRange && (
            <button
              onClick={onClear}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              حذف فیلتر
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

