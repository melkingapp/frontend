import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar } from "lucide-react";

export default function PersianDatePicker({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder || "تاریخ را انتخاب کنید"}
                inputClass="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue transition"
                className="rtl"
                calendarPosition="bottom-right"
            />
            <Calendar className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>
    );
}
