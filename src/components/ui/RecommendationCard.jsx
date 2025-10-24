import React from "react";

const RecommendationCard = ({ rec, index }) => {
    return (
        <div className="flex items-start space-x-3">
            {/* Number bubble */}
            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6
                      bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300
                      rounded-full text-sm font-medium">
                {index + 1}
            </div>

            {/* Recommendation body */}
            <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border
                      border-gray-200 dark:border-gray-600 space-y-2">

                {/* Title */}
                <h4 className="text-gray-900 dark:text-white font-semibold">
                    {rec.title}
                </h4>

                {/* Description */}
                {rec.description && (
                    <p
                        className="text-gray-700 dark:text-gray-300 text-sm"
                        dangerouslySetInnerHTML={{ __html: rec.description }}
                    />
                )}

                {/* Steps */}
                {rec.steps && rec.steps.length > 0 && (
                    <ol className="list-decimal ml-5 text-sm space-y-1">
                        {rec.steps.map((step, i) => (
                            <li
                                key={i}
                                className="text-gray-700 dark:text-gray-300"
                                dangerouslySetInnerHTML={{ __html: step }}
                            />
                        ))}
                    </ol>
                )}

                {/* Risks */}
                {rec.risks && rec.risks.length > 0 && (
                    <ul className="list-disc ml-5 text-sm text-red-500 dark:text-red-400 space-y-1">
                        {rec.risks.map((risk, i) => (
                            <li key={i}>{risk}</li>
                        ))}
                    </ul>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>Priority: {rec.priority || ''}</span> ·{" "}
                    <span>Urgency: {rec.urgency || ''}</span> ·{" "}
                    <span>Category: {rec.category || ''}</span>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
