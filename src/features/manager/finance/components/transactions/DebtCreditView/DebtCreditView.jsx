import { Download } from "lucide-react";

export default function DebtCreditView({
  buildingUnits,
  building,
  onExport,
}) {
  if (buildingUnits.length === 0) {
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
        <h2 className="text-xl font-bold text-gray-800">بدهکاری و بستانکاری واحدها</h2>
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
      <div className="grid grid-cols-5 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
        <span className="flex items-center gap-1">شماره واحد</span>
        <span className="flex items-center gap-1">نام واحد</span>
        <span className="flex items-center gap-1">نقش</span>
        <span className="flex items-center gap-1">بدهکاری</span>
        <span className="flex items-center gap-1">بستانکاری</span>
      </div>

      {/* Units List */}
      {buildingUnits.map((unit, index) => {
        const unitNumber = unit.unit_number || unit.units_id || "—";
        const unitName = unit.full_name || unit.owner_name || "—";
        const role = unit.role === 'owner' 
          ? (unit.tenant_full_name ? 'مالک دارای مستاجر' : 'مالک')
          : unit.role === 'tenant'
          ? 'مستاجر'
          : (unit.owner_name && unit.tenant_full_name ? 'مالک و ساکن' : 
             unit.owner_name ? 'مالک' : 
             unit.tenant_full_name ? 'ساکن' : 'خالی');
        
        const totalDebt = unit.total_debt || 0;
        const totalCredit = unit.total_credit || 0;

        return (
          <div
            key={unit.units_id || unit.id || index}
            className="grid grid-cols-5 gap-2 items-center text-sm border-b pb-2 mb-2 hover:bg-gray-50 rounded-lg p-2"
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
          </div>
        );
      })}
    </div>
  );
}

