const ReportProgress = ({ currentStep, steps, onStepClick, allowStepNavigation = false }) => {
    const getStepStatus = (stepIndex) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'current';
        return 'upcoming';
    };

    const getStepClasses = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-blue-600 text-white';
            case 'current':
                return 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/20';
            case 'upcoming':
                return 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400';
            default:
                return '';
        }
    };

    const getConnectorClasses = (stepIndex) => {
        return stepIndex < currentStep
            ? 'bg-blue-600'
            : 'bg-gray-300 dark:bg-gray-600';
    };

    return (
        <div className="mb-6 sm:mb-8 overflow-hidden">
            <nav aria-label="Progress" className="mx-auto max-w-4xl">
                <ol className="flex items-center overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {steps.map((step, index) => (
                        <li key={step.id} className={`relative flex-shrink-0 ${index !== steps.length - 1 ? 'pr-8 sm:pr-0 sm:flex-1' : ''}`}>
                            {/* Connector Line */}
                            {index !== steps.length - 1 && (
                                <div className="absolute top-4 left-4 -ml-px h-0.5 w-full hidden sm:flex items-center" aria-hidden="true">
                                    <div className={`h-0.5 flex-1 transition-all duration-500 ${getConnectorClasses(index)}`} />
                                </div>
                            )}

                            {/* Step Content */}
                            <div className="group relative flex items-start">
                <span className="flex h-9 items-center flex-shrink-0">
                  <span
                      className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${getStepClasses(getStepStatus(index))} ${
                          allowStepNavigation && onStepClick ? 'cursor-pointer hover:scale-110' : ''
                      }`}
                      onClick={() => allowStepNavigation && onStepClick && onStepClick(index)}
                  >
                    {getStepStatus(index) === 'completed' ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : getStepStatus(index) === 'current' ? (
                        <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white" />
                    ) : (
                        <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-transparent border-2 border-current" />
                    )}
                  </span>
                </span>

                                <span className="ml-2 sm:ml-4 flex min-w-0 flex-col max-w-[120px] sm:max-w-none">
                  <span
                      className={`text-xs sm:text-sm font-medium transition-colors truncate sm:whitespace-normal ${
                          getStepStatus(index) === 'upcoming'
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-blue-600 dark:text-blue-400'
                      } ${allowStepNavigation && onStepClick ? 'cursor-pointer hover:text-blue-700 dark:hover:text-blue-300' : ''}`}
                      onClick={() => allowStepNavigation && onStepClick && onStepClick(index)}
                      title={step.name}
                  >
                    {step.name}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate sm:whitespace-normal" title={step.description}>
                    {step.description}
                  </span>
                </span>
                            </div>

                            {/* Step Status Indicator */}
                            {getStepStatus(index) === 'current' && (
                                <div className="absolute -bottom-2 left-3 sm:left-4 flex items-center">
                                    <div className="h-0.5 sm:h-1 w-6 sm:w-8 bg-blue-600 rounded-full animate-pulse" />
                                </div>
                            )}
                        </li>
                    ))}
                </ol>

                {/* Progress Bar */}
                <div className="mt-4 sm:mt-6 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Progress Text */}
                <div className="mt-2 flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span className="hidden sm:inline">{Math.round(((currentStep) / (steps.length - 1)) * 100)}% Complete</span>
                    <span className="sm:hidden">{Math.round(((currentStep) / (steps.length - 1)) * 100)}%</span>
                </div>
            </nav>
        </div>
    );
};

export default ReportProgress;