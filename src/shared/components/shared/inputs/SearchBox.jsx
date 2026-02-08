import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    useEffect(() => {
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
        <div className="relative w-full my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                aria-keyshortcuts="Control+K"
                className="w-full pl-10 sm:pl-28 sm:focus:pl-10 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold peer transition-all duration-200"
            />

            <div dir="ltr" aria-hidden="true" className="absolute left-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-gray-400 peer-focus:hidden pointer-events-none">
                <span className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">Ctrl + K</span>
            </div>
        </div>
    );
}
