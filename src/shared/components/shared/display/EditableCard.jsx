import { Edit, Save, User, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SelectField from "../inputs/SelectField";

export default function EditableCard({ title, data, setData, isEditing, setIsEditing, onSave, loading = false, fields, colorClass }) {
    const handleSave = async () => {
        if (onSave) {
            try {
                await onSave();
                toast.success(`${title} با موفقیت ویرایش شد!`);
            } catch (error) {
                toast.error(`خطا در ویرایش ${title}: ${error.message || 'خطای نامشخص'}`);
            }
        } else {
            console.log("ذخیره:", data);
            setIsEditing(false);
            toast.success(`${title} با موفقیت ویرایش شد!`);
        }
    };

    return (
        <div className={`mb-6 p-5 rounded-2xl border shadow-md ${colorClass} relative`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User /> {title}
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="ml-auto text-gray-500 hover:text-gray-700">
                        <Edit size={16} />
                    </button>
                )}
            </h3>

            {isEditing ? (
                <div className="space-y-3">
                    {fields.map((f) => {
                        // Skip hidden fields (when condition is false)
                        if (f.condition === false) return null;
                        
                        if (f.type === "checkbox") {
                            return (
                                <div key={f.key} className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id={f.key}
                                        checked={data[f.key] || false}
                                        onChange={(e) => setData({ ...data, [f.key]: e.target.checked })}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={f.key} className="text-sm font-medium text-gray-700">
                                        {f.label}
                                    </label>
                                </div>
                            );
                        }
                        
                        if (f.options) {
                            return (
                                <div key={f.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {f.label}
                                    </label>
                                    <SelectField
                                        name={f.key}
                                        value={data[f.key] || ''}
                                        onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                                        options={f.options}
                                        disabled={f.disabled}
                                    />
                                </div>
                            );
                        }
                        
                        return (
                            <div key={f.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {f.label}
                                </label>
                                <input
                                    type={f.type || "text"}
                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${f.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                    value={data[f.key] || ''}
                                    onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                                    placeholder={f.label}
                                    disabled={f.disabled}
                                />
                            </div>
                        );
                    })}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {loading ? 'در حال ذخیره...' : 'ذخیره'}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={loading}
                            className="flex items-center gap-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <XCircle size={16} /> لغو
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {fields.map((f) => {
                        // Skip hidden fields (when condition is false)
                        if (f.condition === false) return null;
                        
                        const value = data[f.key];
                        let displayValue;
                        
                        if (f.type === "checkbox") {
                            displayValue = value ? "بله" : "خیر";
                        } else if (f.options) {
                            displayValue = f.options.find(opt => opt.value === value)?.label || value;
                        } else {
                            displayValue = value;
                        }
                        
                        return (
                            <div key={f.key} className="flex justify-between items-center py-1">
                                <span className="text-sm font-medium text-gray-600">{f.label}:</span>
                                <span className="text-sm text-gray-800">{displayValue !== null && displayValue !== undefined && displayValue !== '' ? displayValue : "—"}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}