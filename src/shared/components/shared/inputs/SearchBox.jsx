import { Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [shortcut, setShortcut] = useState('Ctrl+K');

    useEffect(() => {
        // Detect OS for shortcut hint
        if (typeof navigator !== 'undefined') {
             // Using userAgent instead of platform as platform is deprecated/unreliable
             const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
             if (isMac) {
                 setShortcut('⌘K');
             }
        }

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none"
                dir="ltr"
            >
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
                    <span className="text-xs">{shortcut}</span>
                </kbd>
            </div>
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 md:pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold"
                aria-keyshortcuts={shortcut}
            />
        </div>
    );
}
