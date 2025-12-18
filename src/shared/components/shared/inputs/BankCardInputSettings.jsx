import { useRef, useEffect, useState } from "react";

/**
 * کامپوننت ورودی شماره کارت بانکی برای Settings
 * این کامپوننت با یک رشته کامل شماره کارت کار می‌کنه (16 رقم)
 */
export default function BankCardInputSettings({ value = "", onChange, error }) {
    const inputsRef = useRef([]);
    const [parts, setParts] = useState({
        card_part0: "",
        card_part1: "",
        card_part2: "",
        card_part3: "",
    });

    // Parse existing card number when value changes
    useEffect(() => {
        if (value && value.length === 16 && /^\d+$/.test(value)) {
            setParts({
                card_part0: value.substring(0, 4),
                card_part1: value.substring(4, 8),
                card_part2: value.substring(8, 12),
                card_part3: value.substring(12, 16),
            });
        } else if (!value || value === '') {
            // Reset if empty
            setParts({
                card_part0: "",
                card_part1: "",
                card_part2: "",
                card_part3: "",
            });
        }
    }, [value]);

    const handleChange = (e, index) => {
        const inputValue = e.target.value.replace(/\D/g, "");
        
        const newParts = { ...parts, [`card_part${index}`]: inputValue };
        setParts(newParts);

        // Construct full card number
        const fullCard = 
            (newParts.card_part0 || "") +
            (newParts.card_part1 || "") +
            (newParts.card_part2 || "") +
            (newParts.card_part3 || "");

        // Call onChange with the full card string
        if (onChange) {
            onChange(fullCard === "" ? "" : fullCard);
        }

        // Auto-focus next input when maxLength is reached
        if (inputValue.length === 4 && inputsRef.current[index + 1]) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            (!parts[`card_part${index}`] || parts[`card_part${index}`].length === 0) &&
            inputsRef.current[index - 1]
        ) {
            e.preventDefault();
            inputsRef.current[index - 1].focus();
        }
    };

    return (
        <div>
            <div className="flex gap-2 sm:gap-3 items-center flex-wrap" dir="ltr">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <input
                        key={idx}
                        ref={(el) => (inputsRef.current[idx] = el)}
                        type="text"
                        maxLength={4}
                        value={parts[`card_part${idx}`]}
                        onChange={(e) => handleChange(e, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className={`w-16 sm:w-20 flex-shrink-0 text-center border rounded-lg p-2 sm:p-2.5 text-sm sm:text-base font-mono focus:outline-none focus:ring-2 overflow-hidden ${
                            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="••••"
                    />
                ))}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600" dir="rtl">{error}</p>
            )}
        </div>
    );
}

