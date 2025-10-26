import React from "react";

const RecommendationCard = ({ rec, index }) => {
    return (
        <div className="flex items-start space-x-2 sm:space-x-3">
            {/* Number bubble */}
            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7
                      bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300
                      rounded-full text-xs sm:text-sm font-medium mt-0.5">
                {index + 1}
            </div>

            {/* Recommendation body */}
            <div className="flex-1 min-w-0 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-md border
                      border-gray-200 dark:border-gray-600 space-y-2">

                {/* Title */}
                <h4 className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold break-words">
                    {rec.title}
                </h4>

                {/* Description */}
                {rec.description && (
                    <div
                        className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm break-words prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: rec.description }}
                    />
                )}

                {/* Steps */}
                {rec.steps && rec.steps.length > 0 && (
                    <ol className="list-decimal ml-4 sm:ml-5 text-xs sm:text-sm space-y-1">
                        {rec.steps.map((step, i) => (
                            <li
                                key={i}
                                className="text-gray-700 dark:text-gray-300 break-words pl-1"
                                dangerouslySetInnerHTML={{ __html: step }}
                            />
                        ))}
                    </ol>
                )}

                {/* Risks */}
                {rec.risks && rec.risks.length > 0 && (
                    <ul className="list-disc ml-4 sm:ml-5 text-xs sm:text-sm text-red-500 dark:text-red-400 space-y-1">
                        {rec.risks.map((risk, i) => (
                            <li key={i} className="break-words pl-1">{risk}</li>
                        ))}
                    </ul>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="inline-block">Priority: {rec.priority || ''}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="inline-block">Urgency: {rec.urgency || ''}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="inline-block">Category: {rec.category || ''}</span>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
