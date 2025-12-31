import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadBuildingDocument, deleteBuildingDocument } from '../../../features/settings/settingsSlice';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Download, X, File, Loader2, AlertTriangle } from 'lucide-react';
import { getFullMediaUrl } from '../../utils/fileUrl';

const DocumentUploader = ({ buildingId, documents, onDocumentUploaded, onDocumentDeleted }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.settings);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentTitle, setDocumentTitle] = useState('');
    const [documentType, setDocumentType] = useState('rules');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !documentTitle || !documentType) {
            toast.error('لطفاً عنوان، نوع و فایل سند را انتخاب کنید.');
            return;
        }

        const formData = new FormData();
        formData.append('title', documentTitle);
        formData.append('document_type', documentType);
        formData.append('file', selectedFile);

        try {
            setIsUploading(true);
            setUploadProgress(0);
            
            // Simulate progress (since we don't have real upload progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            await dispatch(uploadBuildingDocument({ buildingId, data: formData })).unwrap();
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            toast.success('✅ سند با موفقیت آپلود شد.');
            
            // Reset form
            setTimeout(() => {
                setDocumentTitle('');
                setSelectedFile(null);
                setUploadProgress(0);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 500);
            
            onDocumentUploaded(); // Refresh documents list
        } catch (error) {
            toast.error(`❌ خطا در آپلود سند: ${error.detail || error.message || 'خطای ناشناخته'}`);
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDelete = (doc) => {
        setDocumentToDelete(doc);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!documentToDelete) return;

        try {
            await dispatch(deleteBuildingDocument({ 
                buildingId, 
                documentId: documentToDelete.document_id 
            })).unwrap();
            toast.success('✅ سند با موفقیت حذف شد.');
            setShowDeleteModal(false);
            setDocumentToDelete(null);
            onDocumentDeleted(); // Refresh documents list
        } catch (error) {
            toast.error(`❌ خطا در حذف سند: ${error.detail || error.message || 'خطای ناشناخته'}`);
        }
    };

    const handleDownload = (fileUrl, title) => {
        try {
            // استخراج نام فایل از URL
            const fileName = fileUrl.split('/').pop() || title;
            
            // ساخت URL کامل
            const fullUrl = getFullMediaUrl(fileUrl);
            
            // ایجاد link با download attribute
            const link = document.createElement('a');
            link.href = fullUrl;
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // اضافه کردن به DOM و کلیک
            document.body.appendChild(link);
            link.click();
            
            // حذف از DOM
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
            toast.success('✅ دانلود فایل آغاز شد');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('❌ خطا در دانلود فایل');
        }
    };

    const getDocumentTypeLabel = (type) => {
        switch (type) {
            case 'rules': return 'قوانین ساختمان';
            case 'contract': return 'قراردادها';
            case 'meeting_minutes': return 'صورت‌جلسات';
            case 'other': return 'سایر';
            default: return type;
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                        نوع سند
                    </label>
                    <select
                        id="documentType"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="rules">قوانین ساختمان</option>
                        <option value="contract">قراردادها</option>
                        <option value="meeting_minutes">صورت‌جلسات</option>
                        <option value="other">سایر</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        عنوان سند
                    </label>
                    <input
                        type="text"
                        id="documentTitle"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="مثال: قوانین داخلی ساختمان"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* File Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${isDragging 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                
                {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                        <File size={40} className="text-indigo-600" />
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            فایل را اینجا بکشید یا کلیک کنید
                        </p>
                        <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, TXT, JPG, PNG (حداکثر 10MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">در حال آپلود...</span>
                        <span className="text-indigo-600 font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !documentTitle}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-blue-600 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
                {isUploading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        در حال آپلود...
                    </>
                ) : (
                    <>
                        <Upload size={18} />
                        آپلود سند
                    </>
                )}
            </button>

            {/* Documents List */}
            <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">اسناد آپلود شده</h4>
                {documents && documents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {documents.map((doc) => (
                            <div 
                                key={doc.document_id} 
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <FileText size={20} className="text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{doc.title}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            {getDocumentTypeLabel(doc.document_type)} • 
                                            {doc.uploaded_by_name} • 
                                            {new Date(doc.upload_date).toLocaleDateString('fa-IR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mr-4">
                                    {doc.file_url && (
                                        <>
                                            <a
                                                href={getFullMediaUrl(doc.file_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="مشاهده سند"
                                            >
                                                <FileText size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleDownload(doc.file_url, doc.title)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="دانلود سند"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => confirmDelete(doc)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="حذف سند"
                                        disabled={loading}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FileText size={40} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">هیچ سندی آپلود نشده است</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDocumentToDelete(null);
                            }}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 px-6 pt-6 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle size={28} className="text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                                            تایید حذف سند
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            این عمل قابل بازگشت نیست
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white px-6 py-6">
                                <div className="space-y-4">
                                    <p className="text-base text-gray-700">
                                        آیا از حذف سند <span className="font-bold text-gray-900">"{documentToDelete?.title}"</span> اطمینان دارید؟
                                    </p>
                                    
                                    <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-lg">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <AlertTriangle size={20} className="text-amber-600" />
                                            </div>
                                            <div className="mr-3">
                                                <p className="text-sm text-amber-800">
                                                    با حذف این سند، تمام کاربران دسترسی به آن را از دست خواهند داد.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDocumentToDelete(null);
                                    }}
                                    disabled={loading}
                                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-all duration-200"
                                >
                                    انصراف
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 border-2 border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            در حال حذف...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            حذف سند
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUploader;
