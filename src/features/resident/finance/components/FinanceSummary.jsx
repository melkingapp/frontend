import { Wallet, CreditCard, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import CountUp from "react-countup";
import moment from "moment-jalaali";
import { useSelector } from "react-redux";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { selectCurrentFundBalance } from "../../../manager/finance/store/slices/financeSlice";

moment.loadPersian({ dialect: "persian-modern" });

export default function FinanceSummary({ totalCost, balance, newestDate, oldestDate, filter, categories, onItemClick, highlightableKeys = [] }) {
  const building = useSelector(selectSelectedBuilding);
  const currentFundBalance = useSelector(selectCurrentFundBalance);
  
  // Use building data if available
  const actualBalance = currentFundBalance?.current_balance || building?.fund_balance || balance || 0;
  const actualTotalCost = totalCost || 0;
  
  const selectedCategory = categories?.find((cat) => cat.value === filter);
  const heading = filter === "all"
    ? "مجموع هزینه (ریال)"
    : `مجموع هزینه ${selectedCategory?.label || ""} (ریال)`;

  // Format dates to Persian
  const formatJalaliDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch {
      return dateString;
    }
  };

  // If we have financial data, show the manager-style summary
  if (totalCost !== undefined || balance !== undefined) {
    return (
      <div className="flex flex-wrap justify-between gap-4 mb-6 bg-melkingDarkBlue px-4 py-8 rounded-xl">
        {/* مجموع هزینه */}
        <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
          <Wallet className="mx-auto mb-2 text-melkingGold" size={32} />
          <h4 className="font-bold mb-4 text-melkingGold">{heading}</h4>
          <p className="text-lg font-bold text-white">
            <CountUp end={actualTotalCost} separator="," />
          </p>
        </div>

        {/* موجودی */}
        <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
          <CreditCard className="mx-auto mb-2 text-melkingGold" size={32} />
          <h4 className="text-melkingGold font-bold mb-4">موجودی صندوق (ریال)</h4>
          <p className="text-lg font-bold text-white">
            <CountUp end={actualBalance} separator="," />
          </p>
        </div>

        {/* تاریخ */}
        <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
          <Calendar className="mx-auto mb-2 text-melkingGold" size={32} />
          <h4 className="text-melkingGold font-bold mb-4">آخرین تاریخ</h4>
          <p className="text-md font-bold text-white">از تاریخ {formatJalaliDate(newestDate)}</p>
          <p className="text-md font-bold text-white">تا تاریخ {formatJalaliDate(oldestDate)}</p>
        </div>
      </div>
    );
  }

  // Fallback to navigation-style summary for dashboard with manager-style design
  const summaryItems = [
    {
      key: "transactions",
      title: "گردش مالی",
      description: "مشاهده تمام تراکنش‌های مالی ساختمان",
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      highlightable: highlightableKeys.includes("transactions"),
      onClick: () => onItemClick && onItemClick("transactions")
    },
    {
      key: "balance",
      title: "بیلان مالی",
      description: "نمایش کامل وضعیت مالی ساختمان",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      highlightable: highlightableKeys.includes("balance"),
      onClick: () => onItemClick && onItemClick("balance")
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {summaryItems.map((item) => (
        <div
          key={item.key}
          className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
            ${item.highlightable 
              ? 'border-blue-300 bg-blue-50 shadow-lg scale-105' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-102'
            }`}
          onClick={item.onClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`p-3 rounded-lg ${item.color} text-white shadow-md`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
