import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { 
  X, 
  Building, 
  User, 
  Home, 
  Car, 
  Users, 
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300", 
      text: "در انتظار تایید مالک",
      shadow: "shadow-yellow-200"
    },
    owner_approved: { 
      icon: CheckCircle, 
      color: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300", 
      text: "تایید شده توسط مالک",
      shadow: "shadow-blue-200"
    },
    manager_approved: { 
      icon: CheckCircle, 
      color: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300", 
      text: "تایید شده توسط مدیر",
      shadow: "shadow-green-200"
    },
    rejected: { 
      icon: XCircle, 
      color: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300", 
      text: "رد شده",
      shadow: "shadow-red-200"
    },
    // Legacy support for old status values
    approved: { 
      icon: CheckCircle, 
      color: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300", 
      text: "تایید شده",
      shadow: "shadow-green-200"
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${config.color} ${config.shadow}`}>
      <Icon size={18} />
      {config.text}
    </span>
  );
};

const InfoCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
    green: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    purple: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200",
    orange: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
    gray: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
  };
  
  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    gray: "bg-gray-100 text-gray-600"
  };

  return (
    <div className={`rounded-lg p-2.5 border shadow-sm hover:shadow-md transition-shadow ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${iconColorClasses[color]}`}>
          {Icon && <Icon size={14} />}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-0.5">{title}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default function MembershipRequestDetailsModal({ request, isOpen, onClose }) {
  if (!request) return null;

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white p-4 text-left align-middle shadow-2xl transition-all max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                      <Building size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-1">
                        جزئیات درخواست عضویت
                      </Dialog.Title>
                      <p className="text-sm text-gray-600 font-medium">
                        {request.full_name} - {request.building_title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        درخواست شماره: {request.request_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={request.status} />
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <X size={18} className="text-gray-500 group-hover:text-gray-700" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* اطلاعات ساختمان */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Building size={16} className="text-blue-600" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">اطلاعات ساختمان</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoCard
                        icon={Building}
                        title="نام ساختمان"
                        value={request.building_title}
                        color="blue"
                      />
                      <InfoCard
                        icon={Building}
                        title="کد ساختمان"
                        value={request.building_code}
                        subtitle="کد شناسایی ساختمان"
                        color="blue"
                      />
                    </div>
                  </div>

                  {/* اطلاعات شخصی */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <User size={16} className="text-green-600" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">اطلاعات شخصی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoCard
                        icon={User}
                        title="نام و نام خانوادگی"
                        value={request.full_name}
                        color="green"
                      />
                      <InfoCard
                        icon={Phone}
                        title="شماره تماس"
                        value={request.phone_number}
                        color="green"
                      />
                    </div>
                  </div>

                  {/* اطلاعات واحد */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Home size={16} className="text-purple-600" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">اطلاعات واحد</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <InfoCard
                        icon={Home}
                        title="شماره واحد"
                        value={request.unit_number}
                        color="purple"
                      />
                      <InfoCard
                        icon={Building}
                        title="شماره طبقه"
                        value={request.floor}
                        color="purple"
                      />
                      <InfoCard
                        icon={Home}
                        title="متراژ"
                        value={`${request.area} متر مربع`}
                        color="purple"
                      />
                      <InfoCard
                        icon={Users}
                        title="تعداد نفر"
                        value={request.resident_count}
                        color="purple"
                      />
                    </div>
                  </div>

                  {/* نقش و نوع مالک */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Users size={16} className="text-orange-600" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">نقش و نوع مالک</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoCard
                        icon={User}
                        title="نقش"
                        value={request.role === 'resident' ? 'ساکن' : 'مالک'}
                        color="orange"
                      />
                      {request.owner_type && (
                        <InfoCard
                          icon={User}
                          title="نوع مالک"
                          value={request.owner_type === 'resident' ? 'مالک مقیم' : 'دارای مستاجر'}
                          color="orange"
                        />
                      )}
                    </div>
                  </div>

                  {/* اطلاعات مستاجر */}
                  {request.owner_type === 'landlord' && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <User size={16} className="text-indigo-600" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800">وضعیت مستاجر</h4>
                      </div>
                      
                      {request.tenant_full_name && request.tenant_phone_number ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InfoCard
                            icon={User}
                            title="نام و نام خانوادگی مستاجر"
                            value={request.tenant_full_name}
                            color="blue"
                          />
                          <InfoCard
                            icon={Phone}
                            title="شماره تماس مستاجر"
                            value={request.tenant_phone_number}
                            color="blue"
                          />
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <Clock size={20} className="text-yellow-600" />
                            <div>
                              <h5 className="font-semibold text-yellow-800">منتظر مستاجر</h5>
                              <p className="text-sm text-yellow-700">
                                این واحد برای اجاره آماده است اما هنوز مستاجر مشخصی ندارد. 
                                بعد از تایید درخواست، واحد در حالت "منتظر مستاجر" قرار می‌گیرد.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* پارکینگ */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Car size={16} className="text-gray-600" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">پارکینگ</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoCard
                        icon={Car}
                        title="دارای پارکینگ"
                        value={request.has_parking ? 'بله' : 'خیر'}
                        color="gray"
                      />
                      {request.has_parking && (
                        <InfoCard
                          icon={Car}
                          title="تعداد پارکینگ"
                          value={request.parking_count}
                          color="gray"
                        />
                      )}
                    </div>
                  </div>

                  {/* اطلاعات درخواست */}
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <Calendar size={16} className="text-slate-600" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800">اطلاعات درخواست</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoCard
                        icon={Calendar}
                        title="تاریخ ارسال"
                        value={moment(request.created_at).format('jYYYY/jMM/jDD - HH:mm')}
                        color="gray"
                      />
                      {request.approved_at && (
                        <InfoCard
                          icon={Calendar}
                          title="تاریخ تایید/رد"
                          value={moment(request.approved_at).format('jYYYY/jMM/jDD - HH:mm')}
                          color="gray"
                        />
                      )}
                    </div>
                    {request.approved_by_name && (
                      <div className="mt-3">
                        <InfoCard
                          icon={User}
                          title="تایید/رد شده توسط"
                          value={request.approved_by_name}
                          color="gray"
                        />
                      </div>
                    )}
                    {request.rejection_reason && (
                      <div className="mt-3">
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-red-100 rounded-md">
                              <XCircle size={14} className="text-red-600" />
                            </div>
                            <h5 className="text-sm font-bold text-red-800">دلیل رد درخواست</h5>
                          </div>
                          <p className="text-red-700 font-medium text-xs">{request.rejection_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    بستن
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

