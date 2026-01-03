import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar } from "lucide-react";

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

export default function PersianDatePicker({ value, onChange, placeholder, format = "YYYY/MM/DD" }) {
    const handleChange = (date) => {
        if (onChange) {
            // Convert DateObject to string format
            if (date && typeof date === 'object' && date.format) {
                // Use format method to get string, then convert Persian digits to English
                const formattedDate = date.format(format);
                onChange(persianToEnglish(formattedDate));
            } else if (date && typeof date === 'object' && date.year !== undefined) {
                // Manual format if format method doesn't work
                const year = String(date.year).padStart(4, '0');
                const month = String(date.month).padStart(2, '0');
                const day = String(date.day).padStart(2, '0');
                const formattedDate = `${year}/${month}/${day}`;
                onChange(persianToEnglish(formattedDate));
            } else if (typeof date === 'string') {
                // Convert Persian digits to English if it's a string
                onChange(persianToEnglish(date));
            } else {
                // Pass through if it's null or other type
                onChange(date);
            }
        }
    };

    return (
        <div className="relative">
            <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={value || ""}
                onChange={handleChange}
                format={format}
                placeholder={placeholder || "تاریخ را انتخاب کنید"}
                inputClass="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue transition"
                className="rtl"
                calendarPosition="bottom-right"
            />
            <Calendar className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>
    );
}
