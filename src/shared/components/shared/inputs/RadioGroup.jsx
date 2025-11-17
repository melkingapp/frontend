function ErrorMessage({ children }) {
    if (!children) return null;
    return <p className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function RadioGroup({ label, name, options, value, onChange, error }) {
    return (
        <div className={`my-4 ${error ? "border border-red-500 rounded-xl p-2" : ""}`}>
            <p className="block text-sm font-semibold text-gray-700 mb-2">{label}</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value: optVal, label: optLabel }) => (
                    <label
                        key={optVal}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${value === optVal ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-400"
                            }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={optVal}
                            checked={value === optVal}
                            onChange={onChange}
                            className="cursor-pointer"
                        />
                        {optLabel}
                    </label>
                ))}
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}