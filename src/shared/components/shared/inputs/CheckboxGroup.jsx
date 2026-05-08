import { useId } from "react";

function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} role="alert" className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function CheckboxGroup({ label, options, selectedValues, onChange, error }) {
    const groupId = useId();
    const labelId = `${groupId}-label`;
    const errorId = error ? `${groupId}-error` : undefined;

    return (
        <div
            className={`mb-4 border p-3 rounded-xl bg-gray-50 ${error ? "border-red-500" : "border-gray-200"}`}
            role="group"
            aria-labelledby={labelId}
            aria-describedby={errorId}
        >
            <p id={labelId} className="text-sm font-medium mb-2 text-gray-700">{label}</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(value)}
                            onChange={() => onChange(value)}
                            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]"
                        />
                        {label}
                    </label>
                ))}
            </div>
            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
}
