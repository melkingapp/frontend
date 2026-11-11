import { forwardRef } from "react";
import { getPersianType } from "../../../utils/typeUtils";

function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} className="text-red-500 text-xs mb-3">{children}</p>;
}

const SelectField = forwardRef(({ label, name, value, onChange, options, error, disabled = false, required = false, ...rest }, ref) => {
    // اگر value وجود دارد اما در options نیست، با getPersianType label آن را پیدا کن
    const selectedOption = options.find(opt => opt.value === value);
    const displayOptions = selectedOption 
        ? options 
        : value && !options.some(opt => opt.value === value)
            ? [...options, { value, label: getPersianType(value) || value }] // Fallback: استفاده از getPersianType برای نمایش فارسی
            : options;
    
    const errorId = error ? `${name}-error` : undefined;

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
            </label>
            <select
                ref={ref}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={errorId}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 ${error ? "border-red-500" : "border-gray-200"} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
                {...rest}
            >
                <option value="">انتخاب کنید</option>
                {displayOptions.map(({ value: optVal, label: optLabel }, index) => (
                    <option key={index} value={optVal}>
                        {optLabel}
                    </option>
                ))}
            </select>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
});

SelectField.displayName = "SelectField";

export default SelectField;