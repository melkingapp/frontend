function ErrorMessage({ children }) {
    if (!children) return null;
    return <p className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function CheckboxGroup({ label, options, selectedValues, onChange, error }) {
    return (
        <div className={`mb-4 border p-3 rounded-xl bg-gray-50 ${error ? "border-red-500" : "border-gray-200"}`}>
            <p className="text-sm font-medium mb-2 text-gray-700">{label}</p>
            <div className="grid grid-cols-2 gap-2">
                {options.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(value)}
                            onChange={() => onChange(value)}
                            className="cursor-pointer"
                        />
                        {label}
                    </label>
                ))}
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
