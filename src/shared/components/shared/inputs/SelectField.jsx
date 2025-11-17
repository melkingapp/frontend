function ErrorMessage({ children }) {
    if (!children) return null;
    return <p className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function SelectField({ label, name, value, onChange, options, error }) {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 ${error ? "border-red-500" : "border-gray-200"
                    }`}
            >
                <option value="">انتخاب کنید</option>
                {options.map(({ value: optVal, label: optLabel }, index) => (
                    <option key={index} value={optVal}>
                        {optLabel}
                    </option>
                ))}
            </select>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}