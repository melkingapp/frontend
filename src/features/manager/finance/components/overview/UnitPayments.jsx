import { useEffect, useRef, useState, useMemo } from "react";

export default function UnitPayments({ units = [] }) {
    const [visibleCount, setVisibleCount] = useState(4);
    const [filter, setFilter] = useState("all");
    const listRef = useRef(null);

    const filteredUnits = useMemo(() => {
        if (!units || !Array.isArray(units)) return [];
        return [...units]
            .filter(unit => {
                if (filter === "paid") return unit.status === "پرداخت‌شده";
                if (filter === "unpaid") return unit.status !== "پرداخت‌شده";
                return true;
            })
            .sort((a, b) => {
                if (a.status === "پرداخت‌شده" && b.status !== "پرداخت‌شده") return -1;
                if (a.status !== "پرداخت‌شده" && b.status === "پرداخت‌شده") return 1;
                return 0;
            });
    }, [units, filter]);

    const canShowMore = visibleCount < filteredUnits.length;

    const handleShowMore = () => setVisibleCount((prev) => prev + 10);

    useEffect(() => {
        if (listRef.current && listRef.current.scrollHeight > listRef.current.clientHeight) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [visibleCount]);

    const filters = [
        { label: "همه", key: "all", activeClass: "bg-white text-black" },
        { label: "پرداخت‌شده", key: "paid", activeClass: "bg-green-600 text-white" },
        { label: "پرداخت‌نشده", key: "unpaid", activeClass: "bg-red-600 text-white" },
    ];

    return (
        <div className="border rounded-xl p-5 bg-white shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="font-bold text-base text-gray-800">پرداختی واحدها</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                    {filters.map(({ label, key, activeClass }) => (
                        <button
                            key={`unit-filter-${key}`}
                            className={`px-3 py-1 rounded-md border transition ${filter === key ? activeClass : "bg-gray-100 text-gray-800"
                                }`}
                            onClick={() => {
                                setFilter(key);
                                setVisibleCount(4);
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div
                ref={listRef}
                className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
                {filteredUnits.slice(0, visibleCount).map((unit, index) => {
                    const isPaid = unit.status === "پرداخت‌شده";
                    return (
                        <div
                            key={`unit-${unit.id || unit.unit || index}-${unit.resident || 'unknown'}-${index}`} // کلید یکتا بهتره
                            className={`flex items-center justify-between gap-4 border px-4 py-3 rounded-lg text-sm transition ${isPaid
                                    ? "bg-green-50 border-green-400 text-green-800"
                                    : "bg-red-50 border-red-400 text-red-800"
                                }`}
                        >
                            <div className="font-medium truncate">
                                {unit.unit} - {unit.resident}
                            </div>
                            <div className="font-semibold whitespace-nowrap">{unit.status}</div>
                            {unit.paid_at && (
                                <div className="text-xs text-gray-600 whitespace-nowrap">{unit.paid_at}</div>
                            )}
                        </div>
                    );
                })}

                {filteredUnits.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">واحدی برای نمایش وجود ندارد.</div>
                )}
            </div>

            {canShowMore && (
                <button className="text-blue-600 text-sm mt-4 hover:underline" onClick={handleShowMore}>
                    مشاهده بیشتر
                </button>
            )}
        </div>
    );
}