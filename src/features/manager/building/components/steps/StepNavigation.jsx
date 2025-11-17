import Button from "../../../../../shared/components/shared/feedback/Button";

export default function StepNavigation({
    onPrev,
    onNext,
    isNextDisabled = false,
    hidePrev = false,
    prevLabel = "مرحله قبل",
    nextLabel = "مرحله بعد",
}) {
    return (
        <div className="flex justify-between mt-10 gap-4">
            {!hidePrev && (
                <Button
                    onClick={onPrev}
                    size="medium"
                    color="whiteBlue"
                    className="w-1/2"
                    disabled={!onPrev} // اگر onPrev تعریف نشده باشه، دکمه قبلی غیر فعال بشه
                >
                    {prevLabel}
                </Button>
            )}

            <Button
                onClick={onNext}
                disabled={isNextDisabled}
                size="medium"
                color="darkBlue"
                className={hidePrev ? "w-full" : "w-1/2"} // اگر دکمه قبلی نیست دکمه بعدی پهن‌تر بشه
            >
                {nextLabel}
            </Button>
        </div>
    );
}
