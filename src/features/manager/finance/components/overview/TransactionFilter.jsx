export default function TransactionFilter({ filter, setFilter, categories }) {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => setFilter(cat.value)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition-all
            ${filter === cat.value
                            ? "bg-melkingDarkBlue text-white border-transparent"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"}`}
                >
                    {cat.icon && <span className="text-[14px]">{cat.icon}</span>}
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
    );
}