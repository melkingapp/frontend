import React from 'react';
import { LoaderCircle } from 'lucide-react';

const SuspenseLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">در حال بارگذاری...</p>
      </div>
    </div>
  );
};

export default SuspenseLoader;
