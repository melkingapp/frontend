import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle, Clock, Building2, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { selectSuggestedRequests, selectSuggestedRequestsLoading } from '../membershipSlice';
import { fetchSuggestedRequests, createMembershipRequest } from '../membershipSlice';
import MembershipRequestForm from './MembershipRequestForm';

export default function SuggestedRequestsList({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const suggestedRequests = useSelector(selectSuggestedRequests);
  const loading = useSelector(selectSuggestedRequestsLoading);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // اگر لیست باز نیست، چیزی نمایش نده
  if (!isOpen) {
    return null;
  }

  // مرتب‌سازی درخواست‌ها بر اساس تاریخ ایجاد (قدیمی‌ترین اول)
  const sortedRequests = [...(suggestedRequests || [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const handleRequestClick = async (request) => {
    // بررسی اینکه آیا این اولین درخواست است
    const isFirstRequest = sortedRequests[0]?.request_id === request.request_id;

    if (!isFirstRequest) {
      toast.error('ابتدا درخواست قدیمی‌تر را بررسی و تایید کنید');
      return;
    }

    setProcessingRequest(request.request_id);
    setSelectedRequest(request);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const result = await dispatch(createMembershipRequest(formData)).unwrap();

      if (result.was_suggested || result.auto_approved) {
        toast.success('درخواست عضویت با موفقیت تایید شد');

        // به‌روزرسانی لیست درخواست‌های suggested
        await dispatch(fetchSuggestedRequests());

        // بستن فرم و لیست اگر همه درخواست‌ها پردازش شد
        if (suggestedRequests.length <= 1) {
          onClose?.();
        }
      }

      setShowForm(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error || 'خطا در ارسال درخواست');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedRequest(null);
    setProcessingRequest(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!sortedRequests || sortedRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            همه درخواست‌ها پردازش شده‌اند
          </h3>
          <p className="text-gray-600">
            در حال حاضر هیچ درخواست عضویت در انتظار ندارید
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              درخواست‌های عضویت پیشنهادی
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              درخواست‌هایی که مدیران ساختمان برای شما ایجاد کرده‌اند
            </p>
          </div>
          <Button
            size="small"
            color="secondary"
            onClick={onClose}
          >
            بستن
          </Button>
        </div>

        <div className="space-y-4">
          {sortedRequests.map((request, index) => {
            const isFirstRequest = index === 0;
            const isProcessing = processingRequest === request.request_id;

            return (
              <div
                key={request.request_id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  isFirstRequest
                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onClick={() => handleRequestClick(request)}
              >
                {/* هدر درخواست */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isFirstRequest ? (
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock size={16} className="text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        واحد {request.unit_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.building_title}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    {isFirstRequest ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <CheckCircle size={12} />
                        قابل پذیرش
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        <Clock size={12} />
                        در انتظار
                      </span>
                    )}
                  </div>
                </div>

                {/* اطلاعات درخواست */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span>{request.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={14} />
                    <span>طبقه {request.floor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{request.area} متر مربع</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{new Date(request.created_at).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>

                {/* وضعیت درخواست */}
                <div className="flex items-center justify-between">
                  {isFirstRequest ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle size={16} />
                      <span>برای پذیرش کلیک کنید</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle size={16} />
                      <span>ابتدا درخواست قبلی را پردازش کنید</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {index + 1} از {sortedRequests.length}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* فرم عضویت */}
      {showForm && selectedRequest && (
        <MembershipRequestForm
          isOpen={showForm}
          onClose={handleFormClose}
          prefillData={selectedRequest}
          onSuccess={handleFormSubmit}
          isSuggestedRequest={true}
        />
      )}
    </>
  );
}
