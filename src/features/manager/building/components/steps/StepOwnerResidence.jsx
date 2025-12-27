import InputField from "../../../../../shared/components/shared/inputs/InputField";
import SelectField from "../../../../../shared/components/shared/inputs/SelectField";
import StepNavigation from "./StepNavigation";

export default function StepOwnerResidence({ formData, setFormData, next, prev }) {
    // اعتبارسنجی: نام و نام خانوادگی حتما باید پر باشند
    // اگر مدیر ساکن است، فیلدهای واحد مدیر هم باید پر باشند
    const isManagerResident = formData.is_owner_resident;
    const isValid =
        formData.name?.trim() &&
        (!isManagerResident || (
            formData.manager_unit_number?.trim() &&
            formData.manager_floor !== "" &&
            formData.manager_role &&
            (!(formData.manager_role === 'owner') || formData.manager_owner_type) &&
            (!(formData.manager_owner_type === 'landlord') || (formData.manager_tenant_full_name?.trim() && formData.manager_tenant_phone_number?.trim()))
        ));

    return (
        <div className="flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
                <h2
                    className="text-2xl font-bold text-center mb-10 text-melkingDarkBlue" >
                    مرحله ۲: اطلاعات مدیر ساختمان
                </h2>

                <div className="space-y-6">
                    <InputField
                        label="نام و نام خانوادگی مدیر ساختمان"
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

                    {/* اطلاعات واحد مدیر */}
                    {formData.is_owner_resident && (
                        <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات واحد مدیر</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="شماره واحد *"
                                    type="text"
                                    placeholder="مثلاً 1 یا مدیر"
                                    value={formData.manager_unit_number || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, manager_unit_number: e.target.value })
                                    }
                                />
                                <InputField
                                    label="شماره طبقه"
                                    type="number"
                                    placeholder="مثلاً 3"
                                    value={formData.manager_floor || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, manager_floor: e.target.value, resident_floor: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="متراژ واحد (متر مربع)"
                                    type="number"
                                    placeholder="مثلاً 75"
                                    value={formData.manager_area || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, manager_area: e.target.value })
                                    }
                                />
                                <InputField
                                    label="تعداد نفرات"
                                    type="number"
                                    placeholder="مثلاً 3"
                                    min="1"
                                    value={formData.manager_resident_count || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, manager_resident_count: e.target.value })
                                    }
                                    disabled={formData.manager_role === 'owner' && formData.manager_owner_type === 'empty'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="تعداد پارکینگ"
                                    type="number"
                                    placeholder="مثلاً 1"
                                    min="0"
                                    value={formData.manager_parking_count || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, manager_parking_count: e.target.value })
                                    }
                                />
                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        id="manager_has_parking"
                                        type="checkbox"
                                        checked={formData.manager_has_parking || false}
                                        onChange={(e) =>
                                            setFormData({ ...formData, manager_has_parking: e.target.checked })
                                        }
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-[#2C5A8C]"
                                    />
                                    <label
                                        htmlFor="manager_has_parking"
                                        className="text-gray-700 font-medium select-none cursor-pointer"
                                    >
                                        پارکینگ دارد
                                    </label>
                                </div>
                            </div>

                            <SelectField
                                label="نقش"
                                name="manager_role"
                                value={formData.manager_role || ""}
                                onChange={(e) => {
                                    const newData = { ...formData, manager_role: e.target.value };
                                    // اگر نقش تغییر کرد، نوع مالک را پاک کن
                                    if (e.target.value !== 'owner') {
                                        newData.manager_owner_type = '';
                                    }
                                    setFormData(newData);
                                }}
                                options={[
                                    { value: "owner", label: "مالک" },
                                    { value: "tenant", label: "ساکن" },
                                ]}
                            />

                            {/* اگر نقش مالک بود، نوع مالک را نمایش بده */}
                            {formData.manager_role === "owner" && (
                                <SelectField
                                    label="نوع مالک"
                                    name="manager_owner_type"
                                    value={formData.manager_owner_type || ""}
                                    onChange={(e) => {
                                        const newData = { ...formData, manager_owner_type: e.target.value };
                                        // اگر واحد خالی انتخاب شد، تعداد نفرات را 0 کن
                                        if (e.target.value === 'empty') {
                                            newData.manager_resident_count = 0;
                                        }
                                        // اگر دارای مستاجر نبود، اطلاعات مستاجر را پاک کن
                                        if (e.target.value !== 'landlord') {
                                            newData.manager_tenant_full_name = '';
                                            newData.manager_tenant_phone_number = '';
                                        }
                                        setFormData(newData);
                                    }}
                                    options={[
                                        { value: "empty", label: "واحد خالی" },
                                        { value: "resident", label: "مالک مقیم" },
                                        { value: "landlord", label: "دارای مستاجر" },
                                    ]}
                                />
                            )}

                            {/* اگر مالک دارای مستاجر است، اطلاعات مستاجر را نمایش بده */}
                            {formData.manager_role === "owner" && formData.manager_owner_type === "landlord" && (
                                <div className="space-y-4 p-3 bg-white rounded-lg border border-gray-200">
                                    <h4 className="text-md font-semibold text-gray-800">اطلاعات مستاجر</h4>
                                    <InputField
                                        label="نام و نام خانوادگی مستاجر"
                                        type="text"
                                        placeholder="مثلاً محمد رضایی"
                                        value={formData.manager_tenant_full_name || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, manager_tenant_full_name: e.target.value })
                                        }
                                    />
                                    <InputField
                                        label="شماره تماس مستاجر"
                                        type="text"
                                        placeholder="مثلاً 09123456789"
                                        value={formData.manager_tenant_phone_number || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, manager_tenant_phone_number: e.target.value })
                                        }
                                    />
                                </div>
                            )}
                        </div>
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
