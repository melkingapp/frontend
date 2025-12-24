import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { validateInviteLink, useInviteLink, selectInviteLinkData, selectValidateInviteLinkLoading, selectUseInviteLinkLoading } from '../membershipSlice';
import { Building, Home, User, CheckCircle, XCircle, Loader, Link } from 'lucide-react';

export default function JoinByInviteLinkPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const inviteLinkData = useSelector(selectInviteLinkData);
  const validateLoading = useSelector(selectValidateInviteLinkLoading);
  const useLoading = useSelector(selectUseInviteLinkLoading);

  const [error, setError] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        await dispatch(validateInviteLink(token)).unwrap();
      } catch (error) {
        setError(error || 'لینک دعوت نامعتبر است');
      }
    };

    if (token) {
      validateToken();
    }
  }, [token, dispatch]);

  const handleUseInviteLink = async () => {
    try {
      await dispatch(useInviteLink(token)).unwrap();
      toast.success('عضویت شما با موفقیت تایید شد!');
      navigate('/resident/dashboard');
    } catch (error) {
      toast.error(error || 'خطا در استفاده از لینک دعوت');
    }
  };

  if (validateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">در حال بررسی لینک دعوت...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !inviteLinkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">لینک دعوت نامعتبر</h2>
          <p className="text-gray-600 mb-6">{error || 'این لینک دعوت معتبر نیست یا منقضی شده است.'}</p>
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
              <Link className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">دعوت‌نامه عضویت</h1>
            <p className="text-gray-600">شما از طریق لینک دعوت برای عضویت در ساختمان دعوت شده‌اید</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">اطلاعات ساختمان</span>
              </div>
              <p className="text-gray-600 text-sm">
                <strong>{inviteLinkData.building_title}</strong>
              </p>
              <p className="text-gray-600 text-sm">
                واحد {inviteLinkData.unit_number} - نقش {inviteLinkData.role_display}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">مزایای عضویت</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• دسترسی کامل به امکانات ساختمان</li>
                    <li>• شرکت در تصمیم‌گیری‌های جمعی</li>
                    <li>• دریافت اعلان‌های مهم ساختمان</li>
                    <li>• مدیریت امور مالی واحد</li>
                  </ul>
                </div>
              </div>
            </div>

            {inviteLinkData.is_used && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      این لینک دعوت قبلاً استفاده شده است.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!inviteLinkData.is_used ? (
              <button
                onClick={handleUseInviteLink}
                disabled={useLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {useLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    عضویت در ساختمان
                  </>
                )}
              </button>
            ) : (
              <div className="w-full px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-center">
                این لینک قبلاً استفاده شده است
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              بازگشت به خانه
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              با عضویت در ساختمان، شما موافقت می‌کنید که اطلاعات شما در سیستم ساختمان ثبت و مدیریت شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
