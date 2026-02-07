import { Search } from "lucide-react";
import { useRef, useEffect } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />

            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none"
                dir="ltr"
            >
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-md font-sans">
                    Ctrl K
                </kbd>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                aria-keyshortcuts="Control+k"
                className="w-full pl-10 sm:pl-28 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
            />
        </div>
    );
}
