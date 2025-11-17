import { useRef } from "react";

export default function ShebaInputGroup({ formData, setFormData }) {
    const inputsRef = useRef([]);

    const handleChange = (e, index, maxLen) => {
        const value = e.target.value.replace(/\D/g, "");
        setFormData((prev) => {
            const newFormData = { ...prev, [`sheba_part${index}`]: value };
            if (value.length === maxLen && inputsRef.current[index + 1]) {
                inputsRef.current[index + 1].focus();
            }
            return newFormData;
        });
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            (!formData[`sheba_part${index}`] || formData[`sheba_part${index}`].length === 0) &&
            inputsRef.current[index - 1]
        ) {
            e.preventDefault();
            inputsRef.current[index - 1].focus();
        }
    };

    return (
        <div className="flex gap-1 sm:gap-2 items-center flex-wrap" dir="ltr">
            <div className="w-10 sm:w-12 flex-shrink-0 flex items-center justify-center bg-gray-100 border rounded select-none text-gray-600 font-bold text-xs sm:text-sm px-1 py-1 sm:py-2">
                IR
            </div>
            <input
                ref={(el) => (inputsRef.current[0] = el)}
                type="text"
                maxLength={2}
                value={formData?.sheba_part0 || ""}
                onChange={(e) => handleChange(e, 0, 2)}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                className="w-10 sm:w-12 flex-shrink-0 text-center border rounded p-1 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue overflow-hidden"
                inputMode="numeric"
                pattern="\d*"
            />
            {Array.from({ length: 5 }).map((_, idx) => (
                <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx + 1] = el)}
                    type="text"
                    maxLength={4}
                    value={formData?.[`sheba_part${idx + 1}`] || ""}
                    onChange={(e) => handleChange(e, idx + 1, 4)}
                    onKeyDown={(e) => handleKeyDown(e, idx + 1)}
                    className="w-12 sm:w-16 flex-shrink-0 text-center border rounded p-1 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue overflow-hidden"
                    inputMode="numeric"
                    pattern="\d*"
                />
            ))}
            <input
                ref={(el) => (inputsRef.current[6] = el)}
                type="text"
                maxLength={2}
                value={formData?.sheba_part6 || ""}
                onChange={(e) => handleChange(e, 6, 2)}
                onKeyDown={(e) => handleKeyDown(e, 6)}
                className="w-10 sm:w-12 flex-shrink-0 text-center border rounded p-1 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-melkingDarkBlue overflow-hidden"
                inputMode="numeric"
                pattern="\d*"
            />
        </div>
    );
}