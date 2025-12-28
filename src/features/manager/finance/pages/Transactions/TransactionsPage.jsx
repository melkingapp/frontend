import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Coins } from "lucide-react";
import { toast } from "sonner";
import ExtraPaymentRequestForm from "../../../../resident/finance/components/ExtraPaymentRequestForm";
import {
  FinanceSummary,
  UnitTransactionsView,
  BuildingTransactionsView,
  UnitTransactionsSummary,
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
import { deleteExpense, fetchTransactions } from "../../store/slices/financeSlice";
import { getPersianType } from "../../../../../shared/utils/typeUtils";
import DeleteConfirmModal from "../../../../../shared/components/shared/feedback/DeleteConfirmModal";
import { getBuildingUnitsDebtCreditSummary, getUnitDebtSummary } from "../../../../../shared/services/billingService";
import { approveExtraPaymentRequest } from "../../store/slices/extraPaymentSlice";

export default function FinanceTransactions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useCategories();

  const [selected, setSelected] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDebtCredit, setShowDebtCredit] = useState(false);
  const [showUnitFinancialModal, setShowUnitFinancialModal] = useState(false);
  const [selectedUnitInvoice, setSelectedUnitInvoice] = useState(null);
  const [unitStatusFilter, setUnitStatusFilter] = useState("all");
  const [showExtraPaymentForm, setShowExtraPaymentForm] = useState(false);
  const [debtCreditData, setDebtCreditData] = useState(null);
  const [debtCreditLoading, setDebtCreditLoading] = useState(false);
  const [debtCreditError, setDebtCreditError] = useState(null);
  const fetchDebtCreditRef = useRef(false);

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

  // Listen for extra payment approval to refresh data
  const extraPaymentState = useSelector((state) => state.extraPayment);
  useEffect(() => {
    // Refresh transactions and debt/credit data when an extra payment is approved
    if (building?.building_id && extraPaymentState.requests.length > 0) {
      const hasApprovedRequest = extraPaymentState.requests.some(r => r.status === 'approved' && r.manager_approved_at);
      if (hasApprovedRequest) {
        // Refresh transactions
        dispatch(fetchTransactions({ building_id: building.building_id }));
        // Refresh debt/credit if showing
        if (showDebtCredit && !debtCreditLoading && !fetchDebtCreditRef.current) {
          fetchDebtCreditRef.current = true;
          setDebtCreditLoading(true);
          getBuildingUnitsDebtCreditSummary(building.building_id)
            .then((response) => {
              setDebtCreditData(response);
              setDebtCreditLoading(false);
              fetchDebtCreditRef.current = false;
            })
            .catch((error) => {
              fetchDebtCreditRef.current = false;
              setDebtCreditLoading(false);
            });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraPaymentState.requests]);

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

  const handleSubmitExpense = (data) => {
    submitExpense(data, editingExpense, setEditingExpense, setActiveModal);
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
      toast.success("هزینه با موفقیت حذف شد");

      refreshTransactions();

      setExpenseToDelete(null);
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

  // Fetch debt/credit data when showDebtCredit becomes true
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebtCredit, building?.building_id, isManager]);

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
            ) : (
              <BuildingTransactionsView
                filteredData={filteredData}
                onSelect={setSelected}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                isManager={isManager}
              />
            )}
          </>
        )}

        <FinanceDetailsModal
          building={building}
          transaction={viewMode === "building" ? selected : null}
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
          setActiveModal(null);
          setEditingExpense(null);
          refreshTransactions();
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
        itemName={
          expenseToDelete
            ? getPersianType(
                expenseToDelete.title || expenseToDelete.bill_type
              )
            : ""
        }
        itemDetails={
          expenseToDelete
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