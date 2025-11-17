import { Dialog } from "@headlessui/react";
import { X, LogOut, LogIn, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../../features/authentication/authSlice";
import { navItems } from "../../../../constants/navigation";

export default function MobileMenu({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-2xl rounded-l-3xl flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-melkingDarkBlue">سامانه مدیریت ساختمان</h2>
                    <button onClick={onClose} aria-label="بستن منو" className="p-2 rounded-full hover:bg-gray-100 transition">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Nav Links - Scrollable */}
                <nav className="flex-grow overflow-y-auto px-6 py-6 space-y-5">
                    {navItems.map(({ label, href }) => (
                        <a
                            key={label}
                            href={href}
                            onClick={onClose}
                            className="
                                flex items-center px-4 py-3 rounded-xl
                                text-base font-semibold text-gray-700
                                hover:bg-[#D3B66C]/20 hover:text-[#927D36]
                                transition-colors duration-300
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]
                                select-none
                                cursor-pointer
                                border border-transparent
                                active:bg-[#c0ad4f]/40
                            "
                        >
                            {label}
                        </a>
                    ))}

                    {/* داشبورد مدیریت */}
                    {isAuthenticated && user?.role === "manager" && (
                        <Link
                            to="/manager"
                            onClick={onClose}
                            className="flex items-center gap-2 text-base font-medium text-melkingDarkBlue hover:text-[#D3B66C] transition"
                        >
                            <UserCircle size={20} />
                            داشبورد مدیریت
                        </Link>
                    )}
                </nav>

                {/* Footer - دکمه خروج یا ورود */}
                <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl text-base font-semibold shadow-md transition"
                        >
                            <LogOut size={20} />
                            خروج
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 bg-[#D3B66C] hover:bg-[#e6c980] text-[#1C2E4E] px-5 py-3 rounded-2xl text-base font-semibold shadow-md transition"
                        >
                            <LogIn size={20} />
                            ورود | ثبت‌نام
                        </Link>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
