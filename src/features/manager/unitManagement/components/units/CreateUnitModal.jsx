import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createUnit, clearError } from "../../slices/unitsSlice";
import SelectField from "../../../../../shared/components/shared/inputs/SelectField";
import { selectSelectedBuilding } from "../../../building/buildingSlice";

const FormField = ({ label, name, type = "text", placeholder, value, onChange, min, required, error, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      required={required}
      disabled={disabled}
      className={`mt-2 block w-full rounded-2xl border shadow-sm focus:ring-melkingDarkBlue focus:border-melkingDarkBlue sm:text-sm p-3 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);


export default function CreateUnitModal({ isOpen, onClose, buildingId: propBuildingId }) {
  const dispatch = useDispatch();
  const { createLoading, error } = useSelector(state => state.units);
  const selectedBuilding = useSelector(selectSelectedBuilding);
  
  // Use prop buildingId or get from selected building
  const buildingId = propBuildingId || selectedBuilding?.building_id || selectedBuilding?.id;
  const [form, setForm] = useState({
    // اطلاعات اصلی
    full_name: "",
    phone_number: "",
    unit_number: "",
    floor: "",
    area: "",
    role: "", // مالک یا مستاجر
    
    // اطلاعات مالک
    owner_type: "", // مقیم یا دارای مستاجر
    
    // اطلاعات مستاجر (اگر مالک دارای مستاجر باشد)
    tenant_full_name: "",
    tenant_phone_number: "",
    
    // پارکینگ
    has_parking: false,
    parking_count: 0,
    
    // تعداد نفر
    resident_count: 1,
  });
  
  const [errors, setErrors] = useState({});

  // Clear Redux error when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearError());
      setErrors({});
    }
  }, [isOpen, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear local validation error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear Redux error when user starts typing in unit_number (duplicate unit error)
    if (name === 'unit_number' && error) {
      dispatch(clearError());
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      // When selecting empty unit, clear person-related fields and set resident_count to 0
      if (name === 'owner_type' && value === 'empty') {
        return {
          ...prev,
          [name]: value,
          full_name: '',
          phone_number: '',
          tenant_full_name: '',
          tenant_phone_number: '',
          resident_count: 0,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    const isEmptyOwner = form.role === 'owner' && form.owner_type === 'empty';

    // Required fields (name/phone always required unless empty owner)
    if (!isEmptyOwner) {
      if (!form.full_name.trim()) newErrors.full_name = 'نام و نام خانوادگی الزامی است';
      if (!form.phone_number.trim()) newErrors.phone_number = 'شماره تماس الزامی است';
    }
    
    if (!form.unit_number.trim()) newErrors.unit_number = 'شماره واحد الزامی است';
    if (!form.floor) newErrors.floor = 'شماره طبقه الزامی است';
    if (!form.role) newErrors.role = 'نقش الزامی است';
    
    // Note: Unit number can be any string (e.g., "A-5", "101", "مدیر")
    // The count limit is checked in backend based on the total number of units created,
    // not based on the unit number value itself
    
    // Phone number validation (only if not an empty owner)
    if (!isEmptyOwner && form.phone_number && !/^09\d{9}$/.test(form.phone_number)) {
      newErrors.phone_number = 'شماره تماس باید با 09 شروع شود و 11 رقم باشد';
    }
    
    // Role-specific validations
    if (form.role === 'owner' && !form.owner_type) {
      newErrors.owner_type = 'نوع مالک برای نقش مالک الزامی است';
    }
    
    // Tenant validations
    if (form.owner_type === 'landlord') {
      if (form.tenant_full_name || form.tenant_phone_number) {
        if (!form.tenant_full_name) {
          newErrors.tenant_full_name = 'نام مستاجر الزامی است';
        }
        if (!form.tenant_phone_number) {
          newErrors.tenant_phone_number = 'شماره تماس مستاجر الزامی است';
        } else if (!/^09\d{9}$/.test(form.tenant_phone_number)) {
          newErrors.tenant_phone_number = 'شماره تماس مستاجر باید با 09 شروع شود و 11 رقم باشد';
        }
      }
    }

    // Resident count: allow 0 when empty owner, otherwise require >= 1
    if (isEmptyOwner) {
      if (Number(form.resident_count) !== 0) {
        newErrors.resident_count = 'برای واحد خالی تعداد نفر باید ۰ باشد';
      }
    } else {
      if (!form.resident_count || Number(form.resident_count) < 1) {
        newErrors.resident_count = 'تعداد نفر باید حداقل ۱ باشد';
      }
    }
    
    // Parking validation
    if (form.has_parking && form.parking_count <= 0) {
      newErrors.parking_count = 'تعداد پارکینگ باید بیشتر از صفر باشد';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔥 CreateUnitModal - Prop BuildingId:", propBuildingId);
    console.log("🔥 CreateUnitModal - Selected Building:", selectedBuilding);
    console.log("🔥 CreateUnitModal - Final BuildingId:", buildingId);
    console.log("🔥 CreateUnitModal - Form data:", form);
    
    if (!buildingId) {
      toast.error("لطفاً ابتدا یک ساختمان انتخاب کنید");
      return;
    }
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      await dispatch(createUnit({ buildingId, unitData: form })).unwrap();
      onClose();
      // Reset form and errors
      setForm({
        full_name: "",
        phone_number: "",
        unit_number: "",
        floor: "",
        area: "",
        role: "",
        owner_type: "",
        tenant_full_name: "",
        tenant_phone_number: "",
        has_parking: false,
        parking_count: 0,
        resident_count: 1,
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating unit:", error);
      // Error is already handled by Redux slice and displayed via error state
    }
  };

  // گزینه‌های نقش
  const roleOptions = [
    { value: "owner", label: "مالک" },
    { value: "tenant", label: "مستاجر" },
  ];

  // گزینه‌های نوع مالک
  const ownerTypeOptions = [
    { value: "empty", label: "واحد خالی" },
    { value: "resident", label: "مالک مقیم" },
    { value: "landlord", label: "دارای مستاجر" },
  ];

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
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col">
              <div className="p-6 pb-4">
                <Dialog.Title className="text-2xl font-semibold text-gray-900">
                  ایجاد واحد جدید
                </Dialog.Title>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                {/* Display API error */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                {/* اطلاعات اصلی */}
                <FormField 
                  label="نام و نام خانوادگی" 
                  name="full_name" 
                  placeholder="مثلاً علی احمدی" 
                  value={form.full_name} 
                  onChange={handleChange} 
                  error={errors.full_name}
                  required={!(form.role === 'owner' && form.owner_type === 'empty')}
                  disabled={form.role === 'owner' && form.owner_type === 'empty'}
                />

                <FormField 
                  label="شماره تماس" 
                  name="phone_number" 
                  placeholder="مثلاً 09123456789" 
                  value={form.phone_number} 
                  onChange={handleChange} 
                  error={errors.phone_number}
                  required={!(form.role === 'owner' && form.owner_type === 'empty')}
                  disabled={form.role === 'owner' && form.owner_type === 'empty'}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField 
                    label="شماره واحد" 
                    name="unit_number" 
                    placeholder="مثلاً 1" 
                    value={form.unit_number} 
                    onChange={handleChange} 
                    error={errors.unit_number}
                    required 
                  />
                  <FormField 
                    label="شماره طبقه" 
                    name="floor" 
                    type="number" 
                    placeholder="مثلاً 1" 
                    value={form.floor} 
                    onChange={handleChange} 
                    error={errors.floor}
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField 
                    label="متراژ (متر مربع)" 
                    name="area" 
                    type="number" 
                    placeholder="مثلاً 75" 
                    value={form.area} 
                    onChange={handleChange} 
                    error={errors.area}
                    required 
                  />
                  <FormField 
                    label="تعداد نفر" 
                    name="resident_count" 
                    type="number" 
                    placeholder="مثلاً 3" 
                    value={form.resident_count} 
                    onChange={handleChange} 
                    min={form.role === 'owner' && form.owner_type === 'empty' ? "0" : "1"}
                    error={errors.resident_count}
                    required={!(form.role === 'owner' && form.owner_type === 'empty')} 
                    disabled={form.role === 'owner' && form.owner_type === 'empty'}
                  />
                </div>

                {/* انتخاب نقش */}
                <SelectField
                  label="نقش"
                  name="role"
                  value={form.role}
                  onChange={handleSelectChange}
                  options={roleOptions}
                  error={errors.role}
                />

                {/* اگر مالک انتخاب شد، نوع مالک را نمایش بده */}
                {form.role === "owner" && (
                  <SelectField
                    label="نوع مالک"
                    name="owner_type"
                    value={form.owner_type}
                    onChange={handleSelectChange}
                    options={ownerTypeOptions}
                    error={errors.owner_type}
                  />
                )}

                {/* اگر مالک دارای مستاجر است، اطلاعات مستاجر را نمایش بده */}
                {form.role === "owner" && form.owner_type === "landlord" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-800">اطلاعات مستاجر</h4>
                    <FormField 
                      label="نام و نام خانوادگی مستاجر" 
                      name="tenant_full_name" 
                      placeholder="مثلاً محمد رضایی" 
                      value={form.tenant_full_name} 
                      onChange={handleChange} 
                      error={errors.tenant_full_name}
                      required 
                    />
                    <FormField 
                      label="شماره تماس مستاجر" 
                      name="tenant_phone_number" 
                      placeholder="مثلاً 09123456789" 
                      value={form.tenant_phone_number} 
                      onChange={handleChange} 
                      error={errors.tenant_phone_number}
                      required 
                    />
                  </div>
                )}

                {/* پارکینگ */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="has_parking"
                      checked={form.has_parking}
                      onChange={handleChange}
                      id="has_parking"
                      className="h-5 w-5 rounded border-gray-300 text-melkingDarkBlue focus:ring-melkingDarkBlue"
                    />
                    <label htmlFor="has_parking" className="text-sm text-gray-700 font-medium">
                      پارکینگ دارد
                    </label>
                  </div>

                  {form.has_parking && (
                    <FormField 
                      label="تعداد پارکینگ" 
                      name="parking_count" 
                      type="number" 
                      placeholder="مثلاً 1" 
                      value={form.parking_count} 
                      onChange={handleChange} 
                      min="1"
                      error={errors.parking_count}
                      required 
                    />
                  )}
                </div>
                </form>
              </div>

              <div className="p-6 pt-4 border-t border-gray-100">
                {!buildingId && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ لطفاً ابتدا یک ساختمان انتخاب کنید
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 rounded-2xl border border-gray-300 hover:bg-gray-50 transition"
                  >
                    لغو
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !buildingId}
                    onClick={handleSubmit}
                    className="px-6 py-3 text-white rounded-2xl bg-melkingDarkBlue hover:bg-blue-800 transition disabled:opacity-50"
                  >
                    {createLoading ? "در حال ثبت..." : "ثبت واحد"}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}