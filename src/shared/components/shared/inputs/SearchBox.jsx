import { Search } from "lucide-react";
import { useRef, useEffect } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative w-full my-4 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold peer"
            />
            <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none transition-opacity duration-200 peer-focus:opacity-0 peer-placeholder-shown:opacity-100 opacity-0" dir="ltr">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg">Ctrl K</kbd>
            </div>
        </div>
    );
}
