import { useState, useEffect } from 'react';
import moment from 'moment-jalaali';
import { Calendar } from 'lucide-react';

moment.loadPersian({ dialect: 'persian-modern' });

export default function PersianDateInput({ 
  value, 
  onChange, 
  placeholder = "انتخاب تاریخ",
  className = "",
  label = ""
}) {
  const [displayValue, setDisplayValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());

  // Convert Gregorian to Persian for display
  useEffect(() => {
    if (value) {
      try {
        // Convert Gregorian date to Persian for display
        const jalaliDate = moment(value, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        setDisplayValue(jalaliDate);
        setSelectedDate(moment(value, 'YYYY-MM-DD'));
      } catch (error) {
        console.error('PersianDateInput - Error loading date:', error);
        setDisplayValue('');
        setSelectedDate(moment());
      }
    } else {
      setDisplayValue('');
      setSelectedDate(moment());
    }
  }, [value]);

  // Generate Jalali calendar days
  const generateCalendarDays = () => {
    const currentDate = selectedDate || moment();
    
    const year = currentDate.jYear();
    const month = currentDate.jMonth();
    
    // Create the first day of the month
    const firstDay = moment().jYear(year).jMonth(month).jDate(1);
    
    // Get the number of days in the month using moment-jalaali
    // Calculate by going to the first day of next month and subtracting 1 day
    const nextMonthFirstDay = firstDay.clone().add(1, 'jMonth');
    const lastDayOfMonth = nextMonthFirstDay.clone().subtract(1, 'day');
    const daysInMonth = lastDayOfMonth.jDate();
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of month
    const firstDayWeekday = firstDay.day();
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create each day of the month
      const dayMoment = moment().jYear(year).jMonth(month).jDate(day);
      const dayGregorian = dayMoment.format('YYYY-MM-DD');
      
      calendarDays.push({
        day,
        moment: dayMoment,
        isToday: dayMoment.isSame(moment(), 'day'),
        isSelected: value && dayGregorian === value
      });
    }
    
    return calendarDays;
  };

  const handleDayClick = (dayMoment) => {
    const gregorianDate = dayMoment.format('YYYY-MM-DD');
    onChange(gregorianDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    const currentDate = selectedDate || moment();
    setSelectedDate(currentDate.clone().subtract(1, 'jMonth'));
  };

  const handleNextMonth = () => {
    const currentDate = selectedDate || moment();
    setSelectedDate(currentDate.clone().add(1, 'jMonth'));
  };

  const handleToday = () => {
    const today = moment();
    setSelectedDate(today);
    onChange(today.format('YYYY-MM-DD'));
    setIsOpen(false);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between bg-white"
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue || placeholder}
        </span>
        <Calendar size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">
                {monthNames[(selectedDate || moment()).jMonth()]} {(selectedDate || moment()).jYear()}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>;
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day.moment)}
                    className={`p-2 text-sm rounded hover:bg-blue-50 ${
                      day.isSelected
                        ? 'bg-blue-600 text-white'
                        : day.isToday
                        ? 'bg-blue-100 text-blue-600 font-medium'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleToday}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                امروز
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
