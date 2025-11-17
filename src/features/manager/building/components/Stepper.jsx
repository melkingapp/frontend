import { Building, Home, Settings, CheckCircle } from "lucide-react";

const steps = [
  { icon: Home, label: "مشخصات کلی" },
  { icon: Building, label: "اطلاعات مدیر" },
  { icon: Settings, label: "صندوق مالی" },
  { icon: CheckCircle, label: "مرور نهایی" },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center w-full px-4 py-8 overflow-x-auto">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = index + 1 === currentStep;
        const isDone = index + 1 < currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isDone
                    ? "bg-[#1C2E4E] text-white shadow-md"
                    : isActive
                      ? "bg-[#1C2E4E] text-white ring-4 ring-[#1C2E4E80] scale-105 shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
              >
                <StepIcon size={24} />
              </div>
              <span
                className={`mt-2 text-sm font-medium text-center ${isDone || isActive ? "text-[#1C2E4E]" : "text-gray-500"
                  }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-1 relative min-w-[60px]">
                <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-gray-300 rounded" />
                <div
                  className="absolute top-1/2 right-0 h-1 -translate-y-1/2 bg-[#1C2E4E] rounded transition-all duration-500"
                  style={{
                    width:
                      currentStep > index + 1
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}