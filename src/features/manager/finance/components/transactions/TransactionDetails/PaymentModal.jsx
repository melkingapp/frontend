import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function PaymentModal({ isOpen, onClose, onConfirm, transaction, isPaying = false }) {
  const [description, setDescription] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('لطفاً فقط فایل تصویری انتخاب کنید');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return;
      }
      
      setReceiptImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    onConfirm({
      description: description.trim() || null,
      receiptImage: receiptImage || null,
    });
  };

  const handleClose = () => {
    setDescription("");
    setReceiptImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white text-right shadow-2xl">
              <div className="flex justify-between items-center border-b p-4">
                <Dialog.Title className="text-lg font-bold text-gray-900">
                  ثبت پرداخت
                </Dialog.Title>
                <button onClick={handleClose} className="text-gray-500 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* توضیحات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات پرداخت را وارد کنید..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                {/* آپلود عکس */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عکس رسید پرداخت (اختیاری)
                  </label>
                  <div className="space-y-2">
                    {!imagePreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
                      >
                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-600">
                          برای آپلود عکس رسید کلیک کنید
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          فرمت‌های مجاز: JPG, PNG (حداکثر 5 مگابایت)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="پیش‌نمایش عکس"
                          className="w-full h-48 object-contain rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* دکمه‌های عملیات */}
              <div className="border-t p-4 space-y-3">
                <p className="text-xs text-center text-gray-500">
                  پرداخت شما پس از تایید مدیر ساختمان ثبت نهایی خواهد شد
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPaying}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        در حال ثبت...
                      </>
                    ) : (
                      "ثبت و ارسال برای تایید"
                    )}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

