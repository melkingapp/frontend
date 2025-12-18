const SIZES = {
    small: 'w-[110px] h-[48px] rounded-[10px] py-[12px] text-[16px] font-bold',
    medium: 'w-[130px] h-[48px] rounded-[10px] py-[12px] text-[18px] font-bold',
    large: 'w-[250px] h-[48px] rounded-[10px] py-[12px] text-[18px] font-bold',
    xlarge: 'w-[200px] h-[60px] rounded-[10px] py-[12px] text-[18px] font-bold',
    xxlarge: 'w-[300px] h-[60px] rounded-[10px] py-[12px] text-[18px] font-bold',
};

const COLORS = {
    darkBlue: 'bg-[#1C2E4E] text-white hover:bg-[#182544]',
    gold: 'bg-[#D3B66C] text-white hover:bg-[#c5a956]',
    whiteBlue: 'bg-white border-2 border-[#2C5A8C] text-[#2C5A8C] hover:bg-[#2C5A8C] hover:text-white',
    white: 'bg-white text-black border-2 border-black hover:bg-gray-100',
};

const SPINNER_COLORS = {
    darkBlue: 'border-white',
    gold: 'border-white',
    whiteBlue: 'border-[#2C5A8C]',
    white: 'border-black',
};

export default function Button({
    size = 'medium',
    color = 'darkBlue',
    children,
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    loading = false,
    ...rest
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            aria-busy={loading}
            className={`
          ${SIZES[size]} 
          ${COLORS[color]} 
          ${className}
          transition-all duration-300 
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center
        `}
            {...rest}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 border-2 ${SPINNER_COLORS[color] || 'border-white'} border-t-transparent rounded-full animate-spin`}></div>
                    <span>در حال پردازش...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
