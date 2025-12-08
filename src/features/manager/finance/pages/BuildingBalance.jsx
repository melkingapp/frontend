import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  Eye
} from "lucide-react";
import { selectSelectedBuilding } from "../../building/buildingSlice";
import BalanceSummary from "../components/balance/BalanceSummary";
import BalanceTable from "../components/balance/BalanceTable";
import BalanceFilters from "../components/balance/BalanceFilters";
import BalanceDetailsModal from "../components/balance/BalanceDetailsModal";
import SearchBox from "../../../../shared/components/shared/inputs/SearchBox";
import { fetchBuildingBalance, fetchBalanceTransactions } from "../slices/financeSlice";
import { getPersianType } from "../../../../shared/utils/typeUtils";
import { exportBalanceData } from "../../../../shared/services/billingService";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function BuildingBalance() {
  const dispatch = useDispatch();
  const building = useSelector(selectSelectedBuilding);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD')
  }); // بازه زمانی

  const [isLoading, setIsLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    currentBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    transactions: []
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
      
      // Fetch building balance from API
      const balanceResponse = await dispatch(fetchBuildingBalance({
        buildingId,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      })).unwrap();
      
      // Fetch balance transactions from API (get all transactions, filter on client side)
      const transactionsResponse = await dispatch(fetchBalanceTransactions({
        buildingId,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      })).unwrap();
      
      console.log("Building Balance Response:", balanceResponse);
      console.log("Balance Transactions Response:", transactionsResponse);
      
      // Use data from API responses
      const transactions = transactionsResponse?.transactions || [];
      const summary = transactionsResponse?.summary || {};
      
      setBalanceData({
        currentBalance: balanceResponse?.current_balance || summary?.current_balance || 0,
        totalIncome: balanceResponse?.total_income || summary?.total_income || 0,
        totalExpenses: balanceResponse?.total_expenses || summary?.total_expenses || 0,
        transactions: transactions
      });
      
    } catch (error) {
      console.error("Error loading balance data:", error);
      
      // Fallback to empty data on error
      setBalanceData({
        currentBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        transactions: []
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

      // فراخوانی API برای دریافت داده‌های اکسل
      const response = await exportBalanceData(building.building_id, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });

      // ایجاد فایل اکسل
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `building-balance-${building?.title}-${moment().format('YYYY-MM-DD')}.xlsx`;
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

  const filteredTransactions = balanceData.transactions.filter(transaction => {
    // Filter by transaction type
    let matchesFilter = true;
    if (filter !== "all") {
      console.log(`🔥 Filtering for: ${filter}`);
      console.log(`🔥 Transaction:`, transaction);
      // Create a more flexible filtering system
      const filterKeywords = {
        "income": ["درآمد", "income", "مثبت"],
        "expense": ["هزینه", "expense", "منفی"],
        "charge": ["شارژ", "charge"],
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
  
  console.log(`🔥 Total transactions: ${balanceData.transactions.length}`);
  console.log(`🔥 Filtered transactions: ${filteredTransactions.length}`);
  console.log(`🔥 Current filter: ${filter}`);

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            لطفاً ابتدا یک ساختمان انتخاب کنید
          </h3>
          <p className="text-gray-500">
            برای مشاهده بیلان ساختمان، ابتدا ساختمان مورد نظر را انتخاب کنید
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            بیلان ساختمان {building.title}
          </h1>
          <p className="text-gray-600">
            مدیریت مالی و تراکنش‌های ساختمان
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
          >
            <Download size={18} />
            خروجی
          </button>
          
          <button
            onClick={loadBalanceData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      <BalanceSummary 
        balance={balanceData.currentBalance}
        income={balanceData.totalIncome}
        expenses={balanceData.totalExpenses}
        isLoading={isLoading}
      />

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">فیلترها و جستجو</h3>
          </div>
          
          <BalanceFilters 
            filter={filter}
            onFilterChange={setFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          
          <div className="w-full lg:w-80">
            <SearchBox
              placeholder="جستجو در تراکنش‌ها..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  تراکنش‌ها
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} تراکنش یافت شد
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">
                {moment(dateRange.from).format('jYYYY/jMM/jDD')} - {moment(dateRange.to).format('jYYYY/jMM/jDD')}
              </span>
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
        />
      )}
      
    </div>
  );
}
