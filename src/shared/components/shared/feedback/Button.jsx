const SIZES = {
    small: 'px-3 py-1.5 text-sm rounded-lg',
    medium: 'px-4 py-2 text-base rounded-lg',
    large: 'px-6 py-3 text-lg rounded-xl',
};

const VARIANTS = {
    solid: {
        darkBlue: 'bg-[#1C2E4E] text-white hover:bg-[#182544]',
        gold: 'bg-[#D3B66C] text-white hover:bg-[#c5a956]',
        white: 'bg-white text-gray-900 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
    },
    outline: {
        darkBlue: 'bg-transparent border-2 border-[#2C5A8C] text-[#2C5A8C] hover:bg-[#2C5A8C] hover:text-white',
        gold: 'bg-transparent border-2 border-[#D3B66C] text-[#D3B66C] hover:bg-[#D3B66C] hover:text-white',
        white: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
        danger: 'bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
        success: 'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white',
    },
    ghost: {
        darkBlue: 'bg-transparent text-[#2C5A8C] hover:bg-[#2C5A8C]/10',
        gold: 'bg-transparent text-[#D3B66C] hover:bg-[#D3B66C]/10',
        white: 'bg-transparent text-gray-700 hover:bg-gray-100',
        danger: 'bg-transparent text-red-600 hover:bg-red-50',
        success: 'bg-transparent text-green-600 hover:bg-green-50',
    },
    link: {
        darkBlue: 'bg-transparent text-[#2C5A8C] hover:underline p-0',
        gold: 'bg-transparent text-[#D3B66C] hover:underline p-0',
        white: 'bg-transparent text-gray-700 hover:underline p-0',
        danger: 'bg-transparent text-red-600 hover:underline p-0',
        success: 'bg-transparent text-green-600 hover:underline p-0',
    },
};

export default function Button({
    size = 'medium',
    variant = 'solid',
    color = 'darkBlue',
    children,
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    loading = false,
    icon,
    iconPosition = 'left',
    tooltip,
    fullWidth = false,
    ...rest
}) {
    const sizeClasses = SIZES[size] || SIZES.medium;
    const variantClasses = VARIANTS[variant]?.[color] || VARIANTS.solid.darkBlue;
    const widthClass = fullWidth ? 'w-full' : '';

    const buttonContent = (
        <>
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>در حال پردازش...</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
                </div>
            )}
        </>
    );

    const button = (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${sizeClasses}
                ${variantClasses}
                ${widthClass}
                ${className}
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5A8C]
                active:scale-[0.98]
            `}
            aria-label={tooltip || (typeof children === 'string' ? children : undefined)}
            {...rest}
        >
            {buttonContent}
        </button>
    );

    if (tooltip) {
        return (
            <div className="relative group">
                {button}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
            </div>
        );
    }

    return button;
}
