import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import CountUp from "react-countup";
import { formatNumber } from "../../../../../shared/utils/helper";

export default function BalanceSummary({ balance, income, expenses, isLoading }) {
  const getBalanceColor = (amount) => {
    if (amount > 0) return "text-green-600";
    if (amount < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getBalanceIcon = (amount) => {
    if (amount > 0) return <ArrowUpRight className="text-green-500" size={20} />;
    if (amount < 0) return <ArrowDownRight className="text-red-500" size={20} />;
    return <DollarSign className="text-gray-500" size={20} />;
  };

  const summaryCards = [
    {
      title: "موجودی فعلی",
      value: balance,
      icon: <Wallet className="text-blue-500" size={24} />,
      color: getBalanceColor(balance),
      iconColor: balance > 0 ? "text-green-500" : balance < 0 ? "text-red-500" : "text-gray-500",
      bgColor: balance > 0 ? "bg-green-50" : balance < 0 ? "bg-red-50" : "bg-gray-50",
      borderColor: balance > 0 ? "border-green-200" : balance < 0 ? "border-red-200" : "border-gray-200"
    },
    {
      title: "کل درآمد",
      value: income,
      icon: <TrendingUp className="text-green-500" size={24} />,
      color: "text-green-600",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "کل هزینه",
      value: expenses,
      icon: <TrendingDown className="text-red-500" size={24} />,
      color: "text-red-600",
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {summaryCards.map((card, index) => (
        <div 
          key={index}
          className={`bg-white rounded-xl p-6 shadow-sm border-2 ${card.borderColor} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              {card.icon}
            </div>
            {index === 0 && getBalanceIcon(card.value)}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">
              {card.title}
            </h3>
            
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value !== undefined ? (
                <CountUp 
                  end={card.value} 
                  separator="," 
                  duration={1.5}
                  decimals={0}
                />
              ) : (
                "—"
              )}
              <span className="text-sm font-normal text-gray-500 mr-1">تومان</span>
            </div>
          </div>
          
          {/* Additional info for balance card */}
          {index === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">وضعیت:</span>
                <span className={`font-medium ${
                  balance > 0 ? "text-green-600" : 
                  balance < 0 ? "text-red-600" : 
                  "text-gray-600"
                }`}>
                  {balance > 0 ? "مثبت" : balance < 0 ? "منفی" : "صفر"}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
