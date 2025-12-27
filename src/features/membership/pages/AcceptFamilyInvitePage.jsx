import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { acceptFamilyInvitation, validateInviteLink, selectInviteLinkData, selectValidateInviteLinkLoading, selectUseInviteLinkLoading } from '../membershipSlice';
import { Building, Home, Users, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function AcceptFamilyInvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const inviteLinkData = useSelector(selectInviteLinkData);
  const validateLoading = useSelector(selectValidateInviteLinkLoading);
  const acceptLoading = useSelector(selectUseInviteLinkLoading);

  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateInvitation = async () => {
      try {
        // For family invitations, we need to validate the invitation code
        // Since the API doesn't have a separate validate endpoint for family invitations,
        // we'll try to accept it directly and handle the error
        setLoading(false);
      } catch (err) {
        setError('دعوت‌نامه نامعتبر است');
        setLoading(false);
      }
    };

    if (code) {
      validateInvitation();
    }
  }, [code, dispatch]);

  const handleAcceptInvitation = async () => {
    try {
      await dispatch(acceptFamilyInvitation(code)).unwrap();
      toast.success('دعوت‌نامه با موفقیت پذیرفته شد! شما اکنون عضو خانواده این واحد هستید.');
      navigate('/resident/dashboard');
    } catch (error) {
      toast.error(error || 'خطا در پذیرش دعوت‌نامه');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">در حال بررسی دعوت‌نامه...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">دعوت‌نامه نامعتبر</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به خانه
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">دعوت‌نامه خانواده</h1>
            <p className="text-gray-600">شما برای پیوستن به خانواده این واحد دعوت شده‌اید</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">اطلاعات ساختمان</span>
              </div>
              <p className="text-gray-600 text-sm">
                شما برای پیوستن به واحد یک خانواده دعوت شده‌اید.
                با پذیرش این دعوت‌نامه، به عنوان عضو خانواده در این واحد ثبت خواهید شد.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">مزایای عضویت</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• دسترسی به امکانات ساختمان</li>
                    <li>• دریافت اعلان‌های خانواده</li>
                    <li>• مشارکت در تصمیم‌گیری‌های واحد</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAcceptInvitation}
              disabled={acceptLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {acceptLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  پذیرش دعوت‌نامه
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف و بازگشت
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              با پذیرش این دعوت‌نامه، شما موافقت می‌کنید که اطلاعات شما در سیستم ساختمان ثبت شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
