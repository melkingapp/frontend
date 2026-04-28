import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  Building2,
  FileText
} from "lucide-react";
import { selectSelectedBuilding } from "../../../building/buildingSlice";
import { BalanceSummary } from "../../components/balance/BalanceSummary";
import { BalanceTable } from "../../components/balance/BalanceTable";
import { BalanceFilters } from "../../components/balance/BalanceFilters";
import { BalanceDetailsModal } from "../../components/balance/BalanceDetails";
import BalanceCharts from "../../components/balance/BalanceCharts";
import SearchBox from "../../../../../shared/components/shared/inputs/SearchBox";
import { fetchBalanceSheet, fetchBalanceTransactions } from "../../store/slices/financeSlice";
import { getPersianType } from "../../../../../shared/utils/typeUtils";
import { exportBalanceSheet } from "../../../../../shared/services/billingService";
import ReportsMenu from "../../components/reports/ReportsMenu";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function BuildingBalance() {
  const dispatch = useDispatch();
  const building = useSelector(selectSelectedBuilding);
  const user = useSelector((state) => state.auth?.user);
  const isManager = user?.role === 'manager';
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD')
  }); // بازه زمانی - برای نمودارها و تراکنش‌ها

  const [isLoading, setIsLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    fundBalance: 0, // موجودی صندوق (دارایی جاری)
    accountsReceivable: 0, // مجموع بدهکاری واحدها
    unitCredits: 0, // مجموع بستانکاری واحدها
    totalExpenses: 0, // هزینه‌های ثبت شده
    totalIncome: 0,
    currentBalance: 0,
    transactions: [],
    hasData: false,
    isManager: false,
    details: null // جزئیات برای مدیر
  });

  // Load balance data
  useEffect(() => {
    if (building?.building_id || building?.id) {
      loadBalanceData();
    }
  }, [building, filter, dateRange]);

  const loadBalanceData = async () => {
    setIsLoading(true);
    try {
      const buildingId = building?.building_id || building?.id;
      
      // Fetch balance sheet from API
      const balanceSheetResponse = await dispatch(fetchBalanceSheet({
        buildingId,
        filters: {
          date_from: dateRange.from,
          date_to: dateRange.to,
          period_type: 'custom'
        }
      })).unwrap();
      
      // Fetch balance transactions from API (get all transactions, filter on client side)
      const transactionsResponse = await dispatch(fetchBalanceTransactions({
        buildingId,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      })).unwrap();
      
      console.log("Balance Sheet Response:", balanceSheetResponse);
      console.log("Balance Transactions Response:", transactionsResponse);
      
      // Extract data from balance sheet response
      const balanceSheet = balanceSheetResponse?.balance_sheet || {};
      const assets = balanceSheet?.assets || {};
      const liabilities = balanceSheet?.liabilities || {};
      const summary = balanceSheet?.summary || {};
      const transactions = transactionsResponse?.transactions || [];
      
      // Calculate current balance (موجودی فعلی)
      const currentBalance = assets?.fund_balance || 0;
      
      setBalanceData({
        fundBalance: assets?.fund_balance || 0, // موجودی صندوق (دارایی جاری)
        accountsReceivable: assets?.accounts_receivable || 0, // مجموع بدهکاری واحدها
        unitCredits: liabilities?.unit_credits || 0, // مجموع بستانکاری واحدها
        totalExpenses: summary?.total_expenses || 0, // هزینه‌های ثبت شده
        totalIncome: summary?.total_income || 0,
        currentBalance: currentBalance,
        transactions: transactions,
        hasData: balanceSheetResponse?.has_data || false,
        isManager: balanceSheetResponse?.is_manager || false,
        details: balanceSheetResponse?.details || null // جزئیات برای مدیر
      });
      
    } catch (error) {
      console.error("Error loading balance data:", error);
      
      // Fallback to empty data on error
      setBalanceData({
        fundBalance: 0,
        accountsReceivable: 0,
        unitCredits: 0,
        totalExpenses: 0,
        totalIncome: 0,
        currentBalance: 0,
        transactions: [],
        hasData: false,
        isManager: false,
        details: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionClick = (transaction) => {
    console.log("Transaction clicked:", transaction);
    setSelectedTransaction(transaction);
    setActiveModal('details');
  };


  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedTransaction(null);
  };


  const handleExportData = async () => {
    try {
      if (!building?.building_id) {
        console.error("Building ID not found");
        return;
      }

      // فراخوانی API برای دریافت فایل اکسل
      const blob = await exportBalanceSheet(building.building_id, {
        date_from: dateRange.from,
        date_to: dateRange.to,
        period_type: 'custom'
      });

      // ایجاد فایل اکسل
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // استفاده از نام فایلی که backend برمی‌گرداند (از Content-Disposition header)
      // اگر نام فایل در header نبود، از نام پیش‌فرض استفاده می‌کنیم
      const safeBuildingName = (building?.title || 'building').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      a.download = `Building-BalanceSheet-${safeBuildingName}-${moment().format('YYYYMMDD')}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("Excel file exported successfully");
    } catch (error) {
      console.error("Error exporting Excel file:", error);
      // Fallback to JSON export
      const data = {
        building: building?.title,
        period: `${dateRange.from} تا ${dateRange.to}`,
        balance: balanceData.currentBalance,
        transactions: balanceData.transactions
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `building-balance-${building?.title}-${moment().format('YYYY-MM-DD')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // ⚡ BOLT OPTIMIZATION: Memoize filtered transactions to prevent O(n) string matching and array iteration
  // on every component re-render. This avoids blocking the main thread when large transaction histories
  // are loaded and unrelated state changes occur.
  const filteredTransactions = useMemo(() => {
    return balanceData.transactions.filter(transaction => {
      // Filter by transaction type
      let matchesFilter = true;
      if (filter !== "all") {
        console.log(`🔥 Filtering for: ${filter}`);
        console.log(`🔥 Transaction:`, transaction);

        // Handle unit occupancy filters
        if (filter === "occupied_units") {
          // Show transactions only for occupied units
          matchesFilter = transaction.unit_occupied === true ||
                         transaction.is_occupied === true ||
                         (transaction.unit && transaction.unit.is_occupied === true) ||
                         (transaction.unit_info && transaction.unit_info.is_occupied === true);
        } else if (filter === "empty_units") {
          // Show transactions only for empty units
          matchesFilter = transaction.unit_occupied === false ||
                         transaction.is_occupied === false ||
                         (transaction.unit && transaction.unit.is_occupied === false) ||
                         (transaction.unit_info && transaction.unit_info.is_occupied === false) ||
                         transaction.unit_occupied === null ||
                         transaction.is_occupied === null;
        } else {
          // Create a more flexible filtering system for other filters
          const filterKeywords = {
            "income": ["درآمد", "income", "مثبت"],
            "expense": ["هزینه", "expense", "منفی"],
            "charge": ["شارژ", "charge", "شارژ جاری", "شارژ عمرانی", "current_charge", "construction_charge"],
            "maintenance": ["تعمیرات", "maintenance", "تعمیر"],
            "utility": ["قبض", "utility", "بیمه"],
            "water": ["آب", "water"],
            "electricity": ["برق", "electricity", "الکتریسیته"],
            "gas": ["گاز", "gas"],
            "cleaning": ["نظافت", "cleaning", "تمیز"],
            "security": ["امنیت", "security", "نگهبان"],
            "camera": ["دوربین", "camera", "نظارت"],
            "parking": ["پارکینگ", "parking", "پارک"],
            "purchases": ["اقلام خریدنی", "purchases", "خرید", "لامپ", "شیرآلات"],
            "transfer": ["انتقال", "transfer", "جابجایی"]
          };

          const keywords = filterKeywords[filter] || [];

          // Check multiple fields for matches
          const checkFields = [
            transaction.category,
            transaction.type,
            transaction.subject,
            transaction.description,
            transaction.title,
            transaction.bill_type,
            transaction.expense_type
          ].filter(Boolean); // Remove null/undefined values

          matchesFilter = keywords.some(keyword =>
            checkFields.some(field =>
              field.toString().toLowerCase().includes(keyword.toLowerCase())
            )
          );

          // Special handling for income/expense based on amount
          if (filter === "income") {
            matchesFilter = matchesFilter || (transaction.amount && transaction.amount > 0);
          } else if (filter === "expense") {
            matchesFilter = matchesFilter || (transaction.amount && transaction.amount < 0);
          }
        }
      }

      // Filter by search term
      const matchesSearch = searchTerm === "" ||
        transaction.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const result = matchesFilter && matchesSearch;
      if (filter !== "all") {
        console.log(`🔥 Match result: ${result} (filter: ${matchesFilter}, search: ${matchesSearch})`);
      }
        return result;
      });
  }, [balanceData.transactions, filter, searchTerm]);
  
  console.log(`🔥 Total transactions: ${balanceData.transactions.length}`);
  console.log(`🔥 Filtered transactions: ${filteredTransactions.length}`);
  console.log(`🔥 Current filter: ${filter}`);

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-slate-50">
        <div className="text-center p-8">
          <div className="text-slate-300 mb-6">
            <Building2 size={64} className="mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-3">
            لطفاً ابتدا یک ساختمان انتخاب کنید
          </h3>
          <p className="text-slate-500 text-lg">
            برای مشاهده بیلان ساختمان، ابتدا ساختمان مورد نظر را انتخاب کنید
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Professional Header */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 lg:p-4 bg-slate-100 rounded-xl md:rounded-2xl flex-shrink-0">
              <FileText className="text-slate-700" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 md:mb-2">
                بیلان مالی ساختمان
              </h1>
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-sm md:text-base lg:text-lg font-medium truncate">{building.title}</span>
              </div>
              <p className="text-slate-500 text-xs md:text-sm hidden md:block">
                گزارش جامع مالی و تراکنش‌های ساختمان
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
            <ReportsMenu building={building} isManager={isManager} />
            
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-slate-800 text-white rounded-lg md:rounded-xl hover:bg-slate-900 transition-all duration-200 shadow-lg shadow-slate-800/20 hover:shadow-slate-800/30 font-semibold text-sm md:text-base"
            >
              <Download size={18} className="md:w-5 md:h-5" />
              <span className="whitespace-nowrap">خروجی Excel بیلان</span>
            </button>
            
            <button
              onClick={loadBalanceData}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg md:rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm md:text-base"
            >
              <RefreshCw size={18} className={`md:w-5 md:h-5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="whitespace-nowrap">بروزرسانی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      {balanceData.hasData || isLoading ? (
        <BalanceSummary 
          fundBalance={balanceData.fundBalance}
          accountsReceivable={balanceData.accountsReceivable}
          unitCredits={balanceData.unitCredits}
          totalExpenses={balanceData.totalExpenses}
          totalIncome={balanceData.totalIncome}
          currentBalance={balanceData.currentBalance}
          hasData={balanceData.hasData}
          isLoading={isLoading}
        />
      ) : null}

      {/* Charts */}
      {balanceData.hasData || isLoading ? (
        <BalanceCharts
          transactions={balanceData.transactions}
          income={balanceData.totalIncome}
          expenses={balanceData.totalExpenses}
          isLoading={isLoading}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      ) : null}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-slate-200">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4 border-b border-slate-200">
            <div className="p-1.5 md:p-2 bg-slate-100 rounded-lg">
              <Filter size={18} className="md:w-5 md:h-5 text-slate-700" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900">فیلترها و جستجو</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="lg:col-span-1">
              <BalanceFilters 
                filter={filter}
                onFilterChange={setFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            
            <div className="lg:col-span-1 flex items-end">
              <div className="w-full">
                <SearchBox
                  placeholder="جستجو در تراکنش‌ها..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 border-b-2 border-slate-200 bg-slate-50">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-slate-800 rounded-lg md:rounded-xl flex-shrink-0">
                <Eye size={20} className="md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-1">
                  لیست تراکنش‌ها
                </h2>
                <p className="text-xs md:text-sm font-medium text-slate-600">
                  {filteredTransactions.length} تراکنش در این بازه زمانی یافت شد
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm self-start">
              <Calendar size={16} className="md:w-[18px] md:h-[18px] text-slate-500 flex-shrink-0" />
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <span className="text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">
                  {moment(dateRange.from).format('jYYYY/jMM/jDD')}
                </span>
                <span className="text-slate-400">—</span>
                <span className="text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">
                  {moment(dateRange.to).format('jYYYY/jMM/jDD')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <BalanceTable 
          transactions={filteredTransactions}
          onTransactionClick={handleTransactionClick}
          isLoading={isLoading}
        />
      </div>


      {/* Modals */}
      {activeModal === 'details' && selectedTransaction && (
        <BalanceDetailsModal
          transaction={selectedTransaction}
          onClose={handleCloseModal}
          isManager={balanceData.isManager || isManager}
          transactionDetails={balanceData.details}
        />
      )}
      
    </div>
  );
}
