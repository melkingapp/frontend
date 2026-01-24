const VARIANTS = {
    text: "h-4 bg-gray-200 rounded animate-pulse",
    title: "h-6 bg-gray-200 rounded animate-pulse",
    paragraph: "h-4 bg-gray-200 rounded animate-pulse",
    card: "h-32 bg-gray-200 rounded-lg animate-pulse",
    list: "h-12 bg-gray-200 rounded animate-pulse",
    table: "h-10 bg-gray-200 rounded animate-pulse",
    circle: "h-12 w-12 bg-gray-200 rounded-full animate-pulse",
    avatar: "h-10 w-10 bg-gray-200 rounded-full animate-pulse",
};

export default function Skeleton({
    variant = "text",
    width,
    height,
    className = "",
    count = 1,
}) {
    const baseClasses = VARIANTS[variant] || VARIANTS.text;
    const style = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;

    if (count > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={`${baseClasses} ${className}`}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${baseClasses} ${className}`}
            style={style}
            aria-label="در حال بارگذاری..."
            role="status"
        />
    );
}

// Compound components for common patterns
export function SkeletonCard({ className = "" }) {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            <Skeleton variant="circle" className="mb-3" />
            <Skeleton variant="title" width="60%" className="mb-2" />
            <Skeleton variant="paragraph" width="100%" className="mb-1" />
            <Skeleton variant="paragraph" width="80%" />
        </div>
    );
}

export function SkeletonList({ count = 3, className = "" }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} variant="list" />
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            variant="table"
                            width={`${100 / cols}%`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
