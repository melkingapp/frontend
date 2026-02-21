import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm }) {
  const inputRef = useRef(null);
  const [modifierKey, setModifierKey] = useState("Ctrl");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      // Check for Mac
      const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
      setModifierKey(isMac ? "⌘" : "Ctrl");
    }

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full my-4">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        size={18}
      />

      <div
        className="hidden md:flex absolute left-10 top-1/2 -translate-y-1/2 items-center pointer-events-none select-none"
        dir="ltr"
      >
        <kbd className="inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
          <span className="text-xs">{modifierKey}</span> + K
        </kbd>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="جستجو..."
        className="w-full pl-10 md:pl-24 pr-3 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold transition-all"
      />
    </div>
  );
}
