import InputField from "../../../../../shared/components/shared/inputs/InputField";
import SelectField from "../../../../../shared/components/shared/inputs/SelectField";
import StepNavigation from "./StepNavigation";

export default function StepInfo({ formData, setFormData, next }) {
    const isValid =
        formData.title &&
        formData.usage_type &&
        formData.property_type &&
        formData.unit_count &&
        (!["complex", "community"].includes(formData.property_type) || formData.blocks_count);

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                <h2
                    className="text-2xl font-bold text-center mb-10 text-melkingDarkBlue">
                    مرحله ۱: مشخصات کلی ملک
                </h2>

                <div className="space-y-6">
                    {/* فیلدهای ورودی */}
                    <InputField
                        label="عنوان ساختمان"
                        placeholder="مثلاً برج نیکان"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    <SelectField
                        label="کاربری ساختمان"
                        value={formData.usage_type}
                        onChange={(e) => setFormData({ ...formData, usage_type: e.target.value })}
                        options={[
                            { value: "residential", label: "مسکونی" },
                            { value: "commercial", label: "تجاری" },
                            { value: "office", label: "اداری" },
                            { value: "other", label: "سایر" },
                        ]}
                    />

                    <SelectField
                        label="نوع ملک"
                        value={formData.property_type}
                        onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                        options={[
                            { value: "block", label: "بلوک" },
                            { value: "tower", label: "برج" },
                            { value: "complex", label: "مجتمع" },
                            { value: "community", label: "شهرک" },
                            { value: "building", label: "ساختمان" },
                        ]}
                    />

                    {["complex", "community"].includes(formData.property_type) && (
                        <InputField
                            label="تعداد بلوک‌ها"
                            type="number"
                            placeholder="مثلاً ۵"
                            value={formData.blocks_count}
                            onChange={(e) => setFormData({ ...formData, blocks_count: e.target.value })}
                        />
                    )}

                    <InputField
                        label="تعداد واحد"
                        type="number"
                        placeholder="مثلاً ۱۰"
                        value={formData.unit_count}
                        onChange={(e) => setFormData({ ...formData, unit_count: e.target.value })}
                    />
                </div>

                <StepNavigation
                    onPrev={null} 
                    onNext={next}
                    isNextDisabled={!isValid}
                    hidePrev={true} 
                    nextLabel="مرحله بعد"
                />

            </div>
        </div>
    );
}
