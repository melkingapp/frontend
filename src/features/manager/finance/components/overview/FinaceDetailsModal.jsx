import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Wallet } from "lucide-react";
import UnitPayments from "./UnitPayments";
import DocumentViewer from "../../../../../shared/components/shared/display/DocumentViewer";

const statusStyles = {
  "پرداخت‌شده": "bg-green-100 text-green-700",
  "لغو شده": "bg-red-100 text-red-700",
  "منتظر": "bg-red-100 text-red-700",
  "ممتاز": "bg-yellow-100 text-yellow-700",
};

const allocationLabels = {
  owner: "مالک",
  resident: "ساکن",
  both: "هردو",
};

const distributionLabels = {
  equal: "مساوی",
  per_person: "بر اساس تعداد نفر",
  area: "بر اساس متراژ",
  parking: "بر اساس تعداد پارکینگ",
};

export default function FinancenDetailsModal({ transaction, building, onClose }) {
  if (!transaction) return null;

  const infoGroups = [
    [
      { label: "💰 مبلغ", value: `${transaction.amount.toLocaleString()} تومان` },
      { label: "📅 تاریخ ایجاد", value: transaction.date },
    ],
    [
      { label: "🏢 ساختمان", value: building.title },
      { label: "🔢 نحوه تخصیص", value: distributionLabels[transaction.distribution] || "—" },
    ],
    [
      { label: "👥 مسئول پرداخت", value: allocationLabels[transaction.allocation] || "—" },
    ],
    [
      { label: "🧱 واحدهای مشمول", value: transaction.unitSummery },
      { label: "💳 روش پرداخت", value: transaction.method || "—" },
    ],
    [
      {
        label: "وضعیت پرداخت",
        value: (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[transaction.status] || "bg-gray-100 text-gray-600"
              }`}
          >
            {transaction.status}
          </span>
        ),
      },
    ],
  ];

  return (
    <Transition show as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white text-right shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center border-b p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="text-primary" />
                  <Dialog.Title className="text-lg font-bold">{transaction.title}</Dialog.Title>
                </div>
                <button onClick={onClose}>
                  <X className="text-gray-500 hover:text-red-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-4 text-sm text-gray-700 flex-1">
                {infoGroups.map((group, i) => (
                  <div key={`info-group-${i}`} className="grid grid-cols-2 gap-x-4 gap-y-3 border rounded-lg p-3">
                    {group.map(({ label, value }, idx) => (
                      <div key={`info-${i}-${idx}-${label}`} className="flex flex-col text-sm">
                        <span className="text-gray-500 text-xs">{label}</span>
                        <span className="text-gray-800 mt-2">{value}</span>
                      </div>
                    ))}
                  </div>
                ))}

                {transaction.invoiceImageUrl && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold text-melkingDarkBlue">فاکتور</h2>
                    <DocumentViewer documentUrl={transaction.invoiceImageUrl} />
                  </>
                )}

                <UnitPayments units={transaction.units} />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}