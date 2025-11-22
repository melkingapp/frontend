import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Coins } from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import FinanceTableRow from "../components/overview/FinanceTableRow";
import FinanceDetailsModal from "../components/overview/FinanceDetailsModal";
import { selectSelectedBuilding } from "../../building/buildingSlice";
import TransactionFilter from "../components/overview/TransactionFilter";
import FinanceSummary from "../components/overview/FinanceSummary";
import SearchBox from "../../../../shared/components/shared/inputs/SearchBox";
import FloatingActionButton from "../../../../shared/components/shared/feedback/FloatingActionButton";
import AddExpenseModal from "../components/transactions/AddExpenseModal";
import PayBillModal from "../components/transactions/PayBillModal";
import useCategories from "../../../../shared/hooks/useCategories";
import { registerExpense, fetchTransactions, fetchCurrentFundBalance, selectCurrentFundBalance } from "../slices/financeSlice";
import { fetchBuildings, setSelectedBuilding } from "../../building/buildingSlice";
import { addExpenseType } from "../slices/expenseTypesSlice";
import { getPersianType } from "../../../../shared/utils/typeUtils";
import PersianDatePicker from "../../../../shared/components/shared/inputs/PersianDatePicker";

export default function FinanceTransactions() {
  const dispatch = useDispatch();
  const categories = useCategories();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState(null); // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ from: '', to: '' });
  const building = useSelector(selectSelectedBuilding);
  const buildings = useSelector(state => state.building.data);
  const currentFundBalance = useSelector(selectCurrentFundBalance);
  const buildingUnits = useSelector(state => {
    const buildingId = building?.building_id || building?.id;
    return buildingId ? state.building.units[buildingId] || [] : [];
  });
  
  console.log("🔥 Building state:", building);
  console.log("🔥 Buildings list:", buildings);
  
  // Load buildings if not loaded
  useEffect(() => {
    if (buildings.length === 0) {
      console.log("🔥 Loading buildings...");
      dispatch(fetchBuildings());
    }
  }, [dispatch, buildings]);

  // Auto-select first building if none selected
  useEffect(() => {
    if (buildings.length > 0 && !building) {
      console.log("🔥 No building selected, auto-selecting first building...");
      const firstBuilding = buildings[0];
      dispatch(setSelectedBuilding(firstBuilding.building_id || firstBuilding.id));
    }
  }, [dispatch, buildings, building]);

  // Fetch current fund balance when building changes
  useEffect(() => {
    if (building?.building_id) {
      dispatch(fetchCurrentFundBalance(building.building_id));
    }
  }, [dispatch, building?.building_id]);

  // Load transactions when building changes
  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log("🔥 No access token found, skipping transactions fetch");
      return;
    }

    if (building && building.building_id) {
      console.log("🔥 Building selected, loading transactions for building:", building.building_id);
      dispatch(fetchTransactions({ building_id: building.building_id }))
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
      dispatch(fetchTransactions({}))
        .then((result) => {
          console.log("🔥 Fetch all transactions result:", result);
        })
        .catch((error) => {
          console.error("🔥 Fetch all transactions error:", error);
        });
    }
  }, [dispatch, building, buildings]);

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
  
  // اگر هزینه‌ای وجود داشته باشد، از تاریخ‌های تراکنش‌ها استفاده کن
  // در غیر این صورت از تاریخ ایجاد ساختمان استفاده کن
  // توجه: sortedData به ترتیب نزولی است (جدیدترین اول)
  const currentBuilding = building || (buildings.length > 0 ? buildings[0] : null);
  const buildingCreatedAt = currentBuilding?.created_at || currentBuilding?.createdAt || null;
  const newestDate = sortedData.length > 0 
    ? sortedData[0].date  // جدیدترین تاریخ (اولین در sortedData)
    : (buildingCreatedAt || "-");
  const oldestDate = sortedData.length > 0 
    ? sortedData[sortedData.length - 1].date  // قدیمی‌ترین تاریخ (آخرین در sortedData)
    : (buildingCreatedAt || "-");

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
      // Get the label from categories to match with title
      const filterLabel = categories.find(cat => cat.value === filter)?.label;
      
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
      
      // Multiple matching strategies
      matchesFilter = 
        // Match by title (Persian label)
        (item.title && item.title === expectedTitle) ||
        // Match by bill_type (backend value)
        (item.bill_type && item.bill_type === expectedBillType) ||
        // Match by category (filter value)
        (item.category && item.category === filter) ||
        // Match by filter label from categories
        (item.title && item.title === filterLabel) ||
        // Match by expense_type if it exists
        (item.expense_type && item.expense_type === expectedBillType);
    }
    
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      search === "" ||
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.status && item.status.toLowerCase().includes(search)) ||
      (item.date && item.date.toLowerCase().includes(search)) ||
      (item.amount && item.amount.toString().includes(search));

    // فیلتر بر اساس تاریخ
    let matchesDate = true;
    if (dateRange && item.date) {
      try {
        // Parse item date and normalize to date only (ignore time)
        const itemDateStr = moment(item.date).format('YYYY-MM-DD');
        const itemDate = new Date(itemDateStr);
        itemDate.setHours(0, 0, 0, 0);
        
        const fromDate = dateRange.from ? (() => {
          const d = new Date(dateRange.from);
          d.setHours(0, 0, 0, 0);
          return d;
        })() : null;
        
        const toDate = dateRange.to ? (() => {
          const d = new Date(dateRange.to);
          d.setHours(23, 59, 59, 999); // Include the entire end date
          return d;
        })() : null;
        
        if (fromDate && itemDate < fromDate) {
          matchesDate = false;
        }
        if (toDate && itemDate > toDate) {
          matchesDate = false;
        }
      } catch (error) {
        // If date parsing fails, don't filter out the item
        console.warn('Error parsing date for filtering:', item.date, error);
      }
    }

    return matchesFilter && matchesSearch && matchesDate;
  });
  
  console.log("🔥 Filtered data:", filteredData);
  console.log("🔥 Current filter:", filter);
  console.log("🔥 Categories:", categories);
  if (sortedData.length > 0) {
    console.log("🔥 Sample transaction:", sortedData[0]);
    console.log("🔥 Sample transaction keys:", Object.keys(sortedData[0]));
  }
  // محاسبه مجموع هزینه
  const totalCost = filteredData.reduce((sum, t) => sum + t.amount, 0);
  console.log("🔥 Total cost:", totalCost);

  const handleExpense = () => setActiveModal("expense");
  // const handleBill = () => setActiveModal("bill");

  const handleDateClick = () => {
    // Initialize temp date range with current date range or default values
    if (dateRange) {
      setTempDateRange({ from: dateRange.from, to: dateRange.to });
    } else {
      // Use oldest and newest dates as default
      const fromDate = oldestDate && oldestDate !== "-" ? moment(oldestDate).format('YYYY-MM-DD') : '';
      const toDate = newestDate && newestDate !== "-" ? moment(newestDate).format('YYYY-MM-DD') : '';
      setTempDateRange({ from: fromDate, to: toDate });
    }
    setIsDateModalOpen(true);
  };

  const handleFromDateChange = (date) => {
    // Convert Persian date to Gregorian for filtering
    let gregorianDate = '';
    if (date) {
      try {
        // react-multi-date-picker returns a DateObject or Date
        if (date.toDate) {
          // DateObject from react-multi-date-picker
          const jsDate = date.toDate();
          gregorianDate = moment(jsDate).format('YYYY-MM-DD');
        } else if (date instanceof Date) {
          gregorianDate = moment(date).format('YYYY-MM-DD');
        } else if (typeof date === 'string') {
          // Try to parse as Persian date first
          const persianMoment = moment(date, 'jYYYY/jMM/jDD');
          if (persianMoment.isValid()) {
            gregorianDate = persianMoment.format('YYYY-MM-DD');
          } else {
            // Try as Gregorian
            gregorianDate = moment(date).format('YYYY-MM-DD');
          }
        } else if (date.year && date.month && date.day) {
          // DateObject with year, month, day properties
          const persianMoment = moment().jYear(date.year).jMonth(date.month.number - 1).jDate(date.day);
          gregorianDate = persianMoment.format('YYYY-MM-DD');
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
    setTempDateRange({ ...tempDateRange, from: gregorianDate });
  };

  const handleToDateChange = (date) => {
    // Convert Persian date to Gregorian for filtering
    let gregorianDate = '';
    if (date) {
      try {
        // react-multi-date-picker returns a DateObject or Date
        if (date.toDate) {
          // DateObject from react-multi-date-picker
          const jsDate = date.toDate();
          gregorianDate = moment(jsDate).format('YYYY-MM-DD');
        } else if (date instanceof Date) {
          gregorianDate = moment(date).format('YYYY-MM-DD');
        } else if (typeof date === 'string') {
          // Try to parse as Persian date first
          const persianMoment = moment(date, 'jYYYY/jMM/jDD');
          if (persianMoment.isValid()) {
            gregorianDate = persianMoment.format('YYYY-MM-DD');
          } else {
            // Try as Gregorian
            gregorianDate = moment(date).format('YYYY-MM-DD');
          }
        } else if (date.year && date.month && date.day) {
          // DateObject with year, month, day properties
          const persianMoment = moment().jYear(date.year).jMonth(date.month.number - 1).jDate(date.day);
          gregorianDate = persianMoment.format('YYYY-MM-DD');
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
    setTempDateRange({ ...tempDateRange, to: gregorianDate });
  };

  const handleApplyDateFilter = () => {
    if (tempDateRange.from && tempDateRange.to) {
      setDateRange({ from: tempDateRange.from, to: tempDateRange.to });
    } else if (tempDateRange.from) {
      setDateRange({ from: tempDateRange.from, to: tempDateRange.from });
    } else if (tempDateRange.to) {
      setDateRange({ from: tempDateRange.to, to: tempDateRange.to });
    }
    setIsDateModalOpen(false);
  };

  const handleClearDateFilter = () => {
    setDateRange(null);
    setIsDateModalOpen(false);
  };

  const handleSubmitExpense = async (data) => {
    console.log("Expense Data:", data);
    setIsSubmitting(true);
    
    try {
      // انتخاب ساختمان
      const selectedBuilding = building || buildings[0];
      if (!selectedBuilding) {
        toast.error("هیچ ساختمانی یافت نشد. لطفاً ابتدا ساختمان ایجاد کنید.");
        return;
      }
      
      // Use the selected building ID
      const buildingId = selectedBuilding.building_id || selectedBuilding.id;
      console.log("🔥 Selected building object:", selectedBuilding);
      console.log("🔥 Building ID extracted:", buildingId);
      console.log("🔥 Building ID type:", typeof buildingId);
      
      
      console.log("🔥 Building ID from selectedBuilding:", selectedBuilding.building_id);
      console.log("🔥 Building ID from selectedBuilding.id:", selectedBuilding.id);
      console.log("🔥 Final building ID:", buildingId);
      
      console.log("🔥 Selected building:", selectedBuilding);
      console.log("🔥 Building ID:", buildingId);
      
      // Mapping frontend values to backend values
      const expenseTypeMapping = {
        'water_bill': 'water',
        'electricity_bill': 'electricity',
        'camera': 'camera',
        'parking': 'parking',
        'charge': 'charge',
        'repair': 'maintenance',
        'cleaning': 'cleaning',
        'purchases': 'purchases'
      };
      
      let mappedExpenseType;
      let description = data.description || "";
      
      if (data.type === "AddExpenseType") {
        // For custom expense types, use 'other' as the backend type and put custom type in description
        mappedExpenseType = 'other';
        description = data.customType;
      } else if (data.type === "purchases") {
        // For purchase items, use 'purchases' as the type
        mappedExpenseType = 'purchases';
        if (data.customType) {
          // Include the custom type in description if provided
          description = `اقلام خریدنی (${data.customType})`;
        } else {
          // Default description if no custom type provided
          description = 'اقلام خریدنی';
        }
      } else {
        mappedExpenseType = expenseTypeMapping[data.type] || data.type || "other";
      }
      
      console.log("🔥 Original expense type:", data.type);
      console.log("🔥 Mapped expense type:", mappedExpenseType);
      
      // تبدیل داده‌های فرم به فرمت API
      let unitSelection = "all_units";
      let specificUnits = [];

      // تعیین نوع انتخاب واحد بر اساس انتخاب کاربر
      switch (data.target) {
        case "all":
          unitSelection = "all_units";
          break;
        case "full":
          unitSelection = "occupied_units";
          break;
        case "empty":
          unitSelection = "empty_units";
          break;
        case "custom":
          unitSelection = "specific_units";
          // Convert unit numbers to unit IDs
          specificUnits = data.selectedUnits?.map(unitNumber => {
            // Find the unit ID from the building units
            const unit = buildingUnits?.find(u => u.unit_number === unitNumber || u.id === unitNumber);
            return unit?.units_id || unit?.id || unitNumber;
          }) || [];
          console.log("🔥 Custom units selected:", data.selectedUnits);
          console.log("🔥 Building units:", buildingUnits);
          console.log("🔥 Specific units array (converted to IDs):", specificUnits);
          break;
        default:
          unitSelection = "all_units";
      }

      const expenseData = {
        expense_type: mappedExpenseType,
        total_amount: parseFloat(data.amount) || 0,
        unit_selection: unitSelection,
        specific_units: specificUnits,
        distribution_method: data.distribution || "equal",
        role: data.allocation || "both",
        description: description,
        building_id: parseInt(buildingId)
      };
      
      // Validate required fields
      if (!expenseData.expense_type) {
        toast.error("نوع هزینه الزامی است");
        return;
      }
      if (!expenseData.total_amount || expenseData.total_amount <= 0) {
        toast.error("مبلغ باید بزرگتر از صفر باشد");
        return;
      }
      if (!expenseData.building_id || isNaN(expenseData.building_id)) {
        toast.error("شناسه ساختمان الزامی است");
        return;
      }
      
      // Validate specific units if custom selection
      if (unitSelection === "specific_units" && (!specificUnits || specificUnits.length === 0)) {
        toast.error("لطفاً حداقل یک واحد انتخاب کنید");
        return;
      }
      
      console.log("🔥 Validated expense data:", expenseData);
      
      console.log("🔥 Final expense data:", expenseData);
      console.log("🔥 Expense data JSON:", JSON.stringify(expenseData, null, 2));
      
      console.log("🔥 Sending expense data:", expenseData);
      console.log("🔥 Selected building:", selectedBuilding);
      console.log("🔥 Building ID:", selectedBuilding.building_id);
      
      const result = await dispatch(registerExpense(expenseData)).unwrap();
      console.log("✅ Expense created successfully:", result);
      
      // بررسی اینکه آیا هزینه بدون واحد ثبت شده یا نه
      if (result.building_level) {
        toast.success(`${result.message}\n\n📝 ${result.note}`);
      }
      
      // نمایش پیام موفقیت
      let displayType;
      if (data.type === "purchases") {
        if (data.customType) {
          displayType = `اقلام خریدنی (${data.customType})`;
        } else {
          displayType = 'اقلام خریدنی';
        }
      } else if (data.type === "AddExpenseType") {
        displayType = data.customType;
        // Add custom expense type to the permanent list
        dispatch(addExpenseType({ 
          value: `custom_${data.customType.replace(/\s+/g, '_').toLowerCase()}`, 
          label: data.customType 
        }));
      } else {
        displayType = getPersianType(expenseData.expense_type);
      }
      toast.success(`هزینه با موفقیت ثبت شد!\nنوع: ${displayType}\nمبلغ: ${expenseData.total_amount.toLocaleString()} تومان`);
      
      // Refresh expenses list
      console.log("🔄 Refreshing expenses list...");
      dispatch(fetchTransactions({ building_id: buildingId }));
      
      setActiveModal(null);
    } catch (error) {
      console.error("❌ Expense creation failed:", error);
      console.error("❌ Error details:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error data:", error.data);
      console.error("❌ Error status:", error.status);
      
      let errorMessage = "خطا در ثبت هزینه";
      if (error.message) {
        errorMessage += ": " + error.message;
      }
      if (error.data?.detail) {
        errorMessage += "\nجزئیات: " + error.data.detail;
      }
      if (error.data?.error) {
        errorMessage += "\nخطا: " + error.data.error;
      }
      if (error.data?.valid_options) {
        errorMessage += "\nگزینه‌های معتبر: " + JSON.stringify(error.data.valid_options);
      }
      
      console.error("❌ Final error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBillPaySubmit = (billData) => {
    console.log("پرداخت قبض:", billData);
    setActiveModal(null);
  };

  return (
    <>
      <div className="p-4">
        <FinanceSummary 
          totalCost={totalCost} 
          balance={balance} 
          newestDate={newestDate} 
          oldestDate={oldestDate} 
          filter={filter} 
          categories={categories}
          onDateClick={handleDateClick}
          dateRange={dateRange}
        />

        <TransactionFilter filter={filter} setFilter={setFilter} categories={categories} />
        <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
        <FinanceDetailsModal building={building} transaction={selected} onClose={() => setSelected(null)} />
      </div>

      <FloatingActionButton
        color="bg-yellow-500"
        items={[
          // { key: "bill", label: "پرداخت قبض", icon: <Receipt className="w-4 h-4" />, onClick: handleBill },
          { key: "expense", label: "ثبت هزینه", icon: <Coins className="w-4 h-4" />, onClick: handleExpense },
        ]}
      />

        <AddExpenseModal
          isOpen={activeModal === "expense"}
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitExpense}
          isLoading={isSubmitting}
          buildingId={building?.building_id || building?.id}
        />

      <PayBillModal
        isOpen={activeModal === "bill"}
        onClose={() => setActiveModal(null)}
        onPay={handleBillPaySubmit}
      />

      {/* Date Range Filter Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">فیلتر بر اساس تاریخ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  از تاریخ
                </label>
                <PersianDatePicker
                  value={tempDateRange.from ? moment(tempDateRange.from).format('jYYYY/jMM/jDD') : ''}
                  onChange={handleFromDateChange}
                  placeholder="از تاریخ را انتخاب کنید"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تا تاریخ
                </label>
                <PersianDatePicker
                  value={tempDateRange.to ? moment(tempDateRange.to).format('jYYYY/jMM/jDD') : ''}
                  onChange={handleToDateChange}
                  placeholder="تا تاریخ را انتخاب کنید"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleApplyDateFilter}
                className="flex-1 bg-melkingGold text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                اعمال فیلتر
              </button>
              {dateRange && (
                <button
                  onClick={handleClearDateFilter}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  حذف فیلتر
                </button>
              )}
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}