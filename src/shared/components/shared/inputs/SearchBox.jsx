import { Search, X } from "lucide-react";
import { useRef } from "react";

export default function SearchBox({ searchTerm, setSearchTerm, placeholder = "جستجو..." }) {
    const inputRef = useRef(null);

    const handleClear = () => {
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full my-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                aria-label="جستجو"
                className="w-full pl-10 pr-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
            />
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                    aria-label="پاک کردن جستجو"
                    type="button"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
