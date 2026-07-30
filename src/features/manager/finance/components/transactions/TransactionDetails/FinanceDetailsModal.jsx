import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { X, Wallet, Edit2, Trash2, User, Building2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import DocumentViewer from "../../../../../../shared/components/shared/display/DocumentViewer";
import { getFullMediaUrl } from "../../../../../../shared/utils/fileUrl";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactionDetails, payBill, deleteExpense, fetchTransactions, fetchCurrentFundBalance, clearTransactions } from "../../../store/slices/financeSlice";
import { useSelector as useReduxSelector } from "react-redux";
import { selectMembershipRequests } from "../../../../../membership/membershipSlice";
import { formatJalaliDate, getPersianType, getPersianStatus, getStatusIcon } from "../../../../../../shared/utils";
import PaymentModal from "./PaymentModal";
import DeleteConfirmModal from "../../../../../../shared/components/shared/feedback/DeleteConfirmModal";

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

const allocationLabels = {
  owner: "مالک",
  resident: "ساکن",
  both: "هردو",
};

const distributionLabels = {
  equal: "مساوی",
  per_person: "بر اساس تعداد نفر",
  area: "بر اساس متراژ",
  parking: "بر اساس تعداد پارکینگ",
};

const billTypeLabels = {
  electricity: "قبض برق",
  water: "قبض آب",
  gas: "قبض گاز",
  maintenance: "تعمیرات",
  cleaning: "نظافت",
  security: "امنیت",
  other: "سایر",
};

const categoryLabels = {
  shared_bill: "قبض مشترک",
  individual_invoice: "فاکتور فردی",
};

// formatJalaliDate is now imported from utils

export default function FinancenDetailsModal({ transaction, building, onClose, isResident = false, onEdit }) {
  const [unitFilter, setUnitFilter] = useState("all"); // all, paid, unpaid
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localAwaitingApproval, setLocalAwaitingApproval] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(null);
  const dispatch = useDispatch();
  const { transactionDetails, loading } = useSelector(state => state.finance);
  const membershipRequests = useReduxSelector(selectMembershipRequests);
  const user = useSelector(state => state.auth.user);
  const userRole = user?.role;
  
  useEffect(() => {
    setLocalAwaitingApproval(false);
  }, [transaction?.id]);
  
  // Fetch transaction details if transaction has an ID
  // Always fetch to get complete unit_details
  useEffect(() => {
    if (transaction?.id) {
      dispatch(fetchTransactionDetails(transaction.id));
    }
    // Only depend on transaction.id to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id, dispatch]);
  
  // Debug: Log unit details - MUST be before early return
  useEffect(() => {
    if (transaction?.id) {
      const unitDetailsDebug = transactionDetails?.unit_details || transaction?.unit_details || [];
      
      console.log('🔍 Transaction ID:', transaction.id);
      console.log('🔍 Transaction Details:', transactionDetails);
      console.log('🔍 Transaction Details ID:', transactionDetails?.id);
      console.log('🔍 Unit Details from transactionDetails:', transactionDetails?.unit_details);
      console.log('🔍 Unit Details from transaction:', transaction?.unit_details);
      console.log('🔍 Final Unit Details:', unitDetailsDebug);
      console.log('🔍 Final Unit Details Length:', unitDetailsDebug?.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id, transactionDetails]);
  
  // Early return if transaction is null (after ALL hooks)
  if (!transaction) return null;
  
  // بررسی اینکه آیا این یک پرداخت اضافی است
  const isExtraPayment = transaction.category === 'extra_payment' || 
                          transaction.expense_type === 'extra_payment' ||
                          transaction.bill_type === 'extra_payment' ||
                          transaction.is_extra_payment ||
                          (typeof transaction.id === 'string' && transaction.id.startsWith('extra_payment_')) ||
                          (transactionDetails && (transactionDetails.category === 'extra_payment' || transactionDetails.is_extra_payment));
  
  // Use transactionDetails if it matches the current transaction
  const isTransactionDetailsMatch = transactionDetails && (
    transactionDetails.id === transaction.id || 
    transactionDetails.transaction_id === transaction.id
  );
  
  // Always prefer transactionDetails (from API) as it has complete unit_details
  // If transactionDetails is available and matches, use it. Otherwise, use transaction
  const effectiveDetails = isTransactionDetailsMatch ? transactionDetails : null;
  
  // For unit_details: prefer transactionDetails (has complete data), then transaction
  // Note: transactionDetails.unit_details comes from fetchTransactionDetails API
  const unitDetails = transactionDetails?.unit_details || transaction?.unit_details || [];
  
  // Use payment status from transaction first (it's always available), then from transactionDetails
  const paymentStatusCounts = transaction?.payment_status_counts || transactionDetails?.payment_status_counts;
  const paymentStatusTotal = transaction?.payment_status_total || transactionDetails?.payment_status_total;
  const paymentStatusLabel = transaction?.payment_status || transactionDetails?.payment_status;
  const paymentOverall = transaction?.payment_status_overall || transactionDetails?.payment_status_overall;
  const paymentStatusBreakdown = [
    { key: 'paid', label: 'پرداخت شده', color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
    { key: 'awaiting_manager', label: 'منتظر تایید مدیر', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-100' },
    { key: 'pending', label: 'پرداخت نشده', color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
  ];
  
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    return String(status).toLowerCase();
  };
  
  // تعیین اینکه آیا کاربر می‌تونه پرداخت کنه
  // 1. resident همیشه می‌تونه پرداخت کنه
  // 2. owner همیشه می‌تونه پرداخت کنه
  // 3. manager فقط اگه خودش مالک یا ساکن باشه می‌تونه پرداخت کنه (is_owner_resident)
  const isOwner = userRole === 'owner';
  const isManager = userRole === 'manager';
  const isManagerOwnerResident = isManager && building?.is_owner_resident === true;
  
  // Try to infer current user's unit_number from approved membership requests in the selected building
  // این برای resident، owner و manager که مالک یا ساکن هستن کار می‌کنه
  const residentUnitNumber = (() => {
    try {
      console.log('🔍 Membership Requests:', membershipRequests);
      console.log('🔍 Building ID:', building?.building_id);
      
      // Debug: Log each request's building and status
      (membershipRequests || []).forEach((req, i) => {
        console.log(`🔍 Request ${i}: building=${req.building}, status=${req.status}, unit_number=${req.unit_number}`);
      });
      
      const approved = (membershipRequests || []).filter(req => {
        const statusMatch = req.status === 'approved' || req.status === 'owner_approved' || req.status === 'manager_approved';
        const buildingMatch = building?.building_id ? (
          req.building === building.building_id || 
          req.building === building.id ||
          String(req.building) === String(building.building_id)
        ) : true;
        console.log(`🔍 Filtering: status=${req.status}, statusMatch=${statusMatch}, req.building=${req.building}, buildingMatch=${buildingMatch}`);
        return statusMatch && buildingMatch;
      });
      console.log('🔍 Approved Requests:', approved);
      // ترجیح: اول resident، بعد owner، بعد اولین مورد
      const preferred = approved.find(r => r.role === 'resident') || 
                       approved.find(r => r.role === 'owner') || 
                       approved[0];
      console.log('🔍 Preferred Request:', preferred);
      console.log('🔍 Resident Unit Number:', preferred?.unit_number);
      return preferred?.unit_number;
    } catch {
      return undefined;
    }
  })();
  
  const derivedAwaitingApproval = (() => {
    // برای resident، owner و manager که می‌تونن پرداخت کنن
    if (!unitDetails?.length || !(isResident || isOwner || isManagerOwnerResident)) return false;
    const myUnitNumber = residentUnitNumber;
    if (!myUnitNumber) return false;
    const targetUnit = unitDetails.find(
      (unit) => String(unit.unit_number ?? unit.unitNumber ?? '') === String(myUnitNumber)
    );
    if (!targetUnit) return false;
    return normalizeStatus(targetUnit.status) === 'awaiting_manager';
  })();
  
  const showAwaitingBanner = localAwaitingApproval || derivedAwaitingApproval;

  // Use real data from transaction.unit_details or transactionDetails only
  const units = unitDetails.length > 0 ? unitDetails : [];
  
  // پیدا کردن سهم واحد کاربر
  const userUnitShare = (() => {
    console.log('🔍 Finding user unit share...');
    console.log('🔍 residentUnitNumber:', residentUnitNumber);
    console.log('🔍 unitDetails:', unitDetails);
    if (!residentUnitNumber || !unitDetails?.length) {
      console.log('🔍 No residentUnitNumber or unitDetails empty');
      return null;
    }
    const found = unitDetails.find(
      (unit) => String(unit.unit_number ?? unit.unitNumber ?? '') === String(residentUnitNumber)
    );
    console.log('🔍 Found user unit share:', found);
    return found;
  })();

  // Filter units based on selected filter
  const filteredUnits = units.filter(unit => {
    const normalized = normalizeStatus(unit.status);
    if (unitFilter === "paid") return normalized === "paid";
    if (unitFilter === "awaiting") return normalized === "awaiting_manager";
    if (unitFilter === "unpaid") return normalized === "pending";
    return true; // all
  });
  
  const getUnitStatusStyle = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "paid" || normalized === "پرداخت شده") {
      return "bg-green-50 border-green-200 text-green-800";
    }
    if (normalized === "awaiting_manager" || normalized === "منتظر تایید مدیر") {
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
    return "bg-red-50 border-red-200 text-red-800";
  };

  const getUnitStatusIcon = (status) => {
    return getStatusIcon(status);
  };

  const getUnitStatusText = (status) => {
    const persianStatus = getPersianStatus(status);
    if (persianStatus === "پرداخت شده") return "پرداخت شده";
    if (persianStatus === "منتظر تایید مدیر") return "منتظر تایید مدیر";
    return "پرداخت نشده";
  };

  const infoGroups = [
    [
      { label: "💰 مبلغ کل", value: `${parseFloat(transaction.amount).toLocaleString('fa-IR')} تومان` },
      { label: "📅 تاریخ ایجاد", value: formatJalaliDate(transaction.date) },
    ],
    [
      { label: "🏢 ساختمان", value: building?.title || "—" },
      { label: "📊 نوع هزینه", value: getPersianType(transaction.expense_type || transaction.bill_type || transaction.category || transaction.category_display || transaction.type || transaction.title, transaction) || transaction.title || "—" },
    ],
    [
      { label: "🔢 نحوه تقسیم", value: distributionLabels[transaction.distribution_method] || "—" },
      { label: "📅 مهلت پرداخت", value: transaction.bill_due ? formatJalaliDate(transaction.bill_due) : "—" },
    ],
    [
      { label: "👤 مسئول پرداخت", value: allocationLabels[transaction.allocation] || allocationLabels[transaction.role] || "—" },
      {
        label: "💳 روش پرداخت",
        value:
          transaction.payment_method === "direct"
            ? "مستقیم"
            : transaction.payment_method === "from_fund"
            ? "موجودی صندوق"
            : transaction.payment_method === "online"
            ? "آنلاین"
            : "—",
      },
    ],
    [
      { label: "📊 دسته‌بندی", value: categoryLabels[transaction.category] || "—" },
      { label: "🧱 تعداد واحدها", value: transaction.unit_count ? `${transaction.unit_count} واحد` : "—" },
    ],
    [
      { label: "📝 توضیحات", value: transaction.description || "—" },
    ],
    [
      {
        label: "وضعیت پرداخت",
        value: (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              transaction.payment_method === 'from_fund' 
                ? "bg-blue-100 text-blue-700"
                : statusStyles[transaction.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {transaction.payment_method === 'from_fund' 
              ? "برداشت از موجودی صندوق"
              : transaction.status}
          </span>
        ),
      },
    ],
  ];

  // اگر payment_method از شارژ باشه، دکمه پرداخت نباید نشون داده بشه
  const isFromFund = transaction.payment_method === 'from_fund';
  const canPay = !isFromFund && 
                 (isResident || isOwner || isManagerOwnerResident) && 
                 (transaction.status !== "پرداخت شده" && transaction.status !== "paid");

  const handleEdit = () => {
    onClose();
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // اگر warning وجود دارد، با confirm=true صدا بزن
      const confirm = !!deleteWarning;
      const response = await dispatch(deleteExpense({ expenseId: transaction.id, confirm })).unwrap();
      
      // بررسی warning
      if (response.warning && !confirm) {
        // نمایش warning و منتظر تایید کاربر بمان
        setDeleteWarning(response);
        setIsDeleting(false);
        return;
      }
      
      // اگر warning نبود یا confirm بود، هزینه حذف شد
      toast.success('هزینه با موفقیت حذف شد');
      
      if (response.refunded_units && response.refunded_units.length > 0) {
        const unitNumbers = response.refunded_units.map(u => u.unit_number).join('، ');
        toast.success(`مبلغ به موجودی صندوق و بستانکاری واحدهای ${unitNumbers} برگردانده شد`);
      }
      
      // Get building ID for refresh
      const buildingId = building?.building_id || building?.id;
      
      // Clear transactions cache to prevent showing old deleted transactions
      dispatch(clearTransactions());

      // Add a small delay to allow backend to process and invalidate cache
      setTimeout(() => {
        // Refresh transactions with a timestamp to bypass cache
        const refreshFilters = {
          building_id: buildingId,
          _refresh: Date.now()
        };

        dispatch(fetchTransactions(refreshFilters))
          .then(() => {
            console.log("✅ Transactions refreshed after expense deletion from modal");
          })
          .catch((error) => {
            console.error("❌ Failed to refresh transactions after expense deletion from modal:", error);
          });

        // Refresh current fund balance to update the balance display (only once)
        if (buildingId) {
          dispatch(fetchCurrentFundBalance(buildingId))
            .then(() => {
              console.log("✅ Fund balance refreshed after expense deletion from modal");
            })
            .catch((error) => {
              console.error("❌ Failed to refresh fund balance after expense deletion from modal:", error);
            });
        }
      }, 1000);
      
      setShowDeleteConfirm(false);
      setDeleteWarning(null);
      onClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('خطا در حذف هزینه');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePaymentConfirm = async (paymentData) => {
    if (!transaction?.id) return;
    
    let targetId = transaction.id;
    let unitId = null;
    
    // If this is a shared bill, choose only the current resident unit's invoice_id and unit_id
    if (transaction.category === 'shared_bill') {
      const sourceUnits = unitDetails.length > 0 ? unitDetails : (transaction.unit_details || transactionDetails?.unit_details || []);
      console.log('🔍 Payment: sourceUnits:', sourceUnits);
      console.log('🔍 Payment: residentUnitNumber:', residentUnitNumber);
      
      // مقایسه با تبدیل به رشته برای اطمینان از مطابقت
      const myInvoice = sourceUnits.find(u => 
        String(u.unit_number ?? u.unitNumber ?? '') === String(residentUnitNumber)
      );
      console.log('🔍 Payment: myInvoice:', myInvoice);
      
      if (myInvoice?.invoice_id) {
        targetId = myInvoice.invoice_id;
        unitId = myInvoice.units_id; // ارسال شناسه واحد برای پرداخت واحد خاص
        console.log('🔍 Payment: targetId:', targetId, 'unitId:', unitId);
      } else {
        console.log('🔍 Payment: No matching invoice found for unit', residentUnitNumber);
      }
    }

    try {
      setIsPaying(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('bill_id', targetId);
      if (unitId) {
        formData.append('unit_id', unitId);
      }
      if (paymentData.description) {
        formData.append('description', paymentData.description);
      }
      if (paymentData.receiptImage) {
        formData.append('receipt_image', paymentData.receiptImage);
      }
      
      // ارسال unit_id برای پرداخت واحد خاص
      await dispatch(payBill(formData)).unwrap();
      setShowPaymentModal(false);
      setLocalAwaitingApproval(true);
      
      // Refresh transaction details to show updated status
      if (transaction?.id) {
        await dispatch(fetchTransactionDetails(transaction.id));
      }
      
      toast.success('پرداخت با موفقیت ثبت شد');
    } catch (e) {
      console.error("Pay bill error:", e);
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
                  <Dialog.Title className="text-lg font-bold">
                    {transaction.expense_name || 
                     getPersianType(transaction.expense_type || transaction.bill_type || transaction.category || transaction.category_display || transaction.type || transaction.title, transaction) || 
                     transaction.title || 
                     "—"}
                  </Dialog.Title>
                </div>
                <div className="flex items-center gap-2">
                  {isManager && !isExtraPayment && (
                    <>
                      <button
                        onClick={handleEdit}
                        aria-label="ویرایش"
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <Edit2 className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        aria-label="حذف"
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </>
                  )}
                  <button onClick={onClose} aria-label="بستن" title="بستن">
                    <X className="text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* نمایش سهم واحد کاربر */}
              {userUnitShare && (isResident || isOwner || isManagerOwnerResident) && (
                <div className="border-b p-4 bg-blue-50">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">سهم واحد {userUnitShare.unit_number}:</span>
                      <span className="text-lg font-bold text-blue-700">
                        {parseFloat(userUnitShare.amount || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* دکمه پرداخت یا وضعیت در انتظار تایید */}
              {(canPay || showAwaitingBanner) && (
                <div className="border-b p-4 bg-green-50 space-y-3">
                  {showAwaitingBanner ? (
                    <div className="flex items-center gap-3 text-green-800">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                      <span className="font-semibold">پرداخت شما ثبت شد و منتظر تایید مدیر است</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Wallet size={20} />
                      پرداخت
                    </button>
                  )}
                </div>
              )}

              <div className="overflow-y-auto p-4 space-y-4 text-sm text-gray-700 flex-1">
                {/* نمایش خاص برای پرداخت‌های اضافی */}
                {isExtraPayment && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-blue-900">پرداخت اضافی کاربر</h3>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">👤 کاربر:</span>
                        <span className="font-semibold text-gray-900">
                          {transactionDetails?.user?.full_name || transaction?.user?.full_name || '—'}
                        </span>
                      </div>
                      
                      {transactionDetails?.unit && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">🏠 واحد:</span>
                          <span className="font-semibold text-gray-900">
                            واحد {transactionDetails.unit.unit_number || '—'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">💰 مبلغ:</span>
                        <span className="font-bold text-blue-700 text-lg">
                          {parseFloat(transaction.amount || transactionDetails?.amount || 0).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      
                      {transactionDetails?.description || transaction?.description ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600 block mb-2">📝 توضیحات:</span>
                          <p className="text-gray-800">
                            {transactionDetails?.description || transaction?.description}
                          </p>
                        </div>
                      ) : null}
                      
                      {transactionDetails?.approved_by && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">تایید شده توسط:</span>
                            <span className="font-semibold text-gray-900">
                              {transactionDetails.approved_by.full_name}
                            </span>
                          </div>
                          {transactionDetails?.approved_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              در تاریخ: {formatJalaliDate(transactionDetails.approved_at)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                          <Building2 className="w-4 h-4" />
                          <span>این پرداخت توسط کاربر انجام شده و جدا از هزینه‌های ثبت شده توسط مدیر است</span>
                        </div>
                      </div>
                    </div>
                    
                    {transactionDetails?.attachment_url || transaction?.attachment_url ? (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">📎 فایل پیوست:</h4>
                        <DocumentViewer documentUrl={transactionDetails?.attachment_url || transaction?.attachment_url} />
                      </div>
                    ) : null}
                  </div>
                )}
                
                {!isExtraPayment && infoGroups.map((group, i) => (
                  <div key={`info-group-${i}`} className="grid grid-cols-2 gap-x-4 gap-y-3 border rounded-lg p-3">
                    {group.map(({ label, value }, idx) => (
                      <div key={`info-${i}-${idx}-${label}`} className="flex flex-col text-sm">
                        <span className="text-gray-500 text-xs">{label}</span>
                        <span className="text-gray-800 mt-2">{value}</span>
                      </div>
                    ))}
                  </div>
                ))}
                
                {paymentStatusCounts && (
                  <div className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">وضعیت کلی پرداخت</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paymentStatusLabel || getPersianStatus(paymentOverall)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {paymentStatusBreakdown.map((item) => (
                        <div key={item.key} className={`p-2 rounded-lg border text-center ${item.bg}`}>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>
                            {paymentStatusCounts?.[item.key] || 0}
                          </p>
                          <p className="text-[10px] text-gray-400">از {paymentStatusTotal || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {transaction.invoiceImageUrl && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold text-melkingDarkBlue">فاکتور</h2>
                    <DocumentViewer documentUrl={transaction.invoiceImageUrl} />
                  </>
                )}

                {transaction.attachments && transaction.attachments.length > 0 && (
                  <>
                    <h2 className="mb-3 text-lg font-semibold text-melkingDarkBlue">📎 فایل‌های پیوست</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                      {transaction.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={getFullMediaUrl(attachment.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative group flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                          title={attachment.name}
                        >
                          {attachment.type && attachment.type.startsWith('image/') ? (
                            <img
                              src={getFullMediaUrl(attachment.url)}
                              alt={attachment.name}
                              className="w-full h-20 object-cover rounded-md mb-2"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-20 bg-gray-100 rounded-md mb-2 text-gray-500">
                              {attachment.type === 'application/pdf' ? (
                                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                                </svg>
                              ) : (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                </svg>
                              )}
                              <span className="text-xs mt-1">{attachment.type?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-700 truncate w-full text-center">{attachment.name}</span>
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                )}

                {/* همیشه بخش واحدهای مشمول را نمایش بده */}
                <>
                  <h2 className="mb-3 text-lg font-semibold text-melkingDarkBlue">واحدهای مشمول</h2>
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 مبلغ‌های نمایش داده شده سهم هر واحد از هزینه کل است
                    </p>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>در حال بارگذاری اطلاعات واحدها...</p>
                    </div>
                  ) : units.length > 0 ? (
                    <>
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
                            پرداخت شده ({units.filter(u => normalizeStatus(u.status) === "paid").length})
                          </button>
                          <button
                            onClick={() => setUnitFilter("awaiting")}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                              unitFilter === "awaiting"
                                ? "bg-yellow-500 text-white border-yellow-500"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            منتظر تایید ({units.filter(u => normalizeStatus(u.status) === "awaiting_manager").length})
                          </button>
                          <button
                            onClick={() => setUnitFilter("unpaid")}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                              unitFilter === "unpaid"
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            پرداخت نشده ({units.filter(u => normalizeStatus(u.status) === "pending").length})
                          </button>
                        </div>
                      </div>

                      {/* لیست واحدها */}
                      <div className="space-y-2">
                        {filteredUnits.length > 0 ? (
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
                                  {parseFloat(unit.amount || 0).toLocaleString('fa-IR')} تومان
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  normalizeStatus(unit.status) === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : normalizeStatus(unit.status) === "awaiting_manager"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}>
                                  {getUnitStatusText(unit.status)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>هیچ واحدی با فیلتر انتخاب شده یافت نشد.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>اطلاعاتی برای نمایش وجود ندارد.</p>
                    </div>
                  )}
                </>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>

      {/* مدال تایید حذف */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteWarning(null);
        }}
        onConfirm={handleDelete}
        title={deleteWarning ? "هشدار: واحدهایی پرداخت کرده‌اند" : "تایید حذف هزینه"}
        message={deleteWarning ? deleteWarning.message : "آیا از حذف این هزینه اطمینان دارید؟"}
        itemName={transaction ? getPersianType(transaction.bill_type || transaction.title) : ""}
        itemDetails={
          deleteWarning
            ? `واحدهای پرداخت‌کننده:\n${deleteWarning.paid_units.map(u => `واحد ${u.unit_number}: ${u.paid_amount.toLocaleString()} تومان`).join('\n')}\n\nمجموع مبلغ پرداخت شده: ${deleteWarning.total_paid_amount.toLocaleString()} تومان\n\nبا حذف این هزینه، مبلغ به موجودی صندوق و بستانکاری واحدها برگردانده می‌شود.`
            : transaction
            ? `مبلغ: ${transaction.amount?.toLocaleString()} تومان`
            : ""
        }
        isLoading={isDeleting}
      />

      {/* مدال پرداخت */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        transaction={transaction}
        isPaying={isPaying}
      />
    </Transition>
  );
}