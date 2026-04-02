import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeftCircle } from "lucide-react";
import InputField from "../../../shared/components/shared/inputs/InputField";
import Button from "../../../shared/components/shared/feedback/Button";

const phoneSchema = yup.object().shape({
    phone: yup
        .string()
        .required("شماره موبایل الزامی است")
        .matches(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});

export default function PhoneInputForm({ phone, setPhone, onSubmit, onBack, role, loading = false }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { phone },
        resolver: yupResolver(phoneSchema),
        mode: "onSubmit",
    });

    const handleFormSubmit = (data) => {
        setPhone(data.phone);
        onSubmit(data.phone);
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

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <InputField
                        label="شماره موبایل"
                        placeholder="مثلاً 09121234567"
                        type="tel"
                        {...register("phone")}
                        error={errors.phone?.message}
                        required
                        dir="ltr"
                    />

                    <div className="space-y-3 flex flex-col items-center">
                        <Button
                            type="submit"
                            color="gold"
                            size="large"
                            loading={loading}
                            className="w-full !max-w-none"
                        >
                            دریافت کد تأیید
                        </Button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-melkingVeryDark transition"
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
