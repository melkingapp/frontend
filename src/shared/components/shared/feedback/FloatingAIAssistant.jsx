import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Bot } from "lucide-react";

export default function FloatingAIAssistant({ to = "/manager/legal-ai" }) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [hoverTimer, setHoverTimer] = useState(null);

    useEffect(() => {
        // نمایش کامل در ابتدا
        setIsVisible(true);
        
        // بعد از انیمیشن slide-in، flag را set کن
        const animationTimer = setTimeout(() => {
            setHasAnimated(true);
        }, 300);
        
        // بعد از 4 ثانیه جمع شود
        const collapseTimer = setTimeout(() => {
            setIsExpanded(false);
        }, 4000);

        return () => {
            clearTimeout(animationTimer);
            clearTimeout(collapseTimer);
        };
    }, []);

    const handleClick = () => {
        navigate(to);
    };

    const handleMouseEnter = () => {
        // لغو تایمر جمع شدن
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            setHoverTimer(null);
        }
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        // بعد از 2 ثانیه جمع شود
        const timer = setTimeout(() => {
            setIsExpanded(false);
        }, 2000);
        setHoverTimer(timer);
    };

    useEffect(() => {
        return () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
        };
    }, [hoverTimer]);

    if (!isVisible) return null;

    return (
        <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed left-0 top-2/3 -translate-y-1/2 z-50 group"
            title="دستیار ملکینگ"
        >
            <div className={`relative flex items-center bg-gradient-to-br from-melkingGold via-yellow-400 to-melkingGold text-melkingDarkBlue py-3.5 rounded-r-full rounded-l-none shadow-2xl hover:shadow-[0_10px_40px_rgba(211,182,108,0.4)] overflow-hidden ${
                isExpanded 
                    ? `pl-6 pr-5 ${!hasAnimated ? 'animate-slide-in-left' : ''}` 
                    : 'pl-3 pr-3'
            }`} style={{
                maxWidth: isExpanded ? '300px' : '56px',
                minWidth: isExpanded ? 'auto' : '56px',
                gap: isExpanded ? '12px' : '0px',
                paddingLeft: isExpanded ? '24px' : '12px',
                paddingRight: isExpanded ? '20px' : '12px',
                transition: 'max-width 700ms cubic-bezier(0.4, 0, 0.2, 1), gap 700ms cubic-bezier(0.4, 0, 0.2, 1), padding-left 700ms cubic-bezier(0.4, 0, 0.2, 1), padding-right 700ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-melkingGold to-yellow-400 rounded-r-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
                
                {/* Icon container with animation */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="absolute inset-0 bg-melkingDarkBlue/10 rounded-full animate-ping"></div>
                    <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                        <Bot className="w-5 h-5 relative z-10" />
                        <Sparkles className="w-3 h-3 absolute -top-0.5 -right-0.5 text-melkingDarkBlue animate-pulse" />
                    </div>
                </div>
                
                {/* Text */}
                <span className={`font-bold text-sm whitespace-nowrap tracking-wide relative z-10 pointer-events-none ${
                    isExpanded 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-2'
                }`} style={{
                    maxWidth: isExpanded ? '200px' : '0',
                    overflow: 'hidden',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1), max-width 700ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    دستیار ملکینگ
                </span>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 rounded-r-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500"></div>
            </div>
        </button>
    );
}

