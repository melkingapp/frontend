function ErrorMessage({ children }) {
    if (!children) return null;
    return <p className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function RadioGroup({ label, name, options, value, onChange, error }) {
    return (
        <fieldset className={`my-4 ${error ? "border border-red-500 rounded-xl p-2" : ""}`}>
            <legend className="block text-sm font-semibold text-gray-700 mb-2">{label}</legend>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value: optVal, label: optLabel }) => (
                    <label
                        key={optVal}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 has-[:focus-visible]:ring-offset-2 ${value === optVal ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-400"
                            }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={optVal}
                            checked={value === optVal}
                            onChange={onChange}
                            className="cursor-pointer sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${value === optVal ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'}`}>
                            {value === optVal && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-gray-900">{optLabel}</span>
                    </label>
                ))}
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </fieldset>
    );
}