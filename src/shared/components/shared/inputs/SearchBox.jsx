import { Search, X } from "lucide-react";
import { useRef, useEffect } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    useEffect(() => {
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
            {/* Search Icon - Right aligned for RTL */}
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
                className="w-full pr-10 pl-10 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-shadow"
            />

            {/* Clear Button - Show when there is text */}
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-1 rounded-full transition-colors"
                    aria-label="پاک کردن جستجو"
                    title="پاک کردن"
                    type="button"
                >
                    <X size={16} />
                </button>
            )}

            {/* Keyboard Shortcut Hint - Show when empty */}
            {!searchTerm && (
                <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 text-gray-400"
                    aria-hidden="true"
                >
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-sans text-gray-500 font-medium">
                        <span className="text-[10px]">Ctrl</span> K
                    </kbd>
                </div>
            )}
        </div>
    );
}
