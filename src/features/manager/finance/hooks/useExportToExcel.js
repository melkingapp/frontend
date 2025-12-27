import * as XLSX from "xlsx";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { formatJalaliDate, getPersianType, getPersianStatus, getPersianDistributionMethod } from "../../../../shared/utils";
import { getExpenseAllocation } from "../../../../shared/services/billingService";

export function useExportToExcel() {
  const exportTransactionsToExcel = async (filteredData, building) => {
    if (filteredData.length === 0) {
      toast.error("داده‌ای برای خروجی وجود ندارد");
      return;
    }

    try {
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
        const date = item.date 
          ? formatJalaliDate(item.date || item.billing_date || item.issue_date || item.created_at)
          : "—";
        
        const rawTitle = item.title || 
                        item.description || 
                        item.category || 
                        item.type ||
                        item.transaction_type ||
                        'بدون عنوان';
        const title = getPersianType(rawTitle);
        
        const expenseName = item.expense_name || item.expense_details?.expense_name || "—";
        const amount = item.amount || item.total_amount || 0;
        
        const systemStatus = item.payment_method === 'from_fund' 
          ? 'برداشت از موجودی صندوق'
          : getPersianStatus(item.status || item.status_label || 'نامشخص');
        
        const billType = getPersianType(item.bill_type || item.category || item.type || "—");
        const distributionMethod = item.distribution_method 
          ? getPersianDistributionMethod(item.distribution_method)
          : "—";
        
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
          unitsList = allocation.unit_allocations
            .map(ua => `واحد ${ua.unit_number || ua.unit_id}`)
            .join("، ");
          
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

      // Generate filename
      const now = new Date();
      const persianDate = moment(now).format('jYYYY/jMM/jDD');
      const buildingName = building?.title || building?.name || 'ساختمان';
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

  const exportUnitsDebtCreditToExcel = (buildingUnits, building) => {
    if (buildingUnits.length === 0) {
      toast.error("داده‌ای برای خروجی وجود ندارد");
      return;
    }

    try {
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

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "بدهکاری و بستانکاری واحدها");

      const now = new Date();
      const persianDate = moment(now).format('jYYYY/jMM/jDD');
      const buildingName = building?.title || building?.name || 'ساختمان';
      const sanitizedBuildingName = buildingName.replace(/[^\u0600-\u06FF\u0750-\u077F\w\s]/g, '').replace(/\s+/g, '_');
      const filename = `بدهکاری_بستانکاری_واحدها_${sanitizedBuildingName}_${persianDate.replace(/\//g, '_')}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("فایل اکسل با موفقیت دانلود شد");
    } catch (error) {
      console.error("Error exporting units debt/credit to Excel:", error);
      toast.error("خطا در ایجاد فایل اکسل");
    }
  };

  return {
    exportTransactionsToExcel,
    exportUnitsDebtCreditToExcel,
  };
}

