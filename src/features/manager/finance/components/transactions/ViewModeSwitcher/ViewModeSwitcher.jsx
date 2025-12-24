import { useMemo, useState } from "react";

export default function ViewModeSwitcher({
  viewMode,
  onViewModeChange,
  showDebtCredit,
  onShowDebtCredit,
  selectedUnitId,
  onUnitSelect,
  unitOptions,
  userUnits,
}) {
  const [unitSearch, setUnitSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const combinedOptions = useMemo(
    () => [
      ...(userUnits.length > 0
        ? [
            {
              value: "my_unit",
              label: `واحد من (${userUnits[0].unit_number || userUnits[0].units_id})`,
            },
          ]
        : []),
      ...unitOptions,
    ],
    [unitOptions, userUnits]
  );

  const filteredOptions = useMemo(() => {
    const term = unitSearch.trim().toLowerCase();
    if (!term) return combinedOptions;
    return combinedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        String(opt.value).toLowerCase().includes(term)
    );
  }, [combinedOptions, unitSearch]);

  const selectedLabel =
    combinedOptions.find((opt) => String(opt.value) === String(selectedUnitId))
      ?.label || "انتخاب واحد";

  const handleSelectValue = (value) => {
    onUnitSelect({ target: { value } });
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
      {/* View Mode Switcher */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
        <button
          onClick={() => {
            onViewModeChange('building');
            onShowDebtCredit(false);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'building' && !showDebtCredit
              ? 'bg-melkingDarkBlue text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          گردش مالی ساختمان
        </button>
        <button
          onClick={() => {
            onViewModeChange('charge');
            onShowDebtCredit(false);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'charge' && !showDebtCredit
              ? 'bg-melkingDarkBlue text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          شارژها
        </button>
        <button
          onClick={() => {
            onViewModeChange('unit');
            onShowDebtCredit(false);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'unit' && !showDebtCredit
              ? 'bg-melkingDarkBlue text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          گردش مالی واحد
        </button>
        <button
          onClick={() => {
            onShowDebtCredit(true);
            onViewModeChange('building');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showDebtCredit
              ? 'bg-melkingDarkBlue text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          بدهکاری و بستانکاری واحدها
        </button>
      </div>

      {/* Unit Selection (only in unit view mode) */}
      {viewMode === 'unit' && (
        <div className="flex-1 min-w-[220px] max-w-md w-full relative">
          <button
            type="button"
            className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-right flex justify-between items-center text-sm border-gray-200"
            onClick={() => setIsDropdownOpen((v) => !v)}
          >
            <span className="truncate">{selectedLabel}</span>
            <span className="text-gray-500 text-xs">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  placeholder="جستجو واحد..."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-melkingGold"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => handleSelectValue(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    واحدی یافت نشد
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

