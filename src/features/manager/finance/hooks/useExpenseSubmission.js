import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { registerExpense, updateExpense, fetchTransactions, fetchCurrentFundBalance } from "../store/slices/financeSlice";

export function useExpenseSubmission(building, buildings, buildingUnits) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExpense = async (data, editingExpense, setEditingExpense, setActiveModal) => {
    setIsSubmitting(true);

    try {
      // Get building ID
      const buildingId = building?.building_id || building?.id;
      if (!buildingId) {
        toast.error("ساختمان انتخاب نشده است");
        setIsSubmitting(false);
        return;
      }

      // Transform form data to API format
      const expenseData = {
        building_id: buildingId,
        expense_type: data.type || data.value,
        expense_name: data.expenseName || data.expense_name,
        total_amount: parseFloat(data.amount?.toString().replace(/,/g, "") || data.total_amount || 0),
        unit_selection: mapTargetToUnitSelection(data.target),
        distribution_method: data.distribution || data.distribution_method,
        role: data.allocation || data.role,
        description: data.description || "",
        bill_due: data.billDue || data.bill_due,
        payment_method: data.paymentMethod || data.payment_method || "direct",
      };

      // Handle specific units if custom target is selected
      if (data.target === "custom" && data.selectedUnits && Array.isArray(data.selectedUnits)) {
        expenseData.specific_units = data.selectedUnits.map(unitId => 
          typeof unitId === "object" ? (unitId.value || unitId.id) : unitId
        );
      }

      // Handle custom unit costs
      if (data.distribution === "custom" && data.customUnitCosts) {
        expenseData.custom_unit_costs = data.customUnitCosts;
      }

      // Handle files - ensure proper File object extraction
      if (data.files && data.files.length > 0) {
        if (Array.isArray(data.files)) {
          // Use the first file as attachment
          const file = data.files[0];
          // Validate that it's actually a File object
          if (file instanceof File || file instanceof Blob) {
            expenseData.attachment = file;
          } else {
            console.warn('File in array is not a valid File object:', file);
          }
        } else if (data.files instanceof File || data.files instanceof Blob) {
          expenseData.attachment = data.files;
        } else {
          console.warn('Files data is not in expected format:', data.files);
        }
      }

      // Handle grace period and auto transfer if provided
      if (data.gracePeriodDays !== undefined) {
        expenseData.grace_period_days = data.gracePeriodDays;
      }
      if (data.autoTransferToDebt !== undefined) {
        expenseData.auto_transfer_to_debt = data.autoTransferToDebt;
      }

      // Handle billing date if provided
      if (data.billingDate || data.billing_date) {
        expenseData.billing_date = data.billingDate || data.billing_date;
      }

      let result;
      if (editingExpense) {
        // Update existing expense
        expenseData.shared_bill_id = editingExpense.shared_bills_id || editingExpense.id || editingExpense.shared_bill_id;
        
        result = await dispatch(updateExpense(expenseData)).unwrap();
        toast.success("هزینه با موفقیت ویرایش شد");
      } else {
        // Create new expense
        result = await dispatch(registerExpense(expenseData)).unwrap();
        toast.success("هزینه با موفقیت ثبت شد");
      }

      // Refresh transactions with a small delay to allow backend to process
      // and invalidate cache, ensuring the newly created expense is included
      const filters = {};
      if (buildingId) {
        filters.building_id = buildingId;
      }

      // Clear any cached data and force fresh fetch
      dispatch({ type: 'finance/clearTransactions' });

      // Add a small delay to allow backend cache invalidation and database update
      setTimeout(() => {
        // Force refresh by adding a timestamp to bypass any frontend caching
        const refreshFilters = {
          ...filters,
          _refresh: Date.now() // Add timestamp to force fresh request
        };

        // Refresh transactions
        dispatch(fetchTransactions(refreshFilters))
          .then(() => {
            console.log("✅ Transactions refreshed after expense registration");
          })
          .catch((error) => {
            console.error("❌ Failed to refresh transactions after expense registration:", error);
          });

        // Refresh current fund balance to update the balance display
        dispatch(fetchCurrentFundBalance(buildingId))
          .then(() => {
            console.log("✅ Fund balance refreshed after expense registration");
          })
          .catch((error) => {
            console.error("❌ Failed to refresh fund balance after expense registration:", error);
          });
      }, 1000); // Increased delay to 1 second

      // Close modal and reset editing state
      setActiveModal(null);
      if (setEditingExpense) {
        setEditingExpense(null);
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "خطا در ثبت هزینه";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitExpense,
  };
}

// Helper function to map target to unit_selection
function mapTargetToUnitSelection(target) {
  const mapping = {
    all: "all_units",
    full: "occupied_units",
    empty: "empty_units",
    custom: "specific_units",
  };
  return mapping[target] || target || "all_units";
}
