import InputField from "../../../../../shared/components/shared/inputs/InputField";
import { formatNumber } from "../../../../../shared/utils/helper";
import ShebaInputGroup from "../../../../../shared/components/shared/inputs/ShebaInputGroup";
import StepNavigation from "./StepNavigation";

export default function StepFund({ formData, setFormData, next, prev }) {

    const handleNext = () => {
        const fullSheba = "IR" +
            (formData.sheba_part0 || "") +
            (formData.sheba_part1 || "") +
            (formData.sheba_part2 || "") +
            (formData.sheba_part3 || "") +
            (formData.sheba_part4 || "") +
            (formData.sheba_part5 || "") +
            (formData.sheba_part6 || "");

        // Only set fund_sheba_number if it's a valid sheba (more than just "IR")
        setFormData(prev => ({
            ...prev,
            fund_sheba_number: fullSheba.length > 2 ? fullSheba : "",
        }));

        next();
    };

    const isValid =
        formData.fund_balance &&
        /^\d+$/.test(formData.fund_balance);

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-10 border border-gray-200">
                <div className="mb-6 sm:mb-8 md:mb-10 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-melkingDarkBlue">
                        مرحله ۳: اطلاعات مالی
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">لطفاً اطلاعات مالی ساختمان را وارد کنید.</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <InputField
                        label="موجودی اولیه صندوق (تومان)"
                        placeholder="مثلاً ۳,۰۰۰,۰۰۰"
                        value={formatNumber(formData.fund_balance)}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, "");
                            if (!/^\d*$/.test(rawValue)) return;
                            setFormData((prev) => ({
                                ...prev,
                                fund_balance: rawValue,
                            }));
                        }}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            شماره شبا صندوق <span className="text-gray-400 text-xs">(اختیاری)</span>
                        </label>
                        <ShebaInputGroup formData={formData} setFormData={setFormData} />
                    </div>
                </div>

                <StepNavigation
                    onPrev={prev}
                    onNext={handleNext}
                    isNextDisabled={!isValid}
                    nextLabel="مرحله بعد"
                />
            </div>
        </div>
    );
}
