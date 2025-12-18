import { Check } from "lucide-react";
import { steps, chargeCategories, chargeTypes } from "../../constants/chargeTypes";

/**
 * Stepper component for charge announcement form
 */
export default function ChargeStepper({ currentStep, formData, getStepTitle }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-0">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 sm:flex-initial">
          <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 flex-shrink-0 ${
            currentStep > step.id
              ? 'bg-green-500 border-green-500 text-white'
              : currentStep === step.id
              ? 'border-yellow-500 text-yellow-500'
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step.id ? (
              <Check size={14} className="sm:w-4 sm:h-4" />
            ) : (
              <span className="text-xs sm:text-sm font-medium">{step.id}</span>
            )}
          </div>
          <div className="mr-2 sm:mr-3 flex-1 min-w-0">
            <p className={`text-xs sm:text-sm font-medium truncate ${
              currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {getStepTitle ? getStepTitle(step.id, formData) : step.title}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`hidden sm:block w-8 md:w-12 h-px mx-2 md:mx-4 flex-shrink-0 ${
              currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Helper function to get step title based on form data
 */
export const getStepTitle = (stepId, formData) => {
  if (stepId === 1) {
    if (formData?.chargeCategory && formData?.chargeType) {
      const categoryTitle = chargeCategories.find(cat => cat.id === formData.chargeCategory)?.title;
      const typeTitle = chargeTypes.find(type => type.id === formData.chargeType)?.title;
      return `${categoryTitle} - ${typeTitle}`;
    } else if (formData?.chargeCategory) {
      const categoryTitle = chargeCategories.find(cat => cat.id === formData.chargeCategory)?.title;
      return categoryTitle;
    }
    return 'انتخاب نوع و نحوه شارژ';
  }
  return steps.find(step => step.id === stepId)?.title || '';
};

