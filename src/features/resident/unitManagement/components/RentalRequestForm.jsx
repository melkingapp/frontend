import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../../shared/components/shared/feedback/Button';
import { API_CONFIG } from '../../../../config/api';
import { createRequest } from '../../../manager/unitManagement/slices/requestsSlice';
import { User, Building, Home, Phone, MessageSquare, CheckCircle, AlertCircle, X } from 'lucide-react';

const RentalRequestForm = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { createLoading, error } = useSelector(state => state.requests);

  const [formData, setFormData] = useState({
    building_code: '',
    unit_number: '',
    tenant_full_name: '',
    tenant_phone_number: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // پاک کردن خطای مربوطه
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.building_code.trim()) {
      newErrors.building_code = 'کد ساختمان الزامی است';
    }

    if (!formData.unit_number.trim()) {
      newErrors.unit_number = 'شماره واحد الزامی است';
    }

    if (!formData.tenant_full_name.trim()) {
      newErrors.tenant_full_name = 'نام و نام خانوادگی مستاجر الزامی است';
    }

    if (!formData.tenant_phone_number.trim()) {
      newErrors.tenant_phone_number = 'شماره تماس مستاجر الزامی است';
    } else if (!/^09\d{9}$/.test(formData.tenant_phone_number)) {
      newErrors.tenant_phone_number = 'شماره تماس باید با 09 شروع شود و 11 رقم باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(createRequest({ buildingId: null, requestData: formData })).unwrap();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating rental request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, name, type = "text", placeholder, value, onChange, error, required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">درخواست اجاره واحد</h2>
                <p className="text-sm text-gray-600">ارسال درخواست اجاره برای واحد مورد نظر</p>
              </div>
            </div>
            <button
              onClick={onCancel}
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
            {/* اطلاعات ساختمان */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">اطلاعات ساختمان</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="کد ساختمان"
                  name="building_code"
                  placeholder="کد ساختمان را وارد کنید"
                  value={formData.building_code}
                  onChange={handleInputChange}
                  error={errors.building_code}
                  required
                />
                
                <FormField
                  label="شماره واحد"
                  name="unit_number"
                  placeholder="شماره واحد را وارد کنید"
                  value={formData.unit_number}
                  onChange={handleInputChange}
                  error={errors.unit_number}
                  required
                />
              </div>
            </div>

            {/* اطلاعات مستاجر */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">اطلاعات مستاجر</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="نام و نام خانوادگی"
                  name="tenant_full_name"
                  placeholder="نام و نام خانوادگی مستاجر"
                  value={formData.tenant_full_name}
                  onChange={handleInputChange}
                  error={errors.tenant_full_name}
                  required
                />
                
                <FormField
                  label="شماره تماس"
                  name="tenant_phone_number"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={formData.tenant_phone_number}
                  onChange={handleInputChange}
                  error={errors.tenant_phone_number}
                  required
                />
              </div>
            </div>

            {/* پیام اضافی */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">پیام اضافی (اختیاری)</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="message">
                  پیام
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="پیام اضافی برای مالک..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createLoading || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {createLoading || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    ارسال درخواست
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestForm;
