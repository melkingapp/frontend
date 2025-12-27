import { useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'sonner';
import { transferBuildingManagement, selectTransferManagementLoading } from '../../membership/membershipSlice';
import { X, Users, AlertTriangle, Loader } from 'lucide-react';

export default function TransferManagementModal({ isOpen, onClose, building }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectTransferManagementLoading);

  const [formData, setFormData] = useState({
    new_manager_phone: '',
    transfer_reason: ''
  });
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirmTransfer) {
      toast.error('لطفاً انتقال مدیریت را تایید کنید');
      return;
    }

    try {
      await dispatch(transferBuildingManagement({
        buildingId: building.building_id,
        data: formData
      })).unwrap();

      toast.success('مدیریت ساختمان با موفقیت انتقال یافت');
      onClose();
      setFormData({ new_manager_phone: '', transfer_reason: '' });
      setConfirmTransfer(false);
    } catch (error) {
      toast.error(error || 'خطا در انتقال مدیریت');
    }
  };

  const handleClose = () => {
    setFormData({ new_manager_phone: '', transfer_reason: '' });
    setConfirmTransfer(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        انتقال مدیریت ساختمان
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        {building?.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره تلفن مدیر جدید *
                    </label>
                    <input
                      type="tel"
                      value={formData.new_manager_phone}
                      onChange={(e) => setFormData({...formData, new_manager_phone: e.target.value})}
                      placeholder="09123456789"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      کاربر باید قبلاً در سیستم ثبت‌نام کرده باشد
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      دلیل انتقال (اختیاری)
                    </label>
                    <textarea
                      value={formData.transfer_reason}
                      onChange={(e) => setFormData({...formData, transfer_reason: e.target.value})}
                      placeholder="دلیل انتقال مدیریت..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">هشدار مهم</h4>
                        <p className="text-sm text-yellow-800 mb-2">
                          با انتقال مدیریت، شما دیگر مدیر این ساختمان نخواهید بود و تمام دسترسی‌های مدیریتی به کاربر جدید انتقال خواهد یافت.
                        </p>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={confirmTransfer}
                            onChange={(e) => setConfirmTransfer(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          انتقال مدیریت را تایید می‌کنم
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !confirmTransfer}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          در حال انتقال...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          انتقال مدیریت
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
