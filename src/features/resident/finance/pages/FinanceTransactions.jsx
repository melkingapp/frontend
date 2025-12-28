import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ExtraPaymentRequestForm from "../components/ExtraPaymentRequestForm";
import {
  FinanceSummary,
  UnitTransactionsView,
  BuildingTransactionsView,
  UnitTransactionsSummary,
} from "../../../manager/finance/components/transactions/TransactionList";
import {
  FinanceDetailsModal,
  UnitFinancialDetailsModal,
} from "../../../manager/finance/components/transactions/TransactionDetails";
import { DateRangeModal } from "../../../manager/finance/components/transactions/TransactionFilters";
import { useTransactions } from "../../../manager/finance/hooks/useTransactions";
import { useTransactionsFilters } from "../../../manager/finance/hooks/useTransactionsFilters";
import { useTransactionsData } from "../../../manager/finance/hooks/useTransactionsData";
import { useExportToExcel } from "../../../manager/finance/hooks/useExportToExcel";
import DebtCreditView from "../../../manager/finance/components/transactions/DebtCreditView/DebtCreditView";
import ViewModeSwitcher from "../../../manager/finance/components/transactions/ViewModeSwitcher/ViewModeSwitcher";
import TransactionsFilters from "../../../manager/finance/components/transactions/TransactionsFilters/TransactionsFilters";
import useCategories from "../../../../shared/hooks/useCategories";
import { fetchTransactions, clearTransactions } from "../../../manager/finance/store/slices/financeSlice";
import { fetchBuildingUnits } from "../../../manager/building/buildingSlice";
import { getBuildingUnitsDebtCreditSummary, getUnitDebtSummary } from "../../../../shared/services/billingService";

export default function FinanceTransactions() {
  const dispatch = useDispatch();
  const categories = useCategories();

  const [selected, setSelected] = useState(null);
  const [showDebtCredit, setShowDebtCredit] = useState(false);
  const [showUnitFinancialModal, setShowUnitFinancialModal] = useState(false);
  const [selectedUnitInvoice, setSelectedUnitInvoice] = useState(null);
  const [unitStatusFilter, setUnitStatusFilter] = useState("all");
  const [showExtraPaymentForm, setShowExtraPaymentForm] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [debtCreditData, setDebtCreditData] = useState(null);
  const [debtCreditLoading, setDebtCreditLoading] = useState(false);
  const [debtCreditError, setDebtCreditError] = useState(null);
  const fetchAttemptedRef = useRef(false);

  const {
    building,
    buildings,
    currentFundBalance,
    isManager,
    buildingUnits,
    userUnits,
    viewMode,
    setViewMode,
    selectedUnitId,
    setSelectedUnitId,
    unitTransactions,
    unitTransactionsLoading,
    dateRange,
    setDateRange,
  } = useTransactions();

  const { sortedData, newestDate, oldestDate } = useTransactionsData(
    viewMode,
    unitTransactions,
    unitStatusFilter
  );

  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateRange: filtersDateRange,
    setDateRange: setFiltersDateRange,
    amountRange,
    setAmountRange,
    filteredData,
    totalCost,
    resetFilters,
  } = useTransactionsFilters(sortedData, viewMode);

  // Clear transactions when building changes (to avoid showing old data)
  useEffect(() => {
    dispatch(clearTransactions());
  }, [dispatch, building?.building_id]);

  useEffect(() => {
    if (dateRange !== filtersDateRange) {
      setFiltersDateRange(dateRange);
    }
  }, [dateRange, filtersDateRange, setFiltersDateRange]);

  const { exportTransactionsToExcel, exportUnitsDebtCreditToExcel } =
    useExportToExcel();

  const balance =
    currentFundBalance?.current_balance || building?.fund_balance || 0;

  const unitOptions = buildingUnits.map((unit) => ({
    value: unit.units_id || unit.id,
    label: `واحد ${unit.unit_number || unit.units_id} - ${
      unit.full_name || unit.owner_name || "بدون نام"
    }`,
  }));

  const refreshTransactions = () => {
    const buildingId = building?.building_id || building?.id;
    if (buildingId) {
      dispatch(fetchTransactions({ building_id: buildingId }));
    } else {
      dispatch(fetchTransactions({}));
    }
  };

  const handleSelectUnitInvoice = (tx) => {
    setSelectedUnitInvoice(tx);
    setShowUnitFinancialModal(true);
  };

  const handleResetFilters = () => {
    resetFilters();
    setDateRange(null);
    toast.success("همه فیلترها پاک شدند");
  };

  const handleExportToExcel = () =>
    exportTransactionsToExcel(filteredData, building);
  const handleExportUnitsDebtCreditToExcel = () =>
    exportUnitsDebtCreditToExcel(debtCreditData?.units || [], building);

  const handleDateClick = () => setIsDateModalOpen(true);

  const handleApplyDateFilter = (tempDateRange) => {
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

  // Fetch building units when showDebtCredit is true and buildingUnits are not loaded
  useEffect(() => {
    if (showDebtCredit && building?.building_id && buildingUnits.length === 0) {
      dispatch(fetchBuildingUnits(building.building_id));
    }
  }, [dispatch, showDebtCredit, building?.building_id]);

  // Fetch debt/credit data when showDebtCredit becomes true
  useEffect(() => {
    if (!showDebtCredit || !building?.building_id) {
      // Reset when hiding debt/credit view
      setDebtCreditData(null);
      setDebtCreditError(null);
      fetchAttemptedRef.current = false;
      return;
    }

    // Don't fetch if buildingUnits are not loaded yet - wait for them to load
    if (buildingUnits.length === 0 || userUnits.length === 0) {
      fetchAttemptedRef.current = false; // Reset so we can try again when units are loaded
      return;
    }

    // Create a unique key for this fetch attempt to prevent duplicate requests
    const fetchKey = `${building?.building_id}-${showDebtCredit}-${buildingUnits.length}-${userUnits.length}`;
    
    // Prevent multiple simultaneous requests - only fetch once per unique combination
    if (fetchAttemptedRef.current === fetchKey) {
      return;
    }

    fetchAttemptedRef.current = fetchKey;
    let cancelled = false;
    
    setDebtCreditLoading(true);
    setDebtCreditError(null);
    
    getBuildingUnitsDebtCreditSummary(building.building_id)
      .then((response) => {
        if (cancelled) return;
        setDebtCreditData(response);
        setDebtCreditLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching debt/credit data:", error);
        
        // اگر خطای 403 بود (visibility disabled)، بدهکاری/بستانکاری واحد خود کاربر را بگیر
        if (error.response?.status === 403) {
          if (userUnits.length > 0) {
            const userUnitId = userUnits[0].units_id || userUnits[0].id;
            console.log("Fetching own unit debt/credit for unit:", userUnitId);
            getUnitDebtSummary(userUnitId)
              .then((unitSummary) => {
                if (cancelled) return;
                console.log("Unit debt summary:", unitSummary);
                // Convert single unit summary to the format expected by DebtCreditView
                const unitData = {
                  unit_id: unitSummary.unit_id,
                  total_debt: unitSummary.total_debt || 0,
                  total_credit: unitSummary.total_credit || 0,
                  balance: unitSummary.balance || 0,
                };
                
                // Get unit_number from buildingUnits if available
                const userUnit = buildingUnits.find(u => 
                  (u.units_id || u.id) === userUnitId
                );
                if (userUnit) {
                  unitData.unit_number = userUnit.unit_number;
                } else if (userUnits[0].unit_number) {
                  unitData.unit_number = userUnits[0].unit_number;
                }
                
                setDebtCreditData({
                  building: {
                    id: building.building_id,
                    title: building.title,
                    building_code: building.building_code,
                  },
                  summary: {
                    total_units_debt: unitData.total_debt,
                    total_units_credit: unitData.total_credit,
                    total_units_balance: unitData.balance,
                    units_count: 1,
                  },
                  units: [unitData],
                  is_manager: false,
                  showOnlyOwnUnit: true, // Flag to indicate only own unit is shown
                });
                setDebtCreditLoading(false);
              })
              .catch((unitError) => {
                if (cancelled) return;
                console.error("Error fetching own unit debt/credit:", unitError);
                console.error("Unit error response:", unitError.response);
                setDebtCreditError("خطا در دریافت اطلاعات بدهکاری/بستانکاری واحد شما");
                setDebtCreditLoading(false);
                toast.error("خطا در دریافت اطلاعات بدهکاری/بستانکاری واحد شما");
              });
          } else {
            // اگر userUnits خالی است، خطای مناسب نمایش دهیم
            setDebtCreditError("واحدی برای شما یافت نشد. لطفاً مطمئن شوید که به عنوان ساکن یا مالک به ساختمان اضافه شده‌اید.");
            setDebtCreditLoading(false);
            toast.error("واحدی برای شما یافت نشد");
          }
        } else {
          setDebtCreditError(error.response?.data?.error || error.message || "خطا در دریافت اطلاعات بدهکاری/بستانکاری");
          setDebtCreditLoading(false);
          toast.error("خطا در دریافت اطلاعات بدهکاری/بستانکاری");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebtCredit, building?.building_id]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "building" || mode === "charge") {
      setSelectedUnitId(null);
    } else if (mode === "unit") {
      if (userUnits.length > 0) {
        const userUnitId = userUnits[0].units_id || userUnits[0].id;
        setSelectedUnitId(userUnitId);
      } else {
        setSelectedUnitId(null);
      }
    }
  };

  useEffect(() => {
    if (viewMode === "charge") {
      setFilter("all"); // Data is already filtered by backend, so show all
    } else if (viewMode === "building" && filter === "charge") {
      setFilter("all"); // Reset to all when switching from charge mode
    }
  }, [viewMode, filter, setFilter]);

  const handleUnitSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "my_unit") {
      if (userUnits.length > 0) {
        const userUnitId = userUnits[0].units_id || userUnits[0].id;
        setSelectedUnitId(userUnitId);
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
      setSelectedUnitId(parseInt(selectedValue, 10));
    } else {
      setSelectedUnitId(null);
    }
  };

  return (
    <>
      <div className="p-4">
        {/* Submit Request Button */}
        {userUnits.length > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowExtraPaymentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>ثبت پرداخت اضافی</span>
            </button>
          </div>
        )}

        <ViewModeSwitcher
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          showDebtCredit={showDebtCredit}
          onShowDebtCredit={setShowDebtCredit}
          selectedUnitId={selectedUnitId}
          onUnitSelect={handleUnitSelect}
          unitOptions={unitOptions}
          userUnits={userUnits}
        />

        {viewMode === "building" && !showDebtCredit && (
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
        )}

        {!showDebtCredit && viewMode === "unit" && unitTransactions && !unitTransactionsLoading && (
          <UnitTransactionsSummary
            unitTransactions={unitTransactions}
            unitStatusFilter={unitStatusFilter}
            onStatusFilterChange={setUnitStatusFilter}
          />
        )}

        {!showDebtCredit && (
          <TransactionsFilters
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            amountRange={amountRange}
            setAmountRange={setAmountRange}
            dateRange={dateRange}
            filteredData={filteredData}
            onReset={handleResetFilters}
            onExport={handleExportToExcel}
            categories={categories}
          />
        )}

        {showDebtCredit && (
          <DebtCreditView
            buildingUnits={debtCreditData?.units || []}
            building={building}
            onExport={handleExportUnitsDebtCreditToExcel}
            isLoading={debtCreditLoading}
            error={debtCreditError}
            isManager={false}
            allBuildingUnits={buildingUnits}
          />
        )}

        {!showDebtCredit && (
          <>
            {viewMode === "unit" ? (
              <UnitTransactionsView
                unitTransactions={unitTransactions}
                unitTransactionsLoading={unitTransactionsLoading}
                selectedUnitId={selectedUnitId}
                filteredData={filteredData}
                onSelectUnitInvoice={handleSelectUnitInvoice}
                onEdit={null}
                onDelete={null}
                isManager={false}
              />
            ) : (
              <BuildingTransactionsView
                filteredData={filteredData}
                onSelect={setSelected}
                onEdit={null}
                onDelete={null}
                isManager={false}
              />
            )}
          </>
        )}

        <FinanceDetailsModal
          building={building}
          transaction={viewMode === "building" ? selected : null}
          onClose={() => setSelected(null)}
          onEdit={null}
          isResident={true}
        />

        <UnitFinancialDetailsModal
          isOpen={showUnitFinancialModal}
          onClose={() => {
            setShowUnitFinancialModal(false);
            setSelectedUnitInvoice(null);
          }}
          invoice={selectedUnitInvoice}
          unitId={selectedUnitId}
        />
      </div>

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        dateRange={dateRange}
        onApply={handleApplyDateFilter}
        onClear={handleClearDateFilter}
        oldestDate={oldestDate}
        newestDate={newestDate}
      />

      {/* Extra Payment Request Form */}
      <ExtraPaymentRequestForm
        isOpen={showExtraPaymentForm}
        onClose={() => setShowExtraPaymentForm(false)}
        onSuccess={() => {
          setShowExtraPaymentForm(false);
          refreshTransactions();
        }}
      />
    </>
  );
}
