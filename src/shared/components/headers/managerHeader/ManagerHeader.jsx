/* eslint-disable no-unused-vars */
import { LogOut, Menu, Home, BellRing, User, Building } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { logout } from "../../../../features/authentication/authSlice";
import { useDispatch } from "react-redux";

export default function ManagerHeader({ onOpenSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [hovered, setHovered] = useState(null);

    // تعیین نوع پنل بر اساس مسیر فعلی
    const getPanelTitle = () => {
        if (location.pathname.startsWith('/resident')) {
            return 'پنل ساکن/مالک';
        } else if (location.pathname.startsWith('/manager')) {
            return 'پنل مدیریت ساختمان';
        }
        return 'پنل مدیریت ساختمان'; // پیش‌فرض
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const icons = [
        { id: "notifications", Icon: BellRing, label: "اعلانات", onClick: () => toast.info("نمایش اعلانات") },
        { id: "profile", Icon: User, label: "پروفایل", onClick: () => navigate("/manager/profile") },
        { id: "panel", Icon: Building, label: "پنل مدیر", onClick: () => navigate("/manager") },
        { id: "home", Icon: Home, label: "خانه", onClick: () => navigate("/") },
        { id: "logout", Icon: LogOut, label: "خروج", onClick: handleLogout },
    ];

    return (
        <header className="h-16 backdrop-blur-md bg-[#1c2e4ef0] text-white px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden text-white hover:text-[#D3B66C] transition-colors duration-200"
                onClick={onOpenSidebar}
                aria-label="باز کردن منو"
            >
                <Menu size={24} />
            </button>

            {/* Title */}
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white drop-shadow-sm text-center">
                {getPanelTitle()}
            </h1>

            {/* Icons */}
            <div className="flex items-center gap-4 sm:gap-6">
                {icons.map(({ id, Icon, label, onClick }) => (
                    <button
                        key={id}
                        onClick={onClick}
                        onMouseEnter={() => setHovered(id)}
                        onMouseLeave={() => setHovered(null)}
                        className="relative group"
                        aria-label={label}
                        type="button"
                    >
                        <div className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#D3B66C]/20 transition-all duration-200 rounded-full shadow-sm">
                            <Icon size={22} className="text-white" />
                        </div>
                        {hovered === id && (
                            <span className="absolute top-full mt-1 right-1/2 translate-x-1/2 whitespace-nowrap bg-[#1C2E4E] text-white text-xs font-medium px-2 py-0.5 rounded shadow-lg z-10">
                                {label}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </header>
    );
}
