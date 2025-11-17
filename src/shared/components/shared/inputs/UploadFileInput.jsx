import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

export default function UploadFileInput({ label, onFilesChange, accept = "image/*,application/pdf" }) {
    const [files, setFiles] = useState([]);

    const handleFiles = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        if (onFilesChange) onFilesChange(selectedFiles);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (onFilesChange) onFilesChange(newFiles);
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
                <ul className="mt-3 max-h-36 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                    {files.map((file, idx) => (
                        <li
                            key={file.name + idx}
                            className="flex items-center justify-between text-sm text-gray-700 mb-1 last:mb-0"
                        >
                            <span className="truncate max-w-[80%]">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-red-500 hover:text-red-700 transition"
                                aria-label="حذف فایل"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}