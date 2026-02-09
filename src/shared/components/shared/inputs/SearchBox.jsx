import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClear = () => {
        setSearchTerm('');
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />

            {searchTerm ? (
                <button
                    onClick={handleClear}
                    className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="پاک کردن جستجو"
                    title="پاک کردن"
                    type="button"
                >
                    <X size={16} />
                </button>
            ) : (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
                        {isMac ? '⌘K' : 'Ctrl+K'}
                    </kbd>
                </div>
            )}

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-20 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all duration-200"
            />
        </div>
    );
}
