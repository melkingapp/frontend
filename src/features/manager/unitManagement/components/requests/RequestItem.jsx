/* eslint-disable react-hooks/exhaustive-deps */
import { Home, Check, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { updateRequestStatus } from "../../slices/requestsSlice";

export default function RequestItem({ request }) {
    const dispatch = useDispatch();
    const { updateLoading } = useSelector(state => state.requests);
    const { selectedBuildingId, data: buildings } = useSelector(state => state.building);
    const { user } = useSelector(state => state.auth);
    const [expanded, setExpanded] = useState(false);
    
    // Only show approve/reject buttons for managers
    const isManager = user?.role === 'manager';

    const buildingId = selectedBuildingId || (buildings && buildings.length > 0 ? buildings[0].building_id : null);

    const roleStyle = useMemo(() => {
        return request?.role === "مالک"
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    }, [request?.role]);

    const isLongText = request?.description?.length > 120;

    const handleApprove = async () => {
        if (!buildingId) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }
        
        try {
            await dispatch(updateRequestStatus({
                buildingId,
                requestId: request.id,
                statusData: { status: 'approved' }
            })).unwrap();
            toast.success("درخواست با موفقیت پذیرفته شد!");
        } catch (error) {
            toast.error("خطا در پذیرش درخواست: " + error);
        }
    };

    const handleReject = async () => {
        if (!buildingId) {
            toast.error("ساختمان انتخاب نشده است");
            return;
        }
        
        try {
            await dispatch(updateRequestStatus({
                buildingId,
                requestId: request.id,
                statusData: { status: 'cancelled' }
            })).unwrap();
            toast.error("درخواست رد شد!");
        } catch (error) {
            toast.error("خطا در رد درخواست: " + error);
        }
    };

    const avatarColors = [
        "bg-pink-100 text-pink-700",
        "bg-purple-100 text-purple-700",
        "bg-amber-100 text-amber-700",
        "bg-teal-100 text-teal-700",
        "bg-blue-100 text-blue-700",
        "bg-rose-100 text-rose-700",
    ];

    const avatarColor = useMemo(() => {
        const k = Number.isFinite(request?.id) ? request.id : 0;
        return avatarColors[k % avatarColors.length];
    }, [request?.id]);

    return (
        <article className="group relative overflow-hidden rounded-2xl my-4 border-b border-gray-200 bg-gray-50 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow" dir="rtl">
            <div className="grid grid-cols-12 gap-4 items-start lg:grid-cols-12">
                {/* ستون ۱: نام + نقش + واحد */}
                <div className="col-span-12 md:col-span-12 lg:col-span-4 flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 shrink-0 rounded-full bg-gray-100 text-gray-700 grid place-items-center font-bold ${avatarColor}`}>
                        {request?.name?.[0] || "?"}
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 break-words">{request?.name || "—"}</h3>
                        {request?.role && (
                            <span
                                className={`inline-flex max-w-max px-2 py-0.5 rounded-full text-xs ${roleStyle}`}
                            >
                                {request.role}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-sm text-gray-600 break-words">
                            <Home size={14} /> واحد: {request?.unit ?? "—"}
                        </span>
                    </div>
                </div>

                {/* ستون ۲: توضیحات */}
                <div className="col-span-12 md:col-span-12 lg:col-span-5">
                    <p
                        className={`text-sm text-gray-700 whitespace-pre-wrap break-words transition-all ${!expanded && isLongText ? "line-clamp-3" : ""
                            }`}
                    >
                        {request?.description}
                    </p>

                    {isLongText && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-1 text-xs text-gray-500 hover:text-gray-700 transition"
                        >
                            {expanded ? "بستن" : "نمایش بیشتر"}
                        </button>
                    )}
                </div>


                {/* ستون ۳: دکمه‌ها */}
                <div className="col-span-12 md:col-span-12 lg:col-span-3 flex flex-col sm:flex-row sm:justify-start gap-2 mt-2 lg:mt-0">
                    {isManager && request?.status === 'pending' ? (
                        <>
                            <button
                                onClick={handleApprove}
                                disabled={updateLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 active:scale-[.98] transition w-full sm:w-auto disabled:opacity-50"
                            >
                                <Check size={16} /> {updateLoading ? "در حال پردازش..." : "پذیرش"}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={updateLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:scale-[.98] transition w-full sm:w-auto disabled:opacity-50"
                            >
                                <X size={16} /> {updateLoading ? "در حال پردازش..." : "رد"}
                            </button>
                        </>
                    ) : (
                        <span className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium w-full sm:w-auto ${
                            request?.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            request?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {request?.status === 'approved' ? 'پذیرفته شده' :
                             request?.status === 'cancelled' ? 'رد شده' :
                             request?.status === 'completed' ? 'تکمیل شده' :
                             request?.status === 'in_progress' ? 'در حال انجام' :
                             'نامشخص'}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
