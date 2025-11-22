import { 
  Filter, 
  ChevronDown,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Droplet,
  Zap,
  Flame,
  SprayCan,
  Shield,
  Camera,
  Car,
  ArrowLeftRight,
  ShoppingCart
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export default function BalanceFilters({ 
  filter, 
  onFilterChange, 
  dateRange, 
  onDateRangeChange 
}) {
  const filterOptions = [
    { value: "all", label: "همه تراکنش‌ها", icon: <Filter size={16} /> },
    { value: "charge", label: "شارژ", icon: <Clock size={16} /> },
    { value: "maintenance", label: "تعمیرات", icon: <Clock size={16} /> },
    { value: "water", label: "قبض آب", icon: <Droplet size={16} /> },
    { value: "electricity", label: "قبض برق", icon: <Zap size={16} /> },
    { value: "gas", label: "قبض گاز", icon: <Flame size={16} /> },
    { value: "cleaning", label: "نظافت", icon: <SprayCan size={16} /> },
    { value: "camera", label: "دوربین", icon: <Camera size={16} /> },
    { value: "parking", label: "پارکینگ", icon: <Car size={16} /> },
    { value: "purchases", label: "اقلام خریدنی", icon: <ShoppingCart size={16} /> },
  ];


  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === option.value
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <span className={`transition-colors ${filter === option.value ? "text-white" : "text-gray-500"}`}>
              {option.icon}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {(filter !== "all" || dateRange.from !== moment().startOf('year').format('YYYY-MM-DD') || dateRange.to !== moment().format('YYYY-MM-DD')) && (
        <button
          onClick={() => {
            onFilterChange("all");
            onDateRangeChange({
              from: moment().startOf('year').format('YYYY-MM-DD'),
              to: moment().format('YYYY-MM-DD')
            });
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full border border-red-200 hover:border-red-300 transition-all duration-200"
        >
          <X size={16} />
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );
}
