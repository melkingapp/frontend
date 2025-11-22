import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Eye, Search, Filter, Calendar, X } from "lucide-react";
import moment from "moment-jalaali";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { fetchTransactions, selectCurrentFundBalance } from "../../../manager/finance/slices/financeSlice";
import FinanceTableRow from "../../../manager/finance/components/overview/FinanceTableRow";
import FinanceDetailsModal from "../../../manager/finance/components/overview/FinanceDetailsModal";
import TransactionFilter from "../../../manager/finance/components/overview/TransactionFilter";
import useCategories from "../../../../shared/hooks/useCategories";

moment.loadPersian({ dialect: "persian-modern" });

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to get start of year in YYYY-MM-DD format
const getStartOfYear = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  return startOfYear.toISOString().split('T')[0];
};

export default function BuildingBalanceTable() {
    const dispatch = useDispatch();
    const building = useSelector(selectSelectedBuilding);
    const _currentFundBalance = useSelector(selectCurrentFundBalance);
    const categories = useCategories();
    
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: getStartOfYear(),
        to: getCurrentDate()
    });
    
    // Get transactions from Redux state
    const transactionsData = useSelector(state => state.finance.transactions || []);
    const transactions = Array.isArray(transactionsData) ? transactionsData : (transactionsData?.transactions || []);
    
    // Fetch transactions when building or date range changes
    useEffect(() => {
        if (building?.building_id) {
            setLoading(true);
            dispatch(fetchTransactions({ 
                building_id: building.building_id,
                date_from: dateRange.from,
                date_to: dateRange.to
            }))
                .finally(() => setLoading(false));
        }
    }, [dispatch, building?.building_id, dateRange]);
    
    // Sort and filter transactions
    const sortedData = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    const filteredData = sortedData.filter(item => {
        let matchesFilter = false;
        
        if (filter === "all") {
            matchesFilter = true;
        } else if (filter === "purchases") {
            matchesFilter = item.title && item.title.startsWith("اقلام خریدنی");
        } else if (filter.startsWith("custom_")) {
            const customType = filter.replace("custom_", "").replace(/_/g, " ");
            matchesFilter = item.title === customType || 
                           item.bill_type === customType ||
                           (item.bill_type === 'other' && item.description === customType);
        } else {
            // Map expense type filters to actual data
            const filterMapping = {
                'water_bill': 'قبض آب',
                'electricity_bill': 'قبض برق',
                'gas': 'قبض گاز',
                'maintenance': 'تعمیرات',
                'cleaning': 'نظافت',
                'security': 'امنیت',
                'camera': 'دوربین',
                'parking': 'پارکینگ',
                'charge': 'شارژ',
                'repair': 'تعمیرات',
                'rent': 'اجاره',
                'service': 'خدمات',
                'other': 'سایر'
            };
            
            const expectedTitle = filterMapping[filter];
            
            const billTypeMapping = {
                'water_bill': 'water',
                'electricity_bill': 'electricity',
                'gas': 'gas',
                'maintenance': 'maintenance',
                'cleaning': 'cleaning',
                'security': 'security',
                'camera': 'camera',
                'parking': 'parking',
                'charge': 'charge',
                'repair': 'maintenance',
                'rent': 'other',
                'service': 'other',
                'other': 'other'
            };
            
            const expectedBillType = billTypeMapping[filter];
            const filterLabel = categories.find(cat => cat.value === filter)?.label;
            
            matchesFilter = item.title === expectedTitle || 
                           (item.bill_type && item.bill_type === expectedBillType) ||
                           (item.category && item.category === filter) ||
                           (item.title && item.title === filterLabel);
        }
        
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
            search === "" ||
            item.title.toLowerCase().includes(search) ||
            item.status.toLowerCase().includes(search) ||
            item.date.toLowerCase().includes(search) ||
            item.amount.toString().includes(search);

        return matchesFilter && matchesSearch;
    });
    
    // Calculate totals
    const totalCost = filteredData.reduce((sum, t) => sum + t.amount, 0);
    const newestDate = filteredData.length > 0 ? filteredData[filteredData.length - 1].date : "-";
    const oldestDate = filteredData.length > 0 ? filteredData[0].date : "-";

    // Helper function to format date
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Helper function to get start/end of week
    const _getWeekRange = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
            from: formatDate(startOfWeek),
            to: formatDate(endOfWeek)
        };
    };

    // Helper function to get start/end of month
    const _getMonthRange = () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
            from: formatDate(startOfMonth),
            to: formatDate(endOfMonth)
        };
    };

    // Helper function to get start/end of year
    const _getYearRange = () => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return {
            from: formatDate(startOfYear),
            to: formatDate(endOfYear)
        };
    };

    // Helper function to get last month range
    const _getLastMonthRange = () => {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
            from: formatDate(lastMonth),
            to: formatDate(endOfLastMonth)
        };
    };


    
    return (
        <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">خلاصه تراکنش‌ها</h3>
                    {loading && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-melkingGold"></div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* مجموع هزینه */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">مجموع هزینه</p>
                                <p className="text-xl font-bold">
                                    {totalCost.toLocaleString()} ریال
                                </p>
                            </div>
                            <div className="text-blue-200">
                                <Filter className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    
                    {/* تعداد تراکنش‌ها */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">تعداد تراکنش‌ها</p>
                                <p className="text-xl font-bold">
                                    {filteredData.length}
                                </p>
                            </div>
                            <div className="text-green-200">
                                <Eye className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    
                    {/* بازه زمانی */}
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">بازه زمانی</p>
                                <p className="text-sm font-semibold">
                                    {newestDate !== "-" && oldestDate !== "-" ? `${newestDate} تا ${oldestDate}` : "بدون داده"}
                                </p>
                            </div>
                            <div className="text-purple-200">
                                <Search className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Transaction Table */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">جدول تراکنش‌ها</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                                {moment(dateRange.from).format('jYYYY/jMM/jDD')} - {moment(dateRange.to).format('jYYYY/jMM/jDD')}
                            </span>
                        </div>
                        <div>
                            {filteredData.length} تراکنش نمایش داده می‌شود
                        </div>
                    </div>
                </div>
                
                {/* Filters and Search */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Transaction Filter */}
                        <div className="flex-1">
                            <TransactionFilter filter={filter} setFilter={setFilter} categories={categories} />
                        </div>
                        
                        
                        {/* Clear Filters */}
                        {(filter !== "all" || dateRange.from !== getStartOfYear() || dateRange.to !== getCurrentDate()) && (
                            <button
                                onClick={() => {
                                    setFilter("all");
                                    setDateRange({
                                        from: getStartOfYear(),
                                        to: getCurrentDate()
                                    });
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <X size={16} />
                                پاک کردن فیلترها
                            </button>
                        )}
                    </div>
                    
                    {/* Search Box */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="جستجو در تراکنش‌ها..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-melkingGold focus:border-transparent"
                        />
                    </div>
                </div>
                
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 text-gray-500 text-xs sm:text-sm font-semibold border-b pb-2 mb-2">
                    <span className="flex items-center gap-1">عنوان</span>
                    <span className="flex items-center gap-1">مبلغ (ریال)</span>
                    <span className="flex items-center gap-1">تاریخ</span>
                    <span className="flex items-center gap-1">وضعیت سیستم</span>
                </div>
                
                {/* Table Rows */}
                {filteredData.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                            <Eye className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-gray-500">موردی برای نمایش وجود ندارد.</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? "نتیجه‌ای برای جستجوی شما یافت نشد." : "هیچ تراکنشی ثبت نشده است."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredData.map((item, index) => (
                            <FinanceTableRow 
                                key={`${item.id}-${item.category}-${item.title}-${index}`} 
                                transaction={item} 
                                onSelect={setSelected} 
                            />
                        ))}
                    </div>
                )}
                
                {/* Modal */}
                <FinanceDetailsModal isResident building={building} transaction={selected} onClose={() => setSelected(null)} />
            </div>
        </div>
    );
}
