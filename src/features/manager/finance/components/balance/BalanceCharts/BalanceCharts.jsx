import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import moment from 'moment-jalaali';
import { formatNumber } from '../../../../../../shared/utils/helper';
import { getPersianType } from '../../../../../../shared/utils/typeUtils';
import PersianDatePicker from '../../../../../../shared/components/shared/inputs/PersianDatePicker';

moment.loadPersian({ dialect: "persian-modern" });

// رنگ‌های حرفه‌ای برای نمودارها
const CHART_COLORS = {
  income: '#10b981', // emerald-500
  expense: '#f43f5e', // rose-500
  balance: '#3b82f6', // blue-500
  background: '#f8fafc', // slate-50
  grid: '#e2e8f0', // slate-200
  text: '#1e293b', // slate-800
  pie: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']
};

// فرمت اعداد برای tooltip
const formatCurrency = (value) => {
  return formatNumber(value) + ' ریال';
};

// فرمت تاریخ برای محور X
const formatDate = (dateString) => {
  try {
    return moment(dateString).format('jMM/jDD');
  } catch {
    return dateString;
  }
};

// نمودار خطی برای روند موجودی
export function BalanceTrendChart({ transactions, isLoading, dateRange }) {
  // پردازش داده‌ها برای نمودار خطی
  const processTrendData = () => {
    if (!transactions || transactions.length === 0) return [];

    // فیلتر بر اساس بازه زمانی
    let filteredTransactions = [...transactions];
    if (dateRange && dateRange.from && dateRange.to) {
      filteredTransactions = transactions.filter((transaction) => {
        const transDate = transaction.date || transaction.created_at;
        if (!transDate) return false;
        return moment(transDate).isBetween(
          moment(dateRange.from),
          moment(dateRange.to),
          null,
          '[]' // شامل تاریخ‌های ابتدا و انتها
        );
      });
    }

    if (filteredTransactions.length === 0) return [];

    // مرتب‌سازی تراکنش‌ها بر اساس تاریخ
    const sorted = filteredTransactions.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // محاسبه موجودی تجمعی
    let runningBalance = 0;
    const chartData = sorted.map((transaction) => {
      runningBalance += transaction.amount || 0;
      return {
        date: transaction.date,
        dateFormatted: formatDate(transaction.date),
        balance: runningBalance,
        income: transaction.amount > 0 ? transaction.amount : 0,
        expense: transaction.amount < 0 ? Math.abs(transaction.amount) : 0
      };
    });

    return chartData;
  };

  const chartData = processTrendData();

  if (isLoading) {
    return (
      <div className="h-80 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-slate-400">در حال بارگذاری نمودار...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
        <div className="text-center">
          <TrendingUp className="mx-auto text-slate-300 mb-2" size={48} />
          <p className="text-slate-500 mb-1">داده‌ای برای نمایش وجود ندارد</p>
          {dateRange?.from && dateRange?.to && (
            <p className="text-slate-400 text-xs">
              در بازه زمانی انتخاب شده داده‌ای وجود ندارد
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis 
          dataKey="dateFormatted" 
          stroke={CHART_COLORS.text}
          style={{ fontSize: '10px', fontFamily: 'IranSansX' }}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          stroke={CHART_COLORS.text}
          style={{ fontSize: '10px', fontFamily: 'IranSansX' }}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontFamily: 'IranSansX'
          }}
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(label) => `تاریخ: ${label}`}
        />
        <Legend 
          wrapperStyle={{ fontFamily: 'IranSansX', fontSize: '14px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={CHART_COLORS.balance}
          strokeWidth={3}
          dot={{ fill: CHART_COLORS.balance, r: 4 }}
          activeDot={{ r: 6 }}
          name="موجودی"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// نمودار میله‌ای برای مقایسه درآمد و هزینه
export function IncomeExpenseChart({ income, expenses, isLoading }) {
  const chartData = [
    {
      name: 'درآمد',
      value: income || 0,
      color: CHART_COLORS.income
    },
    {
      name: 'هزینه',
      value: expenses || 0,
      color: CHART_COLORS.expense
    }
  ];

  if (isLoading) {
    return (
      <div className="h-64 md:h-80 bg-slate-100 rounded-lg md:rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-slate-400 text-sm md:text-base">در حال بارگذاری نمودار...</div>
      </div>
    );
  }

  if ((income || 0) === 0 && (expenses || 0) === 0) {
    return (
      <div className="h-64 md:h-80 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center border border-slate-200">
        <div className="text-center">
          <DollarSign className="mx-auto text-slate-300 mb-2" size={40} />
          <p className="text-slate-500 text-sm">داده‌ای برای نمایش وجود ندارد</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis 
          dataKey="name" 
          stroke={CHART_COLORS.text}
          style={{ fontSize: '12px', fontFamily: 'IranSansX', fontWeight: 'bold' }}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke={CHART_COLORS.text}
          style={{ fontSize: '10px', fontFamily: 'IranSansX' }}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontFamily: 'IranSansX'
          }}
          formatter={(value) => formatCurrency(value)}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// نمودار دایره‌ای برای تفکیک انواع هزینه‌ها
export function ExpenseBreakdownChart({ transactions, isLoading, dateRange }) {
  // پردازش داده‌ها برای نمودار دایره‌ای
  const processExpenseData = () => {
    if (!transactions || transactions.length === 0) return [];

    // فیلتر بر اساس بازه زمانی
    let filteredTransactions = transactions.filter(t => t.amount < 0);
    if (dateRange && dateRange.from && dateRange.to) {
      filteredTransactions = filteredTransactions.filter((transaction) => {
        const transDate = transaction.date || transaction.created_at;
        if (!transDate) return false;
        return moment(transDate).isBetween(
          moment(dateRange.from),
          moment(dateRange.to),
          null,
          '[]'
        );
      });
    }

    if (filteredTransactions.length === 0) return [];

    const expenseMap = {};
    
    filteredTransactions.forEach((transaction) => {
      const rawType = transaction.subject || transaction.type || transaction.expense_type || 'سایر';
      const type = getPersianType(rawType, transaction); // تبدیل به فارسی
      const amount = Math.abs(transaction.amount);
      
      if (expenseMap[type]) {
        expenseMap[type] += amount;
      } else {
        expenseMap[type] = amount;
      }
    });

    // تبدیل به آرایه و مرتب‌سازی
    const expenseArray = Object.entries(expenseMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // فقط 8 نوع برتر

    return expenseArray;
  };

  const chartData = processExpenseData();

  if (isLoading) {
    return (
      <div className="h-64 md:h-80 bg-slate-100 rounded-lg md:rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-slate-400 text-sm md:text-base">در حال بارگذاری نمودار...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 md:h-80 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center border border-slate-200">
        <div className="text-center">
          <TrendingDown className="mx-auto text-slate-300 mb-2" size={40} />
          <p className="text-slate-500 text-sm mb-1">هزینه‌ای برای نمایش وجود ندارد</p>
          {dateRange?.from && dateRange?.to && (
            <p className="text-slate-400 text-xs">
              در بازه زمانی انتخاب شده هزینه‌ای وجود ندارد
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            // نمایش فقط برای برش‌های بزرگ‌تر از 5%
            if (percent > 0.05) {
              return `${(percent * 100).toFixed(0)}%`;
            }
            return '';
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontFamily: 'IranSansX'
          }}
          formatter={(value, name) => [formatCurrency(value), name]}
        />
        <Legend 
          wrapperStyle={{ fontFamily: 'IranSansX', fontSize: '12px', paddingTop: '20px' }}
          iconType="circle"
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// کامپوننت اصلی که همه نمودارها را نمایش می‌دهد
export default function BalanceCharts({ transactions, income, expenses, isLoading, dateRange, onDateRangeChange }) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ from: dateRange?.from || '', to: dateRange?.to || '' });

  // Update temp date range when dateRange prop changes
  useEffect(() => {
    if (dateRange) {
      setTempDateRange({ from: dateRange.from || '', to: dateRange.to || '' });
    }
  }, [dateRange]);

  const handleFromDateChange = (date) => {
    let gregorianDate = '';
    if (date) {
      try {
        if (date.toDate) {
          const jsDate = date.toDate();
          gregorianDate = moment(jsDate).format('YYYY-MM-DD');
        } else if (date instanceof Date) {
          gregorianDate = moment(date).format('YYYY-MM-DD');
        } else if (typeof date === 'string') {
          const persianMoment = moment(date, 'jYYYY/jMM/jDD');
          if (persianMoment.isValid()) {
            gregorianDate = persianMoment.format('YYYY-MM-DD');
          } else {
            gregorianDate = moment(date).format('YYYY-MM-DD');
          }
        } else if (date.year && date.month && date.day) {
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
    let gregorianDate = '';
    if (date) {
      try {
        if (date.toDate) {
          const jsDate = date.toDate();
          gregorianDate = moment(jsDate).format('YYYY-MM-DD');
        } else if (date instanceof Date) {
          gregorianDate = moment(date).format('YYYY-MM-DD');
        } else if (typeof date === 'string') {
          const persianMoment = moment(date, 'jYYYY/jMM/jDD');
          if (persianMoment.isValid()) {
            gregorianDate = persianMoment.format('YYYY-MM-DD');
          } else {
            gregorianDate = moment(date).format('YYYY-MM-DD');
          }
        } else if (date.year && date.month && date.day) {
          const persianMoment = moment().jYear(date.year).jMonth(date.month.number - 1).jDate(date.day);
          gregorianDate = persianMoment.format('YYYY-MM-DD');
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
    setTempDateRange({ ...tempDateRange, to: gregorianDate });
  };

  const handleApplyDateRange = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onDateRangeChange && onDateRangeChange(tempDateRange);
      setIsDateRangeOpen(false);
    }
  };

  const handleClearDateRange = () => {
    setTempDateRange({ from: '', to: '' });
    onDateRangeChange && onDateRangeChange({ from: '', to: '' });
    setIsDateRangeOpen(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
      {/* Date Range Filter for Charts */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">بازه زمانی نمودارها</h3>
            <p className="text-sm text-slate-500">انتخاب بازه زمانی برای نمایش نمودارها</p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-700"
            >
              <Calendar size={18} />
              <span>
                {dateRange?.from && dateRange?.to
                  ? `${moment(dateRange.from).format('jYYYY/jMM/jDD')} - ${moment(dateRange.to).format('jYYYY/jMM/jDD')}`
                  : 'انتخاب بازه زمانی'}
              </span>
            </button>

            {isDateRangeOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">از تاریخ</label>
                    <PersianDatePicker
                      value={tempDateRange.from ? moment(tempDateRange.from).format('jYYYY/jMM/jDD') : ''}
                      onChange={handleFromDateChange}
                      placeholder="از تاریخ را انتخاب کنید"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">تا تاریخ</label>
                    <PersianDatePicker
                      value={tempDateRange.to ? moment(tempDateRange.to).format('jYYYY/jMM/jDD') : ''}
                      onChange={handleToDateChange}
                      placeholder="تا تاریخ را انتخاب کنید"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyDateRange}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      اعمال
                    </button>
                    <button
                      onClick={handleClearDateRange}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                      پاک کردن
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* نمودار روند موجودی */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-0.5 md:mb-1">روند موجودی</h3>
              <p className="text-xs md:text-sm text-slate-500 hidden md:block">تغییرات موجودی در طول زمان</p>
            </div>
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg md:rounded-xl flex-shrink-0">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
          </div>
          <BalanceTrendChart transactions={transactions} isLoading={isLoading} dateRange={dateRange} />
        </div>

        {/* نمودار مقایسه درآمد و هزینه */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-0.5 md:mb-1">درآمد و هزینه</h3>
              <p className="text-xs md:text-sm text-slate-500 hidden md:block">مقایسه کل درآمد و هزینه</p>
            </div>
            <div className="p-2 md:p-3 bg-emerald-100 rounded-lg md:rounded-xl flex-shrink-0">
              <DollarSign className="text-emerald-600" size={20} />
            </div>
          </div>
          <IncomeExpenseChart income={income} expenses={expenses} isLoading={isLoading} />
        </div>

        {/* نمودار تفکیک هزینه‌ها - در صورت وجود داده */}
        {transactions && transactions.some(t => t.amount < 0) && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 lg:col-span-2">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-0.5 md:mb-1">تفکیک هزینه‌ها</h3>
                <p className="text-xs md:text-sm text-slate-500 hidden md:block">نوع هزینه‌ها بر اساس مبلغ</p>
              </div>
              <div className="p-2 md:p-3 bg-rose-100 rounded-lg md:rounded-xl flex-shrink-0">
                <TrendingDown className="text-rose-600" size={20} />
              </div>
            </div>
            <ExpenseBreakdownChart transactions={transactions} isLoading={isLoading} dateRange={dateRange} />
          </div>
        )}
      </div>
    </div>
  );
}

