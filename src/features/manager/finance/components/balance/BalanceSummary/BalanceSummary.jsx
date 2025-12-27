import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CreditCard,
  Users,
  Receipt
} from "lucide-react";
import CountUp from "react-countup";
import { formatNumber } from "../../../../../../shared/utils/helper";

export default function BalanceSummary({ 
  fundBalance, 
  accountsReceivable, 
  unitCredits, 
  totalExpenses, 
  totalIncome,
  currentBalance,
  hasData,
  isLoading 
}) {

  // Professional color scheme - more muted and elegant
  const getBalanceColors = (amount) => {
    if (amount > 0) {
      return {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        iconBg: "bg-emerald-100",
        icon: "text-emerald-600",
        statusText: "text-emerald-700",
        statusBg: "bg-emerald-50"
      };
    }
    if (amount < 0) {
      return {
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-100",
        iconBg: "bg-rose-100",
        icon: "text-rose-600",
        statusText: "text-rose-700",
        statusBg: "bg-rose-50"
      };
    }
    return {
      text: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
      iconBg: "bg-slate-100",
      icon: "text-slate-500",
      statusText: "text-slate-600",
      statusBg: "bg-slate-50"
    };
  };

  const getBalanceIcon = (amount) => {
    if (amount > 0) return <ArrowUpRight className="text-emerald-600" size={18} />;
    if (amount < 0) return <ArrowDownRight className="text-rose-600" size={18} />;
    return <Minus className="text-slate-400" size={18} />;
  };

  const balanceColors = getBalanceColors(currentBalance);

  const summaryCards = [
    {
      title: "موجودی صندوق",
      subtitle: "دارایی جاری",
      value: fundBalance,
      icon: <Wallet className="text-slate-600" size={22} />,
      colors: {
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-100",
        iconBg: "bg-blue-100",
        icon: "text-blue-600"
      },
      showStatus: false
    },
    {
      title: "مجموع بدهکاری واحدها",
      subtitle: "حساب‌های دریافتنی",
      value: accountsReceivable,
      icon: <CreditCard className="text-amber-600" size={22} />,
      colors: {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-100",
        iconBg: "bg-amber-100",
        icon: "text-amber-600"
      },
      showStatus: false
    },
    {
      title: "مجموع بستانکاری واحدها",
      subtitle: "تعهد ساختمان",
      value: unitCredits,
      icon: <Users className="text-purple-600" size={22} />,
      colors: {
        text: "text-purple-700",
        bg: "bg-purple-50",
        border: "border-purple-100",
        iconBg: "bg-purple-100",
        icon: "text-purple-600"
      },
      showStatus: false
    },
    {
      title: "هزینه‌های ثبت شده",
      subtitle: "کل هزینه‌ها",
      value: totalExpenses,
      icon: <Receipt className="text-rose-600" size={22} />,
      colors: {
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-100",
        iconBg: "bg-rose-100",
        icon: "text-rose-600"
      },
      showStatus: false
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-slate-200">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded-lg md:rounded-xl"></div>
                <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="h-3 md:h-4 bg-slate-200 rounded w-20 md:w-24"></div>
                <div className="h-7 md:h-9 bg-slate-200 rounded w-32 md:w-40"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // اگر داده‌ای وجود ندارد
  if (!hasData && !isLoading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 mb-6 md:mb-8">
        <div className="text-center">
          <Wallet className="mx-auto text-slate-300 mb-4" size={56} />
          <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">
            هیچ داده‌ای برای نمایش وجود ندارد
          </h3>
          <p className="text-slate-500 text-sm md:text-base">
            در بازه زمانی انتخاب شده داده مالی ثبت نشده است
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {summaryCards.map((card, index) => (
        <div 
          key={index}
          className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border ${card.colors.border} hover:shadow-lg md:hover:scale-[1.02] transition-all duration-300`}
        >
          {/* Icon and Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${card.colors.iconBg} shadow-sm`}>
              <div className="scale-90 md:scale-100">
                {card.icon}
              </div>
            </div>
          </div>
          
          {/* Title */}
          <div className="mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-semibold text-slate-600 tracking-wide mb-1">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-[10px] md:text-xs text-slate-500">
                {card.subtitle}
              </p>
            )}
          </div>
          
          {/* Value */}
          <div className="mb-2">
            <div className={`text-xl md:text-2xl lg:text-3xl font-bold ${card.colors.text} leading-tight`}>
              {card.value !== undefined && card.value !== null ? (
                <>
                  <CountUp 
                    end={card.value} 
                    separator="," 
                    duration={1.8}
                    decimals={0}
                  />
                  <span className="text-sm md:text-base font-medium text-slate-500 mr-1 md:mr-2">ریال</span>
                </>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

