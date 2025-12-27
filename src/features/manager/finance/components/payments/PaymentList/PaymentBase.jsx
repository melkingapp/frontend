import { Wallet2, Loader2, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PaymentItem } from "../PaymentItem";
import { fetchPendingPayments } from "../../../store/slices/paymentsSlice";

export default function PaymentBase({ limit, buildingId = null }) {
    const dispatch = useDispatch();
    const { payments: reduxPayments, loading, error } = useSelector(state => state.payments);
    
    // Always use Redux data for real backend integration
    const dataSource = reduxPayments || [];
    const displayedPayments = limit ? dataSource.slice(0, limit) : dataSource;

    useEffect(() => {
        console.log("🔥 PaymentBase - Fetching payments for buildingId:", buildingId);
        if (buildingId) {
            dispatch(fetchPendingPayments({ buildingId, status: 'pending' }))
                .then((result) => {
                    console.log("🔥 PaymentBase - Fetch payments result:", result);
                    console.log("🔥 PaymentBase - Payments in result:", result.payload);
                })
                .catch((error) => {
                    console.error("🔥 PaymentBase - Fetch payments error:", error);
                });
        }
    }, [dispatch, buildingId]);

    const handleRefresh = () => {
        dispatch(fetchPendingPayments({ buildingId, status: 'pending' }));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <Wallet2 className="text-melkingDarkBlue" size={20} />
                    بررسی پرداخت ها
                </h2>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    بروزرسانی
                </button>
            </div>

            {loading && displayedPayments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری پرداخت‌ها</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayedPayments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">پرداختی موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayedPayments.map((payment) => (
                        <PaymentItem key={payment.id} payment={payment} buildingId={buildingId} />
                    ))}
                </div>
            )}

            {limit && dataSource.length > limit && (
                <p className="text-sm text-gray-500 mt-2">
                    {`نمایش ${limit} مورد از ${dataSource.length} پرداختی`}
                </p>
            )}
        </div>
    );
}
