import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, Download, X, Users, Calendar, User, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { exportCompleteReports } from "../../../../../shared/services/billingService";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function ReportsMenu({ building, isManager = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(moment().jYear());
  const [selectedMonth, setSelectedMonth] = useState(moment().jMonth() + 1);

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  // بستن با ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const handleExportCompleteReports = async () => {
    if (!building?.building_id) {
      toast.error("لطفاً ابتدا یک ساختمان انتخاب کنید");
      return;
    }

    if (!isManager) {
      toast.error("فقط مدیر ساختمان می‌تواند گزارش‌ها را export کند");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportCompleteReports(
        building.building_id,
        selectedYear,
        selectedMonth
      );

      // ایجاد فایل اکسل
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const safeBuildingName = (building?.title || 'building').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const monthName = persianMonths[selectedMonth - 1] || selectedMonth;
      a.download = `Building-Reports-${safeBuildingName}-${selectedYear}-${monthName}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("گزارش‌ها با موفقیت export شدند");
      setIsOpen(false);
    } catch (error) {
      console.error("Error exporting reports:", error);
      toast.error("خطا در export گزارش‌ها");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isManager) {
    return null; // فقط مدیران می‌توانند گزارش‌ها را export کنند
  }

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto z-[10000]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Export گزارش‌های کامل
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                همه 6 گزارش در یک فایل اکسل
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              سال شمسی
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = moment().jYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ماه شمسی (برای گزارش‌های ماهانه)
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              {persianMonths.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Report List */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              گزارش‌های موجود در فایل Excel:
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                <Users size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">اطلاعات اعضای ساختمان</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                <Calendar size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">بیلان سال {selectedYear}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                <User size={16} className="text-purple-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">ساکن {persianMonths[selectedMonth - 1]} {selectedYear}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                <User size={16} className="text-orange-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">مالکانه {persianMonths[selectedMonth - 1]} {selectedYear}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                <CreditCard size={16} className="text-red-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">بدهکاری و بستانکاری</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                <Receipt size={16} className="text-indigo-600 flex-shrink-0" />
                <span className="text-sm text-slate-700">هزینه‌ها</span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCompleteReports}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base"
          >
            <Download size={20} className={isExporting ? "animate-pulse" : ""} />
            <span>{isExporting ? "در حال export..." : "Export به Excel"}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 font-semibold text-sm"
      >
        <FileText size={18} />
        <span>گزارش‌های کامل</span>
      </button>

      {createPortal(modalContent, document.body)}
    </>
  );
}
