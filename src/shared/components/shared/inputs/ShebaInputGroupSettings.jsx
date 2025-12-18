import { useRef, useEffect, useState } from "react";

/**
 * کامپوننت ورودی شماره شبا برای Settings
 * این کامپوننت با یک رشته کامل شماره شبا کار می‌کنه (مثل "IR820540102680020817909002")
 */
export default function ShebaInputGroupSettings({ value = "", onChange, error }) {
    const inputsRef = useRef([]);
    const [parts, setParts] = useState({
        sheba_part0: "",
        sheba_part1: "",
        sheba_part2: "",
        sheba_part3: "",
        sheba_part4: "",
        sheba_part5: "",
        sheba_part6: "",
    });

    // Parse existing sheba number when value changes
    useEffect(() => {
        if (value && value.startsWith('IR') && value.length === 26) {
            const digits = value.substring(2); // Remove "IR" prefix
            setParts({
                sheba_part0: digits.substring(0, 2),
                sheba_part1: digits.substring(2, 6),
                sheba_part2: digits.substring(6, 10),
                sheba_part3: digits.substring(10, 14),
                sheba_part4: digits.substring(14, 18),
                sheba_part5: digits.substring(18, 22),
                sheba_part6: digits.substring(22, 24),
            });
        } else if (!value || value === '') {
            // Reset if empty
            setParts({
                sheba_part0: "",
                sheba_part1: "",
                sheba_part2: "",
                sheba_part3: "",
                sheba_part4: "",
                sheba_part5: "",
                sheba_part6: "",
            });
        }
    }, [value]);

    const handleChange = (e, index, maxLen) => {
        const inputValue = e.target.value.replace(/\D/g, "");
        
        const newParts = { ...parts, [`sheba_part${index}`]: inputValue };
        setParts(newParts);

        // Construct full sheba number
        const fullSheba = "IR" +
            (newParts.sheba_part0 || "") +
            (newParts.sheba_part1 || "") +
            (newParts.sheba_part2 || "") +
            (newParts.sheba_part3 || "") +
            (newParts.sheba_part4 || "") +
            (newParts.sheba_part5 || "") +
            (newParts.sheba_part6 || "");

        // Call onChange with the full sheba string
        if (onChange) {
            onChange(fullSheba === "IR" ? "" : fullSheba);
        }

        // Auto-focus next input when maxLength is reached
        if (inputValue.length === maxLen && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            (!parts[`sheba_part${index}`] || parts[`sheba_part${index}`].length === 0) &&
            inputsRef.current[index - 1]
        ) {
            e.preventDefault();
            inputsRef.current[index - 1].focus();
        }
    };

    return (
        <div>
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap" dir="ltr">
                <div className="w-10 sm:w-12 flex-shrink-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded select-none text-gray-700 font-bold text-xs sm:text-sm px-1 py-2 sm:py-2.5">
                    IR
                </div>
                <input
                    ref={(el) => (inputsRef.current[0] = el)}
                    type="text"
                    maxLength={2}
                    value={parts.sheba_part0}
                    onChange={(e) => handleChange(e, 0, 2)}
                    onKeyDown={(e) => handleKeyDown(e, 0)}
                    className={`w-10 sm:w-12 flex-shrink-0 text-center border rounded p-1.5 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 overflow-hidden ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    inputMode="numeric"
                    pattern="\d*"
                />
                {Array.from({ length: 5 }).map((_, idx) => (
                    <input
                        key={idx}
                        ref={(el) => (inputsRef.current[idx + 1] = el)}
                        type="text"
                        maxLength={4}
                        value={parts[`sheba_part${idx + 1}`]}
                        onChange={(e) => handleChange(e, idx + 1, 4)}
                        onKeyDown={(e) => handleKeyDown(e, idx + 1)}
                        className={`w-12 sm:w-16 flex-shrink-0 text-center border rounded p-1.5 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 overflow-hidden ${
                            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        inputMode="numeric"
                        pattern="\d*"
                    />
                ))}
                <input
                    ref={(el) => (inputsRef.current[6] = el)}
                    type="text"
                    maxLength={2}
                    value={parts.sheba_part6}
                    onChange={(e) => handleChange(e, 6, 2)}
                    onKeyDown={(e) => handleKeyDown(e, 6)}
                    className={`w-10 sm:w-12 flex-shrink-0 text-center border rounded p-1.5 sm:p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 overflow-hidden ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    inputMode="numeric"
                    pattern="\d*"
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600" dir="rtl">{error}</p>
            )}
        </div>
    );
}

