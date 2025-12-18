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
import { registerExpense, updateExpense, deleteExpense, fetchTransactions, fetchCurrentFundBalance, selectCurrentFundBalance } from "../slices/financeSlice";
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
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const building = useSelector(selectSelectedBuilding);
  const buildings = useSelector(state => state.building.data);
  const currentFundBalance = useSelector(selectCurrentFundBalance);
  const user = useSelector(state => state.auth.user);
  const isManager = user?.role === 'manager';
  const buildingUnits = useSelector(state => {
    const buildingId = building?.building_id || building?.id;
    return buildingId ? state.building.units[buildingId] || [] : [];
  });
  
  
  // Load buildings if not loaded
  useEffect(() => {
    if (buildings.length === 0) {
      dispatch(fetchBuildings());
    }
  }, [dispatch, buildings.length]);

  // Auto-select first building if none selected
  useEffect(() => {
    if (buildings.length > 0 && !building) {
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

  // Load transactions when building changes
  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return;
    }

    if (building && building.building_id) {
      dispatch(fetchTransactions({ building_id: building.building_id }))
        .then((result) => {
        })
        .catch((error) => {
          console.error("🔥 Fetch transactions error:", error);
        });
    } else if (buildings.length > 0 && !building) {
      // If no building selected but buildings are available, load all transactions
      dispatch(fetchTransactions({}))
        .then((result) => {
        })
        .catch((error) => {
          console.error("🔥 Fetch all transactions error:", error);
        });
    }
  }, [dispatch, building?.building_id, buildings.length]);

  // Get transactions from Redux state
  const transactionsData = useSelector(state => state.finance.transactions || []);
  const transactions = Array.isArray(transactionsData) ? transactionsData : (transactionsData?.transactions || []);
  
  // Debug first transaction
  if (transactions.length > 0) {
  }
  
  const sortedData = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const balance = currentFundBalance?.current_balance || building?.fund_balance || 0;
  
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
  
  if (sortedData.length > 0) {
  }
  // محاسبه مجموع هزینه
  const totalCost = filteredData.reduce((sum, t) => sum + t.amount, 0);

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

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setActiveModal("expense");
  };

  const handleDeleteExpense = async (expense) => {
    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید این هزینه را حذف کنید؟\n\nنوع: ${getPersianType(expense.title || expense.bill_type)}\nمبلغ: ${expense.amount?.toLocaleString()} تومان`);
    if (!confirmed) return;

    try {
      setDeletingExpenseId(expense.id);
      await dispatch(deleteExpense(expense.id)).unwrap();
      toast.success('هزینه با موفقیت حذف شد');
      
      // Refresh transactions
      const buildingId = building?.building_id || building?.id;
      if (buildingId) {
        await dispatch(fetchTransactions({ building_id: buildingId }));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('خطا در حذف هزینه');
    } finally {
      setDeletingExpenseId(null);
    }
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
          break;
        default:
          unitSelection = "all_units";
      }

      // تبدیل allocation از آرایه به string
      let finalAllocation = "both"; // پیش‌فرض
      if (Array.isArray(data.allocation)) {
        if (data.allocation.length === 2 && 
            data.allocation.includes("owner") && data.allocation.includes("resident")) {
          finalAllocation = "both";
        } else if (data.allocation.length === 1) {
          finalAllocation = data.allocation[0];
        }
      } else if (data.allocation) {
        finalAllocation = data.allocation;
      }

      const expenseData = {
        expense_type: mappedExpenseType,
        total_amount: parseFloat(data.amount) || 0,
        unit_selection: unitSelection,
        specific_units: specificUnits,
        distribution_method: data.distribution || "equal",
        role: finalAllocation,
        description: description,
        building_id: parseInt(buildingId),
        // اضافه کردن فایل اول از لیست فایل‌ها
        ...(data.files && data.files.length > 0 && { attachment: data.files[0] })
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
      
      // اگر در حال ویرایش هستیم، shared_bill_id اضافه کن
      let result;
      if (editingExpense) {
        const updateData = {
          ...expenseData,
          shared_bill_id: editingExpense.id
        };
        result = await dispatch(updateExpense(updateData)).unwrap();
        toast.success('هزینه با موفقیت ویرایش شد');
      } else {
        result = await dispatch(registerExpense(expenseData)).unwrap();
      }
      
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
      
      // نمایش پیام موفقیت فقط برای ثبت جدید (ویرایش خودش پیام نمایش میده)
      if (!editingExpense) {
        toast.success(`هزینه با موفقیت ثبت شد!\nنوع: ${displayType}\nمبلغ: ${expenseData.total_amount.toLocaleString()} تومان`);
      }
      
      // Refresh expenses list
      dispatch(fetchTransactions({ building_id: buildingId }));
      
      setActiveModal(null);
      setEditingExpense(null);
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = "خطا در ثبت هزینه";
      if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (error.message) {
        errorMessage += ": " + error.message;
      }
      
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
            <FinanceTableRow 
              key={`${item.id}-${item.category}-${item.title}-${index}`} 
              transaction={item} 
              onSelect={setSelected} 
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              isManager={isManager}
            />
          ))
        )}
        {/* Modal */}
        <FinanceDetailsModal 
          building={building} 
          transaction={selected} 
          onClose={() => setSelected(null)} 
          onEdit={handleEditExpense}
        />
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
          onClose={() => {
            setActiveModal(null);
            setEditingExpense(null);
          }}
          onSubmit={handleSubmitExpense}
          isLoading={isSubmitting}
          buildingId={building?.building_id || building?.id}
          editingExpense={editingExpense}
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