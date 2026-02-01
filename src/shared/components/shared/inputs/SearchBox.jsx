import { Search, X } from "lucide-react";
import { useRef } from "react";

export default function SearchBox({
    searchTerm,
    setSearchTerm,
    value,
    onChange,
    placeholder = "جستجو...",
    className = "",
    ...rest
}) {
    // Resolve value and onChange to handle both APIs
    // If value is provided, use it. Otherwise use searchTerm (or empty string).
    const actualValue = value !== undefined ? value : (searchTerm || "");

    const inputRef = useRef(null);

    const handleChange = (e) => {
        const newValue = e.target.value;
        if (onChange) onChange(newValue);
        if (setSearchTerm) setSearchTerm(newValue);
    };

    const handleClear = () => {
        const newValue = "";
        if (onChange) onChange(newValue);
        if (setSearchTerm) setSearchTerm(newValue);
        inputRef.current?.focus();
    };

    const hasValue = actualValue && actualValue.length > 0;

    return (
        <div className={`relative w-full my-4 ${className}`}>
            {/* Search Icon - Start (Right) */}
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={18}
                aria-hidden="true"
            />

            <input
                ref={inputRef}
                type="text"
                value={actualValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full pr-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold ${hasValue ? 'pl-10' : 'pl-3'}`}
                aria-label={rest['aria-label'] || "جستجو"}
                {...rest}
            />

            {/* Clear Button - End (Left) */}
            {hasValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-1 rounded-full transition-colors"
                    aria-label="پاک کردن جستجو"
                    title="پاک کردن جستجو"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
