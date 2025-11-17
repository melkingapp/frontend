import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { confirmUnitAssignment } from "../../../../shared/services/unitManagementService";

export default function UnitAssignmentModal({ isOpen, onClose, unitData, suggestedRole, onConfirmed }) {
  const [role, setRole] = useState(suggestedRole || "owner");
  const [residentCount, setResidentCount] = useState(unitData?.resident_count ?? 1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(suggestedRole || "owner");
    setResidentCount(unitData?.resident_count ?? 1);
  }, [isOpen, unitData, suggestedRole]);

  const handleConfirm = async () => {
    if (!unitData?.units_id) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await confirmUnitAssignment({ 
        unit_id: unitData.units_id, 
        role, 
        resident_count: Number(residentCount) || 1 
      });
      onConfirmed?.(data);
      onClose?.();
    } catch (e) {
      setError("خطا در اتصال به سرور");
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => (submitting ? null : onClose?.())}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-bold text-gray-900">تأیید واحد تعریف شده</Dialog.Title>

                {error && (
                  <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
                )}

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">ساختمان</div>
                      <div className="font-medium">{unitData?.building_title}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">شماره واحد</div>
                      <div className="font-medium">{unitData?.unit_number}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">متراژ</div>
                      <div className="font-medium">{unitData?.area ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">نفرات ثبت‌شده</div>
                      <div className="font-medium">{unitData?.resident_count ?? 1}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نقش شما</label>
                      <select
                        className="w-full rounded-xl border border-gray-300 p-2.5"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="owner">مالک</option>
                        <option value="tenant">مستأجر</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تعداد نفرات</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-gray-300 p-2.5"
                        value={residentCount}
                        onChange={(e) => setResidentCount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={onClose} disabled={submitting}>
                    بستن
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-melkingDarkBlue text-white hover:bg-blue-800 disabled:opacity-50"
                    onClick={handleConfirm}
                    disabled={submitting}
                  >
                    {submitting ? "در حال ثبت..." : "تأیید"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}


