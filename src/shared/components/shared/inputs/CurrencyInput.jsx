import { forwardRef, useState, useEffect } from "react";

const CurrencyInput = forwardRef(({
    label,
    value,
    onChange,
    placeholder = "0",
    name,
    disabled = false,
    error,
    helperText,
    required = false,
    className,
    min = 0,
    max,
    ...rest
}, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
        if (value !== undefined && value !== null) {
            const formatted = formatNumber(value);
            setDisplayValue(formatted);
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        const numStr = num.toString().replace(/,/g, "");
        return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const parseNumber = (str) => {
        const numStr = str.replace(/,/g, "");
        const num = parseFloat(numStr);
        return isNaN(num) ? null : num;
    };

    const handleChange = (e) => {
        const inputValue = e.target.value.replace(/,/g, "");
        
        // Only allow numbers
        if (inputValue === "" || /^\d+$/.test(inputValue)) {
            const numValue = inputValue === "" ? null : parseFloat(inputValue);
            
            // Validate min/max
            if (numValue !== null) {
                if (min !== undefined && numValue < min) {
                    return;
                }
                if (max !== undefined && numValue > max) {
                    return;
                }
            }
            
            const formatted = inputValue === "" ? "" : formatNumber(inputValue);
            setDisplayValue(formatted);
            
            if (onChange) {
                const event = {
                    target: {
                        name,
                        value: numValue,
                    },
                };
                onChange(event);
            }
        }
    };

    const handleBlur = () => {
        if (displayValue) {
            const num = parseNumber(displayValue);
            if (num !== null) {
                setDisplayValue(formatNumber(num));
            }
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
                <input
                    ref={ref}
                    id={name}
                    name={name}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    inputMode="numeric"
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={[errorId, helperId].filter(Boolean).join(" ") || undefined}
                    className={`w-full px-4 py-3 pr-16 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] transition ${
                        error ? "border-red-500" : "border-gray-200"
                    }`}
                    {...rest}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                    تومان
                </div>
            </div>
            {error && (
                <p id={errorId} className="text-red-500 text-xs mt-1">
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

CurrencyInput.displayName = "CurrencyInput";

export default CurrencyInput;
