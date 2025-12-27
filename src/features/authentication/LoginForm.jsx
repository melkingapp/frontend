import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../authentication/authSlice";
import { sendOtp, verifyOtp, login as authLogin } from "../../shared/services/authService";
import { sanitizeUser } from "../../shared/utils/security";

import PhoneInputForm from "./components/PhoneInputForm";
import OtpVerificationForm from "./components/OtpVerificationForm";

export default function LoginForm() {
    const { role } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    console.log("phone:", phone);
    console.log("otp:", otp);
    console.log("role:", role);

    useEffect(() => {
        if (role !== "manager" && role !== "resident") {
            navigate("/login", { replace: true });
        }
    }, [role, navigate]);

    const handleSendOtp = async (phoneFromForm) => {
        const phoneNumber = phoneFromForm || phone;
        console.log(`ارسال کد برای شماره ${phoneNumber} نقش: ${role}`);
        
        if (!phoneNumber || !role) {
            setError('شماره تلفن و نقش الزامی است');
            return;
        }
        
        if (!/^09\d{9}$/.test(phoneNumber)) {
            setError('فرمت شماره تلفن نامعتبر است');
            return;
        }
        
        setPhone(phoneNumber); // به‌روزرسانی state
        setLoading(true);
        setError('');
        
        try {
            const data = await sendOtp(phoneNumber, role);
            console.log('Send OTP Response:', data);
            
            console.log('کد ارسال شد:', data.otp); // فقط برای توسعه
            if (data.otp) {
                console.log(`🔐 کد تایید: ${data.otp}`); // نمایش در کنسول
            }
            setStep(2);
            setError('');
        } catch (error) {
            console.error('خطا در ارسال کد:', error);
            setError(error.response?.data?.error || 'خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        const codeToVerify = otpCode || otp;
        
        if (codeToVerify.length !== 5) {
            setError('کد تایید باید 5 رقم باشد');
            return; 
        }

        setLoading(true);
        setError('');

        try {
            console.log('Verifying OTP:', { phone_number: phone, role: role, otp: codeToVerify });
            
            const data = await verifyOtp(phone, role, codeToVerify);
            console.log('Verify response:', data);
            
            // ذخیره توکن در localStorage
            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);
            
            const sanitizedUser = sanitizeUser(data.user);

            dispatch(login({ 
                phone: data.user.phone_number, 
                role: data.user.role,
                user: sanitizedUser
            }));
            
            // ذخیره در authService
            await authLogin(data.tokens.access, data.tokens.refresh, sanitizedUser);
            
            // هدایت بر اساس نقش کاربر و صفحه قبلی
            const from = location.state?.from?.pathname || '/';
            
            if (data.user.role === 'manager') {
                // اگر کاربر از صفحه manager آمده یا به آن نیاز دارد
                if (from.startsWith('/manager') || location.state?.from) {
                    navigate(from, { replace: true });
                } else {
                    navigate("/manager", { replace: true });
                }
            } else if (data.user.role === 'resident') {
                // اگر کاربر از صفحه resident آمده یا به آن نیاز دارد
                if (from.startsWith('/resident') || location.state?.from) {
                    navigate(from, { replace: true });
                } else {
                    navigate("/resident", { replace: true });
                }
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error('خطا در تایید کد:', error);
            setError(error.response?.data?.error || 'خطا در تایید کد. لطفاً دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[94vh]flex items-center justify-center bg-[#F4F6FA]">
            <div className="bg-white w-full rounded-xl text-center">
                <h2 className="text-lg font-bold text-melkingDarkBlue mb-4">
                    ورود به سامانه ملکینگ
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <PhoneInputForm
                        phone={phone}
                        setPhone={setPhone}
                        onSubmit={handleSendOtp}
                        onBack={() => navigate("/login")}
                        role={role}
                        loading={loading}
                        error={error}
                    />
                )}

                {step === 2 && (
                    <OtpVerificationForm
                        otp={otp}
                        setOtp={setOtp}
                        onVerify={handleVerifyOtp}
                        onBack={() => setStep(1)}
                        role={role}
                        loading={loading}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
}
