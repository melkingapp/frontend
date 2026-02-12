import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [shortcut, setShortcut] = useState("Ctrl+K");

    useEffect(() => {
        // Detect OS for correct shortcut text
        if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
            setShortcut("Cmd+K");
        }
    }, []);

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

            {/* Keyboard Shortcut Hint */}
            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block"
                dir="ltr"
            >
                <kbd className="inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
                    {shortcut === "Cmd+K" ? "⌘K" : "Ctrl+K"}
                </kbd>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-keyshortcuts={shortcut === "Cmd+K" ? "Meta+K" : "Control+K"}
                className="w-full pl-10 sm:pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold placeholder:text-gray-400"
            />
        </div>
    );
}
