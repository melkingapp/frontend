/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, BellRing, UserCog, LogOut, Menu, User, Home, Building } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../../../../features/authentication/authSlice";
import { navItems } from "../../../../constants/navigation";
import melkingLogo from "../../../../assets/logo/Melking-en-80.svg";
import MobileMenu from "./MobileMenu";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [hovered, setHovered] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const handleSettingsClick = () => {
        if (user?.role === 'resident') {
            navigate("/resident");
        } else if (user?.role === 'manager') {
            navigate("/manager");
        } else {
            // Default fallback
            navigate("/manager");
        }
    };

    // آیکون‌های مشترک برای همه کاربران وارد شده
    const commonIcons = [
        { id: "notifications", Icon: BellRing, label: "اعلانات", onClick: () => toast.info("نمایش نوتیفیکیشن") },
        { id: "home", Icon: Home, label: "خانه", onClick: () => navigate("/") },
        { id: "logout", Icon: LogOut, label: "خروج", onClick: handleLogout },
    ];

    // آیکون‌های مخصوص نقش کاربر
    const roleSpecificIcons = [
        { id: "profile", Icon: User, label: "پروفایل", onClick: () => navigate(user?.role === 'resident' ? "/resident/profile" : "/manager/profile") },
        { id: "panel", Icon: Building, label: user?.role === 'resident' ? "پنل ساکن" : "پنل مدیر", onClick: () => navigate(user?.role === 'resident' ? "/resident" : "/manager") },
    ];

    // ترکیب آیکون‌ها
    const icons = [...roleSpecificIcons, ...commonIcons];

    return (
        <header className="w-full bg-white border-b-2 border-melkingDarkBlue rounded-b-3xl shadow-md sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

                {/* ----------------- Mobile Layout ------------------ */}
                <div className="flex w-full items-center justify-between md:hidden">
                    <button onClick={() => setMenuOpen(true)} className="text-gray-700">
                        <Menu className="w-6 h-6" />
                    </button>

                    <Link to="/" className="mx-auto">
                        <img src={melkingLogo} alt="Melking Logo" className="w-20" />
                    </Link>

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            icons.map(({ id, Icon, label, onClick }) => (
                                <button
                                    key={id}
                                    onClick={onClick}
                                    onMouseEnter={() => setHovered(id)}
                                    onMouseLeave={() => setHovered(null)}
                                    className="relative group bg-black/10 hover:bg-[#D3B66C]/20 rounded-full text-melkingDarkBlue hover:text-[#D3B66C] p-2"
                                    aria-label={label}
                                    type="button"
                                >
                                    <div className="flex items-center justify-center transition-all duration-200 rounded-full shadow-sm">
                                        <Icon size={20} />
                                    </div>
                                    {hovered === id && (
                                        <span className="absolute top-full mt-1 right-1/2 translate-x-1/2 whitespace-nowrap bg-[#1C2E4E] text-white text-xs font-medium px-2 py-0.5 rounded shadow-lg z-10">
                                            {label}
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 bg-[#D3B66C] hover:bg-[#e6c980] transition text-[#1C2E4E] px-3 py-1.5 rounded-md text-sm shadow-sm"
                            >
                                <LogIn size={16} />
                                ورود | ثبت‌نام
                            </Link>
                        )}
                    </div>
                </div>

                {/* ----------------- Desktop Layout ------------------ */}
                <div className="hidden md:flex w-full items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/">
                            <img src={melkingLogo} alt="Melking Logo" className="w-20" />
                        </Link>
                        <nav className="flex gap-6 text-sm font-medium">
                            {navItems.map(({ label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="hover:text-[#D3B66C] transition-all duration-200"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        {isAuthenticated ? (
                            icons.map(({ id, Icon, label, onClick }) => (
                                <button
                                    key={id}
                                    onClick={onClick}
                                    onMouseEnter={() => setHovered(id)}
                                    onMouseLeave={() => setHovered(null)}
                                    className="relative group bg-black/10  hover:bg-[#D3B66C]/20 rounded-full text-melkingDarkBlue hover:text-[#D3B66C]"
                                    aria-label={label}
                                    type="button"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center transition-all duration-200 rounded-full shadow-sm">
                                        <Icon size={22} />
                                    </div>
                                    {hovered === id && (
                                        <span className="absolute top-full mt-1 right-1/2 translate-x-1/2 whitespace-nowrap bg-[#1C2E4E] text-white text-xs font-medium px-2 py-0.5 rounded shadow-lg z-10">
                                            {label}
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 bg-[#D3B66C] hover:bg-[#e6c980] transition text-[#1C2E4E] px-4 py-1.5 rounded-md text-sm shadow-sm"
                            >
                                <LogIn size={16} />
                                ورود | ثبت‌نام
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </header>
    );
}
