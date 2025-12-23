import { useState, useEffect, useRef } from "react";
import moment from "moment-jalaali";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar, BadgeX, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnitTransactions, clearUnitTransactions } from "../../slices/transactionsSlice";
import { getPersianType, getPersianStatus, getStatusBgColor } from "../../../../../shared/utils/typeUtils";
import { getTypeIcon } from "../../../../../shared/utils/iconUtils.jsx";
import unitsApi from "../../../../../shared/services/unitsApi";


export default function UnitTransactionsList({ unitNumber, buildingId = null }) {
    const dispatch = useDispatch();
    const { unitTransactions, unitSummary, unitLoading, error } = useSelector(state => state.transactions);
    const [filteredTx, setFilteredTx] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState(null); // بازه زمانی
    const [unitInfo, setUnitInfo] = useState(null); // اطلاعات واحد
    const inputRef = useRef();

    useEffect(() => {
        if (!unitNumber.trim()) {
            dispatch(clearUnitTransactions());
            setFilteredTx([]);
            setUnitInfo(null);
            return;
        }
        
        // Fetch unit information from API, then load full financial transactions by unit_id
        const fetchUnitInfoAndTransactions = async () => {
            if (!buildingId) {
                console.warn('Building ID is required to fetch unit info');
                return;
            }

            try {
                const result = await unitsApi.getUnitByNumber(buildingId, unitNumber);
                if (result.success) {
                    const unit = result.unit;
                    setUnitInfo({
                        unitNumber: unit.unit_number,
                        owner: unit.full_name || unit.owner_name || 'نامشخص',
                        resident: unit.tenant_full_name || unit.resident_name || null,
                        phone: unit.phone_number || 'نامشخص',
                        tenantPhone: unit.tenant_phone_number || null,
                        area: unit.area ? `${unit.area} متر مربع` : 'نامشخص',
                        floor: unit.floor ? `طبقه ${unit.floor}` : 'نامشخص',
                        role: unit.role || 'نامشخص',
                        ownerType: unit.owner_type || 'نامشخص',
                        hasParking: unit.has_parking || false,
                        parkingCount: unit.parking_count || 0,
                        residentCount: unit.resident_count || 1
                    });
                    // بعد از پیدا شدن واحد، گردش مالی کامل واحد را بگیر
                    if (unit.units_id) {
                        dispatch(fetchUnitTransactions({ unitId: unit.units_id }));
                    }
                } else {
                    console.error('Failed to fetch unit info:', result.error);
                    setUnitInfo(null);
                }
            } catch (error) {
                console.error('Error fetching unit info:', error);
                setUnitInfo(null);
            }
        };

        fetchUnitInfoAndTransactions();
    }, [dispatch, unitNumber, buildingId]);

    useEffect(() => {
        // فقط تراکنش‌های مرتبط با هزینه (قبوض مشترک و فاکتورهای واحد)
        // اگر invoice به یک shared_bill متصل است، در backend برای آن expense_name ست شده
        // اینجا فقط یکی را نگه می‌داریم: یا shared_bill یا invoice مستقل بدون expense_name
        let result = unitTransactions.filter(
            (tx) =>
                tx.type === "shared_bill" ||
                (tx.type === "invoice" && !tx.expense_name) ||
                tx.category === "individual_invoice"
        );

        // فیلتر بر اساس وضعیت
        if (statusFilter) result = result.filter(tx => tx.status === statusFilter);

        // فیلتر بر اساس بازه زمانی
        if (dateRange && dateRange.length === 2 && result.length > 0) {
            const startDate = moment(dateRange[0].toDate()).startOf("day").valueOf();
            const endDate = moment(dateRange[1].toDate()).endOf("day").valueOf();
            result = result.filter(tx => {
                const txDate = moment(tx.date || tx.created_at).valueOf();
                return txDate >= startDate && txDate <= endDate;
            });
        }

        // مرتب‌سازی بر اساس تاریخ (جدیدترین بالا)
        const sorted = [...result].sort((a, b) => {
            const dateA = moment(a.date || a.created_at).valueOf();
            const dateB = moment(b.date || b.created_at).valueOf();
            return dateB - dateA;
        });

        setFilteredTx(sorted);
    }, [statusFilter, dateRange, unitTransactions]);


    // Format date to Persian
    const formatJalaliDate = (dateString) => {
        if (!dateString) return "بدون تاریخ";
        try {
            // Try to parse as English date first (YYYY-MM-DD)
            const date = moment(dateString);
            if (date.isValid()) {
                return date.format("jYYYY/jMM/jDD");
            }
            // If not valid, try Persian format
            const persianDate = moment(dateString, "jYYYY/jMM/jDD");
            if (persianDate.isValid()) {
                return persianDate.format("jYYYY/jMM/jDD");
            }
            return dateString;
        } catch {
            return dateString;
        }
    };


    return (
        <div className="mt-6">
            {/* اطلاعات واحد */}
            {unitInfo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">
                        🏠 اطلاعات واحد {unitInfo.unitNumber}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600 mb-1">👤 مالک</p>
                            <p className="font-medium text-gray-800">{unitInfo.owner}</p>
                            <p className="text-xs text-gray-500 mt-1">📞 {unitInfo.phone}</p>
                        </div>
                        {unitInfo.resident && (
                            <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-600 mb-1">🏠 ساکن</p>
                                <p className="font-medium text-gray-800">{unitInfo.resident}</p>
                                {unitInfo.tenantPhone && (
                                    <p className="text-xs text-gray-500 mt-1">📞 {unitInfo.tenantPhone}</p>
                                )}
                            </div>
                        )}
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600 mb-1">📐 متراژ</p>
                            <p className="font-medium text-gray-800">{unitInfo.area}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600 mb-1">🏢 طبقه</p>
                            <p className="font-medium text-gray-800">{unitInfo.floor}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600 mb-1">👥 تعداد نفر</p>
                            <p className="font-medium text-gray-800">{unitInfo.residentCount} نفر</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600 mb-1">🚗 پارکینگ</p>
                            <p className="font-medium text-gray-800">
                                {unitInfo.hasParking ? `${unitInfo.parkingCount} پارکینگ` : 'ندارد'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* خلاصه گردش مالی واحد */}
            {unitSummary && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl shadow-sm border border-blue-200">
                    <h3 className="font-semibold mb-3 text-blue-800 text-lg flex items-center gap-2">
                        خلاصه گردش مالی واحد
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600 block">کل فاکتورها</span>
                            <span className="font-medium text-gray-900">
                                {unitSummary.total_invoices} مورد
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">
                                مبلغ:{" "}
                                <span className="font-semibold text-gray-900">
                                    {unitSummary.total_amount_invoices?.toLocaleString('fa-IR') || 0} تومان
                                </span>
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">کل پرداخت‌ها</span>
                            <span className="font-medium text-gray-900">
                                {unitSummary.total_payments} مورد
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">
                                مبلغ:{" "}
                                <span className="font-semibold text-gray-900">
                                    {unitSummary.total_amount_payments?.toLocaleString('fa-IR') || 0} تومان
                                </span>
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">کل بدهی‌ها</span>
                            <span className="font-medium text-gray-900">
                                {unitSummary.total_debts} مورد
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">
                                مبلغ:{" "}
                                <span className="font-semibold text-gray-900">
                                    {unitSummary.total_amount_debts?.toLocaleString('fa-IR') || 0} تومان
                                </span>
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">صورتحساب‌های مشترک</span>
                            <span className="font-medium text-gray-900">
                                {unitSummary.total_shared_bills} مورد
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* فیلترها */}
            {unitTransactions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {(statusFilter || dateRange) && (
                        <button
                            onClick={() => {
                                setStatusFilter("");
                                setDateRange(null);
                            }}
                            className="px-4 py-2 flex rounded-full text-red-600 text-sm font-medium hover:bg-red-500 hover:text-white transition"
                        >
                            <BadgeX size={20} className="ml-3" />حذف فیلترها
                        </button>
                    )}
                    {[
                        { label: "مشاهده همه", value: "", bg: "bg-gray-100", text: "text-gray-800" },
                        { label: "منتظر پرداخت", value: "pending", bg: "bg-yellow-500", text: "text-white", dot: "bg-yellow-400" },
                        { label: "پرداخت شده", value: "paid", bg: "bg-emerald-600", text: "text-white", dot: "bg-emerald-500" },
                        { label: "سررسید گذشته", value: "overdue", bg: "bg-orange-600", text: "text-white", dot: "bg-orange-400" },
                        { label: "لغو شده", value: "cancelled", bg: "bg-red-600", text: "text-white", dot: "bg-red-400" },
                    ].map((status) => (
                        <button
                            key={status.value || "all"}
                            onClick={() => setStatusFilter(status.value)}
                            className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition
                                        ${statusFilter === status.value ? `${status.bg} ${status.text} shadow-md` : `bg-gray-100 text-gray-800 hover:bg-gray-200`}
                                    `}
                        >
                            {status.dot && <span className={`w-2 h-2 rounded-full ${status.dot}`} />}
                            {status.label}
                        </button>
                    ))}

                    {/* انتخاب بازه زمانی */}
                    <div className="relative flex">
                        <button
                            onClick={() => inputRef.current.openCalendar()}
                            className="px-4 py-1 rounded-full bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 flex items-center gap-1 transition"
                        >
                            <Calendar className="w-4 h-4" />
                            {dateRange && dateRange.length === 2 
                                ? `${dateRange[0].format("YYYY/MM/DD")} - ${dateRange[1].format("YYYY/MM/DD")}`
                                : "انتخاب بازه زمانی"
                            }
                        </button>

                        <DatePicker
                            calendar={persian}
                            locale={persian_fa}
                            ref={inputRef}
                            value={dateRange}
                            onChange={setDateRange}
                            range
                            format="jYYYY/jMM/jDD"
                            inputClass="hidden"
                            calendarPosition="bottom-center"
                        />
                    </div>
                </div>
            )}

            {unitLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-melkingDarkBlue" size={24} />
                    <span className="mr-2 text-gray-600">در حال بارگذاری تراکنش‌ها...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">خطا در بارگذاری تراکنش‌ها</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            ) : filteredTx.length === 0 && unitTransactions.length > 0 ? (
                <p className="text-gray-500 text-center">هیچ تراکنشی با فیلتر انتخابی یافت نشد.</p>
            ) : filteredTx.length === 0 ? (
                <p className="text-gray-500 text-center">تراکنشی برای این واحد یافت نشد.</p>
            ) : (
                <div className="space-y-4">
                    {/* توضیح کوتاه */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-3">
                        <p className="text-xs text-gray-600 text-center">
                            💡 مبلغ‌های نمایش داده شده سهم این واحد از هزینه‌های مشترک است
                        </p>
                    </div>
                    
                    {filteredTx.map((tx, index) => {
                        const expenseName = tx.expense_name || tx.expense_details?.expense_name || null;
                        const typeLabel = getPersianType(tx.type || tx.category || tx.transaction_type || "");

                        return (
                            <div
                                key={`${tx.id}-${tx.type || tx.category || "tx"}-${index}`}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border rounded-2xl shadow-md bg-white hover:shadow-xl transition duration-300"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                    <div className="flex items-center gap-2">{getTypeIcon(tx.type || tx.category)}</div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-lg">
                                            {expenseName || typeLabel}
                                        </span>
                                        {expenseName && (
                                            <span className="text-xs text-gray-500 mt-0.5">
                                                {typeLabel}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-gray-700 text-base">
                                        <span className="font-medium">{parseFloat(tx.amount).toLocaleString('fa-IR')}</span> تومان
                                    </span>
                                </div>
                                <div className="flex gap-3 mt-3 sm:mt-0 items-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(tx.status)}`}>
                                        {getPersianStatus(tx.status)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatJalaliDate(tx.date || tx.created_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}