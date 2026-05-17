import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const SettingsInput = ({ 
    label, 
    id, 
    name,
    type = 'text', 
    value, 
    onChange, 
    error, 
    placeholder, 
    disabled = false,
    helpText 
}) => {
    const errorId = error ? `${id}-error` : undefined;
    const descId = (helpText && !error) ? `${id}-desc` : undefined;
    const ariaDescribedBy = [errorId, descId].filter(Boolean).join(' ') || undefined;

    return (
        <div className="group">
            <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    id={id}
                    name={name || id}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={ariaDescribedBy}
                    className={`
                        w-full px-4 py-2.5 border rounded-lg shadow-sm
                        transition-all duration-200
                        ${error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }
                        ${disabled 
                            ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                            : 'bg-white text-gray-900 hover:border-gray-400'
                        }
                        focus:outline-none focus:ring-2 focus:ring-opacity-50
                        text-sm
                    `}
                />
                {error && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={18} className="text-red-500" aria-hidden="true" />
                    </div>
                )}
            </div>
            {error && (
                <div id={errorId} role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-600 animate-fade-in">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}
            {helpText && !error && (
                <p id={descId} className="mt-1.5 text-xs text-gray-500">{helpText}</p>
            )}
        </div>
    );
};

export default SettingsInput;
