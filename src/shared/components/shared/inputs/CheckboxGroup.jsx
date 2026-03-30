import { forwardRef, useId } from "react";

function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} className="text-red-500 text-xs mt-2 mb-1">{children}</p>;
}

const CheckboxGroup = forwardRef(({ label, options, selectedValues, onChange, error, ...rest }, ref) => {
    const errorId = useId();

    return (
        <fieldset className={`mb-4 border p-3 rounded-xl bg-gray-50 ${error ? "border-red-500" : "border-gray-200"}`}>
            <legend className="text-sm font-medium px-1 text-gray-700">{label}</legend>
            <div className="grid grid-cols-2 gap-2 mt-2">
                {options.map(({ value, label }, index) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(value)}
                            onChange={() => onChange(value)}
                            className="cursor-pointer"
                            aria-invalid={!!error}
                            aria-describedby={error ? errorId : undefined}
                            {...(index === 0 ? { ref } : {})}
                            {...rest}
                        />
                        {label}
                    </label>
                ))}
            </div>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </fieldset>
    );
});

CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;
