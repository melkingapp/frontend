function ErrorMessage({ children }) {
    if (!children) return null;
    return <p className="text-red-500 text-xs mb-3">{children}</p>;
}

export default function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    name,
    disabled = false,
    error
}) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={name}>
                    {label}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-4 py-3 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] transition  ${error ? "border-red-500" : "border-gray-200"
                    }`}
            />

            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}