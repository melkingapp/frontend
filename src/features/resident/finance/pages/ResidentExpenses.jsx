import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  RefreshCw,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import PaymentModal from "../components/PaymentModal";

moment.loadPersian({ dialect: "persian-modern" });

export default function ResidentExpenses() {
  const user = useSelector((state) => state.auth?.user);
  const [expenses, setExpenses] = useState([]);
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState({
    total_pending: 0,
    total_paid: 0,
    total_overdue: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [selectedUnit]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedUnit) {
        params.append("unit_id", selectedUnit);
      }

      const response = await fetch(
        `${getApiUrl()}/billing/resident-unit-expenses/?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت هزینه‌ها");
      }

      const data = await response.json();
      setExpenses(data.expenses || []);
      setUnits(data.units || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error(error.message || "خطا در دریافت هزینه‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentClick = (expense) => {
    setSelectedInvoice(expense);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchExpenses();
  };

  // Optimization: Memoize filtered and sorted expenses to prevent expensive array operations on every render
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        if (filterStatus === "all") return true;
        return expense.status === filterStatus;
      })
      .sort((a, b) => {
        if (sortBy === "due_date") {
          return new Date(b.due_date) - new Date(a.due_date);
        } else if (sortBy === "amount") {
          return b.amount - a.amount;
        }
        return 0;
      });
  }, [expenses, filterStatus, sortBy]);

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
          <AlertCircle size={14} />
          سررسید گذشته
        </span>
      );
    }

    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "منتظر پرداخت",
      },
      paid: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "پرداخت شده",
      },
      overdue: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: AlertCircle,
        label: "سررسید گذشته",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm font-medium`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">هزینه‌های من</h1>
        <p className="text-gray-600">مشاهده و پرداخت هزینه‌های مرتبط با واحد شما</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">منتظر پرداخت</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(summary.total_pending || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">تومان</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">پرداخت شده</p>
              <p className="text-2xl font-bold text-green-600">
                {(summary.total_paid || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">تومان</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">سررسید گذشته</p>
              <p className="text-2xl font-bold text-red-600">
                {(summary.total_overdue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">تومان</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">مجموع</p>
              <p className="text-2xl font-bold text-blue-600">
                {(summary.total || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">تومان</p>
            </div>
            <DollarSign className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {units.length > 0 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-2" />
                واحد
              </label>
              <select
                value={selectedUnit || ""}
                onChange={(e) => setSelectedUnit(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">تمام واحدها</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.building} - واحد {unit.number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-2" />
              وضعیت
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه</option>
              <option value="pending">منتظر پرداخت</option>
              <option value="paid">پرداخت شده</option>
              <option value="overdue">سررسید گذشته</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مرتب‌سازی
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="due_date">تاریخ سررسید (جدیدترین)</option>
              <option value="amount">مبلغ (بیشترین)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchExpenses}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              بروزرسانی
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
          <p className="text-xl font-semibold text-gray-900 mb-2">
            شما هیچ هزینه‌ای ندارید
          </p>
          <p className="text-gray-600">تمام صورت‌حساب‌های شما پرداخت شده‌اند</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.invoice_id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <DollarSign size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {expense.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        واحد {expense.unit}
                      </p>
                    </div>
                  </div>

                  {expense.description && (
                    <p className="text-sm text-gray-600 mt-2 mr-13">
                      {expense.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-3 mr-13">
                    {expense.period_start && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {moment(expense.period_start).format("jYYYY/jMM/jDD")} تا{" "}
                        {moment(expense.period_end).format("jYYYY/jMM/jDD")}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      سررسید: {moment(expense.due_date).format("jYYYY/jMM/jDD")}
                    </span>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex flex-col md:text-right gap-2 md:min-w-[200px]">
                  <p className="text-2xl font-bold text-gray-900">
                    {expense.amount.toLocaleString()}
                    <span className="text-sm text-gray-500 mr-1">تومان</span>
                  </p>
                  {getStatusBadge(expense.status, expense.is_overdue)}
                </div>

                {/* Action Button */}
                {expense.status === "pending" && (
                  <div className="md:min-w-[120px]">
                    <button
                      onClick={() => handlePaymentClick(expense)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                    >
                      پرداخت
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredExpenses.length === 0 && expenses.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-yellow-800">
            هیچ هزینه‌ای با فیلترهای انتخاب شده پیدا نشد
          </p>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
