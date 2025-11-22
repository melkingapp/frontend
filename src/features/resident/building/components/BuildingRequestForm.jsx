import { useState } from "react";
import { Building2, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import Button from "../../../../shared/components/shared/feedback/Button";
import InputField from "../../../../shared/components/shared/inputs/InputField";
import { fetchResidentRequests } from "../residentBuildingSlice";

export default function BuildingRequestForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        building_code: "",
        full_name: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const dispatch = useDispatch();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.building_code.trim()) {
            setError("کد ساختمان الزامی است");
            return;
        }

        if (formData.building_code.length !== 7) {
            setError("کد ساختمان باید 7 رقم باشد");
            return;
        }

        if (!formData.full_name.trim()) {
            setError("نام و نام خانوادگی الزامی است");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem('access_token');
            const getApiBaseURL = () => {
                if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                    return isLocalhost ? 'http://localhost:8000/api/v1' : 'http://171.22.25.201:9000/api/v1';
                }
                return 'http://localhost:8000/api/v1';
            };
            const response = await fetch(`${getApiBaseURL()}/buildings/resident-requests/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setFormData({ building_code: "", full_name: "", message: "" });
                // Refresh requests list
                dispatch(fetchResidentRequests());
                if (onSuccess) {
                    onSuccess(data.request);
                }
            } else {
                // Handle specific error cases
                if (data.error) {
                    if (data.error.includes('در انتظار تایید')) {
                        setError('درخواست شما برای این ساختمان در انتظار تایید است. لطفاً منتظر بمانید.');
                    } else if (data.error.includes('عضو این ساختمان شده‌اید')) {
                        setError('شما قبلاً عضو این ساختمان شده‌اید.');
                    } else {
                        setError(data.error);
                    }
                } else {
                    setError('خطا در ارسال درخواست');
                }
            }
        } catch (error) {
            console.error('خطا در ارسال درخواست:', error);
            setError('خطا در ارسال درخواست. لطفاً دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-md text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">درخواست ارسال شد!</h3>
                <p className="text-gray-600 mb-4">
                    درخواست عضویت شما با موفقیت ارسال شد. منتظر تایید مدیر ساختمان باشید.
                </p>
                <Button 
                    size="medium" 
                    color="darkBlue"
                    onClick={() => setSuccess(false)}
                >
                    ارسال درخواست جدید
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-melkingDarkBlue" />
                <h2 className="text-xl font-bold text-gray-800">درخواست عضویت در ساختمان</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <InputField
                        label="نام و نام خانوادگی"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                        required
                    />
                </div>

                <div>
                    <InputField
                        label="کد ساختمان (7 رقم)"
                        name="building_code"
                        value={formData.building_code}
                        onChange={handleInputChange}
                        placeholder="مثال: 1234567"
                        className="text-center text-lg tracking-widest"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        کد ساختمان را از مدیر ساختمان دریافت کنید
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        پیام اضافی (اختیاری)
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="در صورت نیاز، پیام اضافی برای مدیر ساختمان بنویسید..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-melkingDarkBlue focus:border-transparent resize-none"
                    />
                </div>

                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-700 text-sm">
                            درخواست شما با موفقیت ارسال شد! مدیر ساختمان به زودی آن را بررسی خواهد کرد.
                        </span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                <Button
                    type="submit"
                    size="large"
                    color="darkBlue"
                    loading={loading}
                    disabled={!formData.building_code.trim() || !formData.full_name.trim()}
                    className="w-full"
                >
                    <Send className="w-5 h-5 ml-2" />
                    ارسال درخواست
                </Button>
            </form>
        </div>
    );
}
