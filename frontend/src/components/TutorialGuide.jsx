function TutorialGuide({ isOpen, steps, currentStep, onNext, onPrev, onSkip, onFinish }) {
  if (!isOpen || !steps?.length) {
    return null;
  }

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30" />

      <section className="pointer-events-auto absolute bottom-4 left-4 right-4 mx-auto max-w-xl rounded-2xl border border-green-200 bg-white p-5 shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-[28rem]">
        <p className="text-xs font-semibold uppercase tracking-wide text-rescue-dark">Tutorial</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{step.title}</h3>
        <p className="mt-2 text-sm text-slate-700">{step.description}</p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-green-100">
          <div
            className="h-full rounded-full bg-rescue-primary transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Step {currentStep + 1} / {steps.length}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Skip tutorial
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirst}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {!isLast && (
              <button
                type="button"
                onClick={onNext}
                className="rounded-lg bg-rescue-primary px-3 py-2 text-sm font-semibold text-white hover:bg-rescue-dark"
              >
                Next
              </button>
            )}

            {isLast && (
              <button
                type="button"
                onClick={onFinish}
                className="rounded-lg bg-rescue-primary px-3 py-2 text-sm font-semibold text-white hover:bg-rescue-dark"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TutorialGuide;