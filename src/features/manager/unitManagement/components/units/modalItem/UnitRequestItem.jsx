import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function UnitRequestItem({ request, onApprove, onReject }) {
    const [expanded, setExpanded] = useState(false);

    const isLongText = request?.description?.length > 120;

    const handleApprove = () => {
        if (onApprove) onApprove(request.id);
        toast.success("درخواست با موفقیت پذیرفته شد!");
    };

    const handleReject = () => {
        if (onReject) onReject(request.id);
        toast.error("درخواست رد شد!");
    };

    return (
        <div className="mb-4 p-5 rounded-2xl border border-gray-200 shadow-lg bg-gradient-to-r from-white to-gray-50">
            {/* توضیحات */}
            <p className={`text-sm text-gray-700 relative ${!expanded && isLongText ? "line-clamp-3" : ""}`}>
                {request?.description}
            </p>
            {isLongText && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-1 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                    {expanded ? "بستن" : "نمایش بیشتر"}
                </button>
            )}

            {/* دکمه‌ها */}
            <div className="flex justify-end gap-3 mt-4">
                <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white font-semibold shadow-md hover:bg-emerald-700 hover:shadow-lg active:scale-[.97] transition-all"
                >
                    <Check size={16} /> پذیرش
                </button>
                <button
                    onClick={handleReject}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500 px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 hover:shadow-sm active:scale-[.97] transition-all"
                >
                    <X size={16} /> رد
                </button>
            </div>
        </div>
    );
}