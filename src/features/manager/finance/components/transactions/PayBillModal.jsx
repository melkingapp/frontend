import { useRef, useState } from "react";
import useClickOutside from "../../../../../shared/hooks/useClickOutside";

const BillInput = ({ label, name, value, onChange, placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-melkingDarkBlue mb-2">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-melkingGold"
            placeholder={placeholder}
        />
    </div>
);

const BillInfoCard = ({ billInfo }) => (
    <div className="border p-4 rounded-lg bg-gray-50 mb-4 text-melkingDarkBlue">
        {Object.entries(billInfo).map(([key, val]) => (
            <p key={key}><strong>{key}:</strong> {val}</p>
        ))}
    </div>
);

export default function PayBillModal({ isOpen, onClose, onPay }) {
    const initialForm = { billId: "", paymentId: "" };
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [billInfo, setBillInfo] = useState(null);
    const [error, setError] = useState("");

    const modalRef = useRef(null);
    useClickOutside(modalRef, () => {
        if (isOpen) handleClose();
    });

    if (!isOpen) return null;

    const resetForm = () => {
        setForm(initialForm);
        setBillInfo(null);
        setError("");
        setLoading(false);
    };

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleInquiry = () => {
        setError("");
        setBillInfo(null);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (form.billId === "123" && form.paymentId === "456") {
                setBillInfo({ نام: "آرمیتا احمدی", "مهلت پرداخت": "1404/06/10", "نوع قبض": "آب", مبلغ: "250,000 تومان" });
            } else {
                setError("شناسه‌های وارد شده معتبر نیستند.");
            }
        }, 1500);
    };

    const handlePay = () => {
        if (billInfo) {
            onPay(billInfo);
            handleClose();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div ref={modalRef}
                className="bg-melkingWhite rounded-xl shadow-lg p-6 w-[400px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-5 text-melkingDarkBlue border-b pb-3">پرداخت قبض</h2>

                <BillInput label="شناسه قبض" name="billId" value={form.billId} onChange={handleChange} placeholder="شناسه قبض را وارد کنید" />
                <BillInput label="شناسه پرداخت" name="paymentId" value={form.paymentId} onChange={handleChange} placeholder="شناسه پرداخت را وارد کنید" />

                <button
                    onClick={handleInquiry}
                    disabled={loading || !form.billId || !form.paymentId}
                    className="w-full py-3 bg-melkingDarkBlue text-white rounded-lg hover:bg-melkingGold hover:text-melkingDarkBlue transition mb-4 disabled:opacity-50"
                >
                    {loading ? "در حال استعلام..." : "استعلام"}
                </button>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {billInfo && <BillInfoCard billInfo={billInfo} />}

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">انصراف</button>
                    <button onClick={handlePay} disabled={!billInfo} className="px-5 py-2 rounded-lg bg-melkingDarkBlue text-white hover:bg-melkingGold hover:text-melkingDarkBlue disabled:opacity-50">
                        پرداخت
                    </button>
                </div>
            </div>
        </div>
    );
}