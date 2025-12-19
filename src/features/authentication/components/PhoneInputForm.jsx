import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeftCircle } from "lucide-react";

const phoneSchema = yup.object().shape({
    phone: yup
        .string()
        .required("شماره موبایل الزامی است")
        .matches(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});

export default function PhoneInputForm({ phone, setPhone, onSubmit, onBack, role, loading }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { phone },
        resolver: yupResolver(phoneSchema),
        mode: "onSubmit",
    });

    const handleFormSubmit = (data) => {
        console.log('Form submitted with phone:', data.phone);
        setPhone(data.phone);
        onSubmit(data.phone); // پاس دادن شماره به والد
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-[#0B111A] to-[#1C2E4E] overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-8 text-right w-full max-w-md mx-auto">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-melkingVeryDark mb-2">
                        ورود به عنوان {role === "manager" ? "مدیر ساختمان" : "ساکن"}
                    </h2>
                    <p className="text-sm text-gray-500">لطفاً شماره موبایل خود را وارد کنید:</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">شماره موبایل</label>
                    <input
                        type="tel"
                        {...register("phone")}
                        placeholder="مثلاً 09121234567"
                        className={`w-full border rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none transition 
                            ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-melkingGold focus:ring-2 focus:ring-melkingGold"}`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}

                    <div className="space-y-3 pt-4 flex flex-col">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-melkingGold text-melkingVeryDark py-3 rounded-xl font-bold text-base hover:bg-[#c6a952] transition flex items-center justify-center gap-2 ${loading ? "opacity-80 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-melkingVeryDark border-t-transparent rounded-full animate-spin"></div>
                                    <span>در حال پردازش...</span>
                                </>
                            ) : (
                                "دریافت کد تأیید"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-melkingVeryDark transition mx-auto"
                        >
                            <ArrowLeftCircle size={16} />
                            بازگشت به انتخاب نقش
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
