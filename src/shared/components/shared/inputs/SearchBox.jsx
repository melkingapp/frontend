import { Search, X } from "lucide-react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const handleClear = () => {
        setSearchTerm("");
    };

    return (
        <div className="relative w-full my-4">
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
                aria-hidden="true"
            />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                className="w-full pr-10 pl-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all duration-200"
            />
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                    aria-label="پاک کردن جستجو"
                    type="button"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
