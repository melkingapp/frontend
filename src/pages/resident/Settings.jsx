import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Bell,
  Users,
  Home
} from 'lucide-react';

import SettingsSection from '../../shared/components/settings/SettingsSection';
import SettingsInput from '../../shared/components/settings/SettingsInput';
import NotificationToggle from '../../shared/components/settings/NotificationToggle';
import { 
  fetchNotificationSettings, 
  updateNotificationSettings,
  updateUnitResidentCount,
} from '../../features/settings/settingsSlice';
import SettingsService from '../../shared/services/settingsService';

const ResidentSettings = () => {
  const dispatch = useDispatch();
  const { notificationSettings, loading, error } = useSelector(state => state.settings);
  const { selectedResidentBuilding } = useSelector(state => state.buildings);
  
  const [formData, setFormData] = useState({
    // Notification settings
    telegram_enabled: true,
    sms_enabled: true,
    email_enabled: true,
    app_notification_enabled: true,
    payment_notifications: true,
    maintenance_notifications: true,
    meeting_notifications: true,
    general_notifications: true,
    
    // Unit settings
    resident_count: 1,
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [telegramStatus, setTelegramStatus] = useState(null);
  const [telegramCodeInfo, setTelegramCodeInfo] = useState(null);
  const [telegramLoading, setTelegramLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (selectedResidentBuilding) {
      dispatch(fetchNotificationSettings());
      // Telegram connection status
      (async () => {
        try {
          setTelegramLoading(true);
          const res = await SettingsService.getTelegramConnectionStatus();
          setTelegramStatus(res?.data || null);
        } catch (e) {
          // ignore (e.g., not configured)
          setTelegramStatus(null);
        } finally {
          setTelegramLoading(false);
        }
      })();
    }
  }, [dispatch, selectedResidentBuilding]);

  // Update form data when settings are loaded
  useEffect(() => {
    if (notificationSettings) {
      setFormData(prev => ({
        ...prev,
        ...notificationSettings,
        resident_count: selectedResidentBuilding?.resident_count || 1
      }));
    }
  }, [notificationSettings, selectedResidentBuilding]);

  // Warn about unsaved changes
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

  const validateForm = () => {
    const errors = {};
    
    if (formData.resident_count < 1 || formData.resident_count > 10) {
      errors.resident_count = 'تعداد ساکنان باید بین ۱ تا ۱۰ باشد';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) {
      toast.error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }

    setIsSaving(true);
    try {
      // Only send fields supported by backend serializer
      const notificationPayload = {
        telegram_enabled: formData.telegram_enabled,
        sms_enabled: formData.sms_enabled,
        email_enabled: formData.email_enabled,
        app_notification_enabled: formData.app_notification_enabled,
        payment_notifications: formData.payment_notifications,
        maintenance_notifications: formData.maintenance_notifications,
        meeting_notifications: formData.meeting_notifications,
        general_notifications: formData.general_notifications,
      };

      await dispatch(updateNotificationSettings(notificationPayload)).unwrap();

      // Update resident count if we can resolve building/unit identifiers
      const buildingId =
        selectedResidentBuilding?.building_id ??
        selectedResidentBuilding?.buildingId ??
        selectedResidentBuilding?.building?.building_id;
      const unitId =
        selectedResidentBuilding?.units_id ??
        selectedResidentBuilding?.unit_id ??
        selectedResidentBuilding?.unitId ??
        selectedResidentBuilding?.unit?.units_id;

      if (buildingId && unitId) {
        await dispatch(
          updateUnitResidentCount({
            buildingId,
            unitId,
            data: { resident_count: formData.resident_count },
          })
        ).unwrap();
      }
      setHasUnsavedChanges(false);
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetTelegramConnectionCode = async () => {
    try {
      setTelegramLoading(true);
      const res = await SettingsService.getTelegramConnectionCode();
      setTelegramCodeInfo(res?.data || null);
      toast.success('کد اتصال ساخته شد');
    } catch (e) {
      toast.error('خطا در دریافت کد اتصال تلگرام');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    try {
      setTelegramLoading(true);
      await SettingsService.disconnectTelegram();
      const res = await SettingsService.getTelegramConnectionStatus();
      setTelegramStatus(res?.data || null);
      setTelegramCodeInfo(null);
      toast.success('اتصال تلگرام قطع شد');
    } catch (e) {
      toast.error('خطا در قطع اتصال تلگرام');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleResetForm = () => {
    if (notificationSettings) {
      setFormData(prev => ({
        ...prev,
        ...notificationSettings,
        resident_count: selectedResidentBuilding?.resident_count || 1
      }));
      setHasUnsavedChanges(false);
      setValidationErrors({});
    }
  };

  if (!selectedResidentBuilding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ساختمان انتخاب نشده</h2>
          <p className="text-gray-600">لطفاً ابتدا یک ساختمان انتخاب کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظیمات ساکن</h1>
          <p className="text-gray-600">
            مدیریت تنظیمات شخصی و واحد مسکونی در {selectedResidentBuilding.title}
          </p>
          
          {hasUnsavedChanges && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 animate-fade-in">
              <AlertCircle size={20} className="text-amber-600" />
              <span className="text-amber-800 font-medium">تغییرات ذخیره نشده</span>
            </div>
          )}
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <SettingsSection
            title="تنظیمات اعلان‌ها"
            description="مدیریت نحوه دریافت اطلاعیه‌ها و اعلان‌ها"
            icon={Bell}
          >
            <div className="space-y-4">
              <NotificationToggle
                id="telegram_enabled"
                label="اعلان‌های تلگرام"
                description="دریافت اعلان‌ها از طریق بات تلگرام"
                checked={!!formData.telegram_enabled}
                onChange={(e) => handleInputChange('telegram_enabled', e.target.checked)}
              />

              <NotificationToggle
                id="email_enabled"
                label="اعلان‌های ایمیل"
                description="دریافت اطلاعیه‌ها از طریق ایمیل"
                checked={!!formData.email_enabled}
                onChange={(e) => handleInputChange('email_enabled', e.target.checked)}
              />
              
              <NotificationToggle
                id="sms_enabled"
                label="اعلان‌های پیامک"
                description="دریافت اطلاعیه‌ها از طریق پیامک"
                checked={!!formData.sms_enabled}
                onChange={(e) => handleInputChange('sms_enabled', e.target.checked)}
              />
              
              <NotificationToggle
                id="app_notification_enabled"
                label="اعلان‌های Push"
                description="دریافت اعلان‌های فوری در اپلیکیشن"
                checked={!!formData.app_notification_enabled}
                onChange={(e) => handleInputChange('app_notification_enabled', e.target.checked)}
              />
              
              <NotificationToggle
                id="maintenance_notifications"
                label="اعلان‌های تعمیرات"
                description="اطلاع از برنامه‌های تعمیرات و نگهداری"
                checked={!!formData.maintenance_notifications}
                onChange={(e) => handleInputChange('maintenance_notifications', e.target.checked)}
              />
              
              <NotificationToggle
                id="payment_notifications"
                label="اعلان‌های پرداخت"
                description="اطلاع از وضعیت پرداخت‌ها و شارژ"
                checked={!!formData.payment_notifications}
                onChange={(e) => handleInputChange('payment_notifications', e.target.checked)}
              />

              <NotificationToggle
                id="meeting_notifications"
                label="اعلان‌های جلسات"
                description="اطلاع از جلسات و نظرسنجی‌ها"
                checked={!!formData.meeting_notifications}
                onChange={(e) => handleInputChange('meeting_notifications', e.target.checked)}
              />

              <NotificationToggle
                id="general_notifications"
                label="اعلان‌های عمومی"
                description="اطلاعیه‌های عمومی مدیریت ساختمان"
                checked={!!formData.general_notifications}
                onChange={(e) => handleInputChange('general_notifications', e.target.checked)}
              />
            </div>
          </SettingsSection>

          {/* Telegram Connection */}
          <SettingsSection
            title="اتصال تلگرام"
            description="اتصال حساب شما به بات برای دریافت اعلان‌ها و استفاده از امکانات داخل تلگرام"
            icon={Bell}
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">وضعیت اتصال</div>
                    <div className="text-sm text-gray-600">
                      {telegramLoading
                        ? 'در حال بررسی...'
                        : telegramStatus?.connected
                          ? `✅ متصل (@${telegramStatus?.username || '—'})`
                          : '❌ متصل نیست'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {telegramStatus?.connected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectTelegram}
                        disabled={telegramLoading}
                        className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                      >
                        قطع اتصال
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGetTelegramConnectionCode}
                        disabled={telegramLoading}
                        className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
                      >
                        دریافت کد اتصال
                      </button>
                    )}
                  </div>
                </div>

                {!telegramStatus?.connected && telegramCodeInfo?.connection_code && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-700">
                      ۱) در تلگرام وارد بات شوید: <span className="font-mono">@{telegramCodeInfo.bot_username}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      ۲) این دستور را بزنید:
                      <div className="mt-2 rounded-lg bg-gray-50 border border-gray-200 p-3 font-mono text-sm">
                        /start {telegramCodeInfo.connection_code}
                      </div>
                    </div>
                    <a
                      href={`https://t.me/${telegramCodeInfo.bot_username}?start=${telegramCodeInfo.connection_code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-semibold"
                    >
                      باز کردن بات در تلگرام
                    </a>
                    {telegramCodeInfo.expires_at && (
                      <div className="text-xs text-gray-500">
                        انقضا: {new Date(telegramCodeInfo.expires_at).toLocaleString('fa-IR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </SettingsSection>

          {/* Unit Settings */}
          <SettingsSection
            title="تنظیمات واحد مسکونی"
            description="مدیریت اطلاعات واحد مسکونی شما"
            icon={Users}
          >
            <div className="space-y-6">
              <SettingsInput
                label="تعداد ساکنان واحد"
                id="resident_count"
                name="resident_count"
                type="number"
                value={formData.resident_count}
                onChange={(e) => handleInputChange('resident_count', parseInt(e.target.value) || 1)}
                error={validationErrors.resident_count}
                placeholder="تعداد ساکنان واحد را وارد کنید"
                helpText="تعداد افرادی که در این واحد زندگی می‌کنند (۱ تا ۱۰ نفر)"
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">اطلاعات واحد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">شماره واحد:</span>
                    <span className="text-blue-900 mr-2">{selectedResidentBuilding.unit_number || 'نامشخص'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">طبقه:</span>
                    <span className="text-blue-900 mr-2">{selectedResidentBuilding.floor || 'نامشخص'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">متراژ:</span>
                    <span className="text-blue-900 mr-2">{selectedResidentBuilding.area || 'نامشخص'} متر مربع</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">نوع واحد:</span>
                    <span className="text-blue-900 mr-2">{selectedResidentBuilding.unit_type || 'نامشخص'}</span>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={handleResetForm}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            بازنشانی
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save size={18} />
                ذخیره تغییرات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentSettings;