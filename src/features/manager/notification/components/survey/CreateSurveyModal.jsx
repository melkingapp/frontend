import { useState, useRef } from "react";
import { X, CheckSquare } from "lucide-react";
import CheckboxGroup from "../../../../../shared/components/shared/inputs/CheckboxGroup";
import useClickOutside from "../../../../../shared/hooks/useClickOutside";
import PersianDatePicker from "../../../../../shared/components/shared/inputs/PersianDatePicker";

export default function CreateSurveyModal({ isOpen, onClose, onSubmit }) {
    const [form, setForm] = useState({
        question: "",
        options: [""],
        endDate: "",
        multiSelect: false,
        showAnonymous: true,
        targetRole: "",
    });
    const [error, setError] = useState("");

    const modalRef = useRef();
    useClickOutside(modalRef, () => onClose());

    const roleOptions = [
        { value: "owner", label: "مالک" },
        { value: "resident", label: "ساکن" },
        { value: "both", label: "هردو" },
    ];

    const handleChange = (key, value) => setForm({ ...form, [key]: value });

    const handleOptionChange = (index, value) => {
        const newOptions = [...form.options];
        newOptions[index] = value;
        handleChange("options", newOptions);
    };

    const addOption = () => handleChange("options", [...form.options, ""]);
    const removeOption = (index) =>
        handleChange(
            "options",
            form.options.filter((_, i) => i !== index)
        );

    const handleRoleChange = (value) => {
        handleChange("targetRole", value);
        setError("");
    };

    const handleSubmit = () => {
        let newError = "";

        if (!form.question.trim()) {
            newError = "لطفاً سوال نظرسنجی را وارد کنید.";
        } else if (form.options.length < 2 || form.options.some((opt) => !opt.trim())) {
            newError = "لطفاً حداقل دو گزینه معتبر وارد کنید.";
        } else if (!form.endDate) {
            newError = "لطفاً تاریخ پایان را انتخاب کنید.";
        } else if (!form.targetRole) {
            newError = "لطفاً یک هدف انتخاب کنید.";
        }

        if (newError) {
            setError(newError);
            return;
        }

        const newSurvey = {
            id: Date.now(),
            question: form.question,
            options: form.options,
            endDate: form.endDate.toDate().getTime(), // توجه: تبدیل به timestamp
            multiSelect: form.multiSelect,
            showAnonymous: form.showAnonymous,
            target: form.targetRole,
            createdAt: Date.now(),
            status: "pending",
        };

        onSubmit(newSurvey);
        onClose();
        setForm({
            question: "",
            options: [""],
            endDate: "",
            multiSelect: false,
            showAnonymous: true,
            targetRole: "",
        });
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh]"
            >
                <button
                    onClick={onClose}
                    aria-label="بستن"
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                    <CheckSquare size={20} /> ایجاد نظرسنجی جدید
                </h2>

                {error && (
                    <p className="text-red-600 text-sm mb-3 flex items-center gap-1">
                        <X size={16} />
                        {error}
                    </p>
                )}

                <div className="mb-4">
                    <label className="flex items-center gap-2 text-gray-700 mb-2 font-medium">
                        <CheckSquare size={18} />
                        سوال نظرسنجی
                    </label>
                    <input
                        type="text"
                        placeholder="سوال خود را وارد کنید..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue transition"
                        value={form.question}
                        onChange={(e) => handleChange("question", e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="flex items-center gap-2 text-gray-700 mb-2 font-medium">
                        <CheckSquare size={18} />
                        گزینه‌ها
                    </label>
                    <div className="flex flex-col gap-2">
                        {form.options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder={`گزینه ${idx + 1}`}
                                    className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue transition"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                />
                                {form.options.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-500 font-bold text-xl hover:text-red-700 transition"
                                        onClick={() => removeOption(idx)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="mt-2 text-melkingDarkBlue font-semibold hover:text-melkingGold transition"
                            onClick={addOption}
                        >
                            + افزودن گزینه
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="flex items-center gap-2 text-gray-700 mb-2 font-medium">
                        <CheckSquare size={18} />
                        تاریخ پایان
                    </label>
                    <PersianDatePicker
                        value={form.endDate}
                        onChange={(date) => handleChange("endDate", date)}
                        placeholder="تاریخ پایان را انتخاب کنید"
                    />
                </div>

                <div className="mb-4 flex flex-col gap-4">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={form.multiSelect}
                            onChange={(e) => handleChange("multiSelect", e.target.checked)}
                        />
                        می‌توان یک یا چند مورد را انتخاب کرد
                    </label>
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={form.showAnonymous}
                            onChange={(e) => handleChange("showAnonymous", e.target.checked)}
                        />
                        نمایش افراد ناشناس
                    </label>
                </div>

                <CheckboxGroup
                    label="مربوط به"
                    options={roleOptions}
                    selectedValues={form.targetRole ? [form.targetRole] : []}
                    onChange={handleRoleChange}
                    error={error}
                />

                <div className="flex justify-end gap-3 mt-5">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        onClick={onClose}
                    >
                        لغو
                    </button>
                    <button
                        className="px-5 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                        onClick={handleSubmit}
                    >
                        ایجاد
                    </button>
                </div>
            </div>
        </div>
    );
}