function ErrorMessage({ children }) {
    if (!children) return null;
    return <p className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function CheckboxGroup({ label, options, selectedValues, onChange, error }) {
    return (
        <fieldset className={`mb-4 border p-3 rounded-xl bg-gray-50 ${error ? "border-red-500" : "border-gray-200"}`}>
            <legend className="block text-sm font-medium mb-2 text-gray-700">{label}</legend>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value, label: optLabel }) => {
                    const isChecked = selectedValues.includes(value);
                    return (
                        <label
                            key={value}
                            className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 has-[:focus-visible]:ring-offset-2 ${isChecked ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-400 bg-white"}`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onChange(value)}
                                className="cursor-pointer sr-only"
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'}`}>
                                {isChecked && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <span className="text-gray-900">{optLabel}</span>
                        </label>
                    );
                })}
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </fieldset>
    );
}
