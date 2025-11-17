import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Coins } from "lucide-react";
import { toast } from "sonner";
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

export default function FinanceTransactions() {
  const dispatch = useDispatch();
  const categories = useCategories();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  }, [dispatch, building?.building_id, buildings.length]);

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

    return matchesFilter && matchesSearch;
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
        <FinanceSummary totalCost={totalCost} balance={balance} newestDate={newestDate} oldestDate={oldestDate} filter={filter} categories={categories} />

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
    </>
  );
}