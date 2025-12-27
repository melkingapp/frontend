import { RotateCcw, Download } from "lucide-react";
import { TransactionFilter } from "../TransactionFilters";
import SearchBox from "../../../../../../shared/components/shared/inputs/SearchBox";

export default function TransactionsFilters({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  amountRange,
  setAmountRange,
  dateRange,
  filteredData,
  onReset,
  onExport,
  categories,
}) {
  const hasActiveFilters = filter !== "all" || searchTerm || dateRange || amountRange.min || amountRange.max;

  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex-1 flex flex-col gap-3">
        <TransactionFilter filter={filter} setFilter={setFilter} categories={categories} />
        <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {/* Amount Range Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-600 whitespace-nowrap">بازه مبلغ:</span>
          <input
            type="number"
            placeholder="حداقل"
            value={amountRange.min}
            onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-melkingDarkBlue focus:border-transparent"
            min="0"
            step="1000"
          />
          <span className="text-xs text-gray-500">تا</span>
          <input
            type="number"
            placeholder="حداکثر"
            value={amountRange.max}
            onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-melkingDarkBlue focus:border-transparent"
            min="0"
            step="1000"
          />
          {(amountRange.min || amountRange.max) && (
            <button
              onClick={() => setAmountRange({ min: '', max: '' })}
              className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="پاک کردن فیلتر مبلغ"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
            title="بازگشت به حالت اولیه (پاک کردن همه فیلترها)"
          >
            <RotateCcw size={16} />
            <span>بازگشت به حالت اولیه</span>
          </button>
        )}
        
        <button
          onClick={onExport}
          disabled={filteredData.length === 0}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
            filteredData.length === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          title={filteredData.length === 0 ? "داده‌ای برای خروجی وجود ندارد" : "دانلود فایل اکسل"}
        >
          <Download size={16} />
          <span>دانلود اکسل</span>
        </button>
      </div>
    </div>
  );
}

