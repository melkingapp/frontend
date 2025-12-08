import { useState, Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createMembershipRequest, fetchUnitByPhone, clearUnitData, selectUnitData, selectUnitLoading, fetchMembershipRequests } from "../membershipSlice";
import { fetchApprovedBuildings } from "../../resident/building/residentBuildingSlice";
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
  const membershipRequests = useSelector(state => state.membership.requests);
  const approvedBuildings = useSelector(state => state.residentBuilding.approvedBuildings);
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
    
    // اطلاعات مالک (اگر نقش ساکن باشد)
    owner_full_name: "",
    owner_phone_number: "",
    
    // پارکینگ
    has_parking: false,
    parking_count: 0,
  });

  const [errors, setErrors] = useState({});
  const debounceRef = useRef(null);

  // Resolve phone number: prefer user.phone_number, fallback to user.username
  const effectivePhoneNumber = user?.phone_number || user?.username || '';

  // Fetch membership requests and approved buildings when form opens to check if user is already a member
  useEffect(() => {
    if (isOpen) {
      // Fetch membership requests to check existing memberships
      dispatch(fetchMembershipRequests());
      // Also fetch approved buildings (from BuildingUser table) to check if manager added user
      dispatch(fetchApprovedBuildings());
    }
  }, [isOpen, dispatch]);

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
      const isOwnerWithLandlord = unitData.role === 'owner' && unitData.owner_type === 'landlord';
      const isResidentRole = unitData.role === 'resident';
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
        // Only pre-fill tenant info if owner_type is 'landlord'
        tenant_full_name: isOwnerWithLandlord ? (unitData.tenant_full_name || "") : "",
        tenant_phone_number: isOwnerWithLandlord ? (unitData.tenant_phone_number || "") : "",
        // Only pre-fill owner info if role is resident
        owner_full_name: isResidentRole ? (unitData.owner_full_name || "") : "",
        owner_phone_number: isResidentRole ? (unitData.owner_phone_number || "") : "",
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
    
    setForm((prev) => {
      const updatedForm = {
      ...prev,
      [name]: processedValue,
      };
      
      if (name === 'role') {
        // If role changes from 'owner' to something else, clear owner_type/tenant info
        if (processedValue !== 'owner') {
          updatedForm.owner_type = "";
          updatedForm.tenant_full_name = "";
          updatedForm.tenant_phone_number = "";
        }
        // If role changes away from resident, clear owner info
        if (processedValue !== 'resident') {
          updatedForm.owner_full_name = "";
          updatedForm.owner_phone_number = "";
        }
      }
      
      // If owner_type changes from 'landlord' to something else, clear tenant info
      if (name === 'owner_type' && processedValue !== 'landlord') {
        updatedForm.tenant_full_name = "";
        updatedForm.tenant_phone_number = "";
      }
      
      return updatedForm;
    });
    
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
    if (form.role === 'resident') {
      if (!form.owner_full_name || !form.owner_full_name.trim()) {
        newErrors.owner_full_name = 'نام مالک برای نقش ساکن الزامی است';
      }
      if (!form.owner_phone_number || !form.owner_phone_number.trim()) {
        newErrors.owner_phone_number = 'شماره تماس مالک برای نقش ساکن الزامی است';
      }
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
      // Normalize role: 'tenant' -> 'resident', 'owner' -> 'owner', anything else -> 'resident'
      const normalizedRole = unitData.role === 'owner' ? 'owner' : 'resident';
      
      // owner_type should only be set if role is 'owner' and it has a value, otherwise null
      // But if role is 'owner' and owner_type is missing, we should not send the request
      const ownerTypeValue = unitData.owner_type || form.owner_type || '';
      const normalizedOwnerType = normalizedRole === 'owner' 
        ? (ownerTypeValue ? ownerTypeValue : null)
        : null;
      
      // Validate owner_type for owner role
      if (normalizedRole === 'owner' && !normalizedOwnerType) {
        const errorMsg = 'نوع مالک برای نقش مالک الزامی است';
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
        return;
      }
      
      // Helper function to convert to number (required fields should not be null)
      const toNumber = (value, required = false) => {
        if (value === null || value === undefined || value === '') {
          if (required && process.env.NODE_ENV === 'development') {
            console.warn("⚠️ Required number field is missing:", value);
          }
          return required ? 0 : null; // Return 0 for required fields instead of null
        }
        const num = Number(value);
        if (isNaN(num)) {
          if (required && process.env.NODE_ENV === 'development') {
            console.warn("⚠️ Required number field is NaN:", value);
          }
          return required ? 0 : null;
        }
        return num;
      };
      
      // Helper function to convert empty strings to null for optional fields
      const toNullIfEmpty = (value) => {
        if (value === null || value === undefined || value === '') return null;
        return value;
      };
      
      // Validate required fields before creating payload
      const buildingCode = (unitData.building_code || form.building_code || '').trim();
      const fullName = (unitData.full_name || form.full_name || '').trim();
      const phoneNumber = (unitData.phone_number || form.phone_number || '').trim();
      const unitNumber = (unitData.unit_number || form.unit_number || '').trim();
      const floorValue = toNumber(unitData.floor || form.floor, true);
      const areaValue = toNumber(unitData.area || form.area, true);
      const residentCountValue = toNumber(unitData.resident_count || form.resident_count, true) || 1;
      let ownerFullName = null;
      let ownerPhoneNumber = null;
      
      // Check all required fields
      const missingFields = [];
      if (!buildingCode) missingFields.push('کد ساختمان');
      if (!fullName) missingFields.push('نام و نام خانوادگی');
      if (!phoneNumber) missingFields.push('شماره تماس');
      if (!unitNumber) missingFields.push('شماره واحد');
      if (!floorValue) missingFields.push('شماره طبقه');
      if (!areaValue) missingFields.push('متراژ');
      if (normalizedRole === 'resident') {
        ownerFullName = (unitData.owner_full_name || form.owner_full_name || '').trim();
        ownerPhoneNumber = (unitData.owner_phone_number || form.owner_phone_number || '').trim();
        if (!ownerFullName) missingFields.push('نام مالک');
        if (!ownerPhoneNumber) missingFields.push('شماره تماس مالک');
      }
      
      if (missingFields.length > 0) {
        const errorMsg = `فیلدهای الزامی خالی هستند: ${missingFields.join(', ')}`;
        if (process.env.NODE_ENV === 'development') {
          console.error("❌ Missing required fields:", missingFields);
        }
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
        return;
      }
      
      // Only include tenant info if owner_type is 'landlord'
      const isOwnerWithLandlord = normalizedRole === 'owner' && normalizedOwnerType === 'landlord';
      
      const payload = {
        building_code: buildingCode,
        full_name: fullName,
        phone_number: phoneNumber,
        unit_number: unitNumber,
        floor: floorValue,
        area: areaValue,
        resident_count: residentCountValue,
        role: normalizedRole,
        owner_type: normalizedOwnerType,
        owner_full_name: normalizedRole === 'resident' ? ownerFullName : null,
        owner_phone_number: normalizedRole === 'resident' ? ownerPhoneNumber : null,
        // Only include tenant info if owner_type is 'landlord'
        tenant_full_name: isOwnerWithLandlord ? toNullIfEmpty(unitData.tenant_full_name || form.tenant_full_name) : null,
        tenant_phone_number: isOwnerWithLandlord ? toNullIfEmpty(unitData.tenant_phone_number || form.tenant_phone_number) : null,
        has_parking: unitData.has_parking ?? form.has_parking ?? false,
        parking_count: toNumber(unitData.parking_count ?? form.parking_count) || 0,
      };
      
      // Log payload for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log("📤 handleAcceptPrefill - Payload being sent:", payload);
        console.log("📤 handleAcceptPrefill - unitData:", unitData);
      }
      
      await dispatch(createMembershipRequest(payload)).unwrap();
      toast.success('درخواست عضویت با اطلاعات شناسایی‌شده ثبت شد');
      handleClose();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ Error in handleAcceptPrefill:", error);
        console.error("❌ Error details:", {
          error,
          message: error?.message,
          payload: error?.payload
        });
      }
      
      // Extract error message
      let errorMessage = 'خطا در ارسال درخواست عضویت';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.payload) {
        errorMessage = error.payload;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
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
      // Only include tenant info if owner_type is 'landlord'
      const isOwnerWithLandlord = form.role === 'owner' && form.owner_type === 'landlord';
      const ownerInfo =
        form.role === 'resident'
          ? {
              owner_full_name: (form.owner_full_name || '').trim(),
              owner_phone_number: (form.owner_phone_number || '').trim(),
            }
          : {
              owner_full_name: null,
              owner_phone_number: null,
            };
      const submitData = {
        ...form,
        owner_full_name: ownerInfo.owner_full_name,
        owner_phone_number: ownerInfo.owner_phone_number,
        // Only include tenant info if owner_type is 'landlord'
        tenant_full_name: isOwnerWithLandlord ? form.tenant_full_name : null,
        tenant_phone_number: isOwnerWithLandlord ? form.tenant_phone_number : null,
      };
      
      const result = await dispatch(createMembershipRequest(submitData)).unwrap();
      if (process.env.NODE_ENV === 'development') {
      console.log("✅ Membership request created successfully:", result);
      }
      
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
        owner_full_name: "",
        owner_phone_number: "",
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
      if (process.env.NODE_ENV === 'development') {
      console.error("❌ Error creating membership request:", error);
      }
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
        owner_full_name: "",
        owner_phone_number: "",
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
                {/* Show for each building where user is a member (via BuildingUser) but doesn't have approved membership request */}
                {!unitLoading && (() => {
                  // Debug logs (only in development)
                  if (process.env.NODE_ENV === 'development') {
                    console.log("🔍 MembershipRequestForm - unitData:", unitData);
                    console.log("🔍 MembershipRequestForm - approvedBuildings:", approvedBuildings);
                    console.log("🔍 MembershipRequestForm - membershipRequests:", membershipRequests);
                  }
                  
                  // Find buildings where user is a member but doesn't have approved membership request
                  const buildingsNeedingRequest = approvedBuildings.filter(building => {
                    const hasApprovedRequest = membershipRequests.some(req => 
                      req.building_code === building.building_code &&
                      (req.status === 'approved' || 
                       req.status === 'owner_approved' || 
                       req.status === 'manager_approved')
                    );
                    return !hasApprovedRequest;
                  });
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log("🔍 buildingsNeedingRequest:", buildingsNeedingRequest);
                  }
                  
                  // If no buildings need request, don't show anything
                  if (buildingsNeedingRequest.length === 0) {
                    return null;
                  }
                  
                  // Show notification for each building that needs a request
                  // For now, show the first one (or match with unitData if available)
                  const targetBuilding = unitData && buildingsNeedingRequest.find(b => 
                    b.building_code === unitData.building_code
                  ) || buildingsNeedingRequest[0];
                  
                  // Use unitData if it matches the target building, otherwise use building info
                  const displayData = (unitData && unitData.building_code === targetBuilding.building_code) 
                    ? unitData 
                    : {
                        building_code: targetBuilding.building_code,
                        building_title: targetBuilding.title,
                        unit_number: targetBuilding.unit_number || '',
                        floor: targetBuilding.floor || '',
                        area: targetBuilding.area || '',
                        role: targetBuilding.role || 'resident',
                        owner_type: targetBuilding.owner_type || '',
                        resident_count: targetBuilding.resident_count || 1,
                        has_parking: targetBuilding.has_parking || false,
                        parking_count: targetBuilding.parking_count || 0,
                        full_name: user?.full_name || '',
                        phone_number: effectivePhoneNumber,
                        owner_full_name: targetBuilding.owner_full_name || '',
                        owner_phone_number: targetBuilding.owner_phone_number || '',
                      };
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log("🔍 Showing pre-fill notification for building:", targetBuilding.building_code);
                  }
                  
                  return (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="text-sm text-green-800">
                          اطلاعات شما در سیستم یافت شد. آیا تایید می‌کنید این اطلاعات مربوط به شماست؟
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-900">
                          <div key="building-title">ساختمان: <span className="font-semibold">{displayData.building_title}</span></div>
                          <div key="building-code">کد ساختمان: <span className="font-semibold">{displayData.building_code}</span></div>
                          {displayData.unit_number && (
                            <div key="unit-info">واحد: <span className="font-semibold">{displayData.unit_number} {displayData.floor ? `(طبقه ${displayData.floor})` : ''}</span></div>
                          )}
                          {displayData.area && (
                            <div key="area">متراژ: <span className="font-semibold">{displayData.area}</span></div>
                          )}
                          {displayData.role && (
                            <div key="role">نقش: <span className="font-semibold">{getPersianRole(displayData.role)}</span></div>
                          )}
                          {displayData.role === 'owner' && displayData.owner_type && (
                            <div key="owner-type">نوع مالک: <span className="font-semibold">{getPersianOwnerType(displayData.owner_type)}</span></div>
                        )}
                          {displayData.resident_count && (
                            <div key="resident-count">تعداد نفر: <span className="font-semibold">{displayData.resident_count}</span></div>
                          )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                            onClick={() => {
                              // Create a payload from displayData
                              const role = displayData.role || 'resident';
                              const ownerType = role === 'owner' ? (displayData.owner_type || null) : null;
                              const isOwnerWithLandlord = role === 'owner' && ownerType === 'landlord';
                              const ownerFullNameQuick = role === 'resident'
                                ? (displayData.owner_full_name || form.owner_full_name || '').trim()
                                : null;
                              const ownerPhoneQuick = role === 'resident'
                                ? (displayData.owner_phone_number || form.owner_phone_number || '').trim()
                                : null;
                              
                              if (role === 'resident' && (!ownerFullNameQuick || !ownerPhoneQuick)) {
                                toast.error('لطفاً نام و شماره تماس مالک را تکمیل کنید');
                                return;
                              }
                              
                              const payload = {
                                building_code: displayData.building_code,
                                full_name: displayData.full_name || user?.full_name || '',
                                phone_number: displayData.phone_number || effectivePhoneNumber,
                                unit_number: displayData.unit_number || '',
                                floor: displayData.floor ? Number(displayData.floor) : null,
                                area: displayData.area ? Number(displayData.area) : null,
                                resident_count: displayData.resident_count || 1,
                                role: role,
                                owner_type: ownerType,
                                owner_full_name: role === 'resident' ? ownerFullNameQuick : null,
                                owner_phone_number: role === 'resident' ? ownerPhoneQuick : null,
                                // Only include tenant info if owner_type is 'landlord'
                                tenant_full_name: isOwnerWithLandlord ? (displayData.tenant_full_name || null) : null,
                                tenant_phone_number: isOwnerWithLandlord ? (displayData.tenant_phone_number || null) : null,
                                has_parking: displayData.has_parking || false,
                                parking_count: displayData.parking_count || 0,
                              };
                              
                              // Use the same logic as handleAcceptPrefill
                              dispatch(createMembershipRequest(payload))
                                .unwrap()
                                .then(() => {
                                  toast.success('درخواست عضویت با اطلاعات شناسایی‌شده ثبت شد');
                                  handleClose();
                                })
                                .catch((error) => {
                                  if (process.env.NODE_ENV === 'development') {
                                    console.error("❌ Error creating membership request:", error);
                                  }
                                  const errorMessage = typeof error === 'string' ? error : (error?.payload || error?.message || 'خطا در ارسال درخواست عضویت');
                                  toast.error(errorMessage);
                                });
                            }}
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
                  );
                })()}

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
                
                {/* اطلاعات مالک برای نقش ساکن */}
                {form.role === 'resident' && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <User size={20} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-800">اطلاعات مالک</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="نام و نام خانوادگی مالک *"
                        name="owner_full_name"
                        placeholder="نام و نام خانوادگی مالک"
                        value={form.owner_full_name}
                        onChange={handleChange}
                        required
                      />
                      <FormField
                        label="شماره تماس مالک *"
                        name="owner_phone_number"
                        type="tel"
                        placeholder="شماره تماس مالک"
                        value={form.owner_phone_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {(errors.owner_full_name || errors.owner_phone_number) && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.owner_full_name && <p>{errors.owner_full_name}</p>}
                        {errors.owner_phone_number && <p>{errors.owner_phone_number}</p>}
                      </div>
                    )}
                  </div>
                )}

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

