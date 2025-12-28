import { Download, AlertCircle } from "lucide-react";

export default function DebtCreditView({
  buildingUnits = [],
  building,
  onExport,
  isLoading = false,
  error = null,
  isManager = false,
  allBuildingUnits = [], // All building units from Redux for name/role lookup
}) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">بدهکاری و بستانکاری واحدها</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">بدهکاری و بستانکاری واحدها</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!buildingUnits || buildingUnits.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">بدهکاری و بستانکاری واحدها</h2>
          <button
            onClick={onExport}
            disabled={true}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors bg-gray-200 text-gray-400 cursor-not-allowed"
            title="داده‌ای برای خروجی وجود ندارد"
          >
            <Download size={16} />
            <span>دانلود اکسل</span>
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">داده‌ای برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">بدهکاری و بستانکاری واحدها</h2>
          {buildingUnits.length === 1 && !isManager && (
            <p className="text-sm text-gray-500 mt-1">
              (نمایش فقط واحد خود شما - مدیر ساختمان نمایش سایر واحدها را غیرفعال کرده است)
            </p>
          )}
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700"
          title="دانلود فایل اکسل"
        >
          <Download size={16} />
          <span>دانلود اکسل</span>
        </button>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-6 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
        <span className="flex items-center gap-1">شماره واحد</span>
        <span className="flex items-center gap-1">نام واحد</span>
        <span className="flex items-center gap-1">نقش</span>
        <span className="flex items-center gap-1">بدهکاری</span>
        <span className="flex items-center gap-1">بستانکاری</span>
        <span className="flex items-center gap-1">آخرین تغییر</span>
      </div>

      {/* Units List */}
      {buildingUnits.map((unit, index) => {
        // API returns unit_id, but buildingUnits from Redux use units_id
        const unitId = unit.unit_id || unit.units_id;
        // Try to find matching unit in allBuildingUnits for name/role
        const matchingUnit = allBuildingUnits.find(u => 
          (u.units_id || u.id) === unitId
        );
        
        const unitNumber = unit.unit_number || matchingUnit?.unit_number || "—";
        const unitName = matchingUnit?.full_name || matchingUnit?.owner_name || "—";
        const role = matchingUnit?.role === 'owner' 
          ? (matchingUnit?.tenant_full_name ? 'مالک دارای مستاجر' : 'مالک')
          : matchingUnit?.role === 'tenant'
          ? 'مستاجر'
          : (matchingUnit?.owner_name && matchingUnit?.tenant_full_name ? 'مالک و ساکن' : 
             matchingUnit?.owner_name ? 'مالک' : 
             matchingUnit?.tenant_full_name ? 'ساکن' : '—');
        
        const totalDebt = unit.total_debt || 0;
        const totalCredit = unit.total_credit || 0;
        const lastChange = unit.last_change;

        // تعیین نوع تغییر و پیام مناسب
        let changeMessage = "—";
        let changeColor = "text-gray-400";
        if (lastChange) {
          if (lastChange.type === 'extra_payment') {
            if (totalDebt > 0 && totalCredit === 0) {
              // اگر بدهکاری دارد و بستانکاری ندارد، احتمالاً از بدهکاری کم شده
              changeMessage = `کاهش بدهکاری: ${Number(lastChange.amount).toLocaleString('fa-IR')} تومان`;
              changeColor = "text-blue-600";
            } else if (totalCredit > 0) {
              // اگر بستانکاری دارد، بستانکاری اضافه شده
              changeMessage = `افزایش بستانکاری: ${Number(lastChange.amount).toLocaleString('fa-IR')} تومان`;
              changeColor = "text-emerald-600";
            } else {
              changeMessage = `پرداخت: ${Number(lastChange.amount).toLocaleString('fa-IR')} تومان`;
              changeColor = "text-blue-600";
            }
          }
        }

        return (
          <div
            key={unit.unit_id || unit.units_id || unit.id || index}
            className="grid grid-cols-6 gap-2 items-center text-sm border-b pb-2 mb-2 hover:bg-gray-50 rounded-lg p-2"
          >
            <span className="font-medium">{unitNumber}</span>
            <span className="text-gray-700">{unitName}</span>
            <span className="text-gray-600 text-xs">{role}</span>
            <span className={`font-semibold ${totalDebt > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {totalDebt > 0 ? `${Number(totalDebt).toLocaleString('fa-IR')} تومان` : "۰ تومان"}
            </span>
            <span className={`font-semibold ${totalCredit > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
              {totalCredit > 0 ? `${Number(totalCredit).toLocaleString('fa-IR')} تومان` : "۰ تومان"}
            </span>
            <span className={`text-xs ${changeColor} font-medium`} title={lastChange?.description || ""}>
              {changeMessage}
            </span>
          </div>
        );
      })}
    </div>
  );
}

