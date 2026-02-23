import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />

            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 hidden md:flex items-center pointer-events-none"
                dir="ltr"
                aria-hidden="true"
            >
                <kbd className="inline-flex items-center h-5 px-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded shadow-sm select-none">
                    <span className="mr-0.5">Ctrl</span>K
                </kbd>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 md:pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all placeholder:text-gray-400"
                aria-keyshortcuts="Control+k"
            />
        </div>
    );
}
