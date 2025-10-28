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
            </div>
        </div>
    );
};

export default RecommendationCard;
