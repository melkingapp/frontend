import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Plus, DollarSign } from "lucide-react";
import moment from "moment-jalaali";
import ExtraPaymentRequestForm from "../components/ExtraPaymentRequestForm";
import { FinanceTableRow, FinanceSummary } from "../../../manager/finance/components/transactions/TransactionList";
import { FinanceDetailsModal } from "../../../manager/finance/components/transactions/TransactionDetails";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { TransactionFilter } from "../../../manager/finance/components/transactions/TransactionFilters";
import SearchBox from "../../../../shared/components/shared/inputs/SearchBox";
import useCategories from "../../../../shared/hooks/useCategories";
import { fetchTransactions, fetchCurrentFundBalance, selectCurrentFundBalance, clearTransactions } from "../../../manager/finance/store/slices/financeSlice";
import { fetchBuildings, setSelectedBuilding } from "../../../manager/building/buildingSlice";

moment.loadPersian({ dialect: "persian-modern" });

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to get start of year in YYYY-MM-DD format
const getStartOfYear = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  return startOfYear.toISOString().split('T')[0];
};

export default function FinanceTransactions() {
  const dispatch = useDispatch();
  const categories = useCategories();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExtraPaymentForm, setShowExtraPaymentForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: getStartOfYear(),
    to: getCurrentDate()
  });
  const building = useSelector(selectSelectedBuilding);
  const buildings = useSelector(state => state.building.data);
  const currentFundBalance = useSelector(selectCurrentFundBalance);
  
  console.log("🔥 Building state:", building);
  console.log("🔥 Buildings list:", buildings);
  
  // Load buildings if not loaded
  useEffect(() => {
    if (buildings.length === 0) {
      console.log("🔥 Loading buildings...");
      dispatch(fetchBuildings());
    }
  }, [dispatch, buildings.length]);

  // Auto-select first building if none selected
  useEffect(() => {
    if (buildings.length > 0 && !building) {
      console.log("🔥 No building selected, auto-selecting first building...");
      const firstBuilding = buildings[0];
      dispatch(setSelectedBuilding(firstBuilding.building_id || firstBuilding.id));
    }
  }, [dispatch, buildings.length, building]);

  // Fetch current fund balance when building changes
  useEffect(() => {
    if (building?.building_id) {
      dispatch(fetchCurrentFundBalance(building.building_id));
    }
  }, [dispatch, building?.building_id]);

  // Clear transactions when building changes (to avoid showing old data)
  useEffect(() => {
    dispatch(clearTransactions());
  }, [dispatch, building?.building_id]);

  // Load transactions when building or date range changes
  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log("🔥 No access token found, skipping transactions fetch");
      return;
    }

    if (building && building.building_id) {
      console.log("🔥 Building selected, loading transactions for building:", building.building_id);
      dispatch(fetchTransactions({ 
        building_id: building.building_id,
        date_from: dateRange.from,
        date_to: dateRange.to
      }))
        .then((result) => {
          console.log("🔥 Fetch transactions result:", result);
          console.log("🔥 Payload:", result.payload);
          console.log("🔥 Transactions in payload:", result.payload?.transactions);
        })
        .catch((error) => {
          console.error("🔥 Fetch transactions error:", error);
        });
    } else if (buildings.length > 0 && !building) {
      // If no building selected but buildings are available, load all transactions
      console.log("🔥 No building selected, loading all transactions...");
      dispatch(fetchTransactions({
        date_from: dateRange.from,
        date_to: dateRange.to
      }))
        .then((result) => {
          console.log("🔥 Fetch all transactions result:", result);
        })
        .catch((error) => {
          console.error("🔥 Fetch all transactions error:", error);
        });
    }
  }, [dispatch, building?.building_id, buildings.length, dateRange]);

  // Get transactions from Redux state
  const transactionsData = useSelector(state => state.finance.transactions || []);
  const transactions = Array.isArray(transactionsData) ? transactionsData : (transactionsData?.transactions || []);
  console.log("🔥 Transactions from Redux:", transactions);
  console.log("🔥 Finance state:", useSelector(state => state.finance));
  
  // Debug first transaction
  if (transactions.length > 0) {
    console.log("🔥 First transaction:", transactions[0]);
    console.log("🔥 First transaction amount:", transactions[0].amount);
    console.log("🔥 First transaction keys:", Object.keys(transactions[0]));
  }
  
  const sortedData = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  console.log("🔥 Sorted data length:", sortedData.length);

  const balance = currentFundBalance?.current_balance || building?.fund_balance || 0;
  console.log("🔥 Sorted data:", sortedData);
  console.log("🔥 Sorted data length:", sortedData.length);
  const newestDate = sortedData.length > 0 ? sortedData[sortedData.length - 1].date : "-";
  const oldestDate = sortedData.length > 0 ? sortedData[0].date : "-";

  const filteredData = sortedData.filter(item => {
    let matchesFilter = false;
    
    if (filter === "all") {
      matchesFilter = true;
    } else if (filter === "purchases") {
      // For purchase items, check if title starts with "اقلام خریدنی"
      matchesFilter = item.title && item.title.startsWith("اقلام خریدنی");
    } else if (filter.startsWith("custom_")) {
      // For custom expense types, check if title matches the custom type
      const customType = filter.replace("custom_", "").replace(/_/g, " ");
      matchesFilter = item.title === customType || 
                     item.bill_type === customType ||
                     (item.bill_type === 'other' && item.description === customType);
    } else {
      // Map expense type filters to actual data
      const filterMapping = {
        'water_bill': 'قبض آب',
        'electricity_bill': 'قبض برق',
        'gas': 'قبض گاز',
        'maintenance': 'تعمیرات',
        'cleaning': 'نظافت',
        'security': 'امنیت',
        'camera': 'دوربین',
        'parking': 'پارکینگ',
        'charge': 'شارژ',
        'repair': 'تعمیرات',
        'rent': 'اجاره',
        'service': 'خدمات',
        'other': 'سایر'
      };
      
      const expectedTitle = filterMapping[filter];
      
      // Also map filter to backend bill_type values
      const billTypeMapping = {
        'water_bill': 'water',
        'electricity_bill': 'electricity',
        'gas': 'gas',
        'maintenance': 'maintenance',
        'cleaning': 'cleaning',
        'security': 'security',
        'camera': 'camera',
        'parking': 'parking',
        'charge': 'charge',
        'repair': 'maintenance',
        'rent': 'other',
        'service': 'other',
        'other': 'other'
      };
      
      const expectedBillType = billTypeMapping[filter];
      
      // Get the label from categories to match with title
      const filterLabel = categories.find(cat => cat.value === filter)?.label;
      
      matchesFilter = item.title === expectedTitle || 
                     (item.bill_type && item.bill_type === expectedBillType) ||
                     (item.category && item.category === filter) ||
                     // For custom expense types that match by title
                     (item.title && item.title === filterLabel);
    }
    
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search) ||
      item.date.toLowerCase().includes(search) ||
      item.amount.toString().includes(search);

    return matchesFilter && matchesSearch;
  });
  
  console.log("🔥 Filtered data:", filteredData);
  // محاسبه مجموع هزینه
  const totalCost = filteredData.reduce((sum, t) => sum + t.amount, 0);
  console.log("🔥 Total cost:", totalCost);



  return (
    <>
      <div className="p-4">
        {/* Button to open extra payment form */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowExtraPaymentForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>ثبت درخواست پرداخت اضافی</span>
          </button>
        </div>

        <FinanceSummary totalCost={totalCost} balance={balance} newestDate={newestDate} oldestDate={oldestDate} filter={filter} categories={categories} />

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Transaction Filter */}
            <div className="flex-1">
              <TransactionFilter filter={filter} setFilter={setFilter} categories={categories} />
            </div>
            
            
            {/* Clear Filters */}
            {(filter !== "all" || dateRange.from !== moment().startOf('year').format('YYYY-MM-DD') || dateRange.to !== moment().format('YYYY-MM-DD')) && (
              <button
                onClick={() => {
                  setFilter("all");
                  setDateRange({
                    from: moment().startOf('year').format('YYYY-MM-DD'),
                    to: moment().format('YYYY-MM-DD')
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X size={16} />
                پاک کردن فیلترها
              </button>
            )}
          </div>
          
          {/* Search Box */}
          <div className="relative">
            <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
        </div>
        {/* Header Row */}
        <div className="grid grid-cols-4 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
          <span className="flex items-center gap-1">عنوان</span>
          <span className="flex items-center gap-1">مبلغ</span>
          <span className="flex items-center gap-1">تاریخ</span>
          <span className="flex items-center gap-1">وضعیت سیستم</span>
        </div>
        {/* Rows */}
        {filteredData.length === 0 ? (
          <p className="text-sm text-gray-400 mt-4">موردی برای نمایش وجود ندارد.</p>
        ) : (
          filteredData.map((item, index) => (
            <FinanceTableRow key={`${item.id}-${item.category}-${item.title}-${index}`} transaction={item} onSelect={setSelected} />
          ))
        )}
        {/* Modal */}
        <FinanceDetailsModal isResident building={building} transaction={selected} onClose={() => setSelected(null)} />
        
        {/* Extra Payment Request Form */}
        <ExtraPaymentRequestForm
          isOpen={showExtraPaymentForm}
          onClose={() => setShowExtraPaymentForm(false)}
          onSuccess={() => {
            // Refresh transactions after successful submission
            if (building?.building_id) {
              dispatch(fetchTransactions({ building_id: building.building_id }));
            }
          }}
        />
      </div>
    </>
  );
}
