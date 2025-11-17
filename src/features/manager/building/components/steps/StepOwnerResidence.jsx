import InputField from "../../../../../shared/components/shared/inputs/InputField";
import StepNavigation from "./StepNavigation";

export default function StepOwnerResidence({ formData, setFormData, next, prev }) {
    // اعتبارسنجی: نام و نام خانوادگی حتما باید پر باشند
    // اگر مدیر ساکن است، طبقه محل سکونت هم باید پر باشد
    const isValid =
        formData.name?.trim() &&
        (!formData.is_owner_resident || formData.resident_floor !== "");

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                <h2
                    className="text-2xl font-bold text-center mb-10 text-melkingDarkBlue" >
                    مرحله ۲: اطلاعات مدیر ساکن
                </h2>

                <div className="space-y-6">
                    <InputField
                        label="نام و نام خانوادگی مدیر / مالک"
                        type="text"
                        placeholder="مثلاً علی"
                        value={formData.name || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />

                    <div className="flex items-center gap-3">
                        <input
                            id="is_owner_resident"
                            type="checkbox"
                            checked={formData.is_owner_resident || false}
                            onChange={(e) =>
                                setFormData({ ...formData, is_owner_resident: e.target.checked })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-[#2C5A8C]"
                        />
                        <label
                            htmlFor="is_owner_resident"
                            className="text-gray-700 font-medium select-none cursor-pointer"
                        >
                            مدیر در این ساختمان ساکن / مالک است؟
                        </label>
                    </div>

                    {/* طبقه محل سکونت */}
                    {formData.is_owner_resident && (
                        <InputField
                            label="واحد سکونت مدیر"
                            type="number"
                            placeholder="مثلاً ۳"
                            value={formData.resident_floor || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, resident_floor: e.target.value })
                            }
                        />
                    )}
                </div>

                <StepNavigation
                    onPrev={prev}
                    onNext={next}
                    isNextDisabled={!isValid}
                />
            </div>
        </div>
    );
}
