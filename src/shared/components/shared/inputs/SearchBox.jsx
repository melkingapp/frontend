import { Search, X } from "lucide-react";
import { useRef } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    const handleClear = () => {
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full my-4">
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={18}
            />
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                className="w-full pr-10 pl-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold text-gray-900"
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                    aria-label="پاک کردن جستجو"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
