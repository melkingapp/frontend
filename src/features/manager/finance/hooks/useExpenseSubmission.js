import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { registerExpense, updateExpense, fetchTransactions, fetchExpenseAllocation } from "../store/slices/financeSlice";
import { addExpenseType } from "../store/slices/expenseTypesSlice";
import { getPersianType } from "../../../../shared/utils/typeUtils";

export function useExpenseSubmission(building, buildings, buildingUnits) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExpense = async (data, editingExpense, setEditingExpense, setActiveModal) => {
    setIsSubmitting(true);
    
    try {
      // اگر فقط update کردن custom_unit_costs است
      if (editingExpense && data.shared_bill_id && data.custom_unit_costs) {
        const updateData = {
          shared_bill_id: data.shared_bill_id,
          distribution_method: 'custom',
          custom_unit_costs: data.custom_unit_costs
        };
        const result = await dispatch(updateExpense(updateData)).unwrap();
        toast.success('مبالغ با موفقیت به‌روزرسانی شد');
        
        if (result.shared_bill_id) {
          try {
            const allocationResult = await dispatch(fetchExpenseAllocation(result.shared_bill_id)).unwrap();
            setEditingExpense({
              id: result.shared_bill_id,
              ...result,
              allocationData: allocationResult
            });
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
        mappedExpenseType = 'other';
        description = data.customType;
      } else if (data.type === "purchases") {
        mappedExpenseType = 'purchases';
        if (data.customType) {
          description = `اقلام خریدنی (${data.customType})`;
        } else {
          description = 'اقلام خریدنی';
        }
      } else {
        mappedExpenseType = expenseTypeMapping[data.type] || data.type || "other";
      }
      
      // تبدیل داده‌های فرم به فرمت API
      let unitSelection = "all_units";
      let specificUnits = [];

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
          specificUnits = data.selectedUnits?.map(unitNumber => {
            const unit = buildingUnits?.find(u => u.unit_number === unitNumber || u.id === unitNumber);
            return unit?.units_id || unit?.id || unitNumber;
          }) || [];
          break;
        default:
          unitSelection = "all_units";
      }

      // تبدیل allocation از آرایه به string
      let finalAllocation = "both";
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

      // تبدیل custom_unit_costs به فرمت مورد نیاز API
      let formattedCustomCosts = null;
      if (data.distribution === "custom" && data.customUnitCosts && Object.keys(data.customUnitCosts).length > 0) {
        formattedCustomCosts = {};
        Object.keys(data.customUnitCosts).forEach(unitId => {
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
        bill_due: data.billDue || "",
        ...(formattedCustomCosts && Object.keys(formattedCustomCosts).length > 0 && {
          custom_unit_costs: JSON.stringify(formattedCustomCosts)
        }),
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
      
      if (unitSelection === "specific_units" && (!specificUnits || specificUnits.length === 0)) {
        toast.error("لطفاً حداقل یک واحد انتخاب کنید");
        setIsSubmitting(false);
        return;
      }

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
        
        if (result.shared_bill_id) {
          try {
            const allocationResult = await dispatch(fetchExpenseAllocation(result.shared_bill_id)).unwrap();
            setEditingExpense({
              id: result.shared_bill_id,
              ...result,
              allocationData: allocationResult
            });
            return;
          } catch (error) {
            console.error("Error fetching allocation:", error);
          }
        }
      }
      
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
        dispatch(addExpenseType({ 
          value: `custom_${data.customType.replace(/\s+/g, '_').toLowerCase()}`, 
          label: data.customType 
        }));
      } else {
        displayType = getPersianType(expenseData.expense_type);
      }
      
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

  return {
    isSubmitting,
    submitExpense,
  };
}

