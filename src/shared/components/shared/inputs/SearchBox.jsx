import { Search, X } from "lucide-react";
import { forwardRef, useRef, useImperativeHandle } from "react";

const SearchBox = forwardRef(({
    searchTerm,
    setSearchTerm,
    value,
    onChange,
    placeholder = "جستجو...",
    className = "",
    inputClassName = "",
    ...rest
}, ref) => {
    const internalInputRef = useRef(null);
    useImperativeHandle(ref, () => internalInputRef.current);

    const actualValue = value !== undefined ? value : (searchTerm ?? "");

    const handleChange = (e) => {
        if (onChange) onChange(e);
        if (setSearchTerm) setSearchTerm(e.target.value);
    };

    const handleClear = () => {
        // Create a synthetic event for compatibility with onChange handlers
        const event = {
            target: { value: "" },
            currentTarget: { value: "" },
            preventDefault: () => {},
            stopPropagation: () => {}
        };
        handleChange(event);
        internalInputRef.current?.focus();
    };

    return (
        <div className={`relative w-full my-4 ${className}`}>
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={18}
                aria-hidden="true"
            />
            <input
                ref={internalInputRef}
                type="text"
                value={actualValue}
                onChange={handleChange}
                placeholder={placeholder}
                aria-label={rest["aria-label"] || "جستجو"}
                className={`w-full pr-10 pl-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold ${inputClassName}`}
                {...rest}
            />
            {actualValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="پاک کردن جستجو"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
});

SearchBox.displayName = "SearchBox";

export default SearchBox;
