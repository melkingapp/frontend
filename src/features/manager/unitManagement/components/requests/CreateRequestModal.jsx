import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createRequest, clearError } from "../../slices/requestsSlice";
import { fetchUnits } from "../../slices/unitsSlice";
import SelectField from "../../../../../shared/components/shared/inputs/SelectField";
import InputField from "../../../../../shared/components/shared/inputs/InputField";

export default function CreateRequestModal({ isOpen, onClose, buildingId, onSuccess }) {
    const dispatch = useDispatch();
    const { createLoading, error } = useSelector(state => state.requests);
    const { units } = useSelector(state => state.units);
    const user = useSelector(state => state.auth.user);
    
    const [form, setForm] = useState({
        unit_id: "",
        title: "",
        description: "",
    });
    
    const [errors, setErrors] = useState({});

    // Fetch units when modal opens
    useEffect(() => {
        if (isOpen && buildingId) {
            dispatch(fetchUnits(buildingId));
        }
    }, [isOpen, buildingId, dispatch]);

    // Clear errors when modal closes
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearError());
            setErrors({});
            setForm({
                unit_id: "",
                title: "",
                description: "",
            });
        }
    }, [isOpen, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear validation error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Clear Redux error when user starts typing
        if (error) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!form.unit_id) {
            newErrors.unit_id = "انتخاب واحد الزامی است";
        }
        if (!form.title || !form.title.trim()) {
            newErrors.title = "عنوان درخواست الزامی است";
        }
        if (!form.description || !form.description.trim()) {
            newErrors.description = "توضیحات درخواست الزامی است";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!buildingId) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }

        try {
            await dispatch(createRequest({
                buildingId,
                requestData: {
                    unit_id: parseInt(form.unit_id),
                    title: form.title.trim(),
                    description: form.description.trim(),
                }
            })).unwrap();
            
            toast.success("درخواست با موفقیت ایجاد شد");
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Error creating request:", error);
            toast.error(error || "خطا در ایجاد درخواست");
        }
    };

    // Filter units to show only user's units
    // IMPORTANT: Only check by phone_number and tenant_phone_number
    // Do NOT check by owner ID because multiple units can have the same owner ID but different phone numbers
    // The user should only see units where their phone number matches the unit's phone_number or tenant_phone_number
    const userPhone = user?.phone_number || user?.phone || user?.username;
    const userPhoneStr = userPhone ? userPhone.toString().trim() : '';
    
    const userUnits = userPhoneStr ? units.filter(unit => {
        // 1. Check by owner phone number
        if (unit.phone_number) {
            const unitPhone = unit.phone_number.toString().trim();
            if (unitPhone === userPhoneStr) {
                return true;
            }
        }
        
        // 2. Check by tenant phone number
        if (unit.tenant_phone_number) {
            const tenantPhone = unit.tenant_phone_number.toString().trim();
            if (tenantPhone === userPhoneStr) {
                return true;
            }
        }
        
        return false;
    }) : [];
    
    // Debug logging
    if (isOpen && units.length > 0) {
        console.log('🔍 CreateRequestModal - Filtering units:', {
            totalUnits: units.length,
            userPhone: userPhoneStr,
            userId: user?.id,
            userUnitsCount: userUnits.length,
            userUnits: userUnits.map(u => ({
                unit_number: u.unit_number,
                phone_number: u.phone_number,
                tenant_phone_number: u.tenant_phone_number,
                owner: u.owner
            }))
        });
    }

    // Prepare unit options for select (only user's units)
    const unitOptions = userUnits.map(unit => ({
        value: unit.units_id || unit.id,
        label: `واحد ${unit.unit_number || 'نامشخص'} - طبقه ${unit.floor || 'نامشخص'}`
    }));

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        ایجاد درخواست جدید
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <SelectField
                                        label="واحد"
                                        name="unit_id"
                                        value={form.unit_id}
                                        onChange={handleChange}
                                        options={unitOptions}
                                        error={errors.unit_id}
                                        disabled={createLoading || userUnits.length === 0}
                                    />

                                    {userUnits.length === 0 && (
                                        <p className="text-sm text-gray-500 mb-4">
                                            هیچ واحدی برای شما در این ساختمان یافت نشد
                                        </p>
                                    )}

                                    <InputField
                                        label="عنوان درخواست"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="مثلاً تعمیر آسانسور"
                                        error={errors.title}
                                        required
                                        disabled={createLoading}
                                    />

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            توضیحات درخواست <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="توضیحات کامل درخواست را وارد کنید..."
                                            rows={4}
                                            required
                                            disabled={createLoading}
                                            className={`w-full px-4 py-3 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] transition ${
                                                errors.description ? "border-red-500" : "border-gray-200"
                                            } ${createLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-600">{error}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={createLoading}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                                        >
                                            انصراف
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createLoading || userUnits.length === 0}
                                            className="px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {createLoading ? "در حال ایجاد..." : "ایجاد درخواست"}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

