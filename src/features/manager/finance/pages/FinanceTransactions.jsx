import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Coins, RotateCcw, Download } from "lucide-react";
import * as XLSX from "xlsx";
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
import { registerExpense, updateExpense, deleteExpense, fetchTransactions, fetchCurrentFundBalance, selectCurrentFundBalance, fetchExpenseAllocation } from "../slices/financeSlice";
import { fetchBuildings, setSelectedBuilding } from "../../building/buildingSlice";
import { addExpenseType } from "../slices/expenseTypesSlice";
import { getPersianType, getPersianDistributionMethod, getPersianStatus } from "../../../../shared/utils/typeUtils";
import { formatJalaliDate } from "../../../../shared/utils";
import PersianDatePicker from "../../../../shared/components/shared/inputs/PersianDatePicker";
import DeleteConfirmModal from "../../../../shared/components/shared/feedback/DeleteConfirmModal";
import { getUnitFinancialTransactions } from "../../../../shared/services/transactionsService";
import { fetchBuildingUnits } from "../../building/buildingSlice";
import SelectField from "../../../../shared/components/shared/inputs/SelectField";
import { getExpenseAllocation } from "../../../../shared/services/billingService";

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
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('building'); // 'building' or 'unit'
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [unitTransactions, setUnitTransactions] = useState(null);
  const [unitTransactionsLoading, setUnitTransactionsLoading] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' }); // { min: number, max: number }
  const [showDebtCredit, setShowDebtCredit] = useState(false); // Show debt/credit section
  const building = useSelector(selectSelectedBuilding);
  const buildings = useSelector(state => state.building.data);
  const currentFundBalance = useSelector(selectCurrentFundBalance);
  const user = useSelector(state => state.auth.user);
  const isManager = user?.role === 'manager';
  const buildingUnits = useSelector(state => {
    const buildingId = building?.building_id || building?.id;
    if (!buildingId) return [];
    const unitsData = state.building.units[buildingId];
    // Handle both array and object with units property
    if (Array.isArray(unitsData)) {
      return unitsData;
    } else if (unitsData && unitsData.units) {
      return unitsData.units;
    }
    return [];
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

  // Find user's unit(s) based on phone number - Must be defined before useEffects
  const userUnits = buildingUnits.filter(unit => 
    unit.phone_number === user?.phone_number || 
    unit.tenant_phone_number === user?.phone_number ||
    (unit.owner && unit.owner.id === user?.id) ||
    (unit.owner && unit.owner.username === user?.username)
  );

  // Fetch building units when building changes or view mode changes to unit
  useEffect(() => {
    if (building?.building_id && (viewMode === 'unit' || buildingUnits.length === 0)) {
      dispatch(fetchBuildingUnits(building.building_id));
    }
  }, [dispatch, building?.building_id, viewMode]);

  // Load transactions when building changes (only for building view mode)
  useEffect(() => {
    if (viewMode !== 'building') return;
    
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
  }, [dispatch, building?.building_id, buildings.length, viewMode]);

  // Auto-select user's unit when switching to unit view mode
  useEffect(() => {
    if (viewMode === 'unit' && !selectedUnitId && userUnits.length > 0) {
      const userUnitId = userUnits[0].units_id || userUnits[0].id;
      setSelectedUnitId(userUnitId);
    }
  }, [viewMode, userUnits, selectedUnitId]);

  // Fetch unit financial transactions when unit is selected
  useEffect(() => {
    if (viewMode === 'unit' && selectedUnitId) {
      setUnitTransactionsLoading(true);
      getUnitFinancialTransactions(selectedUnitId, dateRange?.from, dateRange?.to)
        .then((response) => {
          setUnitTransactions(response);
        })
        .catch((error) => {
          console.error("Error fetching unit transactions:", error);
          toast.error("خطا در دریافت گردش مالی واحد");
          setUnitTransactions(null);
        })
        .finally(() => {
          setUnitTransactionsLoading(false);
        });
    } else if (viewMode === 'building') {
      setUnitTransactions(null);
    }
  }, [selectedUnitId, viewMode, dateRange]);

  // Get transactions from Redux state
  const transactionsData = useSelector(state => state.finance.transactions || []);
  const transactions = Array.isArray(transactionsData) ? transactionsData : (transactionsData?.transactions || []);
  
  // Debug first transaction
  if (transactions.length > 0) {
  }
  
  // Get transactions based on view mode
  const transactionsToDisplay = viewMode === 'unit' && unitTransactions 
    ? unitTransactions.transactions || []
    : transactions;

  const sortedData = [...transactionsToDisplay].sort(
    (a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    }
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

  // Prepare unit options for dropdown
  const unitOptions = buildingUnits.map(unit => ({
    value: unit.units_id || unit.id,
    label: `واحد ${unit.unit_number || unit.units_id} - ${unit.full_name || unit.owner_name || 'بدون نام'}`
  }));

  const filteredData = sortedData.filter(item => {
    let matchesFilter = false;
    
    // For unit view mode, filter is less strict (just show all transactions)
    if (viewMode === 'unit') {
      matchesFilter = true;
    } else if (filter === "all") {
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
        (item.expense_type && item.expense_type === expectedBillType) ||
        // Match by transaction_type for unit transactions
        (item.transaction_type && item.transaction_type === expectedTitle);
    }
    
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      search === "" ||
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.description && item.description.toLowerCase().includes(search)) ||
      (item.status && item.status.toLowerCase().includes(search)) ||
      (item.status_label && item.status_label.toLowerCase().includes(search)) ||
      (item.date && item.date.toLowerCase().includes(search)) ||
      (item.amount && item.amount.toString().includes(search)) ||
      (item.expense_name && item.expense_name.toLowerCase().includes(search));

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

    // فیلتر بر اساس بازه مبلغی
    let matchesAmount = true;
    if (amountRange.min || amountRange.max) {
      const itemAmount = parseFloat(item.amount || item.total_amount || 0);
      const minAmount = amountRange.min ? parseFloat(amountRange.min) : null;
      const maxAmount = amountRange.max ? parseFloat(amountRange.max) : null;
      
      if (minAmount !== null && itemAmount < minAmount) {
        matchesAmount = false;
      }
      if (maxAmount !== null && itemAmount > maxAmount) {
        matchesAmount = false;
      }
    }

    return matchesFilter && matchesSearch && matchesDate && matchesAmount;
  });
  
  if (sortedData.length > 0) {
  }
  // محاسبه مجموع هزینه
  const totalCost = filteredData.reduce((sum, t) => sum + t.amount, 0);

  const handleExpense = () => setActiveModal("expense");
  // const handleBill = () => setActiveModal("bill");

  // Reset all filters
  const handleResetFilters = () => {
    setFilter("all");
    setSearchTerm("");
    setDateRange(null);
    setAmountRange({ min: '', max: '' });
    toast.success("همه فیلترها پاک شدند");
  };

  // Export to Excel
  const handleExportToExcel = async () => {
    if (filteredData.length === 0) {
      toast.error("داده‌ای برای خروجی وجود ندارد");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("در حال آماده‌سازی فایل اکسل...");

      // Fetch allocations for all shared bills
      const allocationPromises = filteredData
        .filter(item => item.id && (item.type === 'shared_bill' || item.category === 'shared_bill'))
        .map(async (item) => {
          try {
            const allocation = await getExpenseAllocation(item.id);
            return { id: item.id, allocation };
          } catch (error) {
            console.error(`Error fetching allocation for expense ${item.id}:`, error);
            return { id: item.id, allocation: null };
          }
        });

      const allocationResults = await Promise.all(allocationPromises);
      const allocationMap = new Map();
      allocationResults.forEach(({ id, allocation }) => {
        if (allocation) {
          allocationMap.set(id, allocation);
        }
      });

      // Prepare data for Excel export
      const excelData = filteredData.map((item, index) => {
        // Format date
        const date = item.date 
          ? formatJalaliDate(item.date || item.billing_date || item.issue_date || item.created_at)
          : "—";
        
        // Get title
        const rawTitle = item.title || 
                        item.description || 
                        item.category || 
                        item.type ||
                        item.transaction_type ||
                        'بدون عنوان';
        const title = getPersianType(rawTitle);
        
        // Get expense name
        const expenseName = item.expense_name || item.expense_details?.expense_name || "—";
        
        // Get amount
        const amount = item.amount || item.total_amount || 0;
        
        // Get status
        const systemStatus = item.payment_method === 'from_fund' 
          ? 'برداشت از موجودی صندوق'
          : getPersianStatus(item.status || item.status_label || 'نامشخص');
        
        // Get bill type
        const billType = getPersianType(item.bill_type || item.category || item.type || "—");
        
        // Get distribution method
        const distributionMethod = item.distribution_method 
          ? getPersianDistributionMethod(item.distribution_method)
          : "—";
        
        // Get payment method
        const paymentMethod = item.payment_method === 'from_fund' 
          ? 'برداشت از موجودی صندوق'
          : item.payment_method === 'direct'
          ? 'مستقیم'
          : item.payment_method === 'online'
          ? 'آنلاین'
          : "—";

        // Get unit allocations if available
        const allocation = allocationMap.get(item.id);
        let unitsList = "—";
        let unitsShares = "—";
        
        if (allocation && allocation.unit_allocations && allocation.unit_allocations.length > 0) {
          // Format units list: "واحد 101، واحد 102، واحد 103"
          unitsList = allocation.unit_allocations
            .map(ua => `واحد ${ua.unit_number || ua.unit_id}`)
            .join("، ");
          
          // Format units shares: "واحد 101: 333,333 تومان (33.33%)، واحد 102: 333,333 تومان (33.33%)"
          unitsShares = allocation.unit_allocations
            .map(ua => {
              const unitNum = ua.unit_number || ua.unit_id;
              const shareAmount = ua.amount ? parseFloat(ua.amount).toLocaleString('fa-IR') : "0";
              const percentage = ua.percentage ? parseFloat(ua.percentage).toFixed(2) : "0";
              return `واحد ${unitNum}: ${shareAmount} تومان (${percentage}%)`;
            })
            .join("؛ ");
        }

        return {
          "ردیف": index + 1,
          "عنوان": title,
          "نام هزینه": expenseName,
          "نوع هزینه": billType,
          "مبلغ (تومان)": amount,
          "تاریخ": date,
          "وضعیت سیستم": systemStatus,
          "نحوه تقسیم": distributionMethod,
          "روش پرداخت": paymentMethod,
          "توضیحات": item.description || "—",
          "مهلت پرداخت": item.bill_due ? formatJalaliDate(item.bill_due) : "—",
          "واحدهای مشمول": unitsList,
          "سهم هر واحد": unitsShares,
        };
      });

      toast.dismiss(loadingToast);

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "گردش مالی");

      // Generate filename with building name and date
      const now = new Date();
      const persianDate = moment(now).format('jYYYY/jMM/jDD');
      const buildingName = building?.title || building?.name || 'ساختمان';
      // Remove special characters and spaces from building name for filename
      const sanitizedBuildingName = buildingName.replace(/[^\u0600-\u06FF\u0750-\u077F\w\s]/g, '').replace(/\s+/g, '_');
      const filename = `گردش_مالی_${sanitizedBuildingName}_${persianDate.replace(/\//g, '_')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      toast.dismiss(loadingToast);
      toast.success("فایل اکسل با موفقیت دانلود شد");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.dismiss(loadingToast);
      toast.error("خطا در ایجاد فایل اکسل");
    }
  };

  // Export units debt/credit to Excel
  const handleExportUnitsDebtCreditToExcel = () => {
    if (buildingUnits.length === 0) {
      toast.error("داده‌ای برای خروجی وجود ندارد");
      return;
    }

    try {
      // Prepare data for Excel export
      const excelData = buildingUnits.map((unit, index) => {
        const unitNumber = unit.unit_number || unit.units_id || "—";
        const unitName = unit.full_name || unit.owner_name || "—";
        const role = unit.role === 'owner' 
          ? (unit.tenant_full_name ? 'مالک دارای مستاجر' : 'مالک')
          : unit.role === 'tenant'
          ? 'مستاجر'
          : (unit.owner_name && unit.tenant_full_name ? 'مالک و ساکن' : 
             unit.owner_name ? 'مالک' : 
             unit.tenant_full_name ? 'ساکن' : 'خالی');
        
        const totalDebt = unit.total_debt || 0;
        const totalCredit = unit.total_credit || 0;
        const balance = unit.balance || (totalCredit - totalDebt);

        return {
          "ردیف": index + 1,
          "شماره واحد": unitNumber,
          "نام واحد": unitName,
          "نقش": role,
          "بدهکاری (تومان)": totalDebt,
          "بستانکاری (تومان)": totalCredit,
          "مانده حساب (تومان)": balance,
        };
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "بدهکاری و بستانکاری واحدها");

      // Generate filename with building name and date
      const now = new Date();
      const persianDate = moment(now).format('jYYYY/jMM/jDD');
      const buildingName = building?.title || building?.name || 'ساختمان';
      const sanitizedBuildingName = buildingName.replace(/[^\u0600-\u06FF\u0750-\u077F\w\s]/g, '').replace(/\s+/g, '_');
      const filename = `بدهکاری_بستانکاری_واحدها_${sanitizedBuildingName}_${persianDate.replace(/\//g, '_')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      toast.success("فایل اکسل با موفقیت دانلود شد");
    } catch (error) {
      console.error("Error exporting units debt/credit to Excel:", error);
      toast.error("خطا در ایجاد فایل اکسل");
    }
  };

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

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      setDeletingExpenseId(expenseToDelete.id);
      await dispatch(deleteExpense(expenseToDelete.id)).unwrap();
      toast.success('هزینه با موفقیت حذف شد');
      
      // Refresh transactions
      const buildingId = building?.building_id || building?.id;
      if (buildingId) {
        await dispatch(fetchTransactions({ building_id: buildingId }));
      }
      
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('خطا در حذف هزینه');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleSubmitExpense = async (data, isUpdate = false) => {
    console.log("Expense Data:", data);
    console.log("billDue:", data.billDue);
    setIsSubmitting(true);
    
    try {
      // اگر فقط update کردن custom_unit_costs است
      if (isUpdate && data.shared_bill_id && data.custom_unit_costs) {
        const updateData = {
          shared_bill_id: data.shared_bill_id,
          distribution_method: 'custom',
          custom_unit_costs: data.custom_unit_costs
        };
        const result = await dispatch(updateExpense(updateData)).unwrap();
        toast.success('مبالغ با موفقیت به‌روزرسانی شد');
        
        // دریافت allocation جدید
        if (result.shared_bill_id) {
          try {
            const allocationResult = await dispatch(fetchExpenseAllocation(result.shared_bill_id)).unwrap();
            setEditingExpense({
              id: result.shared_bill_id,
              ...result,
              allocationData: allocationResult
            });
            // Refresh transactions بعد از update
            const buildingId = building?.building_id || building?.id;
            if (buildingId) {
              dispatch(fetchTransactions({ building_id: buildingId }));
            } else {
              dispatch(fetchTransactions({}));
            }
            return;
          } catch (error) {
            console.error("Error fetching allocation:", error);
          }
        }
        return;
      }
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

      // تبدیل custom_unit_costs به فرمت مورد نیاز API (units_id به عنوان کلید)
      let formattedCustomCosts = null;
      if (data.distribution === "custom" && data.customUnitCosts && Object.keys(data.customUnitCosts).length > 0) {
        formattedCustomCosts = {};
        // تبدیل unitId ها به units_id
        Object.keys(data.customUnitCosts).forEach(unitId => {
          // unitId می‌تواند units_id یا unit_number باشد
          // باید units_id واقعی را پیدا کنیم
          const unit = buildingUnits?.find(u => 
            String(u.units_id) === String(unitId) || 
            String(u.id) === String(unitId) || 
            String(u.unit_number) === String(unitId)
          );
          const actualUnitId = unit?.units_id || unit?.id || unitId;
          const cost = parseFloat(data.customUnitCosts[unitId]);
          if (!isNaN(cost) && cost > 0) {
            formattedCustomCosts[String(actualUnitId)] = cost;
          }
        });
      }

      const expenseData = {
        expense_type: mappedExpenseType,
        expense_name: data.expenseName || "",
        total_amount: parseFloat(data.amount) || 0,
        unit_selection: unitSelection,
        specific_units: specificUnits,
        distribution_method: data.distribution || "equal",
        role: finalAllocation,
        payment_method: data.paymentMethod || "direct",
        description: description,
        building_id: parseInt(buildingId),
        bill_due: data.billDue || "", // تاریخ مهلت پرداخت از فرم
        // اضافه کردن custom_unit_costs اگر distribution_method = custom باشد
        ...(formattedCustomCosts && Object.keys(formattedCustomCosts).length > 0 && {
          custom_unit_costs: JSON.stringify(formattedCustomCosts)
        }),
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
        setIsSubmitting(false);
        return;
      }

      // Validate bill_due
      if (!data.billDue || data.billDue.trim() === "") {
        toast.error("تاریخ مهلت پرداخت الزامی است");
        setIsSubmitting(false);
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
        
        // بعد از ثبت موفق، allocation را از بکند بگیریم و نمایش دهیم
        if (result.shared_bill_id) {
          try {
            const allocationResult = await dispatch(fetchExpenseAllocation(result.shared_bill_id)).unwrap();
            
            // نمایش allocation در modal
            setEditingExpense({
              id: result.shared_bill_id,
              ...result,
              allocationData: allocationResult
            });
            // modal را باز نگه دار تا allocation نمایش داده شود
            return; // از بستن modal جلوگیری می‌کنیم
          } catch (error) {
            console.error("Error fetching allocation:", error);
            // اگر خطا داشت، ادامه می‌دهیم و modal را می‌بندیم
          }
        }
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
    // بعد از بستن modal، refresh کن
    const buildingId = building?.building_id || building?.id;
    if (buildingId) {
      dispatch(fetchTransactions({ building_id: buildingId }));
    } else {
      dispatch(fetchTransactions({}));
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'building') {
      setSelectedUnitId(null);
      setUnitTransactions(null);
    } else if (mode === 'unit') {
      // Auto-select user's unit if available
      if (userUnits.length > 0) {
        const userUnitId = userUnits[0].units_id || userUnits[0].id;
        setSelectedUnitId(userUnitId);
      } else {
        setSelectedUnitId(null);
      }
    }
  };

  // Handle unit selection
  const handleUnitSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'my_unit') {
      // Find and select user's unit
      if (userUnits.length > 0) {
        const userUnitId = userUnits[0].units_id || userUnits[0].id;
        setSelectedUnitId(userUnitId);
        // Update select field to show the actual unit ID
        setTimeout(() => {
          const selectElement = e.target;
          if (selectElement) {
            selectElement.value = userUnitId;
          }
        }, 0);
      } else {
        toast.error("واحدی برای شما یافت نشد");
        setSelectedUnitId(null);
      }
    } else if (selectedValue) {
      setSelectedUnitId(parseInt(selectedValue));
    } else {
      setSelectedUnitId(null);
    }
  };

  return (
    <>
      <div className="p-4">
        {/* View Mode Toggle */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => {
                setViewMode('building');
                setShowDebtCredit(false);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'building' && !showDebtCredit
                  ? 'bg-melkingDarkBlue text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              گردش مالی ساختمان
            </button>
            <button
              onClick={() => {
                setViewMode('unit');
                setShowDebtCredit(false);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'unit' && !showDebtCredit
                  ? 'bg-melkingDarkBlue text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              گردش مالی واحد
            </button>
            <button
              onClick={() => {
                setShowDebtCredit(true);
                setViewMode('building');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showDebtCredit
                  ? 'bg-melkingDarkBlue text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              بدهکاری و بستانکاری واحدها
            </button>
          </div>

          {/* Unit Selection (only in unit view mode) */}
          {viewMode === 'unit' && (
            <div className="flex-1 min-w-[200px] max-w-md">
              <SelectField
                label=""
                name="selectedUnit"
                value={selectedUnitId || ""}
                onChange={handleUnitSelect}
                options={[
                  ...(userUnits.length > 0 ? [{
                    value: 'my_unit',
                    label: `واحد من (${userUnits[0].unit_number || userUnits[0].units_id})`
                  }] : []),
                  ...unitOptions
                ]}
                error={null}
              />
            </div>
          )}
        </div>

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

        {/* Filters Section */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 flex flex-col gap-3">
            <TransactionFilter filter={filter} setFilter={setFilter} categories={categories} />
            <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            {/* Amount Range Filter - Compact */}
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
            {/* Reset Filters Button */}
            {(filter !== "all" || searchTerm || dateRange || amountRange.min || amountRange.max) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
                title="بازگشت به حالت اولیه (پاک کردن همه فیلترها)"
              >
                <RotateCcw size={16} />
                <span>بازگشت به حالت اولیه</span>
              </button>
            )}
            
            {/* Export to Excel Button */}
            <button
              onClick={handleExportToExcel}
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

        {/* Debt/Credit Section */}
        {showDebtCredit && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">بدهکاری و بستانکاری واحدها</h2>
              <button
                onClick={handleExportUnitsDebtCreditToExcel}
                disabled={buildingUnits.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  buildingUnits.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                title={buildingUnits.length === 0 ? "داده‌ای برای خروجی وجود ندارد" : "دانلود فایل اکسل"}
              >
                <Download size={16} />
                <span>دانلود اکسل</span>
              </button>
            </div>

            {buildingUnits.length === 0 ? (
              <p className="text-sm text-gray-400 mt-4">داده‌ای برای نمایش وجود ندارد.</p>
            ) : (
              <>
                {/* Header Row */}
                <div className="grid grid-cols-5 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
                  <span className="flex items-center gap-1">شماره واحد</span>
                  <span className="flex items-center gap-1">نام واحد</span>
                  <span className="flex items-center gap-1">نقش</span>
                  <span className="flex items-center gap-1">بدهکاری</span>
                  <span className="flex items-center gap-1">بستانکاری</span>
                </div>

                {/* Units List */}
                {buildingUnits.map((unit, index) => {
                  const unitNumber = unit.unit_number || unit.units_id || "—";
                  const unitName = unit.full_name || unit.owner_name || "—";
                  const role = unit.role === 'owner' 
                    ? (unit.tenant_full_name ? 'مالک دارای مستاجر' : 'مالک')
                    : unit.role === 'tenant'
                    ? 'مستاجر'
                    : (unit.owner_name && unit.tenant_full_name ? 'مالک و ساکن' : 
                       unit.owner_name ? 'مالک' : 
                       unit.tenant_full_name ? 'ساکن' : 'خالی');
                  
                  const totalDebt = unit.total_debt || 0;
                  const totalCredit = unit.total_credit || 0;

                  return (
                    <div
                      key={unit.units_id || unit.id || index}
                      className="grid grid-cols-5 gap-2 items-center text-sm border-b pb-2 mb-2 hover:bg-gray-50 rounded-lg p-2"
                    >
                      <span className="font-medium">{unitNumber}</span>
                      <span className="text-gray-700">{unitName}</span>
                      <span className="text-gray-600 text-xs">{role}</span>
                      <span className={`font-semibold ${totalDebt > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {totalDebt > 0 ? `${Number(totalDebt).toLocaleString('fa-IR')} تومان` : "۰ تومان"}
                      </span>
                      <span className={`font-semibold ${totalCredit > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {totalCredit > 0 ? `${Number(totalCredit).toLocaleString('fa-IR')} تومان` : "۰ تومان"}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Transactions Section - Only show if not showing debt/credit */}
        {!showDebtCredit && (
          <>
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
              <span className="flex items-center gap-1">عنوان</span>
              <span className="flex items-center gap-1">نام هزینه</span>
              <span className="flex items-center gap-1">مبلغ</span>
              <span className="flex items-center gap-1">تاریخ</span>
              <span className="flex items-center gap-1">وضعیت سیستم</span>
            </div>
        {/* Loading State for Unit Transactions */}
        {viewMode === 'unit' && unitTransactionsLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-melkingDarkBlue"></div>
            <span className="mr-2 text-gray-600">در حال بارگذاری گردش مالی واحد...</span>
          </div>
        )}

        {/* Unit Transactions Summary */}
        {viewMode === 'unit' && unitTransactions && !unitTransactionsLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold mb-3 text-blue-800 text-lg">خلاصه گردش مالی واحد</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">کل فاکتورها:</span>
                <span className="font-medium text-gray-900 mr-1">
                  {unitTransactions.summary?.total_invoices || 0} مورد
                </span>
                <span className="block text-gray-600">مبلغ:</span>
                <span className="font-semibold text-gray-900 mr-1">
                  {unitTransactions.summary?.total_amount_invoices?.toLocaleString('fa-IR') || 0} تومان
                </span>
              </div>
              <div>
                <span className="text-gray-600">کل پرداخت‌ها:</span>
                <span className="font-medium text-gray-900 mr-1">
                  {unitTransactions.summary?.total_payments || 0} مورد
                </span>
                <span className="block text-gray-600">مبلغ:</span>
                <span className="font-semibold text-gray-900 mr-1">
                  {unitTransactions.summary?.total_amount_payments?.toLocaleString('fa-IR') || 0} تومان
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Rows */}
        {viewMode === 'unit' && !selectedUnitId && !unitTransactionsLoading && (
          <p className="text-sm text-gray-400 mt-4">لطفاً یک واحد را انتخاب کنید.</p>
        )}
        {viewMode === 'unit' && selectedUnitId && !unitTransactions && !unitTransactionsLoading && (
          <p className="text-sm text-gray-400 mt-4">در حال بارگذاری...</p>
        )}
        {filteredData.length === 0 && viewMode === 'building' && (
          <p className="text-sm text-gray-400 mt-4">موردی برای نمایش وجود ندارد.</p>
        )}
        {filteredData.length === 0 && viewMode === 'unit' && selectedUnitId && unitTransactions && !unitTransactionsLoading && (
          <p className="text-sm text-gray-400 mt-4">این واحد تراکنشی ندارد.</p>
        )}
        {filteredData.length > 0 && (
          filteredData.map((item, index) => (
            <FinanceTableRow 
              key={`${item.id}-${item.type || item.category}-${item.title}-${index}`} 
              transaction={item} 
              onSelect={setSelected} 
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              isManager={isManager}
            />
          ))
        )}
          </>
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
            // بعد از بستن modal، refresh کن
            const buildingId = building?.building_id || building?.id;
            if (buildingId) {
              dispatch(fetchTransactions({ building_id: buildingId }));
            } else {
              dispatch(fetchTransactions({}));
            }
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

      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDeleteExpense}
        title="تایید حذف هزینه"
        itemName={expenseToDelete ? getPersianType(expenseToDelete.title || expenseToDelete.bill_type) : ""}
        itemDetails={expenseToDelete ? `نوع: ${getPersianType(expenseToDelete.title || expenseToDelete.bill_type)}\nمبلغ: ${expenseToDelete.amount?.toLocaleString()} تومان` : ""}
        isLoading={deletingExpenseId === expenseToDelete?.id}
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