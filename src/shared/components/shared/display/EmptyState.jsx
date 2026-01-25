import { AlertCircle, Inbox, Search, FileX } from "lucide-react";
import Button from "../feedback/Button";

const DEFAULT_ICONS = {
    default: Inbox,
    search: Search,
    error: AlertCircle,
    empty: FileX,
};

export default function EmptyState({
    icon,
    iconType = "default",
    title = "هیچ داده‌ای یافت نشد",
    description,
    actionLabel,
    onAction,
    className = "",
}) {
    const IconComponent = icon || DEFAULT_ICONS[iconType] || DEFAULT_ICONS.default;

    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="text-gray-400 mb-4">
                <IconComponent size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
            )}
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="outline"
                    color="darkBlue"
                    size="medium"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
