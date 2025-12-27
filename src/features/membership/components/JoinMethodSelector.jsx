import { useState } from 'react';
import { Building, Phone, Users, ArrowLeft } from 'lucide-react';
import MembershipRequestForm from './MembershipRequestForm';
import JoinByManagerPhoneForm from './JoinByManagerPhoneForm';

export default function JoinMethodSelector({ onClose }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const joinMethods = [
    {
      id: 'building_code',
      title: 'عضویت با کد ساختمان',
      description: 'کد ساختمان را دارید؟ سریع‌ترین روش عضویت',
      icon: <Building className="w-8 h-8 text-blue-600" />,
      color: 'blue'
    },
    {
      id: 'manager_phone',
      title: 'عضویت با شماره مدیر',
      description: 'شماره تلفن مدیر ساختمان را دارید؟',
      icon: <Phone className="w-8 h-8 text-green-600" />,
      color: 'green'
    }
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  const handleSuccess = (response) => {
    // Handle successful join
    console.log('Join successful:', response);
    onClose?.();
  };

  if (selectedMethod === 'building_code') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">عضویت با کد ساختمان</h2>
        </div>
        <MembershipRequestForm onSuccess={handleSuccess} />
      </div>
    );
  }

  if (selectedMethod === 'manager_phone') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">عضویت با شماره مدیر</h2>
        </div>
        <JoinByManagerPhoneForm onSuccess={handleSuccess} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">عضویت در ساختمان</h1>
        <p className="text-gray-600">یکی از روش‌های زیر را برای عضویت در ساختمان انتخاب کنید</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {joinMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 text-right group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 bg-${method.color}-100 rounded-lg group-hover:bg-${method.color}-200 transition-colors`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {method.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          نمی‌توانید به ساختمان بپیوندید؟
        </p>
        <button
          onClick={onClose}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          بازگشت به خانه
        </button>
      </div>
    </div>
  );
}
