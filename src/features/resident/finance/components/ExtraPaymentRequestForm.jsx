import { useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Upload, DollarSign, FileText, Calendar, Image as ImageIcon, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import moment from "moment-jalaali";
import { createExtraPaymentRequest } from "../../../manager/finance/store/slices/extraPaymentSlice";
import { selectSelectedResidentBuilding, selectApprovedBuildings } from "../../../resident/building/residentBuildingSlice";
import { selectSelectedBuilding } from "../../../manager/building/buildingSlice";
import { useAllApprovedUnits } from "../../../resident/building/hooks/useApprovedRequests";
import PersianDatePicker from "../../../../shared/components/shared/inputs/PersianDatePicker";
import { formatNumber } from "../../../../shared/utils/helper";

moment.loadPersian({ dialect: "persian-modern" });

export default function ExtraPaymentRequestForm({ isOpen, onClose, onSuccess }) {
    const dispatch = useDispatch();
    // Support both resident and manager building selectors
    const residentBuilding = useSelector(selectSelectedResidentBuilding);
    const managerBuilding = useSelector(selectSelectedBuilding);
    const approvedBuildings = useSelector(selectApprovedBuildings);
    const allApprovedUnits = useAllApprovedUnits();
    
    // Try to find building with building_id from approvedBuildings or allApprovedUnits
    const buildingWithId = useMemo(() => {
        // First try manager building
        if (managerBuilding?.building_id || managerBuilding?.id) {
            return managerBuilding;
        }
        
        // Then try to find resident building with building_id from approvedBuildings or allApprovedUnits
        if (residentBuilding) {
            // Try to find matching building from approvedBuildings that has building_id
            const matchingBuilding = approvedBuildings.find(b => {
                if (b.building_id || b.id) {
                    return (
                        (b.building_id || b.id) === (residentBuilding.building_id || residentBuilding.id) ||
                        b.building_code === residentBuilding.building_code ||
                        b.title === residentBuilding.title
                    );
                }
                return false;
            });
            if (matchingBuilding && (matchingBuilding.building_id || matchingBuilding.id)) {
                return matchingBuilding;
            }
            
            // Try to find from allApprovedUnits
            const matchingUnit = allApprovedUnits.find(b => {
                if (b.building_id) {
                    return (
                        b.building_id === residentBuilding.building_id ||
                        b.building_code === residentBuilding.building_code ||
                        b.title === residentBuilding.title ||
                        // Extract building_id from residentBuilding.id if it's a string like "2-5"
                        (residentBuilding.id && typeof residentBuilding.id === 'string' && 
                         residentBuilding.id.split('-')[0] === b.building_id.toString())
                    );
                }
                return false;
            });
            if (matchingUnit && matchingUnit.building_id) {
                return matchingUnit;
            }
        }
        
        // Fallback: try first building from approvedBuildings or allApprovedUnits
        if (approvedBuildings.length > 0 && approvedBuildings[0].building_id) {
            return approvedBuildings[0];
        }
        if (allApprovedUnits.length > 0 && allApprovedUnits[0].building_id) {
            return allApprovedUnits[0];
        }
        
        // Last fallback to residentBuilding or managerBuilding
        return residentBuilding || managerBuilding;
    }, [residentBuilding, managerBuilding, approvedBuildings, allApprovedUnits]);
    
    const building = buildingWithId;
    const user = useSelector((state) => state.auth.user);
    const { creating, error } = useSelector((state) => state.extraPayment);

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        payment_date: "",
        description: "",
        attachment: null
    });

    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleDateChange = (date) => {
        let gregorianDate = '';
        if (date) {
            try {
                // Handle different date formats from react-multi-date-picker
                if (date.toDate) {
                    // DateObject from react-multi-date-picker
                    const jsDate = date.toDate();
                    gregorianDate = moment(jsDate).format('YYYY-MM-DD');
                } else if (date instanceof Date) {
                    gregorianDate = moment(date).format('YYYY-MM-DD');
                } else if (typeof date === 'string') {
                    // String format (jYYYY/jMM/jDD)
                    const persianMoment = moment(date, 'jYYYY/jMM/jDD');
                    if (persianMoment.isValid()) {
                        gregorianDate = persianMoment.format('YYYY-MM-DD');
                    } else {
                        gregorianDate = moment(date).format('YYYY-MM-DD');
                    }
                } else if (date.year && date.month && date.day) {
                    // Object with year, month, day
                    const persianMoment = moment().jYear(date.year).jMonth(date.month.number - 1).jDate(date.day);
                    gregorianDate = persianMoment.format('YYYY-MM-DD');
                } else if (date.format) {
                    // DateObject with format method
                    gregorianDate = moment(date.format("YYYY-MM-DD")).format('YYYY-MM-DD');
                }
            } catch (error) {
                console.error('Error converting date:', error);
            }
        }
        
        setFormData((prev) => ({
            ...prev,
            payment_date: gregorianDate
        }));
        
        if (errors.payment_date) {
            setErrors((prev) => ({
                ...prev,
                payment_date: ""
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('لطفاً فقط فایل تصویری انتخاب کنید');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
                return;
            }
            
            setFormData((prev) => ({
                ...prev,
                attachment: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            attachment: null
        }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "نام هزینه الزامی است";
        }

        if (!formData.amount || parseFloat(formData.amount.replace(/,/g, "")) <= 0) {
            newErrors.amount = "مبلغ باید بیشتر از صفر باشد";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Extract building_id - building should have building_id from useMemo above
        let buildingId = null;
        if (building) {
            // First check building_id directly (should always be available after useMemo)
            if (building.building_id !== undefined && building.building_id !== null && building.building_id !== 'undefined') {
                // Convert to number if it's a string
                const parsed = typeof building.building_id === 'number' 
                    ? building.building_id 
                    : parseInt(building.building_id);
                if (!isNaN(parsed)) {
                    buildingId = parsed;
                }
            }
            
            // Fallback: try id field (for manager buildings)
            if (!buildingId && building.id && typeof building.id === 'number') {
                buildingId = building.id;
            }
        }
        
        // Validate that buildingId is a valid number
        if (!buildingId || isNaN(buildingId)) {
            console.error("Building structure:", building);
            console.error("Resident building:", residentBuilding);
            console.error("Approved buildings:", approvedBuildings);
            console.error("All approved units:", allApprovedUnits);
            console.error("Extracted buildingId:", buildingId);
            toast.error("لطفاً ابتدا یک ساختمان انتخاب کنید. شناسه ساختمان یافت نشد.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            // Parse amount با بررسی خطا
            let parsedAmount = formData.amount;
            if (typeof parsedAmount === 'string') {
                const cleanedAmount = parsedAmount.replace(/,/g, "").trim();
                if (cleanedAmount === '') {
                    toast.error("لطفاً مبلغ را وارد کنید");
                    return;
                }
                parsedAmount = parseFloat(cleanedAmount);
                if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
                    toast.error("مبلغ وارد شده نامعتبر است");
                    return;
                }
            }
            
            const submitData = {
                title: formData.title.trim(),
                amount: parsedAmount, // حالا یک number معتبر است
                payment_date: formData.payment_date || undefined,
                description: formData.description.trim() || undefined,
                attachment: formData.attachment || undefined
            };

            console.log('🔵 [ExtraPaymentRequestForm] Submitting data:', {
                buildingId,
                submitData: {
                    ...submitData,
                    attachment: submitData.attachment ? {
                        name: submitData.attachment.name,
                        size: submitData.attachment.size,
                        type: submitData.attachment.type
                    } : null
                }
            });

            // اگر کاربر مدیر است، باید user_id را ارسال کنیم
            if (user?.role === 'manager' && user?.id) {
                submitData.user_id = user.id;
            }

            await dispatch(createExtraPaymentRequest({
                buildingId: buildingId,
                data: submitData
            })).unwrap();

            toast.success("درخواست پرداخت اضافی با موفقیت ثبت شد");
            
            // Reset form
            setFormData({
                title: "",
                amount: "",
                payment_date: "",
                description: "",
                attachment: null
            });
            setImagePreview(null);
            setErrors({});
            
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error creating extra payment request:", error);
            toast.error(error || "خطا در ثبت درخواست");
        }
    };

    const handleClose = () => {
        setFormData({
            title: "",
            amount: "",
            payment_date: "",
            description: "",
            attachment: null
        });
        setImagePreview(null);
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    const displayDate = formData.payment_date 
        ? moment(formData.payment_date).format("jYYYY/jMM/jDD")
        : "";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">ثبت درخواست پرداخت اضافی</h2>
                                <p className="text-sm text-gray-600">ثبت پرداخت انجام شده خارج از سیستم</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">خطا</span>
                            </div>
                            <p className="text-red-600 mt-1">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* نام هزینه */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                نام هزینه <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="مثال: خرید لامپ راه‌پله"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* مبلغ */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                مبلغ (تومان) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="amount"
                                value={formatNumber(formData.amount.replace(/,/g, ""))}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/,/g, "");
                                    if (/^\d*$/.test(value)) {
                                        handleInputChange({ target: { name: "amount", value } });
                                    }
                                }}
                                placeholder="مثال: 500000"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.amount ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.amount && (
                                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                            )}
                        </div>

                        {/* تاریخ پرداخت */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                تاریخ پرداخت
                            </label>
                            <PersianDatePicker
                                value={displayDate}
                                onChange={handleDateChange}
                                placeholder="تاریخ پرداخت را انتخاب کنید"
                            />
                            {errors.payment_date && (
                                <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>
                            )}
                        </div>

                        {/* آپلود فیش */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                تصویر فیش پرداخت
                            </label>
                            <div className="space-y-2">
                                {!imagePreview ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                    >
                                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-600">
                                            برای آپلود تصویر فیش کلیک کنید
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            فرمت‌های مجاز: JPG, PNG (حداکثر 5 مگابایت)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="پیش‌نمایش فیش"
                                            className="w-full h-48 object-contain rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* توضیحات */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                توضیحات (اختیاری)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="توضیحات اضافی در مورد پرداخت..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={creating}
                                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                انصراف
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        در حال ثبت...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        ثبت درخواست
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

