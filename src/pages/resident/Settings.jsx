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
  updateNotificationSettings 
} from '../../features/settings/settingsSlice';

const ResidentSettings = () => {
  const dispatch = useDispatch();
  const { notificationSettings } = useSelector(state => state.settings);
  const { selectedResidentBuilding } = useSelector(state => state.buildings);
  
  const [formData, setFormData] = useState({
    // Notification settings
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    maintenance_notifications: true,
    financial_notifications: true,
    emergency_notifications: true,
    
    // Unit settings
    resident_count: 1,
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Load initial data
  useEffect(() => {
    if (selectedResidentBuilding) {
      dispatch(fetchNotificationSettings());
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
      await dispatch(updateNotificationSettings(formData)).unwrap();
      setHasUnsavedChanges(false);
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch {
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setIsSaving(false);
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
                id="email_notifications"
                label="اعلان‌های ایمیل"
                description="دریافت اطلاعیه‌ها از طریق ایمیل"
                checked={formData.email_notifications}
                onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
              />
              
              <NotificationToggle
                id="sms_notifications"
                label="اعلان‌های پیامک"
                description="دریافت اطلاعیه‌ها از طریق پیامک"
                checked={formData.sms_notifications}
                onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
              />
              
              <NotificationToggle
                id="push_notifications"
                label="اعلان‌های Push"
                description="دریافت اعلان‌های فوری در اپلیکیشن"
                checked={formData.push_notifications}
                onChange={(e) => handleInputChange('push_notifications', e.target.checked)}
              />
              
              <NotificationToggle
                id="maintenance_notifications"
                label="اعلان‌های تعمیرات"
                description="اطلاع از برنامه‌های تعمیرات و نگهداری"
                checked={formData.maintenance_notifications}
                onChange={(e) => handleInputChange('maintenance_notifications', e.target.checked)}
              />
              
              <NotificationToggle
                id="financial_notifications"
                label="اعلان‌های مالی"
                description="اطلاع از مسائل مالی و شارژ ساختمان"
                checked={formData.financial_notifications}
                onChange={(e) => handleInputChange('financial_notifications', e.target.checked)}
              />
              
              <NotificationToggle
                id="emergency_notifications"
                label="اعلان‌های اضطراری"
                description="اطلاع از شرایط اضطراری و مهم"
                checked={formData.emergency_notifications}
                onChange={(e) => handleInputChange('emergency_notifications', e.target.checked)}
              />
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