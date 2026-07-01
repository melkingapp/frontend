import { getPersianType } from "../../../utils/typeUtils";

function ErrorMessage({ children }) {
    if (!children) return null;
    return <p role="alert" className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function SelectField({ label, name, value, onChange, options, error, disabled = false }) {
    // اگر value وجود دارد اما در options نیست، با getPersianType label آن را پیدا کن
    const selectedOption = options.find(opt => opt.value === value);
    const displayOptions = selectedOption 
        ? options 
        : value && !options.some(opt => opt.value === value)
            ? [...options, { value, label: getPersianType(value) || value }] // Fallback: استفاده از getPersianType برای نمایش فارسی
            : options;
    
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 ${error ? "border-red-500" : "border-gray-200"} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
            >
                <option value="">انتخاب کنید</option>
                {displayOptions.map(({ value: optVal, label: optLabel }, index) => (
                    <option key={index} value={optVal}>
                        {optLabel}
                    </option>
                ))}
            </select>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}