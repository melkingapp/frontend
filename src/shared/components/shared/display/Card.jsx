import { forwardRef } from "react";

const VARIANTS = {
    default: "bg-white border border-gray-200",
    outlined: "bg-transparent border-2 border-gray-300",
    elevated: "bg-white shadow-lg border-0",
};

const SIZES = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
};

export default forwardRef(function Card({
    children,
    variant = "default",
    size = "md",
    className = "",
    loading = false,
    error = null,
    onClick,
    ...rest
}, ref) {
    const baseClasses = "rounded-lg transition-all duration-200";
    const variantClasses = VARIANTS[variant] || VARIANTS.default;
    const sizeClasses = SIZES[size] || SIZES.md;
    const interactiveClasses = onClick ? "cursor-pointer hover:shadow-md active:scale-[0.98]" : "";

    return (
        <div
            ref={ref}
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${interactiveClasses} ${className}`}
            onClick={onClick}
            {...rest}
        >
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#2C5A8C] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {error && (
                <div className="text-red-500 text-sm py-2">
                    {error}
                </div>
            )}
            {!loading && !error && children}
        </div>
    );
});

Card.displayName = "Card";
