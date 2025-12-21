import React from 'react';

const SuspenseLoader = () => {
    return (
        <div className="flex items-center justify-center w-full h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1C2E4E] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#1C2E4E] font-medium text-lg">در حال بارگذاری...</span>
            </div>
        </div>
    );
};

export default SuspenseLoader;
