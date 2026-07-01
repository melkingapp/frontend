import { useState, forwardRef, useImperativeHandle } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar } from "lucide-react";

const DatePickerField = forwardRef(({
    label,
    value,
    onChange,
    placeholder = "تاریخ را انتخاب کنید",
    name,
    disabled = false,
    error,
    helperText,
    required = false,
    className,
    format = "YYYY/MM/DD",
    minDate,
    maxDate,
    ...rest
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value || null);

    useImperativeHandle(ref, () => ({
        value: internalValue,
        setValue: setInternalValue,
    }));

    const handleChange = (date) => {
        const dateString = date ? date.format(format) : null;
        setInternalValue(dateString);
        if (onChange) {
            const event = {
                target: {
                    name,
                    value: dateString,
                },
            };
            onChange(event);
        }
    };

    const errorId = error ? `${name}-error` : undefined;
    const helperId = helperText ? `${name}-helper` : undefined;

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={name}>
                    {label}
                    {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="relative">
                <DatePicker
                    value={internalValue}
                    onChange={handleChange}
                    calendar={persian}
                    locale={persian_fa}
                    format={format}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabled={disabled}
                    containerClassName="w-full"
                    inputClass={`w-full px-4 py-3 pr-10 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] transition ${
                        error ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder={placeholder}
                    calendarPosition="bottom-right"
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    {...rest}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Calendar size={20} />
                </div>
            </div>
            {error && (
                <p id={errorId} role="alert" className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p id={helperId} className="text-gray-500 text-xs mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
});

DatePickerField.displayName = "DatePickerField";

export default DatePickerField;
