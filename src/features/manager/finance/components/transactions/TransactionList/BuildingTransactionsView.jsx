import FinanceTableRow from "./FinanceTableRow";
import { Loader2 } from "lucide-react";

export default function BuildingTransactionsView({
  filteredData,
  onSelect,
  onEdit,
  onDelete,
  isManager,
  loading = false,
}) {
  // Show loading state when data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-melkingDarkBlue" />
        <span className="mr-3 text-gray-600">در حال بارگذاری هزینه‌ها...</span>
      </div>
    );
  }

  // Show empty message only after loading is complete
  if (filteredData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-400">موردی برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header Row */}
      <div className="grid grid-cols-5 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
        <span className="flex items-center gap-1">نوع هزینه</span>
        <span className="flex items-center gap-1">نام هزینه</span>
        <span className="flex items-center gap-1">مبلغ</span>
        <span className="flex items-center gap-1">تاریخ</span>
        <span className="flex items-center gap-1">وضعیت سیستم</span>
      </div>

      {/* Rows */}
      {filteredData.map((item, index) => (
        <FinanceTableRow 
          key={`${item.id}-${item.type || item.category}-${item.title}-${index}`} 
          transaction={item} 
          onSelect={onSelect} 
          onEdit={onEdit}
          onDelete={onDelete}
          isManager={isManager}
          isUnitView={false}
        />
      ))}
    </>
  );
}

