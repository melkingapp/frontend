import { Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [isMac, setIsMac] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showShortcut = !searchTerm && !isFocused;

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="جستجو..."
                aria-label="جستجو"
                aria-keyshortcuts={isMac ? "Meta+k" : "Control+k"}
                className="w-full pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all"
            />
            {showShortcut && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs flex items-center gap-1" dir="ltr">
                   <kbd className="font-sans border border-gray-300 rounded px-1.5 py-0.5 bg-gray-50 shadow-sm">
                        {isMac ? '⌘K' : 'Ctrl+K'}
                   </kbd>
                </div>
            )}
        </div>
    );
}
