/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { RefreshCcw, Edit3 } from "lucide-react";

export default function OtpVerificationForm({ otp, setOtp, onVerify, onBack, loading }) {
    const inputsRef = useRef([]);
    const [timer, setTimer] = useState(60);
    const [resendVisible, setResendVisible] = useState(false);
    const [otpError, setOtpError] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
            return () => clearTimeout(countdown);
        } else {
            setResendVisible(true);
        }
    }, [timer]);

    const focusInput = (index) => {
        const el = inputsRef.current[index];
        if (el) el.focus();
    };

    const getOtpValue = () => inputsRef.current.map((el) => el?.value || "").join("");

    const handleOtpInput = (e, index) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length > 1) {
            value.split("").forEach((digit, i) => {
                if (i < 5) inputsRef.current[i].value = digit;
            });
            const otpValue = getOtpValue();
            setOtp(otpValue);
            if (otpValue.length === 5) {
               // Auto-submit removed for better UX/control
               focusInput(4);
            } else {
               focusInput(otpValue.length);
            }
            return;
        }

        e.target.value = value;
        if (value && index < 4) focusInput(index + 1);

        const otpValue = getOtpValue();
        setOtp(otpValue);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            focusInput(index - 1);
        }
    };

    const handleSubmit = (enteredOtp) => {
        if (enteredOtp.length !== 5) {
            setOtpError(true);
            return;
        }

        setOtpError(false);
        onVerify(enteredOtp);
    };

    const handleResend = () => {
        setTimer(60);
        setResendVisible(false);
        setOtpError(false);
        inputsRef.current.forEach((el) => el && (el.value = ""));
        focusInput(0);
        setOtp("");
        // API call logic would go here
    };

    useEffect(() => {
        focusInput(0);
    }, []);

    const isFormValid = (otp?.length === 5);

    return (
        <div className="h-[90dvh] flex items-center justify-center bg-gradient-to-br from-[#0B111A] to-[#1C2E4E] p-6 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 text-right w-full max-w-sm">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-melkingVeryDark mb-2">
                        تأیید شماره موبایل
                    </h2>
                    <p className="text-sm text-gray-500">
                        کد ۵ رقمی ارسال‌شده را وارد کنید:
                    </p>
                </div>

                <div className="flex justify-center gap-3 mt-4" dir="ltr">
                    {Array(5)
                        .fill("")
                        .map((_, index) => (
                            <input
                                key={index}
                                aria-label={`رقم ${index + 1}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className={`w-12 h-12 border rounded-xl text-center text-lg font-bold shadow-sm focus:outline-none transition
                                ${otpError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-melkingGold"}
                                `}
                                ref={(el) => (inputsRef.current[index] = el)}
                                onChange={(e) => handleOtpInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                </div>

                {otpError && (
                    <p className="text-red-500 text-sm text-center mt-2">
                        کد تأیید نامعتبر است.
                    </p>
                )}

                <button
                    onClick={() => handleSubmit(getOtpValue())}
                    disabled={!isFormValid || loading}
                    className="w-full bg-melkingGold text-white py-3 rounded-xl font-bold text-base hover:bg-[#16243f] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>در حال ورود...</span>
                        </>
                    ) : (
                        "ورود به سامانه"
                    )}
                </button>

                <div className="text-center text-sm text-gray-500">
                    {timer > 0 ? (
                        <>ارسال مجدد کد تا {timer} ثانیه دیگر</>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="flex items-center justify-center gap-2 text-gray-500 hover:text-melkingVeryDark transition mx-auto"
                        >
                            <RefreshCcw size={16} />
                            ارسال مجدد کد
                        </button>
                    )}
                </div>

                <button
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-melkingVeryDark transition mx-auto" >
                    <Edit3 size={16} />
                    ویرایش شماره موبایل
                </button>
            </div>
        </div>
    );
}
