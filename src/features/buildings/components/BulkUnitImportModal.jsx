import { useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'sonner';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import membershipApi from '../../membership/services/membershipApi';

export default function BulkUnitImportModal({ isOpen, onClose, buildingId, buildingTitle, onImportSuccess }) {
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewData([]);
      setImportResults(null);

      // For demo purposes, we'll create mock data
      // In a real implementation, you'd parse the CSV/Excel file
      const mockData = [
        {
          unit_number: '101',
          floor: 1,
          area: 120,
          full_name: 'احمد رضایی',
          phone_number: '09123456789',
          role: 'owner',
          owner_type: 'resident',
          tenant_full_name: '',
          tenant_phone_number: '',
          has_parking: true,
          parking_count: 1,
          resident_count: 3
        },
        {
          unit_number: '102',
          floor: 1,
          area: 110,
          full_name: 'مریم احمدی',
          phone_number: '09123456790',
          role: 'owner',
          owner_type: 'landlord',
          tenant_full_name: 'علی محمدی',
          tenant_phone_number: '09123456791',
          has_parking: true,
          parking_count: 1,
          resident_count: 4
        }
      ];

      setPreviewData(mockData);
    }
  };

  const handleImport = async () => {
    if (!previewData.length) {
      toast.error('داده‌ای برای وارد کردن وجود ندارد');
      return;
    }

    setImporting(true);
    try {
      const response = await membershipApi.bulkImportUnits(buildingId, {
        units: previewData
      });

      setImportResults(response);
      toast.success('واحد‌ها با موفقیت وارد شدند');

      if (onImportSuccess) {
        onImportSuccess();
      }

      // Close modal after successful import
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      toast.error(error || 'خطا در وارد کردن واحدها');
      setImportResults({ errors: ['خطا در وارد کردن داده‌ها'] });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setImportResults(null);
    setLoading(false);
    setImporting(false);
    onClose();
  };

  const removePreviewItem = (index) => {
    setPreviewData(prev => prev.filter((_, i) => i !== index));
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        وارد کردن گروهی واحدها
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        ساختمان: {buildingTitle}
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

                {/* File Upload Section */}
                {!previewData.length && !importResults && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      فایل Excel یا CSV را انتخاب کنید
                    </h4>
                    <p className="text-gray-600 mb-6">
                      فایل باید شامل ستون‌های: شماره واحد، طبقه، متراژ، نام مالک، شماره تماس، نقش، نوع مالک، نام مستاجر، شماره مستاجر، پارکینگ، تعداد پارکینگ، تعداد نفر
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload size={20} />
                      انتخاب فایل
                    </label>
                  </div>
                )}

                {/* Preview Section */}
                {previewData.length > 0 && !importResults && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">
                        پیش‌نمایش داده‌ها ({previewData.length} واحد)
                      </h4>
                      <button
                        onClick={() => setPreviewData([])}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        پاک کردن همه
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">واحد</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">مالک</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">مستاجر</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اقدام</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.map((unit, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  واحد {unit.unit_number}
                                </div>
                                <div className="text-xs text-gray-500">
                                  طبقه {unit.floor} - {unit.area} متر
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900">{unit.full_name}</div>
                                <div className="text-xs text-gray-500">{unit.phone_number}</div>
                              </td>
                              <td className="px-4 py-3">
                                {unit.tenant_full_name ? (
                                  <div className="text-sm text-gray-900">{unit.tenant_full_name}</div>
                                ) : (
                                  <span className="text-xs text-gray-400">بدون مستاجر</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removePreviewItem(index)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={() => setPreviewData([])}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={handleImport}
                        disabled={importing || previewData.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {importing ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            در حال وارد کردن...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            وارد کردن واحدها ({previewData.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {importResults && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <h4 className="text-lg font-medium text-gray-900">نتیجه وارد کردن</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-600 font-medium">ایجاد شده</div>
                        <div className="text-2xl font-bold text-green-700">{importResults.created_units || 0}</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-blue-600 font-medium">به‌روزرسانی شده</div>
                        <div className="text-2xl font-bold text-blue-700">{importResults.updated_units || 0}</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-600 font-medium">خطاها</div>
                        <div className="text-2xl font-bold text-red-700">{importResults.errors?.length || 0}</div>
                      </div>
                    </div>

                    {importResults.errors && importResults.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-medium text-red-900 mb-2">خطاها:</h5>
                        <ul className="text-sm text-red-800 space-y-1">
                          {importResults.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        بستن
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
