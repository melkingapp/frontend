import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadBuildingDocument, deleteBuildingDocument } from '../../../features/settings/settingsSlice';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Download, X, File } from 'lucide-react';
import { API_CONFIG } from '../../../config/api';

const DocumentUploader = ({ buildingId, documents, onDocumentUploaded, onDocumentDeleted }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.settings);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentTitle, setDocumentTitle] = useState('');
    const [documentType, setDocumentType] = useState('rules');
    const [isDragging, setIsDragging] = useState(false);
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
            await dispatch(uploadBuildingDocument({ buildingId, data: formData })).unwrap();
            toast.success('سند با موفقیت آپلود شد.');
            setDocumentTitle('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onDocumentUploaded(); // Refresh documents list
        } catch (error) {
            toast.error(`خطا در آپلود سند: ${error.detail || error.message || 'خطای ناشناخته'}`);
        }
    };

    const handleDelete = async (docId) => {
        if (window.confirm('آیا از حذف این سند اطمینان دارید؟')) {
            try {
                await dispatch(deleteBuildingDocument({ buildingId, documentId: docId })).unwrap();
                toast.success('سند با موفقیت حذف شد.');
                onDocumentDeleted(); // Refresh documents list
            } catch (error) {
                toast.error(`خطا در حذف سند: ${error.detail || error.message || 'خطای ناشناخته'}`);
            }
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

            <button
                onClick={handleUpload}
                disabled={loading || !selectedFile || !documentTitle}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                <Upload size={18} />
                {loading ? 'در حال آپلود...' : 'آپلود سند'}
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
                                        <a
                                            href={`${API_CONFIG.BASE_URL}${doc.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="دانلود سند"
                                        >
                                            <Download size={18} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(doc.document_id)}
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
        </div>
    );
};

export default DocumentUploader;
