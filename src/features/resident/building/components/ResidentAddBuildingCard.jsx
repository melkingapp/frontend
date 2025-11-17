import { useState } from "react";
import { Home, Building2, LogIn } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../../../shared/components/shared/feedback/Button";
import BuildingRequestForm from "./BuildingRequestForm";
import BuildingRequestStatus from "./BuildingRequestStatus";

export default function ResidentAddBuildingCard() {
    const [showForm, setShowForm] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const handleRequestSuccess = () => {
        setShowForm(false);
        setShowStatus(true);
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md text-center">
                <LogIn className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ورود به سیستم
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md">
                    برای ارسال درخواست عضویت در ساختمان، ابتدا باید وارد حساب کاربری خود شوید.
                </p>
                
                <Button 
                    size="large" 
                    color="darkBlue"
                    onClick={handleLoginRedirect}
                    className="flex items-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    ورود به سیستم
                </Button>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="space-y-4">
                <BuildingRequestForm onSuccess={handleRequestSuccess} />
                <Button 
                    size="medium" 
                    color="gray"
                    onClick={() => setShowForm(false)}
                >
                    بازگشت
                </Button>
            </div>
        );
    }

    if (showStatus) {
        return (
            <div className="space-y-4">
                <BuildingRequestStatus />
                <Button 
                    size="medium" 
                    color="gray"
                    onClick={() => setShowStatus(false)}
                >
                    بازگشت
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md text-center">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                عضویت در ساختمان
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
                برای دسترسی به اطلاعات ساختمان خود، کد 7 رقمی ساختمان را از مدیر دریافت کرده و درخواست عضویت ارسال کنید.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button 
                    size="large" 
                    color="darkBlue"
                    onClick={() => setShowForm(true)}
                    className="flex-1"
                >
                    <Home className="w-5 h-5 ml-2" />
                    ارسال درخواست عضویت
                </Button>
                
                <Button 
                    size="large" 
                    color="gray"
                    onClick={() => setShowStatus(true)}
                    className="flex-1"
                >
                    <Building2 className="w-5 h-5 ml-2" />
                    وضعیت درخواست‌ها
                </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
                <p className="text-xs text-blue-800">
                    💡 <strong>راهنما:</strong> کد ساختمان را از مدیر ساختمان دریافت کنید. 
                    پس از تایید درخواست، به تمام اطلاعات ساختمان دسترسی خواهید داشت.
                </p>
            </div>
        </div>
    );
}

