import { useId, forwardRef } from "react";

function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} role="alert" className="text-red-500 text-xs mt-2">{children}</p>;
}

const RadioGroup = forwardRef(function RadioGroup({ label, name, options, value, onChange, error }, ref) {
    const labelId = useId();
    const errorId = error ? `${labelId}-error` : undefined;

    return (
        <div
            className={`my-4 ${error ? "border border-red-500 rounded-xl p-2" : ""}`}
            role="group"
            aria-labelledby={labelId}
            aria-describedby={errorId}
        >
            <p id={labelId} className="block text-sm font-semibold text-gray-700 mb-2">{label}</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value: optVal, label: optLabel }, index) => (
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
                            className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D3B66C] focus:outline-none"
                            ref={index === 0 ? ref : null}
                        />
                        {optLabel}
                    </label>
                ))}
            </div>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
});

export default RadioGroup;