import { Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function SearchBox({ searchTerm, setSearchTerm, className = "", ...props }) {
    const inputRef = useRef(null);
    const [modifierKey, setModifierKey] = useState('Ctrl');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
            setModifierKey('⌘');
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Determine value: preferred controlled via searchTerm, then props.value, then empty string fallback
    const value = searchTerm !== undefined ? searchTerm : (props.value !== undefined ? props.value : "");

    const handleChange = (e) => {
        if (setSearchTerm) {
            setSearchTerm(e.target.value);
        }
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <div className={`relative w-full my-4 ${className}`}>
            {/* Icon - Left (End in RTL) */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />

            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="جستجو..."
                {...props}
                className={`w-full pl-10 pr-16 py-2 rounded-2xl border-2 border-melkingGold focus:outline-none focus:ring-2 focus:ring-melkingGold peer ${props.className || ''}`}
            />

            {/* Visual Hint - Right (Start in RTL) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center pointer-events-none" dir="ltr">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 rounded-md shadow-sm font-sans whitespace-nowrap">
                    <span className="text-xs">{modifierKey}</span> K
                </kbd>
            </div>
        </div>
    );
}
