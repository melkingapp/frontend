import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [modifierKey, setModifierKey] = useState("Ctrl");

    useEffect(() => {
        if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
            setModifierKey("Cmd");
        }

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClear = () => {
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full my-4 group">
            {/* Search Icon - Always on the far left (end) */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} aria-hidden="true" />

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-label="جستجو"
                className={`w-full pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all ${
                    searchTerm ? "pl-20" : "pl-10 sm:pl-24"
                }`}
            />

            {searchTerm ? (
                <button
                    onClick={handleClear}
                    className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="پاک کردن جستجو"
                    type="button"
                >
                    <X size={16} />
                </button>
            ) : (
                <div
                    className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none select-none"
                    dir="ltr"
                    aria-hidden="true"
                >
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 shadow-sm">
                        <span className="text-xs">{modifierKey}</span> + K
                    </kbd>
                </div>
            )}
        </div>
    );
}
