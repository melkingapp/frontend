import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import useClickOutside from "../../../hooks/useClickOutside";

const MenuButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center gap-1 w-[140px] bg-melkingDarkBlue text-white shadow px-3 py-2 rounded-md text-sm hover:bg-melkingGold hover:text-melkingDarkBlue transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-melkingGold"
        role="menuitem"
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Menu = ({ items, open, onSelect }) => {
    const itemHeight = 40;
    const topOffset = -itemHeight * items.length - 8; 

    return (
        <div
            id="fab-menu"
            className={`absolute left-12 flex flex-col gap-2 items-start transition-all duration-300 ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-90 pointer-events-none invisible"}`}
            style={{ top: open ? topOffset : -20 }}
            role="menu"
            aria-orientation="vertical"
        >
            {items.map(({ key, label, icon, onClick }) => (
                <MenuButton key={key} icon={icon} label={label} onClick={() => onSelect(key, onClick)} />
            ))}
        </div>
    );
};

export default function FloatingActionButton({ items = [], color = "bg-yellow-500" }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useClickOutside(menuRef, () => setOpen(false));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (open && e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    const handleSelect = (key, callback) => {
        setOpen(false);
        if (callback) callback();
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" ref={menuRef}>
            <div className="relative">
                <Menu items={items} open={open} onSelect={handleSelect} />
                <button
                    onClick={() => setOpen((o) => !o)}
                    className={`w-14 h-14 flex items-center justify-center ${color} text-white rounded-full shadow-lg hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-melkingGold`}
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-controls="fab-menu"
                >
                    <Plus className={`w-6 h-6 transform transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
