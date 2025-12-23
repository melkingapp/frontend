import { Home, Phone, Square, Car, Edit, CheckCircle2, XCircle, CircleSlash, Layers } from "lucide-react";
import { useMemo } from "react";

export default function UnitItem({ unit, onSelect, onEdit = () => {} }) {
    const isOccupied = unit.is_occupied || false;
    
    // استفاده از فیلدهای جدید
    const fullName = unit.full_name || "";
    const role = unit.role || "";
    const tenantFullName = unit.tenant_full_name || "";
    const phoneNumber = unit.phone_number || "";
    const tenantPhoneNumber = unit.tenant_phone_number || "";
    const hasParking = unit.has_parking || false;
    const parkingCount = unit.parking_count || 0;
    const residentCount = (unit.resident_count ?? 0);
    const ownerType = unit.owner_type || "";
    // فیلدهای مالی واحد
    const totalDebt = unit.total_debt ?? 0;
    const totalCredit = unit.total_credit ?? 0;
    
    // سازگاری با فیلدهای قدیمی
    const ownerName = unit.owner_name || fullName;
    const residentName = unit.resident_name || tenantFullName;
    
    // تعیین نوع واحد بر اساس نقش
    const unitType = useMemo(() => {
        if (role === "owner") return "owner";
        if (role === "tenant") return "tenant";
        if (ownerName && !residentName) return "owner";
        if (residentName && !ownerName) return "tenant";
        if (ownerName && residentName) return "owner_with_tenant";
        return "empty";
    }, [role, ownerName, residentName]);

    const roleStyle = useMemo(() => {
        switch (unitType) {
            case "owner":
            case "owner_with_tenant":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
            case "tenant":
                return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
            default:
                return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
        }
    }, [unitType]);


    const borderColor = useMemo(() => {
        switch (unitType) {
            case "owner":
            case "owner_with_tenant":
                return "border-emerald-400";
            case "tenant":
                return "border-sky-400";
            default:
                return "border-gray-200";
        }
    }, [unitType]);

    const ownerConfirmed = unit.owner_confirmed === true;
    const tenantConfirmed = unit.tenant_confirmed === true;

    return (
        <article
            onClick={() => onSelect(unit)}
            className={`group relative overflow-hidden rounded-2xl my-3 border-2 ${borderColor} bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out`}
            dir="rtl"
        >
            {/* نوار رنگی سمت راست */}
            <div
                className={`absolute top-0 right-0 h-full w-1 rounded-l-2xl 
        ${unitType === "owner" || unitType === "owner_with_tenant" ? "bg-emerald-400" : 
          unitType === "tenant" ? "bg-sky-400" : "bg-gray-200"} 
        group-hover:scale-y-105 transform origin-top transition-transform duration-300`}
            />

            <div className="relative z-10 flex flex-col gap-3">
                {/* ردیف اول: مشخصات واحد */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700 font-medium">
                    <div className="flex items-center gap-1">
                        <Square size={16} /> {unit.area ? `${unit.area} متر` : "—"}
                    </div>
                    <div className="flex items-center gap-1">
                        <Home size={16} /> واحد {unit.unit_number || unit.units_id}
                    </div>
                    <div className="flex items-center gap-1">
                        {hasParking && (
                            <>
                                <Car size={16} /> {parkingCount} پارکینگ
                            </>
                        )}
                    </div>
                </div>

                {/* خط جداکننده */}
                <div className="border-t border-gray-100 my-2" />

                {/* ردیف دوم: مالک / ساکن */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {/* آواتار */}
                        <div className="w-14 h-14 shrink-0 rounded-full bg-gray-100 text-gray-700 grid place-items-center font-bold text-lg">
                            {(fullName || ownerName || residentName)?.[0] || "?"}
                        </div>
                        {/* نام + نقش */}
                        <div className="flex flex-col">
                            <span className={`font-semibold text-gray-900 ${
                                unitType === "empty" ? "text-base" : "text-lg"
                            }`}>
                                {fullName || ownerName || residentName || "واحد خالی"}
                            </span>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleStyle}`}
                                >
                                    {role === "owner" && tenantFullName ? "مالک دارای مستاجر" : 
                                     role === "owner" ? "مالک" : 
                                     role === "tenant" ? "مستاجر" :
                                     ownerName && residentName ? "مالک و ساکن" : 
                                     ownerName ? "مالک" : 
                                     residentName ? "ساکن" : "خالی"}
                                </span>
                                {ownerName && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${ownerConfirmed ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'}`}>
                                    {ownerConfirmed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    مالک {ownerConfirmed ? 'تأیید شده' : 'تأیید نشده'}
                                  </span>
                                )}
                                {tenantFullName && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${tenantConfirmed ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'}`}>
                                    {tenantConfirmed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    مستأجر {tenantConfirmed ? 'تأیید شده' : 'تأیید نشده'}
                                  </span>
                                )}
                               
                            </div>
                        </div>
                    </div>

                    {/* وضعیت + دکمه ویرایش */}
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                        {ownerType === 'empty' || Number(residentCount) === 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium shadow-sm">
                                <CircleSlash size={14} className="shrink-0" />
                                واحد خالی
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                                {residentCount} نفر
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (typeof onEdit === 'function') {
                                    onEdit(unit);
                                }
                            }}
                            className="text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-100 p-2 rounded-full transition-colors"
                            title="ویرایش واحد"
                        >
                            <Edit size={18} />
                        </button>
                    </div>
                </div>

                {/* اگر مالک دارای مستاجر است، اطلاعات مستاجر را نمایش بده */}
                {(role === "owner" && tenantFullName) || (ownerName && residentName && ownerName !== residentName) ? (
                    <div className="mt-3 p-3 bg-sky-50 rounded-xl shadow-sm border border-sky-200">
                        <div className="flex items-center gap-3">
                            {/* آواتار مستاجر */}
                            <div className="w-12 h-12 shrink-0 rounded-full bg-sky-100 text-sky-700 grid place-items-center font-bold text-lg">
                                {(tenantFullName || residentName)?.[0] || "?"}
                            </div>
                            <div className="flex flex-col space-y-2">
                                <span className="text-sm font-semibold text-gray-900">
                                    {tenantFullName || residentName}
                                </span>
                            </div>
                            {/* برچسب مشخص‌کننده */}
                            <span className="ml-auto px-2 py-0.5 text-xs bg-sky-200 text-sky-800 rounded-full font-medium">
                                مستاجر
                            </span>
                        </div>
                    </div>
                ) : null}

                {/* وضعیت مالی واحد: بدهکاری / بستانکاری */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
                    <div className="flex flex-col bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        <span className="text-[11px] sm:text-xs text-red-600 mb-1">بدهی واحد</span>
                        <span className="font-semibold text-red-700">
                            {totalDebt ? `${Number(totalDebt).toLocaleString('fa-IR')} تومان` : "۰ تومان"}
                        </span>
                    </div>
                    <div className="flex flex-col bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                        <span className="text-[11px] sm:text-xs text-emerald-600 mb-1">بستانکاری واحد</span>
                        <span className="font-semibold text-emerald-700">
                            {totalCredit ? `${Number(totalCredit).toLocaleString('fa-IR')} تومان` : "۰ تومان"}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}