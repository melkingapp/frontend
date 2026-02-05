import { Search, X } from "lucide-react";
import { useRef } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    const handleClear = () => {
        setSearchTerm('');
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full my-4">
            {/* Search Icon - moved to Right (Start) for RTL standard */}
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                aria-hidden="true"
            />

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                className="w-full pl-10 pr-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold placeholder:text-gray-400"
            />

            {/* Clear Button - appears on Left (End) when there is text */}
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-1 rounded-full transition-colors"
                    aria-label="پاک کردن جستجو"
                    type="button"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
