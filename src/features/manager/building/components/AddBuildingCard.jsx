import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import Button from "../../../../shared/components/shared/feedback/Button";

export default function AddBuildingCard() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md text-center">
            <Home className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm mb-6">
                برای شروع مدیریت، لطفاً ساختمان خود را ایجاد کنید.
            </p>
            <Button size="xlarge" color="darkBlue"
                onClick={() => navigate("/manager/create-building")}
            >
                ایجاد ساختمان
            </Button>
        </div>
    );
}
