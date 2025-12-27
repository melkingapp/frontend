import FinanceTableRow from "./FinanceTableRow";

export default function UnitTransactionsView({
  unitTransactions,
  unitTransactionsLoading,
  selectedUnitId,
  filteredData,
  onSelectUnitInvoice,
  onEdit,
  onDelete,
  isManager,
}) {
  if (!selectedUnitId && !unitTransactionsLoading) {
    return (
      <p className="text-sm text-gray-400 mt-4">لطفاً یک واحد را انتخاب کنید.</p>
    );
  }

  if (selectedUnitId && !unitTransactions && !unitTransactionsLoading) {
    return (
      <p className="text-sm text-gray-400 mt-4">در حال بارگذاری...</p>
    );
  }

  if (unitTransactionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-melkingDarkBlue"></div>
        <span className="mr-2 text-gray-600">در حال بارگذاری گردش مالی واحد...</span>
      </div>
    );
  }

  if (filteredData.length === 0 && selectedUnitId && unitTransactions && !unitTransactionsLoading) {
    return (
      <p className="text-sm text-gray-400 mt-4">این واحد تراکنشی ندارد.</p>
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
      {filteredData.length > 0 && (
        filteredData.map((item, index) => (
          <FinanceTableRow 
            key={`${item.id}-${item.type || item.category}-${item.title}-${index}`} 
            transaction={item} 
            onSelect={onSelectUnitInvoice} 
            onEdit={onEdit}
            onDelete={onDelete}
            isManager={isManager}
            isUnitView={true}
          />
        ))
      )}
    </>
  );
}

