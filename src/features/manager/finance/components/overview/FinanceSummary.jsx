import { Wallet, CreditCard, Calendar } from "lucide-react";
import CountUp from "react-countup";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function FinanceSummary({ totalCost, balance, newestDate, oldestDate, filter, categories }) {
  const selectedCategory = categories.find((cat) => cat.value === filter);
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

  return (
    <div className="flex flex-wrap justify-between gap-4 mb-6 bg-melkingDarkBlue px-4 py-8 rounded-xl">
      {/* مجموع هزینه */}
      <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
        <Wallet className="mx-auto mb-2 text-melkingGold" size={32} />
        <h4 className="font-bold mb-4 text-melkingGold">{heading}</h4>
        <p className="text-lg font-bold text-white">
          <CountUp end={totalCost} separator="," />
        </p>
      </div>

      {/* موجودی */}
      <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
        <CreditCard className="mx-auto mb-2 text-melkingGold" size={32} />
        <h4 className="text-melkingGold font-bold mb-4">موجودی صندوق (ریال)</h4>
        <p className="text-lg font-bold text-white">
          <CountUp end={balance} separator="," />
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
