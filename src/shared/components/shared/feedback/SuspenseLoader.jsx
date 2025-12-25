import React from 'react';

const SuspenseLoader = () => {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-melkingDarkBlue border-t-transparent rounded-full animate-spin"></div>
                <span className="text-melkingDarkBlue font-medium">در حال بارگذاری...</span>
            </div>
        </div>
    );
};

export default SuspenseLoader;
