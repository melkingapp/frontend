import { forwardRef, useId } from "react";

function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} className="text-red-500 text-xs mb-3">{children}</p>;
}

const CheckboxGroup = forwardRef(({ label, options, selectedValues, onChange, error }, ref) => {
    const labelId = useId();
    const errorId = error ? `${labelId}-error` : undefined;

    return (
        <div
            className={`mb-4 border p-3 rounded-xl bg-gray-50 ${error ? "border-red-500" : "border-gray-200"}`}
            role="group"
            aria-labelledby={labelId}
            aria-describedby={errorId}
        >
            <p id={labelId} className="text-sm font-medium mb-2 text-gray-700">{label}</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value, label: optLabel }, index) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            ref={index === 0 ? ref : null}
                            type="checkbox"
                            checked={selectedValues.includes(value)}
                            onChange={() => onChange(value)}
                            className="cursor-pointer"
                            aria-invalid={!!error}
                        />
                        {optLabel}
                    </label>
                ))}
            </div>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
});

CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;
