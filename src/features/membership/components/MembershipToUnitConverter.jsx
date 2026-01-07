import { useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createUnit } from "../../manager/unitManagement/slices/unitsSlice";
import { approveMembershipRequestByManager } from "../membershipSlice";
import { Dialog, Transition } from "@headlessui/react";
import Button from "../../../shared/components/shared/feedback/Button";
import { extractErrorMessage } from "../../../shared/utils/errorUtils";
import { 
  Building, 
  User, 
  Home, 
  Car, 
  Users,
  CheckCircle,
  AlertCircle,
  X,
  DollarSign
} from "lucide-react";

const InfoCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    pink: "bg-pink-100 text-pink-600",
    indigo: "bg-indigo-100 text-indigo-600"
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="font-semibold text-gray-900 text-lg">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default function MembershipToUnitConverter({ 
  membershipRequest, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const dispatch = useDispatch();
  const { createLoading } = useSelector(state => state.units);
  const { approveLoading } = useSelector(state => state.membership);
  
  const [isConverting, setIsConverting] = useState(false);
  const [initialDebt, setInitialDebt] = useState(0);
  const [initialCredit, setInitialCredit] = useState(0);
  const [debtCreditError, setDebtCreditError] = useState("");

  if (!membershipRequest) return null;

  const validateDebtCredit = () => {
    if (initialDebt > 0 && initialCredit > 0) {
      setDebtCreditError("نمی‌توانید همزمان بدهکاری و بستانکاری داشته باشید");
      return false;
    }
    setDebtCreditError("");
    return true;
  };

  const handleConvertAndApprove = async () => {
    // اعتبارسنجی بدهکاری/بستانکاری
    if (!validateDebtCredit()) {
      return;
    }

    setIsConverting(true);
    
    try {
      // تایید نهایی توسط مدیر با مقادیر بدهکاری/بستانکاری اولیه
      await dispatch(approveMembershipRequestByManager({
        requestId: membershipRequest.request_id,
        initialDebt: parseFloat(initialDebt) || 0,
        initialCredit: parseFloat(initialCredit) || 0
      })).unwrap();

      console.log("✅ Membership request approved successfully");

      // ریست کردن فیلدها
      setInitialDebt(0);
      setInitialCredit(0);

      // بستن مدال و اطلاع‌رسانی موفقیت
      onSuccess?.();
      onClose();

    } catch (error) {
      console.error("❌ Error approving membership request:", error);
      
      const errorMessage = extractErrorMessage(error);
      
      // نمایش پیام خطا با توضیحات مناسب
      toast.error(errorMessage, {
        duration: 6000,
        description: membershipRequest?.requires_owner_approval 
          ? 'این درخواست نیاز به تایید مالک دارد. لطفاً منتظر تایید مالک بمانید.'
          : 'لطفاً وضعیت درخواست را بررسی کنید و دوباره تلاش کنید.'
      });
    } finally {
      setIsConverting(false);
    }
  };

  const isLoading = createLoading || approveLoading || isConverting;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all max-h-[85vh] overflow-y-auto">
                {/* Header با گرادیانت */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-white mb-1">
                          تایید درخواست عضویت
                        </Dialog.Title>
                        <p className="text-green-100 text-sm">
                          {membershipRequest.full_name} - {membershipRequest.building_title}
                        </p>
                        <p className="text-green-200 text-xs mt-1">
                          کد درخواست: {membershipRequest.request_id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <X size={18} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-5">
                    {/* هشدار */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-yellow-800 mb-2">
                        <div className="p-1.5 bg-yellow-100 rounded-lg">
                          <AlertCircle size={18} />
                        </div>
                        <h4 className="font-bold text-base">توجه مهم</h4>
                      </div>
                      <p className="text-yellow-700 text-sm leading-relaxed">
                        با تایید این درخواست، واحد جدیدی در ساختمان ایجاد خواهد شد و درخواست عضویت تایید می‌شود. 
                        این عمل غیرقابل بازگشت است.
                      </p>
                    </div>

                    {/* اطلاعات شخصی */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User size={18} className="text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">اطلاعات شخصی</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoCard
                          icon={User}
                          title="نام و نام خانوادگی"
                          value={membershipRequest.full_name}
                          color="blue"
                        />
                        <InfoCard
                          icon={User}
                          title="شماره تماس"
                          value={membershipRequest.phone_number}
                          color="indigo"
                        />
                      </div>
                    </div>

                    {/* اطلاعات واحد */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Home size={18} className="text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">اطلاعات واحد</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <InfoCard
                          icon={Home}
                          title="شماره واحد"
                          value={membershipRequest.unit_number}
                          color="green"
                        />
                        <InfoCard
                          icon={Building}
                          title="شماره طبقه"
                          value={membershipRequest.floor}
                          color="purple"
                        />
                        <InfoCard
                          icon={Home}
                          title="متراژ"
                          value={`${membershipRequest.area} متر مربع`}
                          color="orange"
                        />
                        <InfoCard
                          icon={Users}
                          title="تعداد نفر"
                          value={membershipRequest.resident_count}
                          color="pink"
                        />
                      </div>
                    </div>

                    {/* نقش و نوع مالک */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users size={18} className="text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">نقش و نوع مالک</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoCard
                          icon={User}
                          title="نقش"
                          value={membershipRequest.role === 'resident' ? 'ساکن' : 'مالک'}
                          color="purple"
                        />
                        {membershipRequest.owner_type && (
                          <InfoCard
                            icon={User}
                            title="نوع مالک"
                            value={
                              membershipRequest.owner_type === 'resident' 
                                ? 'مالک مقیم' 
                                : membershipRequest.owner_type === 'landlord' 
                                ? 'دارای مستاجر' 
                                : membershipRequest.owner_type === 'empty'
                                ? 'واحد خالی'
                                : membershipRequest.owner_type
                            }
                            color="pink"
                          />
                        )}
                      </div>
                    </div>

                    {/* وضعیت مستاجر */}
                    {membershipRequest.owner_type === 'landlord' && 
                     membershipRequest.tenant_full_name && 
                     membershipRequest.tenant_full_name.trim() !== '' && 
                     membershipRequest.tenant_phone_number && 
                     membershipRequest.tenant_phone_number.trim() !== '' && (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <User size={18} className="text-orange-600" />
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">وضعیت مستاجر</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InfoCard
                            icon={User}
                            title="نام و نام خانوادگی مستاجر"
                            value={membershipRequest.tenant_full_name}
                            color="orange"
                          />
                          <InfoCard
                            icon={User}
                            title="شماره تماس مستاجر"
                            value={membershipRequest.tenant_phone_number}
                            color="pink"
                          />
                        </div>
                      </div>
                    )}

                    {/* اطلاعات مالک (برای مستاجر) */}
                    {membershipRequest.role === 'resident' && 
                     membershipRequest.owner_full_name && 
                     membershipRequest.owner_full_name.trim() !== '' && 
                     membershipRequest.owner_phone_number && 
                     membershipRequest.owner_phone_number.trim() !== '' && (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <User size={18} className="text-amber-600" />
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">اطلاعات مالک</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InfoCard
                            icon={User}
                            title="نام و نام خانوادگی مالک"
                            value={membershipRequest.owner_full_name}
                            color="orange"
                          />
                          <InfoCard
                            icon={User}
                            title="شماره تماس مالک"
                            value={membershipRequest.owner_phone_number}
                            color="orange"
                          />
                        </div>
                      </div>
                    )}

                    {/* پارکینگ */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Car size={18} className="text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">پارکینگ</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoCard
                          icon={Car}
                          title="دارای پارکینگ"
                          value={membershipRequest.has_parking ? 'بله' : 'خیر'}
                          color="indigo"
                        />
                        {membershipRequest.has_parking && (
                          <InfoCard
                            icon={Car}
                            title="تعداد پارکینگ"
                            value={membershipRequest.parking_count}
                            color="blue"
                          />
                        )}
                      </div>
                    </div>

                    {/* بدهکاری و بستانکاری اولیه */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <DollarSign size={18} className="text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">بدهکاری و بستانکاری اولیه</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        در صورت وجود بدهکاری یا بستانکاری اولیه برای این واحد، مقادیر را وارد کنید.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            بدهکاری اولیه (تومان)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={initialDebt}
                              onChange={(e) => {
                                setInitialDebt(e.target.value);
                                if (debtCreditError) setDebtCreditError("");
                              }}
                              placeholder="مثلاً 1000000"
                              className="w-full px-4 py-2.5 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50/50"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                              تومان
                            </span>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            مبلغی که ساکن به ساختمان بدهکار است
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            بستانکاری اولیه (تومان)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={initialCredit}
                              onChange={(e) => {
                                setInitialCredit(e.target.value);
                                if (debtCreditError) setDebtCreditError("");
                              }}
                              placeholder="مثلاً 500000"
                              className="w-full px-4 py-2.5 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">
                              تومان
                            </span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            مبلغی که ساختمان به ساکن بدهکار است
                          </p>
                        </div>
                      </div>
                      {debtCreditError && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <AlertCircle size={16} />
                            {debtCreditError}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-3">
                        💡 توجه: نمی‌توانید همزمان هم بدهکاری و هم بستانکاری وارد کنید. در صورت عدم نیاز، فیلدها را خالی بگذارید.
                      </p>
                    </div>
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                    <Button
                      color="white"
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-5 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 text-sm"
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={handleConvertAndApprove}
                      disabled={isLoading}
                      loading={isLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    >
                      {isLoading ? (
                        'در حال پردازش...'
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          تایید و ایجاد واحد
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}