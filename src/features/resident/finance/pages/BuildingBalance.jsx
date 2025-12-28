import { useState, useEffect } from "react";
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
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { selectSelectedResidentBuilding, selectApprovedBuildings, setSelectedBuilding as setSelectedResidentBuilding, refreshApprovedBuildings, fetchApprovedBuildingsDetails } from "../../building/residentBuildingSlice";
import { selectMembershipRequests, fetchMembershipRequests } from "../../../membership/membershipSlice";
import { BalanceSummary } from "../../../manager/finance/components/balance/BalanceSummary";
import { BalanceTable } from "../../../manager/finance/components/balance/BalanceTable";
import { BalanceFilters } from "../../../manager/finance/components/balance/BalanceFilters";
import { BalanceDetailsModal } from "../../../manager/finance/components/balance/BalanceDetails";
import BalanceCharts from "../../../manager/finance/components/balance/BalanceCharts";
import SearchBox from "../../../../shared/components/shared/inputs/SearchBox";
import { fetchBalanceSheet, fetchBalanceTransactions } from "../../../manager/finance/store/slices/financeSlice";
import { getPersianType } from "../../../../shared/utils/typeUtils";
import { exportBalanceSheet } from "../../../../shared/services/billingService";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function BuildingBalance() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const isManager = user?.role === 'manager';
  const isResident = user?.role === 'resident';
  
  // Use appropriate building selector based on user role
  const managerBuilding = useSelector(selectSelectedBuilding);
  const residentBuilding = useSelector(selectSelectedResidentBuilding);
  const approvedBuildings = useSelector(selectApprovedBuildings);
  const membershipRequests = useSelector(selectMembershipRequests);
  
  // Select building based on role
  const building = isResident ? residentBuilding : managerBuilding;
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

  // For residents: fetch membership requests if not loaded
  useEffect(() => {
    if (isResident && membershipRequests.length === 0) {
      dispatch(fetchMembershipRequests());
    }
  }, [isResident, membershipRequests.length, dispatch]);

  // For residents: fetch approved buildings and auto-select if needed
  useEffect(() => {
    if (isResident) {
      // Refresh approved buildings if not loaded
      if (approvedBuildings.length === 0) {
        dispatch(refreshApprovedBuildings());
      }
      // Auto-select first building if none is selected
      else if (approvedBuildings.length > 0 && !building) {
        const firstBuilding = approvedBuildings[0];
        // Make sure the building has a valid building_id
        if (firstBuilding.building_id && !isNaN(firstBuilding.building_id)) {
          dispatch(setSelectedResidentBuilding(firstBuilding));
        } else if (firstBuilding.id) {
          // If building_id is not available, try to extract it from id
          let buildingIdToFetch = null;
          if (typeof firstBuilding.id === 'number') {
            buildingIdToFetch = firstBuilding.id;
          } else if (typeof firstBuilding.id === 'string') {
            // Try to extract building_id from composite string like "5-2"
            const idParts = firstBuilding.id.split('-');
            if (idParts.length > 0 && !isNaN(idParts[0]) && idParts[0] !== 'undefined') {
              buildingIdToFetch = parseInt(idParts[0], 10);
            }
          }
          
          if (buildingIdToFetch && !isNaN(buildingIdToFetch)) {
            dispatch(fetchApprovedBuildingsDetails([buildingIdToFetch]))
              .then((result) => {
                if (result.payload && result.payload.length > 0) {
                  dispatch(setSelectedResidentBuilding(result.payload[0]));
                }
              })
              .catch(error => {
                console.error('Error fetching building details:', error);
              });
          }
        }
      }
      // If building is selected but doesn't have valid building_id, fetch details
      else if (building && (!building.building_id || isNaN(building.building_id))) {
        let buildingIdToFetch = null;
        if (building.building_id && !isNaN(building.building_id)) {
          buildingIdToFetch = building.building_id;
        } else if (building.id) {
          if (typeof building.id === 'number') {
            buildingIdToFetch = building.id;
          } else if (typeof building.id === 'string') {
            // Try to extract building_id from composite string like "undefined-5" or "5-2"
            const idParts = building.id.split('-');
            if (idParts.length > 0 && !isNaN(idParts[0]) && idParts[0] !== 'undefined') {
              buildingIdToFetch = parseInt(idParts[0], 10);
            }
          }
        }
        
        if (buildingIdToFetch && !isNaN(buildingIdToFetch)) {
          dispatch(fetchApprovedBuildingsDetails([buildingIdToFetch]))
            .then((result) => {
              if (result.payload && result.payload.length > 0) {
                dispatch(setSelectedResidentBuilding(result.payload[0]));
              }
            })
            .catch(error => {
              console.error('Error fetching building details:', error);
            });
        }
      }
    }
  }, [isResident, approvedBuildings.length, building, dispatch]);

  // Enrich building with unit_info from membershipRequests if missing
  useEffect(() => {
    if (isResident && building && !building.unit_info?.unit_number && membershipRequests.length > 0) {
      const buildingId = building.building_id || building.id;
      const approvedRequests = membershipRequests.filter(req => 
        req.status === 'approved' || 
        req.status === 'owner_approved' || 
        req.status === 'manager_approved'
      );
      
      const matchingRequest = approvedRequests.find(req => {
        const reqBuildingId = req.building;
        return (
          (reqBuildingId && buildingId && (
            reqBuildingId === buildingId ||
            String(reqBuildingId) === String(buildingId) ||
            (building.building_code && req.building_code === building.building_code) ||
            (building.title && req.building_title === building.title)
          ))
        );
      });
      
      if (matchingRequest && matchingRequest.unit_number) {
        const enrichedBuilding = {
          ...building,
          unit_info: {
            unit_number: matchingRequest.unit_number,
            floor: matchingRequest.floor,
            area: matchingRequest.area,
            resident_count: matchingRequest.resident_count,
            has_parking: matchingRequest.has_parking,
            parking_count: matchingRequest.parking_count,
            role: matchingRequest.role
          }
        };
        dispatch(setSelectedResidentBuilding(enrichedBuilding));
      }
    }
  }, [isResident, building, membershipRequests, dispatch]);

  // Load balance data
  useEffect(() => {
    if (building) {
      // For residents, wait for approvedBuildings to be loaded if needed
      if (isResident && approvedBuildings.length === 0) {
        return; // Wait for buildings to load
      }
      loadBalanceData();
    }
  }, [building, filter, dateRange, approvedBuildings.length, isResident]);

  const loadBalanceData = async () => {
    setIsLoading(true);
    try {
      // Extract building_id properly - only use building_id if it's a valid number
      // Don't use id if it's a composite string like "undefined-5"
      let buildingId = building?.building_id;
      
      // If building_id doesn't exist or is invalid, try to get it from id only if id is a number
      if (!buildingId && building?.id) {
        const idValue = building.id;
        // Check if id is a number (not a composite string)
        if (typeof idValue === 'number' || (typeof idValue === 'string' && /^\d+$/.test(idValue))) {
          buildingId = typeof idValue === 'number' ? idValue : parseInt(idValue, 10);
        }
      }
      
      // If still no valid buildingId, try to find it from approvedBuildings
      if ((!buildingId || isNaN(buildingId)) && isResident && approvedBuildings.length > 0) {
        // Try to find building by title, building_code, or extract from id
        const matchingBuilding = approvedBuildings.find(b => {
          // Match by title (exact match)
          if (building?.title && b.title && b.title.trim() === building.title.trim()) {
            return true;
          }
          // Match by building_code (exact match)
          if (building?.building_code && b.building_code && b.building_code === building.building_code) {
            return true;
          }
          // Match by id if it's a composite string - try to match unit number
          if (building?.id && typeof building.id === 'string' && building.id.includes('-')) {
            const idParts = building.id.split('-');
            if (idParts.length > 1 && idParts[1]) {
              // Try to match by unit number in id
              const unitNumber = idParts[1];
              if (b.unit_info?.unit_number && String(b.unit_info.unit_number) === unitNumber) {
                return true;
              }
            }
          }
          return false;
        });
        
        if (matchingBuilding) {
          // If matching building has valid building_id, use it
          if (matchingBuilding.building_id && !isNaN(matchingBuilding.building_id)) {
            buildingId = matchingBuilding.building_id;
            // Update the selected building with the valid one
            dispatch(setSelectedResidentBuilding(matchingBuilding));
          } else {
            // Try to extract building_id from matching building's id or fetch from API
            let potentialBuildingId = null;
            if (matchingBuilding.id) {
              const idValue = matchingBuilding.id;
              if (typeof idValue === 'number') {
                potentialBuildingId = idValue;
              } else if (typeof idValue === 'string') {
                const idParts = idValue.split('-');
                if (idParts.length > 0 && !isNaN(idParts[0]) && idParts[0] !== 'undefined') {
                  potentialBuildingId = parseInt(idParts[0], 10);
                }
              }
            }
            
            if (potentialBuildingId && !isNaN(potentialBuildingId)) {
              // Try to fetch building details from API
              try {
                const result = await dispatch(fetchApprovedBuildingsDetails([potentialBuildingId])).unwrap();
                if (result && result.length > 0 && result[0].building_id && !isNaN(result[0].building_id)) {
                  buildingId = result[0].building_id;
                  dispatch(setSelectedResidentBuilding(result[0]));
                } else {
                  // Fallback: use potentialBuildingId if API doesn't return valid building_id
                  buildingId = potentialBuildingId;
                  dispatch(setSelectedResidentBuilding(matchingBuilding));
                }
              } catch (error) {
                console.error('Error fetching building details:', error);
                // Fallback: use potentialBuildingId
                if (potentialBuildingId) {
                  buildingId = potentialBuildingId;
                  dispatch(setSelectedResidentBuilding(matchingBuilding));
                }
              }
            }
          }
        }
      }
      
      // If still no valid buildingId, try to extract from id string (even if it contains 'undefined')
      if ((!buildingId || isNaN(buildingId)) && building?.id && typeof building.id === 'string') {
        const idParts = building.id.split('-');
        // Try to find a valid number in the parts (skip 'undefined')
        for (const part of idParts) {
          if (part && part !== 'undefined' && !isNaN(part)) {
            const potentialId = parseInt(part, 10);
            if (potentialId > 0) {
              // Try to find this building in approvedBuildings
              const foundBuilding = approvedBuildings.find(b => 
                (b.building_id === potentialId || b.id === potentialId)
              );
              if (foundBuilding && foundBuilding.building_id && !isNaN(foundBuilding.building_id)) {
                buildingId = foundBuilding.building_id;
                dispatch(setSelectedResidentBuilding(foundBuilding));
                break;
              }
            }
          }
        }
      }
      
      // Validate buildingId
      if (!buildingId || isNaN(buildingId)) {
        console.error("Invalid building ID:", building);
        console.error("Approved buildings:", approvedBuildings);
        // Don't throw error, just return early
        setIsLoading(false);
        return;
      }
      
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

  // For residents: show loading if buildings are being fetched, otherwise show select message
  if (!building) {
    // If resident has approved buildings but none selected yet, show loading
    if (isResident && approvedBuildings.length > 0) {
      return (
        <div className="flex items-center justify-center min-h-[500px] bg-slate-50">
          <div className="text-center p-8">
            <RefreshCw className="animate-spin text-slate-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              در حال بارگذاری...
            </h3>
          </div>
        </div>
      );
    }
    
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
            {isResident 
              ? "برای مشاهده بیلان ساختمان، ابتدا ساختمان مورد نظر را انتخاب کنید"
              : "برای مشاهده بیلان ساختمان، ابتدا ساختمان مورد نظر را انتخاب کنید"
            }
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
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-slate-800 text-white rounded-lg md:rounded-xl hover:bg-slate-900 transition-all duration-200 shadow-lg shadow-slate-800/20 hover:shadow-slate-800/30 font-semibold text-sm md:text-base"
            >
              <Download size={18} className="md:w-5 md:h-5" />
              <span className="whitespace-nowrap">خروجی Excel</span>
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
