const SIZES = {
    small: "w-4 h-4 border-2",
    medium: "w-6 h-6 border-2",
    large: "w-8 h-8 border-3",
};

const COLORS = {
    primary: "border-[#2C5A8C] border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent",
};

export default function LoadingSpinner({
    size = "medium",
    color = "primary",
    className = "",
    overlay = false,
}) {
    const sizeClasses = SIZES[size] || SIZES.medium;
    const colorClasses = COLORS[color] || COLORS.primary;

    const spinner = (
        <div className={`${sizeClasses} ${colorClasses} rounded-full animate-spin ${className}`} />
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg p-6 shadow-xl">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
}
