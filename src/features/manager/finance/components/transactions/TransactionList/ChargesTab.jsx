import { useState, useEffect, useMemo } from "react";
import { Loader2, Calendar, DollarSign, CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { getUnitFinancialTransactions } from "../../../../../../shared/services/billingService";
import { toast } from "sonner";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('fa-IR').format(amount);
};

const cleanChargeDescription = (description, category) => {
  if (!description) {
    // Return category display name if no description
    return category === 'current_charge' ? 'شارژ جاری' :
           category === 'construction_charge' ? 'شارژ عمرانی' :
           'شارژ';
  }

  // Remove metadata parts like [charge_type=...][payer_type=...][announcement_id=...]
  let cleaned = description.replace(/\[charge_type=[^\]]+\]/g, '')
                           .replace(/\[payer_type=[^\]]+\]/g, '')
                           .replace(/\[announcement_id=[^\]]+\]/g, '')
                           .trim();

  // If after cleaning it's empty or just "فاکتور", use category
  if (!cleaned || cleaned === 'فاکتور') {
    return category === 'current_charge' ? 'شارژ جاری' :
           category === 'construction_charge' ? 'شارژ عمرانی' :
           'شارژ';
  }

  return cleaned;
};

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'partial':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'unpaid':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getPaymentStatusText = (status) => {
  switch (status) {
    case 'paid':
      return 'پرداخت شده';
    case 'partial':
      return 'پرداخت جزئی';
    case 'unpaid':
      return 'پرداخت نشده';
    default:
      return 'نامشخص';
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-50';
    case 'partial':
      return 'text-yellow-600 bg-yellow-50';
    case 'unpaid':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const ChargeCard = ({ charge, onSelect }) => {
  const {
    invoice_id,
    category,
    total_amount,
    due_date,
    description,
    payments = [],
    issue_date,
    paid_amount = 0
  } = charge;

  // Calculate payment status
  const totalAmount = parseFloat(total_amount) || 0;
  // Use paid_amount from API if available, otherwise calculate from payments
  const paidAmount = parseFloat(paid_amount) > 0 ? parseFloat(paid_amount) :
    payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const remainingAmount = totalAmount - paidAmount;

  let paymentStatus = 'unpaid';
  if (remainingAmount <= 0) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'partial';
  }

  const handleClick = () => {
    onSelect && onSelect(charge);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-melkingDarkBlue" />
            <span className="font-medium text-gray-900">
              {cleanChargeDescription(description, category)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            شماره فاکتور: {invoice_id}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPaymentStatusColor(paymentStatus)}`}>
          {getPaymentStatusIcon(paymentStatus)}
          {getPaymentStatusText(paymentStatus)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">مبلغ کل</div>
          <div className="font-semibold text-gray-900">
            {formatCurrency(totalAmount)} تومان
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">پرداخت شده</div>
          <div className="font-semibold text-green-600">
            {formatCurrency(paidAmount)} تومان
          </div>
        </div>
      </div>

      {remainingAmount > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">باقی مانده</div>
          <div className="font-semibold text-red-600">
            {formatCurrency(remainingAmount)} تومان
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          سررسید: {due_date ? moment(due_date).format('jYYYY/jMM/jDD') : 'نامشخص'}
        </div>
        <div>
          صدور: {issue_date ? moment(issue_date).format('jYYYY/jMM/jDD') : 'نامشخص'}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">پرداخت‌ها:</div>
          <div className="space-y-1">
            {payments.slice(0, 2).map((payment, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {moment(payment.created_at).format('jYYYY/jMM/jDD')}
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(payment.amount)} تومان
                </span>
              </div>
            ))}
            {payments.length > 2 && (
              <div className="text-xs text-gray-400">
                و {payments.length - 2} پرداخت دیگر...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChargesTab({
  unitId,
  buildingId,
  dateRange,
  isManager = false,
  onChargeSelect
}) {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate summary
  const summary = useMemo(() => {
    if (!charges.length) return { total: 0, paid: 0, unpaid: 0, partial: 0 };

    return charges.reduce((acc, charge) => {
      const totalAmount = parseFloat(charge.total_amount) || 0;
      // Use paid_amount from API if available, otherwise calculate from payments
      const paidAmount = parseFloat(charge.paid_amount) > 0 ? parseFloat(charge.paid_amount) :
        (charge.payments
          ?.filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0);

      acc.total += totalAmount;
      acc.paid += paidAmount;

      const remaining = totalAmount - paidAmount;
      if (remaining <= 0) {
        acc.paidCount += 1;
      } else if (paidAmount > 0) {
        acc.partialCount += 1;
      } else {
        acc.unpaidCount += 1;
      }

      return acc;
    }, { total: 0, paid: 0, unpaidCount: 0, partialCount: 0, paidCount: 0 });
  }, [charges]);

  useEffect(() => {
    if (!unitId) {
      setCharges([]);
      return;
    }

    const fetchCharges = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {};
        if (dateRange?.from) filters.date_from = dateRange.from;
        if (dateRange?.to) filters.date_to = dateRange.to;

        const response = await getUnitFinancialTransactions(unitId, filters);
        // Filter only charge-related invoices
        const chargeInvoices = (response.invoices || []).filter(invoice =>
          invoice.description?.includes('[charge_type=') ||
          invoice.description?.includes('[announcement_id=') ||
          invoice.category === 'current_charge' ||
          invoice.category === 'construction_charge'
        );
        setCharges(chargeInvoices);
      } catch (err) {
        console.error('Error fetching charges:', err);
        setError(err.response?.data?.error || 'خطا در دریافت شارژها');
        toast.error('خطا در دریافت شارژها');
      } finally {
        setLoading(false);
      }
    };

    fetchCharges();
  }, [unitId, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-melkingDarkBlue" />
        <span className="mr-3 text-gray-600">در حال بارگذاری شارژها...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-melkingDarkBlue hover:underline"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!charges.length) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">هیچ شارژی برای این واحد یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">مجموع شارژها</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(summary.total)} تومان
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">پرداخت شده</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(summary.paid)} تومان
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">شارژهای پرداخت شده</div>
          <div className="text-xl font-bold text-green-600">
            {summary.paidCount}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">شارژهای معوق</div>
          <div className="text-xl font-bold text-red-600">
            {summary.unpaidCount}
          </div>
        </div>
      </div>

      {/* Charges List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {charges.map((charge) => (
          <ChargeCard
            key={charge.invoice_id}
            charge={charge}
            onSelect={onChargeSelect}
          />
        ))}
      </div>
    </div>
  );
}
