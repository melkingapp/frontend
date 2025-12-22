function ErrorMessage({ children, id }) {
    if (!children) return null;
    return <p id={id} className="text-red-500 text-xs mb-3" role="alert">{children}</p>;
}

export default function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    name,
    disabled = false,
    required = false,
    error
}) {
    const errorId = name ? `${name}-error` : undefined;

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={name}>
                    {label}
                    {required && <span className="text-red-500 ms-1" aria-hidden="true">*</span>}
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
                required={required}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={`w-full px-4 py-3 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C5A8C] transition  ${error ? "border-red-500" : "border-gray-200"
                    }`}
            />

            <ErrorMessage id={errorId}>{error}</ErrorMessage>
        </div>
    );
}