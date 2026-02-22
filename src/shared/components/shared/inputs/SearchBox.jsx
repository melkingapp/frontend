import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchBox({ searchTerm, setSearchTerm, delay = 500 }) {
    const [localValue, setLocalValue] = useState(searchTerm);

    // Sync local state when external prop changes (e.g. reset button)
    useEffect(() => {
        setLocalValue(searchTerm);
    }, [searchTerm]);

    // Debounce calls to setSearchTerm
    useEffect(() => {
        const handler = setTimeout(() => {
            // Only update if value is different to avoid unnecessary calls
            if (localValue !== searchTerm) {
                setSearchTerm(localValue);
            }
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [localValue, delay, searchTerm, setSearchTerm]);

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
            />
        </div>
    );
}
