import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, X, ChevronDown } from 'lucide-react';
import { selectSuggestedRequests } from '../membershipSlice';

export default function SuggestedRequestsBanner({ onViewRequests }) {
  const suggestedRequests = useSelector(selectSuggestedRequests);
  const [isVisible, setIsVisible] = useState(true);

  // اگر درخواست suggested وجود ندارد، چیزی نمایش نده
  if (!suggestedRequests || suggestedRequests.length === 0 || !isVisible) {
    return null;
  }

  const handleViewRequests = () => {
    if (onViewRequests) {
      onViewRequests();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 mb-4 shadow-lg border border-blue-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Bell size={20} className="text-blue-100" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              درخواست‌های عضویت در انتظار
            </h3>
            <p className="text-blue-100 text-sm">
              {suggestedRequests.length} درخواست عضویت برای شما وجود دارد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewRequests}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
          >
            مشاهده درخواست‌ها
            <ChevronDown size={16} />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 text-blue-200 hover:text-white transition-colors"
            title="بستن اعلان"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
