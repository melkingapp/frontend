import { Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [shortcutText, setShortcutText] = useState('Ctrl+K');

    useEffect(() => {
        // Detect platform for shortcut text
        if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)) {
            setShortcutText('⌘K');
        }

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
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />

            <kbd
                className="absolute left-12 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded select-none"
                dir="ltr"
            >
                {shortcutText}
            </kbd>

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 sm:pl-28 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all"
                aria-label="جستجو"
                aria-keyshortcuts="Control+K"
            />
        </div>
    );
}
