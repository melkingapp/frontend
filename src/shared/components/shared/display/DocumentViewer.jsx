import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Download, X } from "lucide-react";

export default function DocumentViewer({ documentUrl }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!documentUrl) return null;

    // Add base URL if the URL is relative
    const getFullUrl = (url) => {
        if (url.startsWith('http') || url.startsWith('data:')) {
            return url;
        }
        // Add the backend base URL
        const baseURL = 'https://melkingapp.ir';
        return `${baseURL}${url}`;
    };

    const fullUrl = getFullUrl(documentUrl);

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="cursor-pointer w-40 h-24 rounded-lg overflow-hidden border border-gray-300"
                title="نمایش سند"
            >
                <img
                    src={fullUrl}
                    alt="سند"
                    className="object-cover w-full h-full"
                    loading="lazy"
                />
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
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
                            <Dialog.Panel className="relative max-w-4xl max-h-[90vh] rounded-xl bg-white p-4 shadow-xl flex flex-col">
                                {/* دکمه بستن */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-3 left-3 text-gray-600 hover:text-red-600"
                                    aria-label="بستن"
                                >
                                    <X size={24} />
                                </button>

                                <img
                                    src={fullUrl}
                                    alt="سند بزرگ"
                                    className="max-w-full max-h-[80vh] object-contain mx-auto rounded"
                                />

                                <a
                                    href={fullUrl}
                                    download
                                    className="mt-4 self-center inline-flex items-center gap-2 px-4 py-2 bg-melkingDarkBlue text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Download size={18} />
                                    دانلود
                                </a>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}