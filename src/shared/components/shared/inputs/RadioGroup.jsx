import { forwardRef, useId } from "react";

function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} className="text-red-500 text-xs mb-3">{children}</p>;
}

const RadioGroup = forwardRef(({ label, name, options, value, onChange, error }, ref) => {
    const labelId = useId();
    const errorId = error ? `${labelId}-error` : undefined;

    return (
        <div
            role="group"
            aria-labelledby={labelId}
            aria-describedby={errorId}
            className={`my-4 ${error ? "border border-red-500 rounded-xl p-2" : ""}`}
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
                            ref={index === 0 ? ref : null}
                            name={name}
                            value={optVal}
                            checked={value === optVal}
                            onChange={onChange}
                            className="cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                        {optLabel}
                    </label>
                ))}
            </div>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
});

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;