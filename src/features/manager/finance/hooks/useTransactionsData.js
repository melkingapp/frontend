import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getPersianType } from "../../../../shared/utils";

/**
 * Hook برای پردازش و نرمال‌سازی داده‌های تراکنش‌ها
 */
export function useTransactionsData(viewMode, unitTransactions, unitStatusFilter) {
  // Get transactions from Redux state
  const transactionsData = useSelector(state => state.finance.transactions || []);
  const transactions = Array.isArray(transactionsData) 
    ? transactionsData 
    : (transactionsData?.transactions || []);

  // Normalize unit financial transactions for UI
  const transactionsToDisplay = useMemo(() => {
    if (viewMode === 'unit' && unitTransactions) {
      const rawUnitTx =
        unitTransactions.invoices ||
        unitTransactions.transactions ||
        [];

      let normalized = rawUnitTx.map((tx) => {
        const expenseName =
          tx.shared_expense_info?.expense_name ||
          tx.expense_name ||
          tx.description ||
          null;

        // Use getPersianType to translate category_display or category
        const categoryLabel = tx.category_display || tx.category || tx.expense_type || tx.type || null;
        const translatedCategory = categoryLabel ? getPersianType(categoryLabel, tx) : null;
        const title =
          expenseName ||
          tx.description ||
          translatedCategory ||
          'تراکنش';

        const amount =
          tx.shared_expense_info?.unit_share_amount ??
          tx.total_amount ??
          0;

        const date = tx.issue_date || tx.date || tx.created_at || null;

        return {
          ...tx,
          id: tx.invoice_id || tx.id,
          title,
          expense_name: expenseName,
          amount,
          date,
          billing_date: tx.shared_expense_info?.billing_date || null,
          bill_due: tx.shared_expense_info?.bill_due || tx.due_date || null,
          payment_method: tx.shared_expense_info?.payment_method || tx.payment_method || null,
          distribution_method: tx.shared_expense_info?.distribution_method || tx.distribution_method || null,
          type: tx.type || 'invoice',
          transaction_type: tx.transaction_type || 'invoice',
          payments: tx.payments || [],
          shared_expense_info: tx.shared_expense_info || null,
          raw: tx,
        };
      });

      // فیلتر وضعیت برای حالت گردش مالی واحد
      if (unitStatusFilter !== "all") {
        normalized = normalized.filter((t) => {
          const status = String(t.status || "").toLowerCase();
          if (unitStatusFilter === "paid") {
            return status === "paid";
          }
          if (unitStatusFilter === "unpaid") {
            return status === "pending" || status === "overdue";
          }
          return true;
        });
      }

      return normalized;
    }

    return transactions;
  }, [viewMode, unitTransactions, unitStatusFilter, transactions]);

  // Sort by date (newest first)
  const sortedData = useMemo(() => {
    return [...transactionsToDisplay].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
  }, [transactionsToDisplay]);

  // Get building for date range calculation
  const building = useSelector(state => {
    const selectedBuilding = state.building.selectedBuilding;
    const buildings = state.building.data;
    return selectedBuilding || (buildings.length > 0 ? buildings[0] : null);
  });
  
  const buildingCreatedAt = building?.created_at || building?.createdAt || null;
  
  // Calculate date range
  const { newestDate, oldestDate } = useMemo(() => {
    if (sortedData.length > 0) {
      return {
        newestDate: sortedData[0].date || buildingCreatedAt || "-",
        oldestDate: sortedData[sortedData.length - 1].date || buildingCreatedAt || "-"
      };
    }
    
    return {
      newestDate: buildingCreatedAt || "-",
      oldestDate: buildingCreatedAt || "-"
    };
  }, [sortedData, buildingCreatedAt]);

  return {
    transactions,
    transactionsToDisplay,
    sortedData,
    newestDate,
    oldestDate,
  };
}

