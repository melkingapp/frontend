/* eslint-disable no-unused-vars */
import { useState, useRef, useId } from "react";
import { Plus } from "lucide-react";
import useClickOutside from "../../../hooks/useClickOutside";

const MenuButton = ({ icon, label, onClick, open }) => (
    <button
        onClick={onClick}
        role="menuitem"
        tabIndex={open ? 0 : -1}
        className="flex items-center justify-center gap-1 w-[140px] bg-melkingDarkBlue text-white shadow px-3 py-2 rounded-md text-sm hover:bg-melkingGold hover:text-melkingDarkBlue focus-visible:ring-2 focus-visible:ring-melkingGold outline-none transition whitespace-nowrap"
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Menu = ({ items, open, onSelect, menuId }) => {
    const itemHeight = 40;
    const topOffset = -itemHeight * items.length - 8; 

    return (
        <div
            id={menuId}
            role="menu"
            aria-hidden={!open}
            className={`absolute left-12 flex flex-col gap-2 items-start transition-all duration-300 ${open ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
            style={{ top: open ? topOffset : -20 }}
        >
            {items.map(({ key, label, icon, onClick }) => (
                <MenuButton key={key} icon={icon} label={label} onClick={() => onSelect(key, onClick)} open={open} />
            ))}
        </div>
    );
};

export default function FloatingActionButton({ items = [], color = "bg-yellow-500" }) {
    const [open, setOpen] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
    const menuRef = useRef(null);
    const menuId = useId();

    useClickOutside(menuRef, () => setOpen(false));

    const handleSelect = (key, callback) => {
        setActiveKey(key);
        setOpen(false);
        if (callback) callback();
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" ref={menuRef}>
            <div className="relative">
                <Menu items={items} open={open} onSelect={handleSelect} menuId={menuId} />
                <button
                    onClick={() => setOpen((o) => !o)}
                    aria-label={open ? "بستن منو" : "عملیات جدید"}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    className={`w-14 h-14 flex items-center justify-center ${color} text-white rounded-full shadow-lg hover:opacity-90 focus-visible:ring-4 focus-visible:ring-yellow-300 outline-none transition`}
                >
                    <Plus className={`w-6 h-6 transform transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`} />
                </button>
            </div>
        </div>
    );
}