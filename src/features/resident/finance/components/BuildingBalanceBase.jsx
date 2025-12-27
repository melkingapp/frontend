import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DollarSign, TrendingUp, TrendingDown, Building2, Calendar, Wallet, CreditCard, Table } from "lucide-react";
import CountUp from "react-countup";
import moment from "moment-jalaali";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { fetchCurrentFundBalance, selectCurrentFundBalance } from "../../../manager/finance/store/slices/financeSlice";
import { fetchBuildings, setSelectedBuilding } from "../../../manager/building/buildingSlice";
import BuildingBalanceTable from "./BuildingBalanceTable";

moment.loadPersian({ dialect: "persian-modern" });

export default function BuildingBalanceBase() {
    const dispatch = useDispatch();
    const building = useSelector(selectSelectedBuilding);
    const buildings = useSelector(state => state.building.data);
    const currentFundBalance = useSelector(selectCurrentFundBalance);
    const [loading, setLoading] = useState(false);

    // Load buildings if not loaded
    useEffect(() => {
        if (buildings.length === 0) {
            dispatch(fetchBuildings());
        }
    }, [dispatch, buildings.length]);

    // Auto-select first building if none selected
    useEffect(() => {
        if (buildings.length > 0 && !building) {
            const firstBuilding = buildings[0];
            dispatch(setSelectedBuilding(firstBuilding.building_id || firstBuilding.id));
        }
    }, [dispatch, buildings.length, building]);

    // Fetch current fund balance when building changes
    useEffect(() => {
        if (building?.building_id) {
            setLoading(true);
            dispatch(fetchCurrentFundBalance(building.building_id))
                .finally(() => setLoading(false));
        }
    }, [dispatch, building?.building_id]);

    // Use currentFundBalance from API as the primary source (موجودی صندوق)
    const currentFundBalanceValue = currentFundBalance?.current_balance || 0;
    const isPositive = currentFundBalanceValue >= 0;

    // Format current date
    const currentDate = moment().format("jYYYY/jMM/jDD");

    return (
        <div className="space-y-6">
            {/* Manager-style Financial Summary */}
            <div className="flex flex-wrap justify-between gap-4 mb-6 bg-melkingDarkBlue px-4 py-8 rounded-xl">
                {/* موجودی صندوق */}
                <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
                    <CreditCard className="mx-auto mb-2 text-melkingGold" size={32} />
                    <h4 className="font-bold mb-4 text-melkingGold">موجودی صندوق (ریال)</h4>
                    <p className="text-lg font-bold text-white">
                        <CountUp end={currentFundBalanceValue} separator="," />
                    </p>
                    <p className="text-xs text-melkingGold/70 mt-1">از API دریافت شده</p>
                </div>

                {/* وضعیت مالی */}
                <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
                    <TrendingUp className="mx-auto mb-2 text-melkingGold" size={32} />
                    <h4 className="text-melkingGold font-bold mb-4">وضعیت مالی</h4>
                    <p className="text-lg font-bold text-white">
                        {isPositive ? 'مثبت' : 'منفی'}
                    </p>
                    <p className="text-xs text-melkingGold/70 mt-1">بر اساس صندوق</p>
                </div>

                {/* تاریخ امروز */}
                <div className="flex-1 min-w-[120px] p-4 rounded-lg text-center">
                    <Calendar className="mx-auto mb-2 text-melkingGold" size={32} />
                    <h4 className="text-melkingGold font-bold mb-4">تاریخ امروز</h4>
                    <p className="text-md font-bold text-white">{currentDate}</p>
                    <p className="text-xs text-melkingGold/70 mt-1">تاریخ شمسی</p>
                </div>
            </div>

            {/* Building Selection */}
            {buildings.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">انتخاب ساختمان</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {buildings.map((b) => (
                            <button
                                key={b.building_id || b.id}
                                onClick={() => dispatch(setSelectedBuilding(b.building_id || b.id))}
                                className={`p-4 rounded-xl border-2 text-right transition-all duration-200 hover:scale-102 ${
                                    (building?.building_id || building?.id) === (b.building_id || b.id)
                                        ? 'border-melkingGold bg-melkingGold/10 shadow-lg'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <Building2 className="w-6 h-6 text-gray-600" />
                                    <div className="text-right">
                                        <h4 className="font-semibold text-gray-900">{b.title}</h4>
                                        <p className="text-sm text-gray-600">{b.address}</p>
                                        <p className="text-xs text-blue-600 font-medium">
                                            کد: {b.building_code || b.code || 'نامشخص'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Balance Cards */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">جزئیات بیلان مالی</h2>
                    {loading && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-melkingGold"></div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* موجودی صندوق */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">موجودی صندوق</p>
                                <p className="text-2xl font-bold">
                                    <CountUp end={currentFundBalanceValue} separator="," /> ریال
                                </p>
                                <p className="text-xs text-blue-200 mt-1">از API</p>
                            </div>
                            <CreditCard className="w-8 h-8 text-blue-200" />
                        </div>
                    </div>

                    {/* وضعیت مالی */}
                    <div className={`rounded-xl p-6 text-white ${
                        isPositive 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${isPositive ? 'text-green-100' : 'text-red-100'}`}>وضعیت مالی</p>
                                <p className="text-xl font-bold">
                                    {isPositive ? 'مثبت' : 'منفی'}
                                </p>
                            </div>
                            {isPositive ? (
                                <TrendingUp className="w-8 h-8 text-green-200" />
                            ) : (
                                <TrendingDown className="w-8 h-8 text-red-200" />
                            )}
                        </div>
                    </div>

                    {/* ساختمان */}
                    {building && (
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm">ساختمان</p>
                                    <p className="text-lg font-semibold">{building.title}</p>
                                    <p className="text-xs text-indigo-200 mt-1">{building.address}</p>
                                </div>
                                <Building2 className="w-8 h-8 text-indigo-200" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">اطلاعات تکمیلی</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                موجودی صندوق از API دریافت می‌شود و به‌روزترین مقدار است
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                وضعیت مالی بر اساس موجودی صندوق محاسبه می‌شود
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                امکان ثبت هزینه فقط برای مدیر ساختمان در دسترس است
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                برای مشاهده جزئیات تراکنش‌ها به جدول زیر مراجعه کنید
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Table */}
            {building && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">جدول تراکنش‌ها</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Table className="w-4 h-4" />
                            <span>مشاهده جزئیات مالی</span>
                        </div>
                    </div>
                    <BuildingBalanceTable />
                </div>
            )}
        </div>
    );
}
