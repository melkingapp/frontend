import React from 'react';

const SettingsSection = ({ title, description, children, icon: Icon }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3 mb-6">
                {Icon && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Icon size={20} className="text-indigo-600" />
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
};

export default SettingsSection;
