function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function RadioGroup({ label, name, options, value, onChange, error, required = false }) {
    const errorId = error ? `${name}-error` : undefined;
    const labelId = `${name}-label`;

    return (
        <div
            className={`my-4 ${error ? "border border-red-500 rounded-xl p-2" : ""}`}
            role="radiogroup"
            aria-labelledby={labelId}
            aria-invalid={!!error}
            aria-describedby={errorId}
            aria-required={required}
        >
            <p id={labelId} className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
            </p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value: optVal, label: optLabel }) => {
                    const inputId = `${name}-${optVal}`;
                    return (
                        <label
                            key={optVal}
                            htmlFor={inputId}
                            className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${value === optVal ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <input
                                id={inputId}
                                type="radio"
                                name={name}
                                value={optVal}
                                checked={value === optVal}
                                onChange={onChange}
                                className="cursor-pointer"
                                aria-checked={value === optVal}
                            />
                            {optLabel}
                        </label>
                    );
                })}
            </div>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
}