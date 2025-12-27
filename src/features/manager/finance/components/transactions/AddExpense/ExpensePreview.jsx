import { formatNumber } from "../../../../../../shared/utils/helper";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function ExpensePreview({ previewData, onConfirm, onBack, isLoading = false }) {
    const { form, unitAmounts, totalAmount } = previewData;
    
    const totalCalculated = unitAmounts.reduce((sum, item) => sum + item.amount, 0);
    const distributionLabels = {
        equal: "مساوی",
        per_person: "بر اساس تعداد نفر",
        area: "بر اساس متراژ",
        parking: "بر اساس تعداد پارکینگ",
        custom: "دلخواه"
    };

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">پیش‌نمایش هزینه</h3>
                </div>
                <p className="text-sm text-green-700">
                    لطفاً اطلاعات زیر را بررسی کنید و در صورت صحت، ثبت نهایی را انجام دهید.
                </p>
            </div>

            {/* اطلاعات کلی */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">نام هزینه:</span>
                    <span className="font-semibold">{form.expenseName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">نوع هزینه:</span>
                    <span className="font-semibold">{form.type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">مبلغ کل:</span>
                    <span className="font-semibold text-lg text-blue-600">{formatNumber(totalAmount)} تومان</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">نحوه تقسیم:</span>
                    <span className="font-semibold">{distributionLabels[form.distribution] || form.distribution}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">مسئول پرداخت:</span>
                    <span className="font-semibold">{form.allocation === "owner" ? "مالک" : form.allocation === "resident" ? "ساکن" : "هر دو"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">روش پرداخت:</span>
                    <span className="font-semibold">{form.paymentMethod === "direct" ? "مستقیم" : "از شارژ"}</span>
                </div>
                {form.description && (
                    <div className="pt-2 border-t">
                        <span className="text-gray-600 block mb-1">توضیحات:</span>
                        <span className="text-sm">{form.description}</span>
                    </div>
                )}
            </div>

            {/* لیست واحدها و مبالغ */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-semibold text-gray-800">توزیع هزینه بین واحدها:</h4>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                    {unitAmounts.map((item, index) => (
                        <div key={item.unitId || index} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">{item.unit.label}</div>
                                    {item.details && (
                                        <div className="text-xs text-gray-500 mt-1">{item.details}</div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg text-blue-600">
                                        {formatNumber(Math.round(item.amount))} تومان
                                    </div>
                                    {totalAmount > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {((item.amount / totalAmount) * 100).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">مجموع:</span>
                        <span className="font-bold text-xl text-green-600">
                            {formatNumber(Math.round(totalCalculated))} تومان
                        </span>
                    </div>
                    {Math.abs(totalCalculated - totalAmount) > 1 && (
                        <div className="text-xs text-orange-600 mt-1">
                            ⚠️ تفاوت با مبلغ کل: {formatNumber(Math.abs(totalCalculated - totalAmount))} تومان
                        </div>
                    )}
                </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex justify-end gap-3 border-t pt-4">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    بازگشت
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    {isLoading ? "در حال ثبت..." : "تایید و ثبت نهایی"}
                </button>
            </div>
        </div>
    );
}

