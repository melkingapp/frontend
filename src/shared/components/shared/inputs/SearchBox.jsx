import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4 group">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-opacity duration-200"
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
                aria-keyshortcuts="Control+K"
                className="w-full pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold placeholder:text-gray-400 transition-all duration-200 group-focus-within:pl-10"
            />
            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md pointer-events-none opacity-100 group-focus-within:opacity-0 transition-opacity duration-200"
                dir="ltr"
                aria-hidden="true"
            >
                <span className="text-[10px] font-mono">Ctrl</span>
                <span className="text-[10px] font-mono">+</span>
                <span className="text-[10px] font-mono">K</span>
            </div>
        </div>
    );
}
