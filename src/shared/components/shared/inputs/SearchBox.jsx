import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [shortcutText] = useState(() => {
        if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)) {
            return "Cmd";
        }
        return "Ctrl";
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />

            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none"
                dir="ltr"
                aria-hidden="true"
            >
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded shadow-sm font-sans">
                    {shortcutText}+K
                </kbd>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-keyshortcuts={`${shortcutText === 'Cmd' ? 'Meta' : 'Control'}+K`}
                className="w-full pl-10 sm:pl-28 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all"
            />
        </div>
    );
}
