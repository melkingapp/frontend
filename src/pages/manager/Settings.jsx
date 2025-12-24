import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
    Settings, Building, Bell, FileText, 
    Save, RefreshCw, AlertCircle, Loader2, CreditCard
} from 'lucide-react';
import SettingsSection from '../../shared/components/settings/SettingsSection';
import SettingsInput from '../../shared/components/settings/SettingsInput';
import DocumentUploader from '../../shared/components/settings/DocumentUploader';
import NotificationToggle from '../../shared/components/settings/NotificationToggle';
import ShebaInputGroupSettings from '../../shared/components/shared/inputs/ShebaInputGroupSettings';
import BankCardInputSettings from '../../shared/components/shared/inputs/BankCardInputSettings';
import {
    fetchBuildingSettings,
    updateBuildingSettings,
    fetchBuildingDocuments,
    deleteBuildingDocument,
    fetchNotificationSettings,
    updateNotificationSettings,
    fetchFinancialVisibilitySettings,
    toggleDebtCreditVisibilitySetting,
    toggleFinancialTransactionsVisibilitySetting,
} from '../../features/settings/settingsSlice';

const ManagerSettings = () => {
    const dispatch = useDispatch();
    const { buildingSettings, buildingDocuments, notificationSettings, financialVisibility, loading, error } = useSelector((state) => state.settings);
    const { selectedBuildingId, data: buildings } = useSelector((state) => state.building);
    
    const [activeTab, setActiveTab] = useState('building');
    const [formData, setFormData] = useState({
        title: '',
        province: '',
        city: '',
        address: '',
        postal_code: '',
        fund_sheba_number: '',
        bank_card_number: '',
        payment_due_day: 1,
        late_payment_penalty_percentage: 0,
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Find selected building from buildings list
    const selectedBuilding = buildings.find(b => b.building_id === selectedBuildingId);

    useEffect(() => {
        if (selectedBuildingId) {
            dispatch(fetchBuildingSettings(selectedBuildingId));
            dispatch(fetchBuildingDocuments(selectedBuildingId));
            dispatch(fetchNotificationSettings());
            dispatch(fetchFinancialVisibilitySettings(selectedBuildingId));
        }
    }, [dispatch, selectedBuildingId]);

    useEffect(() => {
        // First try to load from buildingSettings (from API)
        if (buildingSettings) {
            setFormData({
                title: buildingSettings.title || '',
                province: buildingSettings.province || '',
                city: buildingSettings.city || '',
                address: buildingSettings.address || '',
                postal_code: buildingSettings.postal_code || '',
                fund_sheba_number: buildingSettings.fund_sheba_number || '',
                bank_card_number: buildingSettings.bank_card_number || '',
                payment_due_day: buildingSettings.payment_due_day || 1,
                late_payment_penalty_percentage: buildingSettings.late_payment_penalty_percentage || 0,
            });
            setHasUnsavedChanges(false);
            setValidationErrors({});
        } 
        // Fallback: if buildingSettings is not loaded yet but we have selectedBuilding, use it
        else if (selectedBuilding && !buildingSettings && selectedBuildingId) {
            setFormData({
                title: selectedBuilding.title || '',
                province: selectedBuilding.province || '',
                city: selectedBuilding.city || '',
                address: selectedBuilding.address || '',
                postal_code: selectedBuilding.postal_code || '',
                fund_sheba_number: selectedBuilding.fund_sheba_number || '',
                bank_card_number: selectedBuilding.bank_card_number || '',
                payment_due_day: selectedBuilding.payment_due_day || 1,
                late_payment_penalty_percentage: selectedBuilding.late_payment_penalty_percentage || 0,
            });
        }
    }, [buildingSettings, selectedBuilding, selectedBuildingId]);

    // Warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setHasUnsavedChanges(true);
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Validate all building-related fields when in building tab
        if (activeTab === 'building') {
            // Validate building info fields
            if (formData.postal_code && formData.postal_code.trim() !== '' && !/^\d{10}$/.test(formData.postal_code)) {
                errors.postal_code = 'کد پستی باید ۱۰ رقم باشد';
            }
            
            // Validate payment fields
            if (formData.fund_sheba_number && formData.fund_sheba_number.trim() !== '' && !/^IR\d{24}$/.test(formData.fund_sheba_number.toUpperCase())) {
                errors.fund_sheba_number = 'شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد';
            }
            
            if (formData.bank_card_number && formData.bank_card_number.trim() !== '' && !/^\d{16}$/.test(formData.bank_card_number)) {
                errors.bank_card_number = 'شماره کارت باید ۱۶ رقم باشد';
            }
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveBuildingSettings = async () => {
        if (!selectedBuildingId) {
            toast.error('لطفاً ابتدا یک ساختمان انتخاب کنید.');
            return;
        }
        
        const isValid = validateForm();
        if (!isValid) {
            // Show specific validation errors
            const errorFields = Object.entries(validationErrors);
            if (errorFields.length > 0) {
                errorFields.forEach(([field, message]) => {
                    // Map field names to Persian labels
                    const fieldLabels = {
                        postal_code: 'کد پستی',
                        fund_sheba_number: 'شماره شبا',
                        bank_card_number: 'شماره کارت',
                        province: 'استان',
                        city: 'شهر',
                        address: 'آدرس',
                        title: 'عنوان ساختمان'
                    };
                    const fieldLabel = fieldLabels[field] || field;
                    toast.error(`❌ ${fieldLabel}: ${message}`, {
                        duration: 4000
                    });
                });
            } else {
                toast.error('لطفاً خطاهای فرم را برطرف کنید.');
            }
            return;
        }
        
        setIsSaving(true);
        try {
            const result = await dispatch(updateBuildingSettings({
                buildingId: selectedBuildingId,
                data: formData
            })).unwrap();
            
            // Refresh building settings after successful update
            await dispatch(fetchBuildingSettings(selectedBuildingId));
            
            toast.success('✅ تنظیمات ساختمان با موفقیت به‌روزرسانی شد.');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error updating building settings:', error);
            console.error('Full error details:', JSON.stringify(error, null, 2));
            
            // Handle validation errors from backend
            if (error && typeof error === 'object') {
                // Check if error contains field-specific validation errors
                const fieldErrors = Object.keys(error).filter(key => 
                    key !== 'detail' && key !== 'message' && key !== 'error' && Array.isArray(error[key])
                );
                
                if (fieldErrors.length > 0) {
                    fieldErrors.forEach(field => {
                        const fieldLabels = {
                            fund_sheba_number: 'شماره شبا',
                            bank_card_number: 'شماره کارت',
                            postal_code: 'کد پستی'
                        };
                        const fieldLabel = fieldLabels[field] || field;
                        const errorMessages = error[field];
                        if (Array.isArray(errorMessages)) {
                            errorMessages.forEach(msg => {
                                toast.error(`❌ ${fieldLabel}: ${msg}`);
                            });
                        }
                    });
                    return;
                }
            }
            
            const errorMessage = error?.detail || error?.message || error?.error || error?.data?.error || 'خطای ناشناخته';
            toast.error(`❌ خطا در به‌روزرسانی تنظیمات: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetForm = () => {
        if (buildingSettings) {
            setFormData({
                title: buildingSettings.title || '',
                province: buildingSettings.province || '',
                city: buildingSettings.city || '',
                address: buildingSettings.address || '',
                postal_code: buildingSettings.postal_code || '',
                fund_sheba_number: buildingSettings.fund_sheba_number || '',
                bank_card_number: buildingSettings.bank_card_number || '',
                payment_due_day: buildingSettings.payment_due_day || 1,
                late_payment_penalty_percentage: buildingSettings.late_payment_penalty_percentage || 0,
            });
            setHasUnsavedChanges(false);
            setValidationErrors({});
            toast.info('فرم به حالت اولیه بازگشت.');
        }
    };

    const handleNotificationChange = async (field, value) => {
        try {
            await dispatch(updateNotificationSettings({
                [field]: value
            })).unwrap();
            toast.success('تنظیمات اعلان با موفقیت به‌روزرسانی شد.');
        } catch (error) {
            toast.error(`خطا در به‌روزرسانی تنظیمات اعلان: ${error.detail || error.message || 'خطای ناشناخته'}`);
        }
    };

    const handleFinancialVisibilityChange = async (field, value) => {
        if (!selectedBuildingId) {
            toast.error('لطفاً ابتدا یک ساختمان انتخاب کنید.');
            return;
        }

        try {
            if (field === 'show_financial_transactions_to_residents') {
                await dispatch(
                    toggleFinancialTransactionsVisibilitySetting({
                        buildingId: selectedBuildingId,
                        showToResidents: value,
                    })
                ).unwrap();
                toast.success('دسترسی به گردش مالی واحدها با موفقیت به‌روزرسانی شد.');
            } else if (field === 'show_debt_credit_to_residents') {
                await dispatch(
                    toggleDebtCreditVisibilitySetting({
                        buildingId: selectedBuildingId,
                        showToResidents: value,
                    })
                ).unwrap();
                toast.success('دسترسی به بدهکاری/بستانکاری با موفقیت به‌روزرسانی شد.');
            }
        } catch (error) {
            const message = error?.detail || error?.message || 'خطا در به‌روزرسانی تنظیمات دسترسی مالی';
            toast.error(message);
        }
    };

    const tabs = useMemo(() => [
        { id: 'building', label: 'اطلاعات ساختمان', icon: Building, description: 'مدیریت اطلاعات پایه و مالی ساختمان' },
        { id: 'financial', label: 'تنظیمات مالی', icon: CreditCard, description: 'کنترل سطح دسترسی به گزارش‌های مالی' },
        { id: 'notifications', label: 'اعلان‌ها', icon: Bell, description: 'مدیریت اطلاع‌رسانی‌ها' },
        { id: 'documents', label: 'مدیریت اسناد', icon: FileText, description: 'آپلود و مدیریت فایل‌ها' },
        // { id: 'security', label: 'امنیت و دسترسی', icon: Shield, description: 'تنظیمات امنیتی' },
    ], []);

    if (!selectedBuildingId || !selectedBuilding) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">ساختمانی انتخاب نشده</h2>
                    <p className="text-gray-600">لطفاً ابتدا یک ساختمان از منوی بالا انتخاب کنید.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Settings size={32} className="ml-3 text-indigo-600" />
                                تنظیمات ساختمان
                            </h1>
                            <p className="text-gray-600 mt-2">مدیریت تنظیمات کلی ساختمان، پرداخت‌ها، اعلان‌ها و اسناد</p>
                        </div>
                        {hasUnsavedChanges && (
                            <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 animate-pulse">
                                <AlertCircle size={20} className="text-yellow-600 ml-2" />
                                <span className="text-sm text-yellow-800 font-medium">تغییرات ذخیره نشده</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <nav className="flex overflow-x-auto border-b border-gray-200" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-center font-medium transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'text-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center">
                                        <Icon size={20} className="ml-2" />
                                        <span className="text-sm whitespace-nowrap">{tab.label}</span>
                                    </div>
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 transition-all duration-200" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'building' && (
                        <div className="animate-fade-in space-y-6">
                            {/* بخش اول: اطلاعات پایه */}
                            <SettingsSection
                                title="اطلاعات پایه ساختمان"
                                description="مشخصات کلی ساختمان مانند نام، آدرس و نوع کاربری"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <SettingsInput
                                            label="نام/عنوان ساختمان"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            disabled={true}
                                            error={validationErrors.title}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">نام ساختمان در زمان ایجاد تنظیم می‌شود و قابل تغییر نیست</p>
                                    </div>
                                    <SettingsInput
                                        label="استان"
                                        id="province"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleInputChange}
                                        placeholder="مثال: تهران"
                                        error={validationErrors.province}
                                    />
                                    <SettingsInput
                                        label="شهر"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="مثال: تهران"
                                        error={validationErrors.city}
                                    />
                                    <div className="md:col-span-2">
                                        <SettingsInput
                                            label="آدرس دقیق"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="مثال: خیابان ولیعصر، کوچه اول، پلاک 10"
                                            error={validationErrors.address}
                                        />
                                    </div>
                                    <SettingsInput
                                        label="کد پستی"
                                        id="postal_code"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleInputChange}
                                        placeholder="مثال: 1234567890"
                                        error={validationErrors.postal_code}
                                    />
                                </div>
                            </SettingsSection>

                            {/* بخش دوم: اطلاعات مالی */}
                            <SettingsSection
                                title="اطلاعات مالی و بانکی"
                                description="تنظیمات مربوط به حساب بانکی ساختمان"
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            شماره شبا (برای واریز وجوه ساختمان)
                                        </label>
                                        <ShebaInputGroupSettings
                                            value={formData.fund_sheba_number}
                                            onChange={(value) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    fund_sheba_number: value
                                                }));
                                                setHasUnsavedChanges(true);
                                                if (validationErrors.fund_sheba_number) {
                                                    setValidationErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.fund_sheba_number;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            error={validationErrors.fund_sheba_number}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            شماره کارت (اختیاری)
                                        </label>
                                        <BankCardInputSettings
                                            value={formData.bank_card_number}
                                            onChange={(value) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    bank_card_number: value
                                                }));
                                                setHasUnsavedChanges(true);
                                                if (validationErrors.bank_card_number) {
                                                    setValidationErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.bank_card_number;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            error={validationErrors.bank_card_number}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">شماره کارت باید ۱۶ رقم باشد</p>
                                    </div>
                                </div>
                            </SettingsSection>

                            {/* دکمه‌های ذخیره و بازگشت - فقط یکبار در پایین */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg p-8 border border-indigo-100">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">ذخیره تغییرات</h3>
                                        <p className="text-sm text-gray-600">
                                            تمامی تغییرات در اطلاعات پایه و مالی ساختمان با هم ذخیره می‌شوند
                                        </p>
                                        {hasUnsavedChanges && (
                                            <div className="mt-2 flex items-center gap-2 text-amber-600">
                                                <AlertCircle size={16} />
                                                <span className="text-xs font-medium">شما تغییرات ذخیره نشده دارید</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={handleResetForm}
                                            disabled={isSaving || !hasUnsavedChanges}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-3 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                                        >
                                            <RefreshCw size={18} className="ml-2" />
                                            بازگشت
                                        </button>
                                        <button
                                            onClick={handleSaveBuildingSettings}
                                            disabled={isSaving || !hasUnsavedChanges}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border-2 border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 size={20} className="ml-2 animate-spin" />
                                                    در حال ذخیره...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={20} className="ml-2" />
                                                    ذخیره تغییرات
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && notificationSettings && (
                        <div className="animate-fade-in">
                            <SettingsSection
                                title="اعلان‌ها و اطلاعیه‌ها"
                                description="تنظیمات مربوط به روش‌های دریافت اعلان و نوع اطلاعیه‌ها"
                            >
                    <NotificationToggle
                        id="sms_enabled"
                        label="اعلان پیامکی"
                        description="دریافت اعلان‌ها از طریق پیامک"
                        checked={notificationSettings.sms_enabled}
                        onChange={(e) => handleNotificationChange('sms_enabled', e.target.checked)}
                    />
                    <NotificationToggle
                        id="email_enabled"
                        label="اعلان ایمیلی"
                        description="دریافت اعلان‌ها از طریق ایمیل"
                        checked={notificationSettings.email_enabled}
                        onChange={(e) => handleNotificationChange('email_enabled', e.target.checked)}
                    />
                    <NotificationToggle
                        id="app_notification_enabled"
                        label="اعلان درون برنامه‌ای"
                        description="دریافت اعلان‌ها در داخل اپلیکیشن"
                        checked={notificationSettings.app_notification_enabled}
                        onChange={(e) => handleNotificationChange('app_notification_enabled', e.target.checked)}
                    />
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-md font-medium text-gray-800 mb-2">نوع اعلان‌ها:</h3>
                        <NotificationToggle
                            id="payment_notifications"
                            label="اعلان‌های پرداخت"
                            description="یادآوری سررسید شارژ و هزینه‌ها"
                            checked={notificationSettings.payment_notifications}
                            onChange={(e) => handleNotificationChange('payment_notifications', e.target.checked)}
                        />
                        <NotificationToggle
                            id="maintenance_notifications"
                            label="اعلان‌های نگهداری و تعمیرات"
                            description="اطلاع‌رسانی در مورد تعمیرات و نگهداری ساختمان"
                            checked={notificationSettings.maintenance_notifications}
                            onChange={(e) => handleNotificationChange('maintenance_notifications', e.target.checked)}
                        />
                        <NotificationToggle
                            id="meeting_notifications"
                            label="اعلان‌های جلسات"
                            description="اطلاع‌رسانی در مورد جلسات مدیریت و ساکنین"
                            checked={notificationSettings.meeting_notifications}
                            onChange={(e) => handleNotificationChange('meeting_notifications', e.target.checked)}
                        />
                        <NotificationToggle
                            id="general_notifications"
                            label="اعلان‌های عمومی"
                            description="اطلاعیه‌های عمومی مدیریت ساختمان"
                            checked={notificationSettings.general_notifications}
                            onChange={(e) => handleNotificationChange('general_notifications', e.target.checked)}
                        />
                                </div>
                            </SettingsSection>
                        </div>
                    )}

                    {activeTab === 'financial' && financialVisibility && (
                        <div className="animate-fade-in">
                            <SettingsSection
                                title="تنظیمات دسترسی مالی"
                                description="کنترل کنید کدام گزارش‌های مالی برای ساکنین قابل مشاهده باشد"
                            >
                                <div className="space-y-6">
                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                            دسترسی به گردش مالی واحدها
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-3">
                                            اگر این گزینه فعال باشد، ساکنان (غیر مالک) در صورت داشتن دسترسی، گردش مالی واحدهای دیگر را هم می‌بینند.
                                        </p>
                                        <NotificationToggle
                                            id="show_financial_transactions_to_residents"
                                            label="نمایش گردش مالی واحدها به ساکنین"
                                            description="نمایش گزارش گردش مالی واحدها برای ساکنین ساختمان"
                                            checked={!!financialVisibility.show_financial_transactions_to_residents}
                                            onChange={(e) =>
                                                handleFinancialVisibilityChange(
                                                    'show_financial_transactions_to_residents',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                            دسترسی به بدهکاری و بستانکاری واحدها
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-3">
                                            با فعال بودن این گزینه، ساکنین می‌توانند گزارش تجمیعی بدهکار و بستانکار بودن واحدها را ببینند.
                                        </p>
                                        <NotificationToggle
                                            id="show_debt_credit_to_residents"
                                            label="نمایش بدهکاری/بستانکاری واحدها به ساکنین"
                                            description="نمایش گزارش بدهکاری و بستانکاری واحدها برای ساکنین ساختمان"
                                            checked={!!financialVisibility.show_debt_credit_to_residents}
                                            onChange={(e) =>
                                                handleFinancialVisibilityChange(
                                                    'show_debt_credit_to_residents',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </SettingsSection>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="animate-fade-in">
                            <SettingsSection
                                title="مدیریت اسناد"
                                description="آپلود و مدیریت اسناد ساختمان"
                            >
                                <DocumentUploader
                                    buildingId={selectedBuildingId}
                                    documents={buildingDocuments}
                                    onDocumentUploaded={() => dispatch(fetchBuildingDocuments(selectedBuildingId))}
                                    onDocumentDeleted={() => dispatch(fetchBuildingDocuments(selectedBuildingId))}
                                />
                            </SettingsSection>
                        </div>
                    )}

                    {/* {activeTab === 'security' && (
                        <div className="animate-fade-in">
                            <SettingsSection
                                title="امنیت و دسترسی"
                                description="تنظیمات مربوط به رمز عبور، احراز هویت دو مرحله‌ای و سطوح دسترسی"
                            >
                                <div className="text-center py-12">
                                    <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">به زودی...</h3>
                                    <p className="text-sm text-gray-500">این بخش در حال توسعه است و به زودی در دسترس خواهد بود.</p>
                                </div>
                            </SettingsSection>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default ManagerSettings;
