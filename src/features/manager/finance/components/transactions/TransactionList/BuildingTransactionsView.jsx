import FinanceTableRow from "./FinanceTableRow";

export default function BuildingTransactionsView({
  filteredData,
  onSelect,
  onEdit,
  onDelete,
  isManager,
}) {
  if (filteredData.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-4">موردی برای نمایش وجود ندارد.</p>
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

