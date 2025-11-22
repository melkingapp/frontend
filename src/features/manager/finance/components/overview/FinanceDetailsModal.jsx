import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { X, Wallet } from "lucide-react";
import { toast } from "sonner";
import DocumentViewer from "../../../../../shared/components/shared/display/DocumentViewer";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactionDetails, payBill } from "../../slices/financeSlice";
import { useSelector as useReduxSelector } from "react-redux";
import { selectMembershipRequests } from "../../../../membership/membershipSlice";
import { formatJalaliDate, getPersianType, getPersianStatus, getStatusIcon } from "../../../../../shared/utils";

const statusStyles = {
  "پرداخت شده": "bg-green-100 text-green-700",
  "پرداخت‌شده": "bg-green-100 text-green-700",
  "paid": "bg-green-100 text-green-700",
  "لغو شده": "bg-red-100 text-red-700",
  "cancelled": "bg-red-100 text-red-700",
  "منتظر پرداخت": "bg-red-100 text-red-700",
  "منتظر": "bg-red-100 text-red-700",
  "pending": "bg-red-100 text-red-700",
  "سررسید گذشته": "bg-orange-100 text-orange-700",
  "overdue": "bg-orange-100 text-orange-700",
  "ممتاز": "bg-yellow-100 text-yellow-700",
};

const distributionLabels = {
  equal: "مساوی",
  per_person: "بر اساس تعداد نفر",
  area: "بر اساس متراژ",
  parking: "بر اساس تعداد پارکینگ",
};
  security: "امنیت",
  other: "سایر",
};

const categoryLabels = {
  shared_bill: "قبض مشترک",
  individual_invoice: "فاکتور فردی",
};

// formatJalaliDate is now imported from utils

export default function FinancenDetailsModal({ transaction, building, onClose, isResident = false }) {
  const [unitFilter, setUnitFilter] = useState("all"); // all, paid, unpaid
  const [paymentId, setPaymentId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const dispatch = useDispatch();
  const { transactionDetails, loading } = useSelector(state => state.finance);
  const membershipRequests = useReduxSelector(selectMembershipRequests);
  
  // Fetch transaction details if transaction has an ID and no unit_details
  useEffect(() => {
    if (transaction?.id && !transaction?.unit_details) {
      dispatch(fetchTransactionDetails(transaction.id));
    }
  }, [transaction?.id, transaction?.unit_details, dispatch]);
  
  if (!transaction) return null;

  // Use real data from transaction.unit_details or transactionDetails, otherwise fallback to mock data
  const units = transaction.unit_details || transactionDetails?.unit_details || [
    { units_id: 1, unit_number: "1", status: "paid", amount: 250000 },
    { units_id: 2, unit_number: "2", status: "unpaid", amount: 250000 },
    { units_id: 3, unit_number: "3", status: "paid", amount: 250000 },
    { units_id: 4, unit_number: "4", status: "unpaid", amount: 250000 },
    { units_id: 5, unit_number: "5", status: "paid", amount: 250000 },
  ];

  // Filter units based on selected filter
  const filteredUnits = units.filter(unit => {
    if (unitFilter === "paid") return unit.status === "paid" || unit.status === "پرداخت شده";
    if (unitFilter === "unpaid") return unit.status === "unpaid" || unit.status === "منتظر پرداخت" || unit.status === "pending";
    return true; // all
  });

  const getUnitStatusStyle = (status) => {
    if (status === "paid" || status === "پرداخت شده") {
      return "bg-green-50 border-green-200 text-green-800";
    } else {
      return "bg-red-50 border-red-200 text-red-800";
    }
  };

  const getUnitStatusIcon = (status) => {
    return getStatusIcon(status);
  };

  const getUnitStatusText = (status) => {
    const persianStatus = getPersianStatus(status);
    return persianStatus === "پرداخت شده" ? "پرداخت شده" : "پرداخت نشده";
  };

  const infoGroups = [
    [
      { label: "💰 مبلغ کل", value: `${parseFloat(transaction.amount).toLocaleString('fa-IR')} تومان` },
      { label: "📅 تاریخ ایجاد", value: formatJalaliDate(transaction.date) },
    ],
    [
      { label: "🏢 ساختمان", value: building?.title || "—" },
      { label: "📊 نوع هزینه", value: getPersianType(transaction.bill_type) || transaction.title || "—" },
    ],
    [
      { label: "🔢 نحوه تقسیم", value: distributionLabels[transaction.distribution_method] || "—" },
      { label: "📊 دسته‌بندی", value: categoryLabels[transaction.category] || "—" },
    ],
    [
      { label: "🧱 تعداد واحدها", value: transaction.unit_count ? `${transaction.unit_count} واحد` : "—" },
      { label: "💳 روش پرداخت", value: transaction.payment_method === 'online' ? 'آنلاین' : "—" },
    ],
    [
      { label: "📅 تاریخ سررسید", value: formatJalaliDate(transaction.bill_due) },
      { label: "🔍 کد پیگیری", value: transaction.tracking_code || "—" },
    ],
    [
      { label: "📝 توضیحات", value: transaction.description || "—" },
    ],
    [
      {
        label: "وضعیت پرداخت",
        value: (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[transaction.status] || "bg-gray-100 text-gray-600"
              }`}
          >
{transaction.status}
          </span>
        ),
      },
    ],
  ];

  const canPay = isResident && (transaction.status !== "پرداخت شده" && transaction.status !== "paid");

  // Try to infer current resident's unit_number from approved membership requests in the selected building
  const residentUnitNumber = (() => {
    try {
      const approved = (membershipRequests || []).filter(req =>
        (req.status === 'approved' || req.status === 'owner_approved' || req.status === 'manager_approved')
        && (building?.building_id ? req.building === (building.building_id || building.id) : true)
      );
      // Prefer resident role entry
      const preferred = approved.find(r => r.role === 'resident') || approved[0];
      return preferred?.unit_number;
    } catch {
      return undefined;
    }
  })();

  const handlePay = async () => {
    if (!transaction?.id) return;
    
    let targetId = transaction.id;
    let unitId = null;
    
    // If this is a shared bill, choose only the current resident unit's invoice_id and unit_id
    if (transaction.category === 'shared_bill') {
      const sourceUnits = (transaction.unit_details || transactionDetails?.unit_details || []);
      const myInvoice = sourceUnits.find(u => u.unit_number === residentUnitNumber) || sourceUnits[0];
      if (myInvoice?.invoice_id) {
        targetId = myInvoice.invoice_id;
        unitId = myInvoice.units_id; // ارسال شناسه واحد برای پرداخت واحد خاص
      }
    }

    const finalPaymentId = paymentId?.trim() || `invoice_${targetId}`;
    try {
      setIsPaying(true);
      // ارسال unit_id برای پرداخت واحد خاص
      await dispatch(payBill({ 
        bill_id: targetId, 
        payment_id: finalPaymentId,
        unit_id: unitId 
      })).unwrap();
      setPaymentId("");
      onClose && onClose();
    } catch (e) {
      console.error("Pay bill error:", e);
      // optional: surface error via alert to keep dependencies minimal
      toast.error(typeof e === 'string' ? e : 'خطا در پرداخت');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Transition show as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white text-right shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center border-b p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="text-primary" />
                  <Dialog.Title className="text-lg font-bold">{transaction.title}</Dialog.Title>
                </div>
                <button onClick={onClose}>
                  <X className="text-gray-500 hover:text-red-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-4 text-sm text-gray-700 flex-1">
                {infoGroups.map((group, i) => (
                  <div key={`info-group-${i}`} className="grid grid-cols-2 gap-x-4 gap-y-3 border rounded-lg p-3">
                    {group.map(({ label, value }, idx) => (
                      <div key={`info-${i}-${idx}-${label}`} className="flex flex-col text-sm">
                        <span className="text-gray-500 text-xs">{label}</span>
                        <span className="text-gray-800 mt-2">{value}</span>
                      </div>
                    ))}
                  </div>
                ))}

                {transaction.invoiceImageUrl && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold text-melkingDarkBlue">فاکتور</h2>
                    <DocumentViewer documentUrl={transaction.invoiceImageUrl} />
                  </>
                )}

                {transaction.unit_count > 0 && (
                  <>
                    <h2 className="mb-3 text-lg font-semibold text-melkingDarkBlue">واحدهای مشمول</h2>
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700">
                        💡 مبلغ‌های نمایش داده شده سهم هر واحد از هزینه کل است
                      </p>
                    </div>
                    
                    {/* فیلتر واحدها */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUnitFilter("all")}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                            unitFilter === "all"
                              ? "bg-melkingDarkBlue text-white border-melkingDarkBlue"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          همه ({units.length})
                        </button>
                        <button
                          onClick={() => setUnitFilter("paid")}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                            unitFilter === "paid"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          پرداخت شده ({units.filter(u => u.status === "paid" || u.status === "پرداخت شده").length})
                        </button>
                        <button
                          onClick={() => setUnitFilter("unpaid")}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                            unitFilter === "unpaid"
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          پرداخت نشده ({units.filter(u => u.status !== "paid" && u.status !== "پرداخت شده").length})
                        </button>
                      </div>
                    </div>

                    {/* لیست واحدها */}
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>در حال بارگذاری اطلاعات واحدها...</p>
                        </div>
                      ) : (
                        filteredUnits.map((unit) => (
                        <div
                          key={unit.units_id || unit.id}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 ${getUnitStatusStyle(unit.status)}`}
                        >
                          <div className="flex items-center gap-3">
                            {getUnitStatusIcon(unit.status)}
                            <span className="font-medium">واحد {unit.unit_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {parseFloat(unit.amount || transaction.amount).toLocaleString('fa-IR')} تومان
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              unit.status === "paid" || unit.status === "پرداخت شده"
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {getUnitStatusText(unit.status)}
                            </span>
                          </div>
                        </div>
                        ))
                      )}
                    </div>

                    {filteredUnits.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>هیچ واحدی با فیلتر انتخاب شده یافت نشد.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {canPay && (
                <div className="border-t p-4 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="شناسه پرداخت (اختیاری)"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-melkingGold"
                  />
                  <button
                    disabled={isPaying}
                    onClick={handlePay}
                    className="px-4 py-2 rounded-lg bg-melkingDarkBlue text-white disabled:opacity-60"
                  >
                    {isPaying ? "در حال پرداخت..." : "پرداخت"}
                  </button>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}