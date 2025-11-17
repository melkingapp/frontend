import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    selectSelectedBuilding,
    setSelectedBuilding,
} from "../../../../features/manager/building/buildingSlice";
import MelkingLogo from "../../../../assets/logo/Melking-fa.svg";

export default function ManagerSidebar({ navItems, sidebarOpen, onCloseSidebar }) {
    const { pathname } = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dispatch = useDispatch();

    const selectedBuilding = useSelector(selectSelectedBuilding);
    const allBuildings = useSelector((state) => state.building.data);
    const userPhone = useSelector((state) => state.auth.user?.phone);

    const managerBuildings = allBuildings.filter(
        (b) => b.manager?.phone === userPhone
    );

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const handleSelectBuilding = (id) => {
        dispatch(setSelectedBuilding(id));
        setDropdownOpen(false);
    };

    const renderMenuItems = (isMobile = false) => {
        // Show menu items even when no building is selected, but with disabled state
        if (!selectedBuilding) {
            return (
                <div className="space-y-1 w-full">
                    <div className="text-center text-yellow-200/70 text-sm py-4">
                        لطفاً ابتدا یک ساختمان انتخاب کنید
                    </div>
                </div>
            );
        }

        return navItems.map((item) => {
            const isActive = pathname.startsWith(item.to);
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.label];

            return (
                <div key={item.label} className="space-y-1 w-full">
                    <div
                        className={clsx(
                            "flex items-center justify-between w-full group",
                            isCollapsed && !isMobile ? "justify-center" : ""
                        )}
                    >
                        <Link
                            to={item.to}
                            className={clsx(
                                "flex items-center px-3 py-2 rounded-xl transition-colors duration-300 w-full",
                                isActive
                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#1C2E4E] font-semibold shadow-lg"
                                    : isMobile
                                        ? "hover:bg-gray-100 text-gray-700"
                                        : "hover:bg-white/20 text-white",
                                isCollapsed && !isMobile ? "justify-center" : "gap-3"
                            )}
                            title={isCollapsed && !isMobile ? item.label : ""}
                        >
                            {item.icon}
                            {!(isCollapsed && !isMobile) && (
                                <span className="text-sm select-none">{item.label}</span>
                            )}
                        </Link>

                        {hasChildren && !isCollapsed && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(item.label);
                                }}
                                className={clsx(
                                    "mr-2 transition",
                                    isMobile
                                        ? "text-gray-600 hover:text-yellow-500"
                                        : "text-white/80 hover:text-yellow-400"
                                )}
                                aria-label={`${isOpen ? "بستن" : "باز کردن"} زیرمنو ${item.label}`}
                            >
                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}
                    </div>

                    {hasChildren && isOpen && !isCollapsed && (
                        <div
                            className={clsx(
                                "pl-8 pr-2 mt-1 space-y-1 rounded-r-md border-r-4 border-yellow-400"
                            )}
                        >
                            {item.children.map((child, index) => (
                                <Link
                                    key={index}
                                    to={child.to}
                                    className={clsx(
                                        "block text-sm px-3 py-1.5 rounded-lg transition-colors duration-200 select-none",
                                        pathname === child.to
                                            ? isMobile
                                                ? "text-yellow-400 font-semibold shadow-inner"
                                                : "text-yellow-400 font-semibold shadow-inner"
                                            : isMobile
                                                ? "hover:bg-gray-100 text-gray-700"
                                                : "hover:bg-white/20 text-white/90"
                                    )}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderBuildingSelector = (isMobile = false) => (
        <div className="relative z-50">
            <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={clsx(
                    "text-sm font-semibold px-3 py-2 rounded-xl flex items-center justify-between w-full transition",
                    isMobile
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-yellow-100 text-yellow-900"
                )}
            >
                <span className="truncate max-w-[150px]">
                    {selectedBuilding?.title || "انتخاب ساختمان"}
                    {selectedBuilding?.building_code && (
                        <span className="block text-xs text-yellow-700 mt-1">
                            کد: {selectedBuilding.building_code}
                        </span>
                    )}
                </span>
                <ChevronDown className="ml-2" size={16} />
            </button>

            {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border text-sm max-h-60 overflow-y-auto">
                    {managerBuildings.length > 0 ? (
                        managerBuildings.map((building, index) => (
                            <button
                                key={building.building_id || building.id || index}
                                onClick={() => handleSelectBuilding(building.building_id || building.id)}
                                className="w-full text-right px-4 py-2 hover:bg-yellow-50 text-gray-800"
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium">{building.title}</span>
                                    {building.building_code && (
                                        <span className="text-xs text-gray-500 mt-1">
                                            کد: {building.building_code}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-gray-400 text-center">
                            ساختمانی یافت نشد
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={clsx(
                    "hidden md:flex flex-col shadow-lg space-y-3 overflow-y-auto rounded-l-3xl transition-all duration-300 relative",
                    isCollapsed
                        ? "w-20 items-center bg-gradient-to-b from-[#1C2E4E] to-[#12355B] p-3"
                        : "w-64 bg-gradient-to-b from-[#1C2E4E] to-[#12355B] p-5"
                )}
            >
                <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="mb-4 self-end text-yellow-300 hover:text-yellow-400 transition-transform duration-300"
                    aria-label={isCollapsed ? "باز کردن سایدبار" : "کوچک کردن سایدبار"}
                >
                    {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                </button>

                {!isCollapsed && renderBuildingSelector(false)}

                {renderMenuItems()}

                {!isCollapsed && (
                    <div className="sticky bottom-0 w-full text-center text-xs text-yellow-200 pt-6 border-t border-yellow-300/30 select-none bg-gradient-to-t from-[#12355B] to-transparent">
                        {/* Logo */}
                        <div className="flex justify-center mb-3">
                            <img 
                                src={MelkingLogo} 
                                alt="Melking Logo" 
                                className="h-32 w-auto filter brightness-0 invert"
                            />
                        </div>
                        <strong className="text-[14px] tracking-wider">نسخه 1.0.0</strong>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
                    onClick={onCloseSidebar}
                >
                    <aside
                        className="absolute right-0 top-0 w-64 h-full bg-white shadow-lg p-4 space-y-3 overflow-y-auto rounded-l-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="mb-4 text-melkingDarkBlue text-sm hover:text-gray-900 transition"
                            onClick={onCloseSidebar}
                            aria-label="بستن منوی موبایل"
                        >
                            ✕ بستن
                        </button>

                        {renderBuildingSelector(true)}

                        {renderMenuItems(true)}

                        <div className="mt-auto text-center text-xs text-melkingDarkBlue pt-6 border-t border-gray-200 select-none">
                            {/* Mobile Logo */}
                            <div className="flex justify-center mb-3">
                                <img 
                                    src={MelkingLogo} 
                                    alt="Melking Logo" 
                                    className="h-28 w-auto"
                                />
                            </div>
                            <strong className="text-[14px] text-melkingDarkBlue tracking-wider">
                                نسخه 1.0.0
                            </strong>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}