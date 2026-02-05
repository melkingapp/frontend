import { Search, X } from "lucide-react";
import clsx from "clsx";

export default function SearchBox({ searchTerm, setSearchTerm, placeholder = "جستجو...", className }) {
    return (
        <div className={clsx("relative w-full my-4", className)}>
            <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
                aria-hidden="true"
            />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className={clsx(
                    "w-full pr-10 pl-10 py-2 rounded-2xl border-2 border-melkingGold",
                    "focus:outline-none focus:ring-2 focus:ring-melkingGold",
                    "transition-all duration-200"
                )}
            />
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    aria-label="پاک کردن جستجو"
                    type="button"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
