import { Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);
    const [shortcut, setShortcut] = useState("Ctrl+K");

    useEffect(() => {
        // Detect OS for shortcut hint
        if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)) {
            setShortcut("Cmd+K");
        }

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-colors group-focus-within:text-melkingGold" size={18} />
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 sm:pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all duration-200 placeholder:text-gray-400"
                aria-keyshortcuts={shortcut === "Cmd+K" ? "Meta+K" : "Control+K"}
            />
            {/* Keyboard Shortcut Hint */}
            <div
                className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none select-none text-gray-400 text-xs"
                dir="ltr"
                aria-hidden="true"
            >
                <kbd className="font-sans border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 text-[10px] text-gray-500 shadow-sm">
                    {shortcut === "Cmd+K" ? "⌘ K" : "Ctrl K"}
                </kbd>
            </div>
        </div>
    );
}
