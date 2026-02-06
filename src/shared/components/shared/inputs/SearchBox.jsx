import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchBox({ searchTerm, setSearchTerm, value, onChange, placeholder = "جستجو..." }) {
    // Resolve props to standard names
    const propValue = value !== undefined ? value : searchTerm;
    const propOnChange = onChange || setSearchTerm;

    const [localValue, setLocalValue] = useState(propValue || "");

    // Sync local state with prop value
    useEffect(() => {
        if (propValue !== undefined) {
            setLocalValue(propValue);
        }
    }, [propValue]);

    // Debounce calls to parent
    useEffect(() => {
        const timer = setTimeout(() => {
            if (propOnChange && localValue !== propValue) {
                propOnChange(localValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, propOnChange, propValue]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
            />
        </div>
    );
}
