import { useState, useRef } from "react";
import { X, Wrench, AlertCircle } from "lucide-react";
import UploadFileInput from "../../../../../shared/components/shared/inputs/UploadFileInput";
import CheckboxGroup from "../../../../../shared/components/shared/inputs/CheckboxGroup";
import useClickOutside from "../../../../../shared/hooks/useClickOutside";
import fakeImage from "../../../../../assets/images/factor.jpg";

export default function CreateServiceModal({ isOpen, onClose, onSubmit }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        longDesc: "",
        contact: "",
        attachment: null,
        target: "",
    });

    const [errors, setErrors] = useState({});
    const modalRef = useRef();
    useClickOutside(modalRef, () => onClose());

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "attachment") {
            setForm((prev) => ({ ...prev, attachment: files[0] || null }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFilesChange = (files) => {
        setForm((prev) => ({ ...prev, attachment: files[0] || null }));
    };

    const handleTargetChange = (value) => {
        setForm((prev) => ({ ...prev, target: value }));
        setErrors((prev) => ({ ...prev, target: "" }));
    };

    const handleSubmit = () => {
        let newErrors = {};
        if (!form.title.trim()) newErrors.title = "این فیلد اجباری است.";
        if (!form.description.trim()) newErrors.description = "این فیلد اجباری است.";
        if (!form.longDesc.trim()) newErrors.longDesc = "این فیلد اجباری است.";
        if (!form.target) newErrors.target = "لطفاً یک مورد را انتخاب کنید.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const newService = {
            id: Date.now(),
            title: form.title,
            description: form.description,
            longDesc: form.longDesc,
            contact: form.contact,
            createdAt: new Date().toISOString(),
            attachment: form.attachment, // ارسال فایل اصلی
            attachmentUrl: form.attachment ? URL.createObjectURL(form.attachment) : fakeImage,
            target: form.target,
        };

        onSubmit(newService);
        onClose();
        setForm({
            title: "",
            description: "",
            longDesc: "",
            contact: "",
            attachment: null,
            target: "",
        });
        setErrors({});
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]"
            >
                <button
                    onClick={onClose}
                    aria-label="بستن"
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-melkingDarkBlue mb-4 flex items-center gap-2">
                    <Wrench size={20} /> ایجاد سرویس جدید
                </h2>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">عنوان</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition
                                ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
                            placeholder="عنوان سرویس را وارد کنید"
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle size={16} /> {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">توضیحات کوتاه</label>
                        <input
                            type="text"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition
                                ${errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
                            placeholder="توضیح کوتاه سرویس"
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle size={16} /> {errors.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">توضیحات کامل</label>
                        <textarea
                            name="longDesc"
                            value={form.longDesc}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg resize-y focus:outline-none focus:ring-2 transition
                                ${errors.longDesc ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
                            placeholder="توضیحات کامل سرویس"
                        />
                        {errors.longDesc && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle size={16} /> {errors.longDesc}
                            </p>
                        )}
                    </div>

                    <UploadFileInput label="فایل پیوست" onFilesChange={handleFilesChange} />

                    <CheckboxGroup
                        label="مربوط به"
                        options={[
                            { value: "resident", label: "ساکن" },
                            { value: "owner", label: "مالک" },
                            { value: "both", label: "هردو" },
                        ]}
                        selectedValues={form.target ? [form.target] : []}
                        onChange={handleTargetChange}
                        error={errors.target}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-xl bg-melkingDarkBlue text-white hover:bg-indigo-700 transition"
                    >
                        ثبت سرویس
                    </button>
                </div>
            </div>
        </div>
    );
}