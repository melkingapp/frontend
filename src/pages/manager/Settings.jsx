import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
    Settings, Building, CreditCard, Bell, Shield, FileText, 
    Save, RefreshCw, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import SettingsSection from '../../shared/components/settings/SettingsSection';
import SettingsInput from '../../shared/components/settings/SettingsInput';
import DocumentUploader from '../../shared/components/settings/DocumentUploader';
import NotificationToggle from '../../shared/components/settings/NotificationToggle';
import {
    fetchBuildingSettings,
    updateBuildingSettings,
    fetchBuildingDocuments,
    fetchNotificationSettings,
    updateNotificationSettings,
} from '../../features/settings/settingsSlice';

const ManagerSettings = () => {
    const dispatch = useDispatch();
    const { buildingSettings, buildingDocuments, notificationSettings } = useSelector((state) => state.settings);
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
        
        // Postal code validation (should be 10 digits)
        if (formData.postal_code && !/^\d{10}$/.test(formData.postal_code)) {
            errors.postal_code = 'کد پستی باید ۱۰ رقم باشد';
        }
        
        // SHEBA number validation
        if (formData.fund_sheba_number && !/^IR\d{24}$/.test(formData.fund_sheba_number.toUpperCase())) {
            errors.fund_sheba_number = 'شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد';
        }
        
        // Card number validation (should be 16 digits)
        if (formData.bank_card_number && !/^\d{16}$/.test(formData.bank_card_number.replace(/\s/g, ''))) {
            errors.bank_card_number = 'شماره کارت باید ۱۶ رقم باشد';
        }
        
        // Payment due day validation
        if (formData.payment_due_day < 1 || formData.payment_due_day > 31) {
            errors.payment_due_day = 'روز سررسید باید بین ۱ تا ۳۱ باشد';
        }
        
        // Late payment penalty validation
        if (formData.late_payment_penalty_percentage < 0 || formData.late_payment_penalty_percentage > 100) {
            errors.late_payment_penalty_percentage = 'درصد جریمه باید بین ۰ تا ۱۰۰ باشد';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveBuildingSettings = async () => {
        if (!selectedBuildingId) {
            toast.error('لطفاً ابتدا یک ساختمان انتخاب کنید.');
            return;
        }
        
        if (!validateForm()) {
            toast.error('لطفاً خطاهای فرم را برطرف کنید.');
            return;
        }
        
        setIsSaving(true);
        try {
            await dispatch(updateBuildingSettings({
                buildingId: selectedBuildingId,
                data: formData
            })).unwrap();
            
            // Refresh building settings after successful update
            await dispatch(fetchBuildingSettings(selectedBuildingId));
            
            toast.success('تنظیمات ساختمان با موفقیت به‌روزرسانی شد.');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error updating building settings:', error);
            const errorMessage = error?.detail || error?.message || error?.error || error?.data?.error || 'خطای ناشناخته';
            toast.error(`خطا در به‌روزرسانی تنظیمات: ${errorMessage}`);
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

    const tabs = useMemo(() => [
        { id: 'building', label: 'اطلاعات ساختمان', icon: Building, description: 'مدیریت اطلاعات پایه ساختمان' },
        { id: 'payments', label: 'پرداخت‌ها', icon: CreditCard, description: 'تنظیمات مالی و بانکی' },
        { id: 'notifications', label: 'اعلان‌ها', icon: Bell, description: 'مدیریت اطلاع‌رسانی‌ها' },
        { id: 'documents', label: 'مدیریت اسناد', icon: FileText, description: 'آپلود و مدیریت فایل‌ها' },
        { id: 'security', label: 'امنیت و دسترسی', icon: Shield, description: 'تنظیمات امنیتی' },
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
                        <div className="animate-fade-in">
                            <SettingsSection
                                title="اطلاعات ساختمان"
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
                                <div className="mt-6 flex items-center gap-3">
                                    <button
                                        onClick={handleSaveBuildingSettings}
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={18} className="ml-2 animate-spin" />
                                                در حال ذخیره...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} className="ml-2" />
                                                ذخیره تغییرات
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleResetForm}
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="inline-flex items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <RefreshCw size={18} className="ml-2" />
                                        بازگشت به حالت اولیه
                                    </button>
                                </div>
                            </SettingsSection>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="animate-fade-in">
                            <SettingsSection
                                title="پرداخت‌های آنلاین و شارژ ساختمان"
                                description="تنظیمات مربوط به حساب بانکی، تاریخ سررسید و جریمه تأخیر"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <SettingsInput
                                            label="شماره شبا (برای واریز وجوه ساختمان)"
                                            id="fund_sheba_number"
                                            name="fund_sheba_number"
                                            value={formData.fund_sheba_number}
                                            onChange={handleInputChange}
                                            placeholder="مثال: IR000000000000000000000000"
                                            error={validationErrors.fund_sheba_number}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <SettingsInput
                                            label="شماره کارت (اختیاری)"
                                            id="bank_card_number"
                                            name="bank_card_number"
                                            value={formData.bank_card_number}
                                            onChange={handleInputChange}
                                            placeholder="مثال: 6037997500000000"
                                            error={validationErrors.bank_card_number}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">شماره کارت باید ۱۶ رقم باشد</p>
                                    </div>
                                    <SettingsInput
                                        label="روز سررسید شارژ"
                                        id="payment_due_day"
                                        name="payment_due_day"
                                        type="number"
                                        value={formData.payment_due_day}
                                        onChange={handleInputChange}
                                        placeholder="مثال: 5"
                                        error={validationErrors.payment_due_day}
                                    />
                                    <SettingsInput
                                        label="درصد جریمه تأخیر"
                                        id="late_payment_penalty_percentage"
                                        name="late_payment_penalty_percentage"
                                        type="number"
                                        value={formData.late_payment_penalty_percentage}
                                        onChange={handleInputChange}
                                        placeholder="مثال: 5"
                                        error={validationErrors.late_payment_penalty_percentage}
                                    />
                                </div>
                                <div className="mt-6 flex items-center gap-3">
                                    <button
                                        onClick={handleSaveBuildingSettings}
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={18} className="ml-2 animate-spin" />
                                                در حال ذخیره...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} className="ml-2" />
                                                ذخیره تغییرات
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleResetForm}
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="inline-flex items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <RefreshCw size={18} className="ml-2" />
                                        بازگشت به حالت اولیه
                                    </button>
                                </div>
                            </SettingsSection>
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

                    {activeTab === 'security' && (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerSettings;
