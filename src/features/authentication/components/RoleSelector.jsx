import { useNavigate } from "react-router-dom";
import { Building2, Home } from "lucide-react";

export default function RoleSelector() {
    const navigate = useNavigate();

    const handleSelect = (role) => {
        navigate(`/login/${role}`);
    };

    return (
        <div className="h-[96dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#0B111A] to-[#1C2E4E] p-6 overflow-hidden">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">ورود به پنل ساختمان</h1>
                <p className="text-gray-300 text-sm md:text-base">لطفاً نوع حساب کاربری خود را انتخاب کنید:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
                <button
                    onClick={() => handleSelect("manager")}
                    className="bg-melkingGold text-melkingVeryDark p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                    <Building2 className="w-12 h-12" />
                    <span className="text-lg font-bold">مدیر ساختمان هستم</span>
                </button>

                <button
                    onClick={() => handleSelect("resident")}
                    className="bg-white text-[#1C2E4E] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                    <Home className="w-12 h-12" />
                    <span className="text-lg font-bold">ساکن هستم</span>
                </button>
            </div>
        </div>
    );
}
