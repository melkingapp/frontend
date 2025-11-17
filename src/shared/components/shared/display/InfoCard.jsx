export default function InfoCards({
    items,
    containerClass = "",
    cardClass = "",
    iconClass = "text-melkingGold",
    labelClass = "font-bold text-melkingGold",
    valueClass = "text-gray-800 font-medium"
}) {
    return (
        <div className={`flex flex-wrap justify-between gap-4 ${containerClass}`}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className={`flex-1 min-w-[120px] p-4 rounded-lg text-center ${item.cardClass || cardClass}`}
                    onClick={item.onClick}
                >
                    {item.icon && (
                        <item.icon className={`mx-auto mb-2 ${item.iconClass || iconClass}`} size={32} />
                    )}

                    {item.label && (
                        <h4 className={`mb-2 ${item.labelClass || labelClass}`}>{item.label}</h4>
                    )}

                    {item.value !== undefined && item.value !== null && item.value !== "" && (
                        <p className={valueClass}>{item.value}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
