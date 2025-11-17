import { 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Calendar,
  FileText,
  CreditCard
} from "lucide-react";
import moment from "moment-jalaali";
import { formatNumber } from "../../../../../shared/utils/helper";
import { getPersianType } from "../../../../../shared/utils/typeUtils";

moment.loadPersian({ dialect: "persian-modern" });

export default function BalanceTable({ transactions, onTransactionClick, isLoading }) {
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
      return <ArrowUpRight className="text-green-500" size={16} />;
    } else if (amount < 0) {
      return <ArrowDownRight className="text-red-500" size={16} />;
    }
    return <DollarSign className="text-gray-500" size={16} />;
  };

  const getAmountColor = (amount) => {
    if (amount > 0) return "text-green-600";
    if (amount < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getAmountBgColor = (amount) => {
    if (amount > 0) return "bg-green-50";
    if (amount < 0) return "bg-red-50";
    return "bg-gray-50";
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
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
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <CreditCard size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          هیچ تراکنشی یافت نشد
        </h3>
        <p className="text-gray-500">
          در بازه زمانی انتخاب شده تراکنشی وجود ندارد
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">موضوع</div>
              <div className="col-span-2">برداشت</div>
              <div className="col-span-2">واریزی</div>
              <div className="col-span-2">تاریخ</div>
              <div className="col-span-2">مانده</div>
              <div className="col-span-1">عملیات</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <div 
                key={transaction.id || index}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onTransactionClick(transaction)}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Subject */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type, transaction.amount)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {getPersianType(transaction.subject || transaction.type) || "بدون عنوان"}
                        </h4>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Withdrawal (برداشت) */}
                  <div className="col-span-2">
                    {transaction.amount < 0 ? (
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${getAmountBgColor(transaction.amount)} ${getAmountColor(transaction.amount)}`}>
                        <ArrowDownRight size={14} />
                        {formatNumber(Math.abs(transaction.amount))}
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  
                  {/* Deposit (واریزی) */}
                  <div className="col-span-2">
                    {transaction.amount > 0 ? (
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${getAmountBgColor(transaction.amount)} ${getAmountColor(transaction.amount)}`}>
                        <ArrowUpRight size={14} />
                        {formatNumber(transaction.amount)}
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  
                  {/* Date */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <div>
                        <div>{formatDate(transaction.date)}</div>
                        <div className="text-xs text-gray-400">{formatTime(transaction.date)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Balance (مانده) */}
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(transaction.balance_after || transaction.balance || 0)}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onTransactionClick(transaction);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {transactions.map((transaction, index) => (
            <div 
              key={transaction.id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTransactionClick(transaction)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type, transaction.amount)}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getPersianType(transaction.subject || transaction.type) || "بدون عنوان"}
                    </h4>
                    {transaction.description && (
                      <p className="text-sm text-gray-500 mt-1">
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
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">برداشت</div>
                  <div className="text-sm font-medium">
                    {transaction.amount < 0 ? formatNumber(Math.abs(transaction.amount)) : "0"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">واریزی</div>
                  <div className="text-sm font-medium">
                    {transaction.amount > 0 ? formatNumber(transaction.amount) : "0"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">مانده</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(transaction.balance_after || transaction.balance || 0)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
