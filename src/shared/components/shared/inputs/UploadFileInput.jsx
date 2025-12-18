import { useState, useEffect } from "react";
import { UploadCloud, X, FileText, File } from "lucide-react";

export default function UploadFileInput({ label, onFilesChange, accept = "image/*,application/pdf" }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleFiles = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        if (onFilesChange) onFilesChange(selectedFiles);

        // ایجاد preview برای فایل‌های تصویری
        const newPreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return null;
        });
        setPreviews(newPreviews);
    };

    const removeFile = (index) => {
        // پاکسازی URL preview
        if (previews[index]) {
            URL.revokeObjectURL(previews[index]);
        }
        
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
        if (onFilesChange) onFilesChange(newFiles);
    };

    // پاکسازی URL ها هنگام unmount
    useEffect(() => {
        return () => {
            previews.forEach(preview => {
                if (preview) URL.revokeObjectURL(preview);
            });
        };
    }, [previews]);

    const getFileIcon = (file) => {
        if (file.type === 'application/pdf') {
            return <FileText className="w-8 h-8 text-red-500" />;
        }
        return <File className="w-8 h-8 text-gray-500" />;
    };

    return (
        <div className="mb-4">
            {label && <label className="block mb-2 font-semibold text-gray-700">{label}</label>}

            <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition text-indigo-600"
            >
                <UploadCloud className="w-5 h-5" />
                انتخاب فایل (عکس، PDF و ...)
            </label>
            <input
                id="file-upload"
                type="file"
                accept={accept}
                multiple
                onChange={handleFiles}
                className="hidden"
            />

            {files.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map((file, idx) => (
                        <div
                            key={file.name + idx}
                            className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
                        >
                            {/* دکمه حذف */}
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute top-1 left-1 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                aria-label="حذف فایل"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* محتوای فایل */}
                            <div className="aspect-square flex items-center justify-center bg-gray-50 p-2">
                                {previews[idx] ? (
                                    // نمایش تصویر
                                    <img
                                        src={previews[idx]}
                                        alt={file.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                ) : (
                                    // نمایش آیکون برای فایل‌های غیر تصویری
                                    getFileIcon(file)
                                )}
                            </div>

                            {/* نام فایل */}
                            <div className="p-2 bg-white border-t border-gray-100">
                                <p className="text-xs text-gray-600 truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}