import { useState, Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createMembershipRequest, fetchUnitByPhone, clearUnitData, selectUnitData, selectUnitLoading } from "../membershipSlice";
import { X, Building, User, Home, Car, Users } from "lucide-react";

// توابع تبدیل نقش و نوع مالک به فارسی
const getPersianRole = (role) => {
  const roleMap = {
    'owner': 'مالک',
    'tenant': 'مستاجر',
    'مالک': 'مالک',
    'مستاجر': 'مستاجر'
  };
  return roleMap[role] || role;
};

const getPersianOwnerType = (ownerType) => {
  const ownerTypeMap = {
    'resident': 'مالک مقیم',
    'landlord': 'دارای مستاجر',
    'مالک مقیم': 'مالک مقیم',
    'دارای مستاجر': 'دارای مستاجر'
  };
  return ownerTypeMap[ownerType] || ownerType;
};

const FormField = ({ label, name, type = "text", placeholder, value, onChange, min, required, options = null }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 block w-full rounded-2xl border border-gray-300 shadow-sm focus:ring-melkingDarkBlue focus:border-melkingDarkBlue sm:text-sm p-3"
      >
        <option value="">انتخاب کنید</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        required={required}
        className="mt-1 block w-full rounded-2xl border border-gray-300 shadow-sm focus:ring-melkingDarkBlue focus:border-melkingDarkBlue sm:text-sm p-3"
      />
    )}
  </div>
);

export default function MembershipRequestForm({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { createLoading } = useSelector(state => state.membership);
  const { user } = useSelector(state => state.auth);
  const unitData = useSelector(selectUnitData);
  const unitLoading = useSelector(selectUnitLoading);
  
  const [form, setForm] = useState({
    // اطلاعات ساختمان
    building_code: "",
    
    // اطلاعات شخصی
    full_name: "",
    phone_number: "",
    
    // اطلاعات واحد
    unit_number: "",
    floor: "",
    area: "",
    resident_count: 1,
    
    // نقش و نوع مالک
    role: "", // ساکن یا مالک
    owner_type: "", // مقیم یا دارای مستاجر
    
    // اطلاعات مستاجر (اگر مالک دارای مستاجر باشد)
    tenant_full_name: "",
    tenant_phone_number: "",
    
    // پارکینگ
    has_parking: false,
    parking_count: 0,
  });

  const [errors, setErrors] = useState({});
  const debounceRef = useRef(null);

  // Resolve phone number: prefer user.phone_number, fallback to user.username
  const effectivePhoneNumber = user?.phone_number || user?.username || '';

  // Fetch unit data when form opens
  useEffect(() => {
    if (isOpen && effectivePhoneNumber) {
      dispatch(fetchUnitByPhone(effectivePhoneNumber));
      // Pre-fill phone in form if empty
      setForm(prev => ({ ...prev, phone_number: prev.phone_number || effectivePhoneNumber }));
    }
    
    // Clear unit data when form closes
    if (!isOpen) {
      dispatch(clearUnitData());
    }
  }, [isOpen, effectivePhoneNumber, dispatch]);

  // Fetch unit data when user types phone number manually (debounced)
  useEffect(() => {
    if (!isOpen) return;
    const phone = (form.phone_number || '').toString().trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // Only search when we have at least 10 digits
    if (phone && phone.replace(/\D/g, '').length >= 10) {
      debounceRef.current = setTimeout(() => {
        dispatch(fetchUnitByPhone(phone));
      }, 500);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.phone_number, isOpen, dispatch]);

  // Pre-fill form when unit data is loaded
  useEffect(() => {
    if (unitData) {
      setForm(prevForm => ({
        ...prevForm,
        building_code: unitData.building_code || "",
        full_name: unitData.full_name || "",
        phone_number: unitData.phone_number || "",
        unit_number: unitData.unit_number || "",
        floor: unitData.floor || "",
        area: unitData.area || "",
        resident_count: unitData.resident_count || 1,
        role: unitData.role || "",
        owner_type: unitData.owner_type || "",
        tenant_full_name: unitData.tenant_full_name || "",
        tenant_phone_number: unitData.tenant_phone_number || "",
        has_parking: unitData.has_parking || false,
        parking_count: unitData.parking_count || 0,
      }));
    }
  }, [unitData]);

  const roleOptions = [
    { value: 'resident', label: 'ساکن' },
    { value: 'owner', label: 'مالک' },
  ];

  const ownerTypeOptions = [
    { value: 'resident', label: 'مالک مقیم' },
    { value: 'landlord', label: 'دارای مستاجر' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Convert numeric fields to numbers
    let processedValue = value;
    if (type === "number") {
      processedValue = value === "" ? "" : Number(value);
    } else if (type === "checkbox") {
      processedValue = checked;
    }
    
    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!form.building_code) newErrors.building_code = 'کد ساختمان الزامی است';
    if (!form.full_name) newErrors.full_name = 'نام و نام خانوادگی الزامی است';
    if (!form.phone_number) newErrors.phone_number = 'شماره تماس الزامی است';
    if (!form.unit_number) newErrors.unit_number = 'شماره واحد الزامی است';
    if (!form.floor) newErrors.floor = 'شماره طبقه الزامی است';
    if (!form.area) newErrors.area = 'متراژ الزامی است';
    if (!form.role) newErrors.role = 'نقش الزامی است';
    
    // Role-specific validations
    if (form.role === 'owner' && !form.owner_type) {
      newErrors.owner_type = 'نوع مالک برای نقش مالک الزامی است';
    }
    
    // Tenant validations - فقط اگر اطلاعات مستاجر وارد شده باشد
    if (form.owner_type === 'landlord') {
      // اگر یکی از فیلدهای مستاجر پر شده باشد، هر دو باید پر شوند
      if (form.tenant_full_name || form.tenant_phone_number) {
        if (!form.tenant_full_name) {
          newErrors.tenant_full_name = 'نام مستاجر الزامی است';
        }
        if (!form.tenant_phone_number) {
          newErrors.tenant_phone_number = 'شماره تماس مستاجر الزامی است';
        }
      }
    }
    
    // Parking validation
    if (form.has_parking && form.parking_count <= 0) {
      newErrors.parking_count = 'تعداد پارکینگ باید بیشتر از صفر باشد';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAcceptPrefill = async () => {
    if (!unitData) return;
    try {
      const normalizedRole = unitData.role === 'owner' ? 'owner' : 'resident';
      const normalizedOwnerType = normalizedRole === 'owner' ? (unitData.owner_type || form.owner_type || '') : '';
      const payload = {
        building_code: unitData.building_code || form.building_code,
        full_name: unitData.full_name || form.full_name,
        phone_number: unitData.phone_number || form.phone_number,
        unit_number: unitData.unit_number || form.unit_number,
        floor: unitData.floor || form.floor,
        area: unitData.area || form.area,
        resident_count: unitData.resident_count || form.resident_count,
        role: normalizedRole,
        owner_type: normalizedOwnerType,
        tenant_full_name: unitData.tenant_full_name || form.tenant_full_name,
        tenant_phone_number: unitData.tenant_phone_number || form.tenant_phone_number,
        has_parking: unitData.has_parking ?? form.has_parking,
        parking_count: unitData.parking_count ?? form.parking_count,
      };
      await dispatch(createMembershipRequest(payload)).unwrap();
      toast.success('درخواست عضویت با اطلاعات شناسایی‌شده ثبت شد');
      handleClose();
    } catch (error) {
      setErrors({ submit: error });
    }
  };

  const handleRejectPrefill = () => {
    dispatch(clearUnitData());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await dispatch(createMembershipRequest(form)).unwrap();
      console.log("✅ Membership request created successfully:", result);
      
      // Reset form
      setForm({
        building_code: "",
        full_name: "",
        phone_number: "",
        unit_number: "",
        floor: "",
        area: "",
        resident_count: 1,
        role: "",
        owner_type: "",
        tenant_full_name: "",
        tenant_phone_number: "",
        has_parking: false,
        parking_count: 0,
      });
      
      onClose();
      
      // Show success message based on approval flow
      if (result.requires_owner_approval) {
        toast.success('درخواست عضویت ارسال شد. درخواست شما ابتدا باید توسط مالک تایید شود.');
      } else {
        toast.success('درخواست عضویت با موفقیت ارسال شد');
      }
      
    } catch (error) {
      console.error("❌ Error creating membership request:", error);
      setErrors({ submit: error });
    }
  };

  const handleClose = () => {
    setForm({
      building_code: "",
      full_name: "",
      phone_number: "",
      unit_number: "",
      floor: "",
      area: "",
      resident_count: 1,
      role: "",
      owner_type: "",
      tenant_full_name: "",
      tenant_phone_number: "",
      has_parking: false,
      parking_count: 0,
    });
    setErrors({});
    dispatch(clearUnitData());
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        درخواست عضویت در ساختمان
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        برای عضویت در ساختمان، اطلاعات زیر را تکمیل کنید
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Loading indicator for unit data */}
                {unitLoading && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-blue-700">
                        در حال بارگذاری اطلاعات واحد شما...
                      </p>
                    </div>
                  </div>
                )}

                {/* Pre-filled data notification and quick action */}
                {unitData && !unitLoading && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="text-sm text-green-800">
                          اطلاعات شما در سیستم یافت شد. آیا تایید می‌کنید این اطلاعات مربوط به شماست؟
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-900">
                        <div>ساختمان: <span className="font-semibold">{unitData.building_title}</span></div>
                        <div>کد ساختمان: <span className="font-semibold">{unitData.building_code}</span></div>
                        <div>واحد: <span className="font-semibold">{unitData.unit_number || '-'} (طبقه {unitData.floor || '-'})</span></div>
                        <div>متراژ: <span className="font-semibold">{unitData.area || '-'}</span></div>
                        <div>نقش: <span className="font-semibold">{getPersianRole(unitData.role) || '-'}</span></div>
                        {unitData.role === 'owner' && (
                          <div>نوع مالک: <span className="font-semibold">{getPersianOwnerType(unitData.owner_type) || '-'}</span></div>
                        )}
                        <div>تعداد نفر: <span className="font-semibold">{unitData.resident_count || '-'}</span></div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={handleAcceptPrefill}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          تایید و ارسال سریع درخواست
                        </button>
                        <button
                          type="button"
                          onClick={handleRejectPrefill}
                          className="px-4 py-2 border border-green-300 text-green-800 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          این اطلاعات متعلق به من نیست
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* اطلاعات ساختمان */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Building size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-800">اطلاعات ساختمان</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="کد ساختمان *"
                        name="building_code"
                        placeholder="کد ساختمان را وارد کنید"
                        value={form.building_code}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.building_code && (
                      <p className="text-red-500 text-sm mt-1">{errors.building_code}</p>
                    )}
                  </div>

                  {/* اطلاعات شخصی */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <User size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-800">اطلاعات شخصی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="نام و نام خانوادگی *"
                        name="full_name"
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                      />
                      <FormField
                        label="شماره تماس *"
                        name="phone_number"
                        type="tel"
                        placeholder="شماره تماس خود را وارد کنید"
                        value={form.phone_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {(errors.full_name || errors.phone_number) && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.full_name && <p>{errors.full_name}</p>}
                        {errors.phone_number && <p>{errors.phone_number}</p>}
                      </div>
                    )}
                  </div>

                  {/* اطلاعات واحد */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Home size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-800">اطلاعات واحد</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        label="شماره واحد *"
                        name="unit_number"
                        placeholder="شماره واحد"
                        value={form.unit_number}
                        onChange={handleChange}
                        required
                      />
                      <FormField
                        label="شماره طبقه *"
                        name="floor"
                        type="number"
                        placeholder="شماره طبقه"
                        value={form.floor}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                      <FormField
                        label="متراژ (متر مربع) *"
                        name="area"
                        type="number"
                        placeholder="متراژ واحد"
                        value={form.area}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                      <FormField
                        label="تعداد نفر *"
                        name="resident_count"
                        type="number"
                        placeholder="تعداد نفر"
                        value={form.resident_count}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>
                    {(errors.unit_number || errors.floor || errors.area || errors.resident_count) && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.unit_number && <p>{errors.unit_number}</p>}
                        {errors.floor && <p>{errors.floor}</p>}
                        {errors.area && <p>{errors.area}</p>}
                        {errors.resident_count && <p>{errors.resident_count}</p>}
                      </div>
                    )}
                  </div>

                  {/* نقش و نوع مالک */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-800">نقش و نوع مالک</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="نقش *"
                        name="role"
                        options={roleOptions}
                        value={form.role}
                        onChange={handleChange}
                        required
                      />
                      {form.role === 'owner' && (
                        <FormField
                          label="نوع مالک *"
                          name="owner_type"
                          options={ownerTypeOptions}
                          value={form.owner_type}
                          onChange={handleChange}
                          required
                        />
                      )}
                    </div>
                    {(errors.role || errors.owner_type) && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.role && <p>{errors.role}</p>}
                        {errors.owner_type && <p>{errors.owner_type}</p>}
                      </div>
                    )}
                  </div>

                  {/* اطلاعات مستاجر */}
                  {form.owner_type === 'landlord' && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <User size={20} className="text-gray-600" />
                        <h4 className="font-semibold text-gray-800">اطلاعات مستاجر</h4>
                      </div>
                      
                      {/* راهنمای کاربر */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700">
                          💡 <strong>راهنما:</strong> اگر هنوز مستاجر ندارید، این فیلدها را خالی بگذارید. 
                          واحد شما در حالت "منتظر مستاجر" قرار می‌گیرد و بعداً می‌توانید اطلاعات مستاجر را اضافه کنید.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="نام و نام خانوادگی مستاجر"
                          name="tenant_full_name"
                          placeholder="نام و نام خانوادگی مستاجر (اختیاری)"
                          value={form.tenant_full_name}
                          onChange={handleChange}
                        />
                        <FormField
                          label="شماره تماس مستاجر"
                          name="tenant_phone_number"
                          type="tel"
                          placeholder="شماره تماس مستاجر (اختیاری)"
                          value={form.tenant_phone_number}
                          onChange={handleChange}
                        />
                      </div>
                      {(errors.tenant_full_name || errors.tenant_phone_number) && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.tenant_full_name && <p>{errors.tenant_full_name}</p>}
                          {errors.tenant_phone_number && <p>{errors.tenant_phone_number}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* پارکینگ */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Car size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-800">پارکینگ</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="has_parking"
                          checked={form.has_parking}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          دارای پارکینگ
                        </label>
                      </div>
                      {form.has_parking && (
                        <FormField
                          label="تعداد پارکینگ *"
                          name="parking_count"
                          type="number"
                          placeholder="تعداد پارکینگ"
                          value={form.parking_count}
                          onChange={handleChange}
                          min="1"
                          required
                        />
                      )}
                    </div>
                    {errors.parking_count && (
                      <p className="text-red-500 text-sm mt-1">{errors.parking_count}</p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {createLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          در حال ارسال...
                        </>
                      ) : (
                        'ارسال درخواست'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

