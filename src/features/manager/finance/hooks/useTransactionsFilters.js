import { useState, useMemo } from "react";
import moment from "moment-jalaali";
import useCategories from "../../../../shared/hooks/useCategories";

export function useTransactionsFilters(transactions, viewMode) {
  const categories = useCategories();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  // Sort transactions by date (newest first)
  const sortedData = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
  }, [transactions]);

  // Filter transactions
  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      let matchesFilter = false;

      if (viewMode === 'unit') {
        matchesFilter = true;
      } else if (viewMode === 'charge') {
        // In charge view mode, show only charge transactions
        matchesFilter = (item.title && item.title.includes('شارژ')) ||
                       item.expense_type === 'charge' ||
                       item.charge_type ||
                       item.type === 'charge' ||
                       item.category === 'charge';
      } else if (filter === "all") {
        matchesFilter = true;
      } else if (filter === "purchases") {
        matchesFilter = item.title && item.title.startsWith("اقلام خریدنی");
      } else if (filter.startsWith("custom_")) {
        const customType = filter.replace("custom_", "").replace(/_/g, " ");
        matchesFilter = item.title === customType || 
                       item.bill_type === customType ||
                       (item.bill_type === 'other' && item.description === customType);
      } else {
        const filterLabel = categories.find(cat => cat.value === filter)?.label;
        
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
        
        const expectedTitle = filterMapping[filter];
        const expectedBillType = billTypeMapping[filter];
        
        matchesFilter =
          (item.title && item.title === expectedTitle) ||
          (item.bill_type && item.bill_type === expectedBillType) ||
          (item.category && item.category === filter) ||
          (item.title && item.title === filterLabel) ||
          (item.expense_type && item.expense_type === expectedBillType) ||
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

      let matchesDate = true;
      if (dateRange && item.date) {
        try {
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
            d.setHours(23, 59, 59, 999);
            return d;
          })() : null;
          
          if (fromDate && itemDate < fromDate) matchesDate = false;
          if (toDate && itemDate > toDate) matchesDate = false;
        } catch (error) {
          console.warn('Error parsing date for filtering:', item.date, error);
        }
      }

      let matchesAmount = true;
      if (amountRange.min || amountRange.max) {
        const itemAmount = parseFloat(item.amount || item.total_amount || 0);
        const minAmount = amountRange.min ? parseFloat(amountRange.min) : null;
        const maxAmount = amountRange.max ? parseFloat(amountRange.max) : null;
        
        if (minAmount !== null && itemAmount < minAmount) matchesAmount = false;
        if (maxAmount !== null && itemAmount > maxAmount) matchesAmount = false;
      }

      return matchesFilter && matchesSearch && matchesDate && matchesAmount;
    });
  }, [sortedData, filter, searchTerm, dateRange, amountRange, viewMode, categories]);

  const totalCost = useMemo(() => {
    return filteredData.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredData]);

  const resetFilters = () => {
    setFilter("all");
    setSearchTerm("");
    setDateRange(null);
    setAmountRange({ min: '', max: '' });
  };

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    amountRange,
    setAmountRange,
    filteredData,
    totalCost,
    resetFilters,
  };
}

