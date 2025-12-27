import { useState } from "react";
import { 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import moment from "moment-jalaali";
import { formatNumber } from "../../../../../../shared/utils/helper";
import { getPersianType } from "../../../../../../shared/utils/typeUtils";

moment.loadPersian({ dialect: "persian-modern" });

export default function BalanceTable({ transactions, onTransactionClick, isLoading }) {
  // State for mobile view - which section to show
  const [mobileView, setMobileView] = useState('assets'); // 'assets' or 'liabilities'
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    try {
      return moment(dateString).format("HH:mm");
    } catch {
      return "—";
    }
  };

  const getTransactionIcon = (type, amount) => {
    if (amount > 0) {
      return <ArrowUpRight className="text-emerald-600" size={16} />;
    } else if (amount < 0) {
      return <ArrowDownRight className="text-rose-600" size={16} />;
    }
    return <DollarSign className="text-slate-400" size={16} />;
  };

  const getAmountColor = (amount) => {
    if (amount > 0) return "text-emerald-700";
    if (amount < 0) return "text-rose-700";
    return "text-slate-600";
  };

  const getAmountBgColor = (amount) => {
    if (amount > 0) return "bg-emerald-50";
    if (amount < 0) return "bg-rose-50";
    return "bg-slate-50";
  };

  const getTransactionTypeColor = (type) => {
    const typeColors = {
      'income': 'bg-green-100 text-green-800',
      'expense': 'bg-red-100 text-red-800',
      'transfer': 'bg-blue-100 text-blue-800',
      'charge': 'bg-purple-100 text-purple-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'utility': 'bg-cyan-100 text-cyan-800',
      'monthly': 'bg-indigo-100 text-indigo-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return typeColors[type] || typeColors['other'];
  };

  // تفکیک تراکنش‌ها به دارایی و بدهی
  const assetsTransactions = transactions.filter(t => (t.amount || 0) > 0); // واریزی‌ها و درآمدها
  const liabilitiesTransactions = transactions.filter(t => (t.amount || 0) < 0); // برداشت‌ها و هزینه‌ها

  // کامپوننت برای رندر کردن یک ردیف جدول
  const renderTableRow = (transaction, index) => (
    <div 
      key={transaction.id || index}
      className="px-8 py-5 hover:bg-slate-50 transition-all duration-200 cursor-pointer border-b border-slate-50 last:border-b-0"
      onClick={() => onTransactionClick(transaction)}
    >
      <div className="grid grid-cols-9 gap-4 items-center">
        {/* Subject */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getAmountBgColor(transaction.amount)} flex-shrink-0`}>
              {getTransactionIcon(transaction.type, transaction.amount)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                {getPersianType(transaction.subject || transaction.type) || "بدون عنوان"}
              </h4>
              {transaction.description && (
                <p className="text-xs text-slate-500 truncate">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Amount - نمایش مبلغ مناسب برای هر بخش */}
        <div className="col-span-2 flex justify-center">
          {transaction.amount > 0 ? (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${getAmountBgColor(transaction.amount)} ${getAmountColor(transaction.amount)}`}>
              <ArrowUpRight size={14} />
              {formatNumber(transaction.amount)}
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${getAmountBgColor(transaction.amount)} ${getAmountColor(transaction.amount)}`}>
              <ArrowDownRight size={14} />
              {formatNumber(Math.abs(transaction.amount))}
            </div>
          )}
        </div>
        
        {/* Date */}
        <div className="col-span-2 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar size={14} className="text-slate-400" />
            <div className="text-center">
              <div className="font-medium text-xs">{formatDate(transaction.date)}</div>
              <div className="text-xs text-slate-400 mt-0.5">{formatTime(transaction.date)}</div>
            </div>
          </div>
        </div>
        
        {/* Balance (مانده) */}
        <div className="col-span-2 flex justify-center">
          <div className="text-sm font-semibold text-slate-900">
            {formatNumber(transaction.balance_after || transaction.balance || 0)}
          </div>
        </div>
      </div>
    </div>
  );

  // کامپوننت برای رندر کردن یک کارت موبایل
  const renderMobileCard = (transaction, index) => (
    <div 
      key={transaction.id || index}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer"
      onClick={() => onTransactionClick(transaction)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${getAmountBgColor(transaction.amount)} flex-shrink-0`}>
            {getTransactionIcon(transaction.type, transaction.amount)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-base mb-1">
              {getPersianType(transaction.subject || transaction.type) || "بدون عنوان"}
            </h4>
            {transaction.description && (
              <p className="text-sm text-slate-500 line-clamp-2">
                {transaction.description}
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onTransactionClick(transaction);
          }}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
        >
          <Eye size={18} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getAmountBgColor(transaction.amount)} ${getAmountColor(transaction.amount)}`}>
          {transaction.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="text-base font-bold">
            {formatNumber(Math.abs(transaction.amount))} ریال
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">مانده</div>
          <div className="text-base font-semibold text-slate-900">
            {formatNumber(transaction.balance_after || transaction.balance || 0)} ریال
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span className="font-medium">{formatDate(transaction.date)}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-36"></div>
                    <div className="h-3 bg-slate-200 rounded w-28"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="text-slate-300 mb-6">
          <CreditCard size={56} className="mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          هیچ تراکنشی یافت نشد
        </h3>
        <p className="text-slate-500 text-sm">
          در بازه زمانی انتخاب شده تراکنشی وجود ندارد
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Desktop Table - دو ستون کنار هم */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-6">
            {/* ستون دارایی */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-emerald-600 px-8 py-4 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-white" size={24} />
                  <h3 className="text-lg font-bold text-white">دارایی</h3>
                  <span className="text-emerald-100 text-sm font-medium">({assetsTransactions.length})</span>
                </div>
                <div className="grid grid-cols-9 gap-4 text-xs font-semibold text-emerald-100 tracking-wide mt-4">
                  <div className="col-span-3">موضوع</div>
                  <div className="col-span-2 text-center">مبلغ (واریزی)</div>
                  <div className="col-span-2 text-center">تاریخ</div>
                  <div className="col-span-2 text-center">مانده</div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {assetsTransactions.length > 0 ? (
                  assetsTransactions.map((transaction, index) => renderTableRow(transaction, index))
                ) : (
                  <div className="p-12 text-center">
                    <TrendingUp className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 text-sm">تراکنش دارایی وجود ندارد</p>
                  </div>
                )}
              </div>
            </div>

            {/* ستون بدهی */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-rose-600 px-8 py-4 border-b-2 border-rose-700">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="text-white" size={24} />
                  <h3 className="text-lg font-bold text-white">بدهی</h3>
                  <span className="text-rose-100 text-sm font-medium">({liabilitiesTransactions.length})</span>
                </div>
                <div className="grid grid-cols-9 gap-4 text-xs font-semibold text-rose-100 tracking-wide mt-4">
                  <div className="col-span-3">موضوع</div>
                  <div className="col-span-2 text-center">مبلغ (برداشت)</div>
                  <div className="col-span-2 text-center">تاریخ</div>
                  <div className="col-span-2 text-center">مانده</div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {liabilitiesTransactions.length > 0 ? (
                  liabilitiesTransactions.map((transaction, index) => renderTableRow(transaction, index))
                ) : (
                  <div className="p-12 text-center">
                    <TrendingDown className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 text-sm">تراکنش بدهی وجود ندارد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tablet/Mobile View - یک ستون با دکمه‌های toggle */}
        <div className="lg:hidden">
          {/* دکمه‌های toggle برای موبایل */}
          <div className="flex gap-3 mb-4 px-4">
            <button
              onClick={() => setMobileView('assets')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                mobileView === 'assets'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <TrendingUp size={20} />
              <span>دارایی</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                mobileView === 'assets' ? 'bg-emerald-500/30' : 'bg-slate-100'
              }`}>
                {assetsTransactions.length}
              </span>
            </button>
            
            <button
              onClick={() => setMobileView('liabilities')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                mobileView === 'liabilities'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-rose-300'
              }`}
            >
              <TrendingDown size={20} />
              <span>بدهی</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                mobileView === 'liabilities' ? 'bg-rose-500/30' : 'bg-slate-100'
              }`}>
                {liabilitiesTransactions.length}
              </span>
            </button>
          </div>

          {/* لیست تراکنش‌ها بر اساس view انتخاب شده */}
          <div className="px-4 space-y-3">
            {mobileView === 'assets' ? (
              assetsTransactions.length > 0 ? (
                assetsTransactions.map((transaction, index) => renderMobileCard(transaction, index))
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                  <TrendingUp className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500 text-sm">تراکنش دارایی وجود ندارد</p>
                </div>
              )
            ) : (
              liabilitiesTransactions.length > 0 ? (
                liabilitiesTransactions.map((transaction, index) => renderMobileCard(transaction, index))
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                  <TrendingDown className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500 text-sm">تراکنش بدهی وجود ندارد</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
