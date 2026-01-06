import { Search, X } from "lucide-react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    return (
        <div className="relative w-full my-4">
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={18}
                aria-hidden="true"
            />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                className="w-full pl-10 pr-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-melkingGold transition-colors"
                    aria-label="پاک کردن جستجو"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
