import { useState, Fragment, useEffect, useRef, useCallback, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createMembershipRequest, fetchUnitByPhone, clearUnitData, selectUnitData, selectUnitLoading, fetchMembershipRequests, rejectRequest } from "../membershipSlice";
import { fetchApprovedBuildings } from "../../resident/building/residentBuildingSlice";
import { X, Building, User, Home, Car, Users, XCircle } from "lucide-react";

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
    'empty': 'واحد خالی',
    'مالک مقیم': 'مالک مقیم',
    'دارای مستاجر': 'دارای مستاجر',
    'واحد خالی': 'واحد خالی'
  };
  return ownerTypeMap[ownerType] || ownerType;
};

const FormField = ({ label, name, type = "text", placeholder, value, onChange, min, required, options = null, disabled = false, icon: Icon }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-indigo-500" />}
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="mt-1 block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3.5 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed hover:border-gray-300"
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
        disabled={disabled}
        className="mt-1 block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3.5 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed hover:border-gray-300 placeholder:text-gray-400"
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

    // بدهکاری / بستانکاری اولیه (فقط برای واحدهای جدید)
    initial_debt: "",
    initial_credit: "",
    initial_balance: "",
  });

  const [errors, setErrors] = useState({});
  const [originalUnitData, setOriginalUnitData] = useState(null); // ذخیره داده‌های اولیه واحد
  const [isFromManagerUnit, setIsFromManagerUnit] = useState(false); // آیا داده‌ها از واحد مدیر پر شده？
  const [showRejectModal, setShowRejectModal] = useState(false); // نمایش modal رد درخواست
  const [rejectionReason, setRejectionReason] = useState(''); // دلیل رد درخواست
  const debounceRef = useRef(null);

  // Resolve phone number: prefer user.phone_number, fallback to user.username
  const effectivePhoneNumber = useMemo(() =>
    user?.phone_number || user?.username || '',
    [user?.phone_number, user?.username]
  );

  // Fetch membership requests and approved buildings when form opens to check if user is already a member
  useEffect(() => {
    if (isOpen) {
      // Reset form state when form opens
      setForm({
        building_code: "",
        full_name: "",
        phone_number: effectivePhoneNumber || "",
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
        initial_debt: "",
        initial_credit: "",
        initial_balance: "",
      });
      setIsFromManagerUnit(false);
      setOriginalUnitData(null);
      
      // Fetch membership requests to check existing memberships
      dispatch(fetchMembershipRequests());
      // Also fetch approved buildings (from BuildingUser table) to check if manager added user
      dispatch(fetchApprovedBuildings());
    }
  }, [isOpen, dispatch, effectivePhoneNumber]);

  // Fetch unit data when form opens
  useEffect(() => {
    if (isOpen && effectivePhoneNumber) {
      if (import.meta.env.DEV) {
        console.log("🔄 Fetching unit data for phone:", effectivePhoneNumber);
      }
      // همیشه unit data رو fetch کن (ممکنه برای ساختمان‌های مختلف باشه)
      dispatch(fetchUnitByPhone(effectivePhoneNumber))
        .then((result) => {
          if (import.meta.env.DEV) {
            console.log("✅ fetchUnitByPhone result:", result);
          }
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.error("❌ fetchUnitByPhone error:", error);
          }
        });
      
      // Pre-fill phone in form if empty (فقط شماره تلفن)
      setForm(prev => ({ 
        ...prev, 
        phone_number: prev.phone_number || effectivePhoneNumber 
      }));
    }
    
    // Clear unit data when form closes
    if (!isOpen) {
      dispatch(clearUnitData());
      // Reset form state
      setIsFromManagerUnit(false);
      setOriginalUnitData(null);
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

  // تابع مقایسه داده‌های فرم با داده‌های اولیه واحد
  const compareFormWithOriginalData = (formData, originalData) => {
    if (!originalData) return false; // اگر داده اولیه وجود ندارد، فرض می‌کنیم تغییر نکرده

    // تشخیص نقش: مستاجر یا مالک
    const isTenant = originalData.role === 'tenant' || originalData.match_type === 'tenant' || formData.role === 'resident';
    const isOwner = originalData.role === 'owner' || formData.role === 'owner';

    // فیلدهای کلیدی برای مقایسه
    const keyFields = ['unit_number', 'floor', 'area', 'full_name', 'phone_number'];

    if (isTenant) {
      // برای مستاجر: اطلاعات مستاجر و مالک را مقایسه کن
      // نقش در فرم باید 'resident' باشد برای مستاجر
      if (formData.role !== 'resident') {
        return true; // تغییر کرده
      }
      // برای مستاجر، اطلاعات مالک را هم چک کن
      keyFields.push('owner_full_name', 'owner_phone_number');
      // owner_type برای مستاجر نباید چک شود (چون مالک است که owner_type دارد)
    } else if (isOwner) {
      // برای مالک: اطلاعات مالک را مقایسه کن
      if (formData.role !== 'owner') {
        return true; // تغییر کرده
      }
      // برای مالک، owner_type را چک کن
      keyFields.push('owner_type');
      // اگر مالک دارای مستاجر است، اطلاعات مستاجر را هم چک کن
      if (formData.owner_type === 'landlord') {
        keyFields.push('tenant_full_name', 'tenant_phone_number');
      }
    } else {
      // اگر نقش مشخص نیست، فرض می‌کنیم تغییر کرده
      return true;
    }

    for (const field of keyFields) {
      let originalValue = originalData[field];
      let formValue = formData[field];

      // برای فیلدهای عددی (floor, area)، باید به عدد تبدیل کنیم و سپس مقایسه کنیم
      if (field === 'floor' || field === 'area') {
        try {
          const originalNum = originalValue != null ? Number(originalValue) : 0;
          const formNum = formValue != null ? Number(formValue) : 0;
          if (originalNum !== formNum) {
            return true; // تغییر کرده
          }
          continue;
        } catch (e) {
          // اگر تبدیل به عدد ممکن نبود، به صورت string مقایسه کن
        }
      }

      // تبدیل به string برای مقایسه
      const originalStr = String(originalValue || '').trim();
      const formStr = String(formValue || '').trim();

      if (originalStr !== formStr) {
        return true; // تغییر کرده
      }
    }

    return false; // تغییر نکرده
  };

  // Pre-fill form when unit data is loaded
  useEffect(() => {
    if (unitData) {
      if (import.meta.env.DEV) {
        console.log("🔍 Checking unitData for pre-fill:", unitData);
        console.log("🔍 membershipRequests:", membershipRequests);
        console.log("🔍 approvedBuildings:", approvedBuildings);
      }
      
      // چک کن که آیا کاربر قبلاً درخواست تایید شده برای این ساختمان داره یا نه
      const hasApprovedRequest = membershipRequests.some(req => {
        const buildingCodeMatch = req.building_code === unitData.building_code;
        // استفاده از building_id به جای building (چون سریالایزر building_id برمیگرداند)
        const buildingIdMatch = (req.building_id === unitData.building_id) || 
                                (req.building === unitData.building_id) ||
                                (req.building_id === unitData.id);
        const statusMatch = req.status === 'approved' || 
                          req.status === 'owner_approved' || 
                          req.status === 'manager_approved';
        return (buildingCodeMatch || buildingIdMatch) && statusMatch;
      });

      // چک کن که آیا کاربر قبلاً از طریق BuildingUser برای این ساختمان عضو شده یا نه
      const hasApprovedBuilding = approvedBuildings.some(building => {
        const buildingCodeMatch = building.building_code === unitData.building_code;
        // چک با building_id و id (برای پوشش همه حالت‌ها)
        const buildingIdMatch = (building.building_id === unitData.building_id) || 
                                (building.id === unitData.building_id) ||
                                (building.building_id === unitData.id);
        return buildingCodeMatch || buildingIdMatch;
      });

      if (import.meta.env.DEV) {
        console.log("🔍 hasApprovedRequest:", hasApprovedRequest);
        console.log("🔍 hasApprovedBuilding:", hasApprovedBuilding);
        console.log("🔍 unitData.building_id:", unitData.building_id);
        console.log("🔍 unitData.building_code:", unitData.building_code);
      }

      // ذخیره داده‌های اولیه برای مقایسه بعداً (حتی اگر کاربر قبلاً join کرده باشد)
      // این برای تشخیص تغییرات در فرم ضروری است
      setOriginalUnitData({...unitData});
      
      // اگر کاربر قبلاً join کرده (از طریق MembershipRequest یا BuildingUser)، فرم رو پر نکن
      // اما originalUnitData را ذخیره کن تا بتوانیم تغییرات را تشخیص دهیم
      if (hasApprovedRequest || hasApprovedBuilding) {
        if (import.meta.env.DEV) {
          console.log("❌ Skipping pre-fill: user already has approved request/building for this building");
          console.log("✅ But saving originalUnitData for comparison:", unitData);
        }
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log("✅ Pre-filling form with unitData");
        console.log("🔍 unitData.role:", unitData.role);
        console.log("🔍 unitData.owner_type:", unitData.owner_type);
      }

      setIsFromManagerUnit(true); // نشان می‌دهد که داده‌ها از واحد مدیر پر شده

      const isOwnerWithLandlord = (unitData.role === 'owner' || unitData.role === 'tenant') && unitData.owner_type === 'landlord';
      const isResidentRole = unitData.role === 'resident' || unitData.role === 'tenant';
      const isTenantMatch = unitData.match_type === 'tenant' || unitData.role === 'tenant';
      
      // اگر owner_type وجود دارد (resident یا landlord یا empty)، role باید 'owner' باشد
      const hasOwnerType = unitData.owner_type && (unitData.owner_type === 'resident' || unitData.owner_type === 'landlord' || unitData.owner_type === 'empty');
      // تبدیل role از مدل Unit (owner/tenant) به MembershipRequest (owner/resident)
      const unitRole = unitData.role === 'tenant' ? 'resident' : (unitData.role === 'owner' ? 'owner' : unitData.role);
      const determinedRole = isTenantMatch ? 'resident' : (hasOwnerType ? 'owner' : (unitRole || ""));

      // owner_type فقط برای مالک (نه مستاجر)
      // اگر owner_type وجود داره و empty string نیست، ازش استفاده کن
      // توجه: 'empty', 'resident', 'landlord' مقادیر معتبر هستند
      // empty string ('') یعنی مقدار نداره و نباید set بشه
      const ownerTypeValue = isTenantMatch ? "" : (
        unitData.owner_type &&
        unitData.owner_type !== null &&
        unitData.owner_type !== undefined &&
        unitData.owner_type !== '' &&
        (unitData.owner_type === 'empty' || unitData.owner_type === 'resident' || unitData.owner_type === 'landlord')
          ? unitData.owner_type
          : ""
      );

      setForm(prevForm => ({
        ...prevForm,
        building_code: unitData.building_code || "",
        // full_name و phone_number: اطلاعات کاربر فعلی (مستاجر یا مالک)
        full_name: unitData.full_name || "",
        phone_number: unitData.phone_number || "",
        unit_number: unitData.unit_number || "",
        floor: unitData.floor || "",
        area: unitData.area || "",
        resident_count: unitData.resident_count || 1,
        // برای مستاجر، نقش را به 'resident' تغییر می‌دهیم
        // اگر owner_type وجود دارد، role باید 'owner' باشد
        role: determinedRole,
        owner_type: ownerTypeValue,
        // Only pre-fill tenant info if owner_type is 'landlord' (برای مالک دارای مستاجر)
        tenant_full_name: isOwnerWithLandlord ? (unitData.tenant_full_name || "") : "",
        tenant_phone_number: isOwnerWithLandlord ? (unitData.tenant_phone_number || "") : "",
        // اطلاعات مالک: برای مستاجر از owner_full_name و owner_phone_number استفاده کن
        owner_full_name: isTenantMatch ? (unitData.owner_full_name || "") : "",
        owner_phone_number: isTenantMatch ? (unitData.owner_phone_number || "") : "",
        has_parking: unitData.has_parking || false,
        parking_count: unitData.parking_count || 0,
      }));
    }
  }, [unitData, membershipRequests, approvedBuildings]);

  // اگر owner_type وجود دارد اما role خالی است یا 'owner' نیست، role را به 'owner' تنظیم کن
  useEffect(() => {
    if (form.owner_type && (form.owner_type === 'resident' || form.owner_type === 'landlord' || form.owner_type === 'empty')) {
      if (!form.role || form.role !== 'owner') {
        setForm(prev => ({
          ...prev,
          role: 'owner'
        }));
      }
    }
  }, [form.owner_type, form.role]);

  const roleOptions = [
    { value: 'resident', label: 'مستاجر' },
    { value: 'owner', label: 'مالک' },
  ];

  const ownerTypeOptions = [
    { value: 'empty', label: 'واحد خالی' },
    { value: 'resident', label: 'مالک مقیم' },
    { value: 'landlord', label: 'دارای مستاجر' },
  ];

  const handleChange = useCallback((e) => {
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

        // اگر نقش مستاجر انتخاب شد و اطلاعات واحد موجود است، اطلاعات مستاجر را پر کن
        if (processedValue === 'resident' && unitData && unitData.match_type === 'tenant') {
          // full_name و phone_number: اطلاعات مستاجر (کاربر فعلی)
          updatedForm.full_name = unitData.full_name || "";
          updatedForm.phone_number = unitData.phone_number || "";
          // owner_full_name و owner_phone_number: اطلاعات مالک اصلی
          updatedForm.owner_full_name = unitData.owner_full_name || "";
          updatedForm.owner_phone_number = unitData.owner_phone_number || "";
        }
      }

      // If owner_type changes
      if (name === 'owner_type') {
        // اگر owner_type "resident" یا "landlord" یا "empty" است، role باید 'owner' باشد
        if (processedValue === 'resident' || processedValue === 'landlord' || processedValue === 'empty') {
          updatedForm.role = 'owner';
        } else if (!processedValue || processedValue === '') {
          // اگر owner_type خالی شد و role 'owner' است، role را خالی کن
          if (updatedForm.role === 'owner') {
            updatedForm.role = "";
          }
        }
        // If owner_type changes to 'empty', set resident_count to 0 and clear tenant info
        if (processedValue === 'empty') {
          updatedForm.resident_count = 0;
          updatedForm.tenant_full_name = "";
          updatedForm.tenant_phone_number = "";
        }
        // If owner_type changes from 'landlord' to something else, clear tenant info
        if (processedValue !== 'landlord') {
          updatedForm.tenant_full_name = "";
          updatedForm.tenant_phone_number = "";
        }
      }

      return updatedForm;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors, unitData]);

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
    
    // اگر owner_type 'empty' است، resident_count باید 0 باشد
    if (form.role === 'owner' && form.owner_type === 'empty') {
      if (form.resident_count !== 0 && form.resident_count !== '0') {
        newErrors.resident_count = 'برای واحد خالی تعداد نفر باید ۰ باشد';
      }
    }
    // Validation for owner fields when role is 'resident' - optional but if one is filled, both must be filled
    if (form.role === 'resident') {
      const ownerName = (form.owner_full_name || '').trim();
      const ownerPhone = (form.owner_phone_number || '').trim();
      
      // اگر یکی از فیلدهای مالک پر شده باشد، هر دو باید پر شوند
      if (ownerName || ownerPhone) {
        if (!ownerName) {
          newErrors.owner_full_name = 'نام مالک الزامی است';
        }
        if (!ownerPhone) {
          newErrors.owner_phone_number = 'شماره تماس مالک الزامی است';
        }
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

  const handleClose = useCallback(() => {
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
    setOriginalUnitData(null);
    setIsFromManagerUnit(false);
    dispatch(clearUnitData());
    onClose();
  }, [dispatch, onClose]);

  const handleAcceptPrefill = useCallback(async () => {
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
          if (required && import.meta.env.DEV) {
            console.warn("⚠️ Required number field is missing:", value);
          }
          return required ? 0 : null; // Return 0 for required fields instead of null
        }
        const num = Number(value);
        if (isNaN(num)) {
          if (required && import.meta.env.DEV) {
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
      // اگر owner_type 'empty' است، resident_count باید 0 باشد
      const isEmptyOwner = normalizedRole === 'owner' && normalizedOwnerType === 'empty';
      const residentCountValue = isEmptyOwner ? 0 : (toNumber(unitData.resident_count || form.resident_count, true) || 1);
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
      // Owner fields are optional for resident role
      // Only validate if one is filled (both must be filled in that case)
      if (normalizedRole === 'resident') {
        ownerFullName = (unitData.owner_full_name || form.owner_full_name || '').trim();
        ownerPhoneNumber = (unitData.owner_phone_number || form.owner_phone_number || '').trim();
        // اگر یکی از فیلدهای مالک پر شده باشد، هر دو باید پر شوند
        if (ownerFullName || ownerPhoneNumber) {
          if (!ownerFullName) missingFields.push('نام مالک');
          if (!ownerPhoneNumber) missingFields.push('شماره تماس مالک');
        }
      }
      
      if (missingFields.length > 0) {
        const errorMsg = `فیلدهای الزامی خالی هستند: ${missingFields.join(', ')}`;
        if (import.meta.env.DEV) {
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
        // فیلدهای مالی اولیه (ورودی کاربر، فقط برای واحدهای جدید؛ سمت سرور فعلاً صرفاً دریافت می‌شود)
        initial_debt: toNullIfEmpty(form.initial_debt),
        initial_credit: toNullIfEmpty(form.initial_credit),
        initial_balance: toNullIfEmpty(form.initial_balance),
      };
      
      // Log payload for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log("📤 handleAcceptPrefill - Payload being sent:", payload);
        console.log("📤 handleAcceptPrefill - unitData:", unitData);
      }
      
      const result = await dispatch(createMembershipRequest(payload)).unwrap();
      
      // اگر درخواست تایید شد (auto_approved یا manager_approved)، لیست‌ها را به‌روز کن
      if (result?.auto_approved || result?.manager_approved || result?.auto_matched || result?.data_unchanged) {
        // به‌روزرسانی لیست درخواست‌ها و ساختمان‌های تایید شده - منتظر بمان تا کامل بشه
        await Promise.all([
          dispatch(fetchMembershipRequests()),
          dispatch(fetchApprovedBuildings())
        ]);
      }
      
      toast.success('درخواست عضویت با اطلاعات شناسایی‌شده ثبت شد');
      handleClose();
    } catch (error) {
      if (import.meta.env.DEV) {
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
  }, [unitData, dispatch, handleClose]);

  const handleRejectPrefill = useCallback(() => {
    dispatch(clearUnitData());
  }, [dispatch]);

  const handleRejectSuggested = useCallback(async () => {
    if (!unitData?.request_id) return;

    try {
      await dispatch(rejectRequest({
        requestId: unitData.request_id,
        rejectionReason: rejectionReason.trim(),
        isSuggested: true
      })).unwrap();

      toast.success('درخواست عضویت رد شد');
      setShowRejectModal(false);
      setRejectionReason('');
      handleClose();
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : (error?.payload || error?.message || 'خطا در رد درخواست');
      toast.error(errorMessage);
    }
  }, [unitData, rejectionReason, dispatch, handleClose]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Only include tenant info if owner_type is 'landlord'
      const isOwnerWithLandlord = form.role === 'owner' && form.owner_type === 'landlord';
      // Owner info is optional for resident role
      // If both are empty, send empty strings (or null) - backend will handle it
      const ownerInfo =
        form.role === 'resident'
          ? {
              owner_full_name: (form.owner_full_name || '').trim() || null,
              owner_phone_number: (form.owner_phone_number || '').trim() || null,
            }
          : {
              owner_full_name: null,
              owner_phone_number: null,
            };
      // بررسی اینکه آیا داده‌ها تغییر کرده یا نه
      // اگر رزیدنت است و unitData یا originalUnitData وجود دارد، باید بررسی کنیم که آیا داده‌ها تغییر کرده یا نه
      // این برای جلوگیری از auto-approve وقتی رزیدنت اطلاعات را تغییر می‌دهد
      let hasBeenEdited = false;
      const dataToCompare = originalUnitData || unitData;
      
      if (user?.role === 'resident' && dataToCompare) {
        // اگر رزیدنت است و داده‌ای برای مقایسه وجود دارد، بررسی کن که آیا داده‌ها تغییر کرده یا نه
        hasBeenEdited = compareFormWithOriginalData(form, dataToCompare);
        if (import.meta.env.DEV) {
          console.log("🔍 Checking if data has been edited:", {
            hasBeenEdited,
            formArea: form.area,
            originalArea: dataToCompare.area,
            formFloor: form.floor,
            originalFloor: dataToCompare.floor,
            formUnitNumber: form.unit_number,
            originalUnitNumber: dataToCompare.unit_number
          });
        }
      } else if (isFromManagerUnit && originalUnitData) {
        hasBeenEdited = compareFormWithOriginalData(form, originalUnitData);
      }

      const submitData = {
        ...form,
        owner_full_name: ownerInfo.owner_full_name,
        owner_phone_number: ownerInfo.owner_phone_number,
        // Only include tenant info if owner_type is 'landlord'
        tenant_full_name: isOwnerWithLandlord ? form.tenant_full_name : null,
        tenant_phone_number: isOwnerWithLandlord ? form.tenant_phone_number : null,
        // اضافه کردن فلگ ویرایش
        has_been_edited: hasBeenEdited,
      };
      
      if (import.meta.env.DEV) {
        console.log("📤 Submitting membership request:", {
          has_been_edited: hasBeenEdited,
          formArea: form.area,
          originalArea: dataToCompare?.area,
          userRole: user?.role,
          submitData: submitData
        });
      }
      
      const result = await dispatch(createMembershipRequest(submitData)).unwrap();
      if (import.meta.env.DEV) {
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
      
      // اگر درخواست تایید شد (auto_approved یا manager_approved)، لیست‌ها را به‌روز کن
      if (result.auto_approved || result.manager_approved || result.auto_matched || result.data_unchanged) {
        // به‌روزرسانی لیست درخواست‌ها و ساختمان‌های تایید شده - منتظر بمان تا کامل بشه
        await Promise.all([
          dispatch(fetchMembershipRequests()),
          dispatch(fetchApprovedBuildings())
        ]);
      }
      
      onClose();
      
      // Show success message based on approval flow
      if (result.requires_owner_approval) {
        toast.success('درخواست عضویت ارسال شد. درخواست شما ابتدا باید توسط مالک تایید شود.');
      } else if (result.requires_manager_approval) {
        toast.success('اطلاعات تغییر کرده است. درخواست شما به مدیر ساختمان ارسال شد.');
      } else {
        toast.success('درخواست عضویت با موفقیت ارسال شد');
      }
      
    } catch (error) {
      if (import.meta.env.DEV) {
      console.error("❌ Error creating membership request:", error);
      }
      setErrors({ submit: error });
    }
  }, [form, dispatch, onClose]);

  return (
    <>
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-6 py-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <Building size={28} className="text-yellow-200" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-2xl font-bold mb-1">
                          درخواست عضویت در ساختمان
                        </Dialog.Title>
                        <p className="text-blue-100 text-sm font-medium">
                          برای عضویت در ساختمان، اطلاعات زیر را تکمیل کنید
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-110"
                    >
                      <X size={22} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">

                {/* Loading indicator for unit data */}
                {unitLoading && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-blue-700">
                        در حال بارگذاری اطلاعات واحد شما...
                      </p>
                    </div>
                  </div>
                )}


                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* اطلاعات ساختمان */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-indigo-200">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Building size={22} className="text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">اطلاعات ساختمان</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="کد ساختمان"
                        name="building_code"
                        placeholder="کد ساختمان را وارد کنید"
                        value={form.building_code}
                        onChange={handleChange}
                        required
                        icon={Building}
                      />
                    </div>
                    {errors.building_code && (
                      <div className="mt-2 p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                        <p className="text-red-600 text-sm font-medium">{errors.building_code}</p>
                      </div>
                    )}
                  </div>

                  {/* اطلاعات شخصی */}
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-purple-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User size={22} className="text-purple-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">اطلاعات شخصی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label={form.role === 'resident' ? "نام و نام خانوادگی مستاجر" : "نام و نام خانوادگی"}
                        name="full_name"
                        placeholder={form.role === 'resident' ? "نام و نام خانوادگی مستاجر را وارد کنید" : "نام و نام خانوادگی خود را وارد کنید"}
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        icon={User}
                      />
                      <FormField
                        label={form.role === 'resident' ? "شماره تماس مستاجر" : "شماره تماس"}
                        name="phone_number"
                        type="tel"
                        placeholder={form.role === 'resident' ? "شماره تماس مستاجر را وارد کنید" : "شماره تماس خود را وارد کنید"}
                        value={form.phone_number}
                        onChange={handleChange}
                        required
                        disabled={true}
                        icon={User}
                      />
                    </div>
                    {(errors.full_name || errors.phone_number) && (
                      <div className="mt-2 space-y-2">
                        {errors.full_name && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.full_name}</p>
                          </div>
                        )}
                        {errors.phone_number && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.phone_number}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* اطلاعات واحد */}
                  <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-green-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Home size={22} className="text-green-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">اطلاعات واحد</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <FormField
                        label="شماره واحد"
                        name="unit_number"
                        placeholder="شماره واحد"
                        value={form.unit_number}
                        onChange={handleChange}
                        required
                        disabled={isFromManagerUnit}
                        icon={Home}
                      />
                      <FormField
                        label="شماره طبقه"
                        name="floor"
                        type="number"
                        placeholder="شماره طبقه"
                        value={form.floor}
                        onChange={handleChange}
                        min="1"
                        required
                        icon={Home}
                      />
                      <FormField
                        label="متراژ (متر مربع)"
                        name="area"
                        type="number"
                        placeholder="متراژ واحد"
                        value={form.area}
                        onChange={handleChange}
                        min="1"
                        required
                        icon={Home}
                      />
                      <FormField
                        label="تعداد نفر"
                        name="resident_count"
                        type="number"
                        placeholder="تعداد نفر"
                        value={form.resident_count}
                        onChange={handleChange}
                        min={form.role === 'owner' && form.owner_type === 'empty' ? "0" : "1"}
                        required={!(form.role === 'owner' && form.owner_type === 'empty')}
                        disabled={form.role === 'owner' && form.owner_type === 'empty'}
                        icon={Users}
                      />
                    </div>
                    {(errors.unit_number || errors.floor || errors.area || errors.resident_count) && (
                      <div className="mt-2 space-y-2">
                        {errors.unit_number && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.unit_number}</p>
                          </div>
                        )}
                        {errors.floor && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.floor}</p>
                          </div>
                        )}
                        {errors.area && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.area}</p>
                          </div>
                        )}
                        {errors.resident_count && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.resident_count}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* نقش و نوع مالک */}
                  <div className="bg-gradient-to-br from-gray-50 to-yellow-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-yellow-200">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Users size={22} className="text-yellow-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">نقش و نوع مالک</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="نقش"
                        name="role"
                        options={roleOptions}
                        value={form.role}
                        onChange={handleChange}
                        required
                        disabled={isFromManagerUnit}
                        icon={Users}
                      />
                      {form.role === 'owner' && (
                        <FormField
                          label="نوع مالک"
                          name="owner_type"
                          options={ownerTypeOptions}
                          value={form.owner_type}
                          onChange={handleChange}
                          required
                          disabled={isFromManagerUnit}
                          icon={Users}
                        />
                      )}
                    </div>
                    {(errors.role || errors.owner_type) && (
                      <div className="mt-2 space-y-2">
                        {errors.role && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.role}</p>
                          </div>
                        )}
                        {errors.owner_type && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.owner_type}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                
                {/* اطلاعات مالک برای نقش ساکن */}
                {form.role === 'resident' && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User size={22} className="text-blue-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">اطلاعات مالک</h4>
                    </div>
                    <div className="mb-3 p-3 bg-blue-50 border-r-4 border-blue-400 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">نکته:</span> فیلدهای مالک اختیاری هستند. اگر اطلاعات مالک را وارد کنید، درخواست شما ابتدا باید توسط مالک و سپس توسط مدیر تایید شود. در غیر این صورت، فقط مدیر تایید می‌کند و یک مالک فرضی برای واحد شما ایجاد می‌شود.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="نام و نام خانوادگی مالک"
                        name="owner_full_name"
                        placeholder="نام و نام خانوادگی مالک (اختیاری)"
                        value={form.owner_full_name}
                        onChange={handleChange}
                        required={false}
                        icon={User}
                      />
                      <FormField
                        label="شماره تماس مالک"
                        name="owner_phone_number"
                        type="tel"
                        placeholder="شماره تماس مالک (اختیاری)"
                        value={form.owner_phone_number}
                        onChange={handleChange}
                        required={false}
                        disabled={isFromManagerUnit}
                        icon={User}
                      />
                    </div>
                    {(errors.owner_full_name || errors.owner_phone_number) && (
                      <div className="mt-2 space-y-2">
                        {errors.owner_full_name && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.owner_full_name}</p>
                          </div>
                        )}
                        {errors.owner_phone_number && (
                          <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{errors.owner_phone_number}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                  {/* اطلاعات مستاجر - فقط برای مالک دارای مستاجر */}
                  {form.role === 'owner' && form.owner_type === 'landlord' && (
                    <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-orange-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <User size={22} className="text-orange-600" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800">اطلاعات مستاجر</h4>
                      </div>
                      
                      {/* راهنمای کاربر */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-xl p-4 mb-5 shadow-sm">
                        <p className="text-sm text-blue-800 font-medium flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <span>
                            <strong>راهنما:</strong> اگر هنوز مستاجر ندارید، این فیلدها را خالی بگذارید. 
                            واحد شما در حالت "منتظر مستاجر" قرار می‌گیرد و بعداً می‌توانید اطلاعات مستاجر را اضافه کنید.
                          </span>
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          label="نام و نام خانوادگی مستاجر"
                          name="tenant_full_name"
                          placeholder="نام و نام خانوادگی مستاجر (اختیاری)"
                          value={form.tenant_full_name}
                          onChange={handleChange}
                          icon={User}
                        />
                        <FormField
                          label="شماره تماس مستاجر"
                          name="tenant_phone_number"
                          type="tel"
                          placeholder="شماره تماس مستاجر (اختیاری)"
                          value={form.tenant_phone_number}
                          onChange={handleChange}
                          disabled={isFromManagerUnit}
                          icon={User}
                        />
                      </div>
                      {(errors.tenant_full_name || errors.tenant_phone_number) && (
                        <div className="mt-2 space-y-2">
                          {errors.tenant_full_name && (
                            <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                              <p className="text-red-600 text-sm font-medium">{errors.tenant_full_name}</p>
                            </div>
                          )}
                          {errors.tenant_phone_number && (
                            <div className="p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                              <p className="text-red-600 text-sm font-medium">{errors.tenant_phone_number}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* پارکینگ */}
                  <div className="bg-gradient-to-br from-gray-50 to-teal-50/30 p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-teal-200">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Car size={22} className="text-teal-600" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">پارکینگ</h4>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-teal-300 transition-colors cursor-pointer group">
                        <input
                          type="checkbox"
                          name="has_parking"
                          checked={form.has_parking}
                          onChange={handleChange}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label className="text-sm font-semibold text-gray-900 cursor-pointer group-hover:text-indigo-600 transition-colors">
                          دارای پارکینگ
                        </label>
                      </div>
                      {form.has_parking && (
                        <FormField
                          label="تعداد پارکینگ"
                          name="parking_count"
                          type="number"
                          placeholder="تعداد پارکینگ"
                          value={form.parking_count}
                          onChange={handleChange}
                          min="1"
                          required
                          icon={Car}
                        />
                      )}
                    </div>
                    {errors.parking_count && (
                      <div className="mt-2 p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
                        <p className="text-red-600 text-sm font-medium">{errors.parking_count}</p>
                      </div>
                    )}
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-r-4 border-red-500 rounded-xl p-4 shadow-sm">
                      <p className="text-red-700 text-sm font-medium">{errors.submit}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-gray-200 mt-6">
                    {unitData?.is_suggested && (
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        className="px-6 py-3 border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        رد کردن
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {createLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <span>ارسال درخواست</span>
                          <Building size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    <Transition appear show={showRejectModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setShowRejectModal(false)}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 text-white">
                  <Dialog.Title as="h3" className="text-xl font-bold flex items-center gap-2">
                    <XCircle size={24} />
                    رد درخواست عضویت
                  </Dialog.Title>
                </div>

                <div className="p-6">
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      دلیل رد (اختیاری)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="اگر مایل هستید، دلیل رد درخواست را وارد کنید..."
                      rows={4}
                      className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm p-4 transition-all duration-200 hover:border-gray-300 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectionReason('');
                      }}
                      className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectSuggested}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      رد کردن
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    </>
  );
}
