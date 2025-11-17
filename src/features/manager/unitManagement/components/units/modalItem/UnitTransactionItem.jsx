import { useMemo } from "react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function UnitTransactionItem({ transaction }) {
    const statusColor = useMemo(() => {
        switch (transaction.status) {
            case "منتظر پرداخت":
                return "bg-yellow-100 text-yellow-800";
            case "پرداخت شده":
                return "bg-emerald-100 text-emerald-800";
            case "تایید شده":
                return "bg-blue-100 text-blue-800";
            case "تایید نشده":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-700";
        }
    }, [transaction.status]);

    const formattedDate = useMemo(() => {
        return transaction.date
            ? moment(transaction.date, "YYYY/MM/DD").format("jYYYY/jMM/jDD")
            : "—";
    }, [transaction.date]);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-gray-200 shadow-sm bg-white mb-3">
            <div className="flex flex-col mb-2 sm:mb-0">
                <span className="font-medium text-gray-900">{transaction.title}</span>
                <span className="text-sm text-gray-600">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <span className="font-medium text-gray-900">{transaction.amount.toLocaleString()} تومان</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor} whitespace-nowrap`}>
                    {transaction.status}
                </span>
            </div>
        </div>
    );
}
