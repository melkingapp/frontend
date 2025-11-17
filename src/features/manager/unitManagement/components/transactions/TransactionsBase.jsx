import { ReceiptText, Loader2, RefreshCw } from "lucide-react";
import TransactionItem from "./TransactionItem";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../slices/transactionsSlice";

export default function TransactionsBase({ limit, buildingId = null }) {
    const dispatch = useDispatch();
    const { transactions: reduxTransactions, loading, error } = useSelector(state => state.transactions);
    
    // Use Redux data if available, otherwise fall back to props
    const dataSource = reduxTransactions || [];
    const displayedTransactions = limit ? dataSource.slice(0, limit) : dataSource;

    useEffect(() => {
        // Always fetch transactions from backend
        dispatch(fetchTransactions({ building_id: buildingId }));
    }, [dispatch, buildingId]);

    const handleRefresh = () => {
        dispatch(fetchTransactions({ building_id: buildingId }));
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-melkingDarkBlue flex items-center gap-2">
                    <ReceiptText className="text-melkingDarkBlue" size={20} />
                    تراکنش ها
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

            {loading && displayedTransactions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری تراکنش‌ها</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition"
                    >
                        تلاش مجدد
                    </button>
                </div>
            ) : displayedTransactions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">تراکنشی موجود نیست.</p>
            ) : (
                <div className="space-y-4">
                    {displayedTransactions.map((transaction) => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                </div>
            )}

            {limit && dataSource.length > limit && (
                <p className="text-sm text-gray-500 mt-2">
                    {`نمایش ${limit} مورد از ${dataSource.length} تراکنش`}
                </p>
            )}
        </div>
    )
}
