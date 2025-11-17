import React from 'react';

const NotificationToggle = ({ label, description, checked, onChange, id }) => {
    return (
        <div className="flex items-center justify-between py-4 px-4 -mx-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <div className="flex-1">
                <label htmlFor={id} className="text-sm font-semibold text-gray-900 cursor-pointer">
                    {label}
                </label>
                {description && <p className="text-xs text-gray-600 mt-1.5">{description}</p>}
            </div>
            <label htmlFor={id} className="relative inline-flex items-center cursor-pointer mr-4">
                <input
                    type="checkbox"
                    id={id}
                    className="sr-only peer"
                    checked={checked}
                    onChange={onChange}
                />
                <div className="
                    w-14 h-7 bg-gray-200 
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 
                    rounded-full peer 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                    after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-6 after:w-6 
                    after:transition-all after:shadow-md
                    peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-indigo-700
                    transition-colors duration-200
                "></div>
            </label>
        </div>
    );
};

export default NotificationToggle;
