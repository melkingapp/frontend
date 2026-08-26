import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Coins } from "lucide-react";
import { toast } from "sonner";
import {
  FinanceSummary,
  UnitTransactionsView,
  BuildingTransactionsView,
  UnitTransactionsSummary,
  ChargesTab,
} from "../../components/transactions/TransactionList";
import {
  FinanceDetailsModal,
  UnitFinancialDetailsModal,
} from "../../components/transactions/TransactionDetails";
import { DateRangeModal } from "../../components/transactions/TransactionFilters";
import { useTransactions } from "../../hooks/useTransactions";
import { useTransactionsFilters } from "../../hooks/useTransactionsFilters";
import { useTransactionsData } from "../../hooks/useTransactionsData";
import { useExportToExcel } from "../../hooks/useExportToExcel";
import { useExpenseSubmission } from "../../hooks/useExpenseSubmission";
import DebtCreditView from "../../components/transactions/DebtCreditView/DebtCreditView";
import ViewModeSwitcher from "../../components/transactions/ViewModeSwitcher/ViewModeSwitcher";
import TransactionsFilters from "../../components/transactions/TransactionsFilters/TransactionsFilters";
import FloatingActionButton from "../../../../../shared/components/shared/feedback/FloatingActionButton";
import { AddExpenseModal } from "../../components/transactions/AddExpense";
import { PayBillModal } from "../../components/transactions/PayBill";
import useCategories from "../../../../../shared/hooks/useCategories";
import { deleteExpense, fetchTransactions, fetchCurrentFundBalance, clearTransactions, selectFinanceLoading } from "../../store/slices/financeSlice";
import { getPersianType } from "../../../../../shared/utils/typeUtils";
import DeleteConfirmModal from "../../../../../shared/components/shared/feedback/DeleteConfirmModal";
import { getBuildingUnitsDebtCreditSummary, getUnitDebtSummary } from "../../../../../shared/services/billingService";
import { approveExtraPaymentRequest } from "../../store/slices/extraPaymentSlice";
import ReportsMenu from "../../components/reports/ReportsMenu";

export default function FinanceTransactions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useCategories();
  const transactionsLoading = useSelector(selectFinanceLoading);

  const [selected, setSelected] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [showDebtCredit, setShowDebtCredit] = useState(false);
  const [showUnitFinancialModal, setShowUnitFinancialModal] = useState(false);
  const [selectedUnitInvoice, setSelectedUnitInvoice] = useState(null);
  const [unitStatusFilter, setUnitStatusFilter] = useState("all");
  const [debtCreditData, setDebtCreditData] = useState(null);
  const [debtCreditLoading, setDebtCreditLoading] = useState(false);
  const [debtCreditError, setDebtCreditError] = useState(null);
  const fetchDebtCreditRef = useRef(false);
  const [debtCreditRefreshKey, setDebtCreditRefreshKey] = useState(0);

  // Listen for debt/credit refresh signals from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'refreshDebtCredit' && showDebtCredit) {
        console.log('Debt/credit refresh signal received, refreshing data...');
        setDebtCreditRefreshKey(prev => prev + 1);
        // Clear the signal
        localStorage.removeItem('refreshDebtCredit');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check on mount in case there was a pending refresh
    const pendingRefresh = localStorage.getItem('refreshDebtCredit');
    if (pendingRefresh && showDebtCredit) {
      console.log('Found pending debt/credit refresh on mount');
      setDebtCreditRefreshKey(prev => prev + 1);
      localStorage.removeItem('refreshDebtCredit');
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [showDebtCredit]);
  const expenseSubmittedRef = useRef(false);
  const expenseSubmittedSuccessfullyRef = useRef(false);

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

  // Always call the hook to maintain hook order
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateRange: filtersDateRange,
    setDateRange: setFiltersDateRange,
    amountRange,
    setAmountRange,
    filteredData: rawFilteredData,
    totalCost,
    resetFilters,
  } = useTransactionsFilters(sortedData, viewMode);

  // In charge mode, don't use filtered data
  const filteredData = viewMode === 'charge' ? [] : rawFilteredData;

  useEffect(() => {
    if (dateRange !== filtersDateRange) {
      setFiltersDateRange(dateRange);
    }
  }, [dateRange, filtersDateRange, setFiltersDateRange]);

  const { exportTransactionsToExcel, exportUnitsDebtCreditToExcel } =
    useExportToExcel();
  const { isSubmitting, submitExpense } = useExpenseSubmission(
    building,
    buildings,
    buildingUnits
  );

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

  const handleExpense = () => setActiveModal("expense");

  const handleSelectUnitInvoice = useCallback((tx) => {
    setSelectedUnitInvoice(tx);
    setShowUnitFinancialModal(true);
  }, []);

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

  const handleSubmitExpense = (data) => {
    expenseSubmittedRef.current = true;
    submitExpense(data, editingExpense, setEditingExpense, setActiveModal);
  };

  // Refresh transactions when expense is successfully submitted and modal is closed
  useEffect(() => {
    // When isSubmitting changes from true to false and expense was submitted, refresh
    if (!isSubmitting && expenseSubmittedRef.current && activeModal === null) {
      expenseSubmittedSuccessfullyRef.current = true;
      refreshTransactions();
      expenseSubmittedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, activeModal]);

  const handleEditExpense = useCallback((expense) => {
    setEditingExpense(expense);
    setActiveModal("expense");
  }, []);

  const handleDeleteExpense = useCallback((expense) => {
    setExpenseToDelete(expense);
    setDeleteWarning(null); // Reset warning when opening delete modal
  }, []);

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      setDeletingExpenseId(expenseToDelete.id);
      
      // اگر warning وجود دارد، با confirm=true صدا بزن
      const confirm = !!deleteWarning;
      const response = await dispatch(deleteExpense({ expenseId: expenseToDelete.id, confirm })).unwrap();
      
      // بررسی warning
      if (response.warning && !confirm) {
        // نمایش warning و منتظر تایید کاربر بمان
        setDeleteWarning(response);
        setDeletingExpenseId(null);
        return;
      }
      
      // اگر warning نبود یا confirm بود، هزینه حذف شد
      toast.success("هزینه با موفقیت حذف شد");
      
      if (response.refunded_units && response.refunded_units.length > 0) {
        const unitNumbers = response.refunded_units.map(u => u.unit_number).join('، ');
        toast.success(`مبلغ به موجودی صندوق و بستانکاری واحدهای ${unitNumbers} برگردانده شد`);
      }

      // Get building ID for refresh
      const buildingId = building?.building_id || building?.id;
      
      // Clear transactions cache to prevent showing old deleted transactions
      dispatch(clearTransactions());

      // Add a small delay to allow backend to process and invalidate cache
      setTimeout(() => {
        // Refresh transactions with a timestamp to bypass cache
        const refreshFilters = {
          building_id: buildingId,
          _refresh: Date.now()
        };

        dispatch(fetchTransactions(refreshFilters))
          .then(() => {
            console.log("✅ Transactions refreshed after expense deletion");
          })
          .catch((error) => {
            console.error("❌ Failed to refresh transactions after expense deletion:", error);
          });

        // Refresh current fund balance to update the balance display (only once)
        if (buildingId) {
          dispatch(fetchCurrentFundBalance(buildingId))
            .then(() => {
              console.log("✅ Fund balance refreshed after expense deletion");
            })
            .catch((error) => {
              console.error("❌ Failed to refresh fund balance after expense deletion:", error);
            });
        }
      }, 1000);

      setExpenseToDelete(null);
      setDeleteWarning(null);
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("خطا در حذف هزینه");
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleBillPaySubmit = (billData) => {
    console.log("پرداخت قبض:", billData);
    setActiveModal(null);
    refreshTransactions();
  };

  const refreshDebtCredit = () => {
    setDebtCreditRefreshKey(prev => prev + 1);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "building") {
      setSelectedUnitId(null);
    } else if (mode === "charge") {
      // For charge mode, set selectedUnitId to user's unit if resident, first unit if manager
      if (!isManager && userUnits.length > 0) {
        const userUnitId = userUnits[0].units_id || userUnits[0].id;
        setSelectedUnitId(userUnitId);
      } else if (isManager && unitOptions.length > 0) {
        // For managers, select the first unit by default
        setSelectedUnitId(unitOptions[0].value);
      } else {
        setSelectedUnitId(null);
      }
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
    console.log('🔄 ViewMode/Filter change:', { viewMode, filter });
    if (viewMode === "charge") {
      console.log('🎯 Setting filter to all for charge mode');
      setFilter("all"); // Don't filter, use ChargesTab instead
    } else if (viewMode === "building" && filter === "charge") {
      console.log('🏠 Resetting filter to all');
      setFilter("all"); // Reset to all when switching from charge mode
    }
  }, [viewMode, filter, setFilter]);

  // Fetch debt/credit data when showDebtCredit becomes true or debtCreditRefreshKey changes
  useEffect(() => {
    if (showDebtCredit && building?.building_id && !debtCreditLoading && !fetchDebtCreditRef.current) {
      fetchDebtCreditRef.current = true;
      setDebtCreditLoading(true);
      setDebtCreditError(null);
      const buildingId = building.building_id;
      getBuildingUnitsDebtCreditSummary(buildingId)
        .then((response) => {
          setDebtCreditData(response);
          setDebtCreditLoading(false);
          fetchDebtCreditRef.current = false;
        })
        .catch((error) => {
          fetchDebtCreditRef.current = false;
          console.error("Error fetching debt/credit data:", error);
          console.log("userUnits:", userUnits);
          console.log("buildingUnits:", buildingUnits);
          
          // اگر خطای 403 بود (visibility disabled) و کاربر مدیر نیست، بدهکاری/بستانکاری واحد خود کاربر را بگیر
          if (error.response?.status === 403 && !isManager && userUnits && userUnits.length > 0) {
            const userUnitId = userUnits[0].units_id || userUnits[0].id;
            console.log("Fetching own unit debt/credit for unit:", userUnitId);
            getUnitDebtSummary(userUnitId)
              .then((unitSummary) => {
                console.log("Unit debt summary:", unitSummary);
                // Convert single unit summary to the format expected by DebtCreditView
                const unitData = {
                  unit_id: unitSummary.unit_id,
                  total_debt: unitSummary.total_debt || 0,
                  total_credit: unitSummary.total_credit || 0,
                  balance: unitSummary.balance || 0,
                };
                
                // Get unit_number from buildingUnits if available
                const userUnit = buildingUnits && buildingUnits.length > 0 
                  ? buildingUnits.find(u => (u.units_id || u.id) === userUnitId)
                  : null;
                if (userUnit) {
                  unitData.unit_number = userUnit.unit_number;
                } else if (userUnits[0]?.unit_number) {
                  unitData.unit_number = userUnits[0].unit_number;
                }
                
                setDebtCreditData({
                  building: {
                    id: buildingId,
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
                fetchDebtCreditRef.current = false;
              })
              .catch((unitError) => {
                fetchDebtCreditRef.current = false;
                console.error("Error fetching own unit debt/credit:", unitError);
                console.error("Unit error response:", unitError.response);
                setDebtCreditError("خطا در دریافت اطلاعات بدهکاری/بستانکاری واحد شما");
                setDebtCreditLoading(false);
                toast.error("خطا در دریافت اطلاعات بدهکاری/بستانکاری واحد شما");
              });
          } else if (error.response?.status === 403 && !isManager && (!userUnits || userUnits.length === 0)) {
            // اگر userUnits خالی است، خطای مناسب نمایش دهیم
            setDebtCreditError("واحدی برای شما یافت نشد. لطفاً مطمئن شوید که به عنوان ساکن یا مالک به ساختمان اضافه شده‌اید.");
            setDebtCreditLoading(false);
            toast.error("واحدی برای شما یافت نشد");
          } else {
            setDebtCreditError(error.response?.data?.error || error.message || "خطا در دریافت اطلاعات بدهکاری/بستانکاری");
            setDebtCreditLoading(false);
            
            // اگر خطای 403 بود (visibility disabled)، پیام مناسب نشان دهیم
            if (error.response?.status === 403 && isManager) {
              toast.error("خطا در دریافت اطلاعات بدهکاری/بستانکاری");
            } else if (error.response?.status !== 403) {
              toast.error("خطا در دریافت اطلاعات بدهکاری/بستانکاری");
            }
          }
        });
    } else if (!showDebtCredit) {
      // Reset when hiding debt/credit view
      setDebtCreditData(null);
      setDebtCreditError(null);
      fetchDebtCreditRef.current = false;
    } else if (debtCreditRefreshKey > 0) {
      // Force refresh when debtCreditRefreshKey changes
      fetchDebtCreditRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebtCredit, building?.building_id, isManager, debtCreditRefreshKey]);

  // Also fetch when buildingUnits become available (in case they load after showDebtCredit is set)
  // Use a ref to track if we've already tried to fetch when buildingUnits loaded
  const buildingUnitsLoadedRef = useRef(false);
  useEffect(() => {
    if (
      showDebtCredit && 
      building?.building_id && 
      buildingUnits.length > 0 && 
      !buildingUnitsLoadedRef.current &&
      !fetchDebtCreditRef.current
    ) {
      buildingUnitsLoadedRef.current = true;
      fetchDebtCreditRef.current = true;
      setDebtCreditLoading(true);
      setDebtCreditError(null);
      const buildingId = building.building_id;
      getBuildingUnitsDebtCreditSummary(buildingId)
        .then((response) => {
          setDebtCreditData(response);
          setDebtCreditLoading(false);
          fetchDebtCreditRef.current = false;
        })
        .catch((error) => {
          fetchDebtCreditRef.current = false;
          buildingUnitsLoadedRef.current = false;
          console.error("Error fetching debt/credit data (retry):", error);
          setDebtCreditError(error.response?.data?.error || error.message || "خطا در دریافت اطلاعات بدهکاری/بستانکاری");
          setDebtCreditLoading(false);
          if (error.response?.status !== 403) {
            toast.error("خطا در دریافت اطلاعات بدهکاری/بستانکاری");
          }
        });
    }
    // Reset when showDebtCredit becomes false
    if (!showDebtCredit) {
      buildingUnitsLoadedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingUnits.length, showDebtCredit, building?.building_id]);

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
        {/* Header Actions */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Reports Menu - Only for Managers */}
          {isManager && building && (
            <ReportsMenu building={building} isManager={isManager} />
          )}
          
          {/* Submit Request Button */}
          {userUnits.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowExtraPaymentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span>ثبت پرداخت اضافی</span>
              </button>
            </div>
          )}
        </div>

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

        {!showDebtCredit && viewMode === "building" && (
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
            isManager={isManager}
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
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                isManager={isManager}
              />
            ) : viewMode === "charge" ? (
              selectedUnitId ? (
                <ChargesTab
                  unitId={selectedUnitId}
                  buildingId={building?.building_id}
                  dateRange={dateRange}
                  isManager={isManager}
                  onChargeSelect={handleSelectUnitInvoice}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">لطفاً یک واحد انتخاب کنید تا شارژهای آن نمایش داده شود.</p>
                </div>
              )
            ) : (
              <BuildingTransactionsView
                filteredData={filteredData}
                onSelect={setSelected}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                isManager={isManager}
                loading={transactionsLoading}
              />
            )}
          </>
        )}

        <FinanceDetailsModal
          building={building}
          transaction={(viewMode === "building" || viewMode === "charge") ? selected : null}
          onClose={() => setSelected(null)}
          onEdit={handleEditExpense}
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

      <FloatingActionButton
        color="bg-yellow-500"
        items={[
          {
            key: "expense",
            label: "ثبت هزینه",
            icon: <Coins className="w-4 h-4" />,
            onClick: handleExpense,
          },
        ]}
      />

      <AddExpenseModal
        isOpen={activeModal === "expense"}
        onClose={() => {
          const wasSubmitted = expenseSubmittedRef.current;
          setActiveModal(null);
          setEditingExpense(null);
          
          // If modal was closed without submitting (user cancels), refresh
          if (!wasSubmitted && !isSubmitting) {
            refreshTransactions();
            expenseSubmittedRef.current = false;
          }
          // If expense was submitted, the useEffect will handle the refresh
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
        onClose={() => {
          setExpenseToDelete(null);
          setDeleteWarning(null);
        }}
        onConfirm={confirmDeleteExpense}
        title={deleteWarning ? "هشدار: واحدهایی پرداخت کرده‌اند" : "تایید حذف هزینه"}
        message={deleteWarning ? deleteWarning.message : undefined}
        itemName={
          expenseToDelete
            ? getPersianType(
                expenseToDelete.title || expenseToDelete.bill_type
              )
            : ""
        }
        itemDetails={
          deleteWarning
            ? `واحدهای پرداخت‌کننده:\n${deleteWarning.paid_units.map(u => `واحد ${u.unit_number}: ${u.paid_amount.toLocaleString()} تومان`).join('\n')}\n\nمجموع مبلغ پرداخت شده: ${deleteWarning.total_paid_amount.toLocaleString()} تومان\n\nبا حذف این هزینه، مبلغ به موجودی صندوق و بستانکاری واحدها برگردانده می‌شود.`
            : expenseToDelete
            ? `نوع: ${getPersianType(
                expenseToDelete.title || expenseToDelete.bill_type
              )}\nمبلغ: ${expenseToDelete.amount?.toLocaleString()} تومان`
            : ""
        }
        isLoading={deletingExpenseId === expenseToDelete?.id}
      />

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        dateRange={dateRange}
        onApply={handleApplyDateFilter}
        onClear={handleClearDateFilter}
        oldestDate={oldestDate}
        newestDate={newestDate}
      />

    </>
  );
}