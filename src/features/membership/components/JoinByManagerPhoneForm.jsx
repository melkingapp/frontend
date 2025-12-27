import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { joinByManagerPhone } from '../membershipSlice';
import { Building, Phone, Users, Loader, ArrowLeft } from 'lucide-react';

export default function JoinByManagerPhoneForm({ onSuccess, onBack }) {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1: Enter phone, 2: Select building (if multiple), 3: Enter details
  const [formData, setFormData] = useState({
    manager_phone: '',
    full_name: '',
    phone_number: '',
    unit_number: '',
    floor: '',
    area: '',
    role: 'resident',
    owner_type: '',
    tenant_full_name: '',
    tenant_phone_number: '',
    has_parking: false,
    parking_count: 0,
    resident_count: 1
  });
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await dispatch(joinByManagerPhone({
        manager_phone: formData.manager_phone
      })).unwrap();

      if (response.requires_selection) {
        // Multiple buildings found
        setBuildings(response.buildings);
        setStep(2);
      } else {
        // Single building or direct join
        toast.success('درخواست عضویت با موفقیت ارسال شد');
        onSuccess?.(response);
      }
    } catch (error) {
      toast.error(error || 'خطا در جستجوی مدیر');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setStep(3);
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const joinData = {
        ...formData,
        building_code: selectedBuilding.building_code
      };

      const response = await dispatch(joinByManagerPhone(joinData)).unwrap();
      toast.success('درخواست عضویت با موفقیت ارسال شد');
      onSuccess?.(response);
    } catch (error) {
      toast.error(error || 'خطا در ارسال درخواست عضویت');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      manager_phone: '',
      full_name: '',
      phone_number: '',
      unit_number: '',
      floor: '',
      area: '',
      role: 'resident',
      owner_type: '',
      tenant_full_name: '',
      tenant_phone_number: '',
      has_parking: false,
      parking_count: 0,
      resident_count: 1
    });
    setBuildings([]);
    setSelectedBuilding(null);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">عضویت با شماره مدیر</h2>
        <p className="text-gray-600">شماره تلفن مدیر ساختمان را وارد کنید</p>
      </div>

      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شماره تلفن مدیر ساختمان
          </label>
          <input
            type="tel"
            value={formData.manager_phone}
            onChange={(e) => setFormData({...formData, manager_phone: e.target.value})}
            placeholder="09123456789"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            شماره تلفن مدیری که ساختمان را ثبت کرده است
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              در حال جستجو...
            </>
          ) : (
            <>
              <Building className="w-5 h-5" />
              جستجوی ساختمان
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">انتخاب ساختمان</h2>
        <p className="text-gray-600">مدیر چند ساختمان دارد، لطفاً ساختمان مورد نظر را انتخاب کنید</p>
      </div>

      <div className="space-y-3">
        {buildings.map((building) => (
          <button
            key={building.building_id}
            onClick={() => handleBuildingSelect(building)}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-right"
          >
            <div className="font-medium text-gray-900">{building.title}</div>
            <div className="text-sm text-gray-600">{building.address}</div>
            <div className="text-xs text-gray-500 mt-1">کد ساختمان: {building.building_code}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(1)}
        className="w-full flex items-center justify-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        بازگشت
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اطلاعات عضویت</h2>
        <p className="text-gray-600">اطلاعات خود را برای عضویت در {selectedBuilding?.title} وارد کنید</p>
      </div>

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره تلفن *</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره واحد *</label>
            <input
              type="text"
              value={formData.unit_number}
              onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">طبقه</label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({...formData, floor: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">متراژ</label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نقش *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="resident">ساکن</option>
            <option value="owner">مالک</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            بازگشت
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                ارسال درخواست
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {onBack && step === 1 && (
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            روش‌های دیگر عضویت
          </button>
        </div>
      )}
    </div>
  );
}
