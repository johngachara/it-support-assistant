import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Card from '../ui/Card.jsx';
import ReportDownload from "./ReportDownload.jsx";

const ReportCard = ({ report, onEdit, onDelete, onDuplicate, onContinueDraft }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (report) => {
        if (report.is_draft) {
            return <Badge variant="info" size="sm">Draft</Badge>;
        }
        if (report.reviewed_by) {
            return <Badge variant="success" size="sm">Reviewed</Badge>;
        }
        return <Badge variant="warning" size="sm">Pending Review</Badge>;
    };

    const getMachineInfo = (report) => {
        const parts = [report.machine_make, report.machine_model].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Unknown Machine';
    };

    // Transform report data to match ReportDownload expected format
    const getReportDataForExport = () => ({
        title: report.title,
        machineDetails: {
            make: report.machine_make,
            model: report.machine_model,
            serialNumber: report.serial_number,
            ram : report.ram,
            storage: report.storage,
            processor: report.processor
        },
        userComplaint: report.user_complaint,
        preparedBy: report.prepared_by,
        createdAt: report.created_at,
        reviewedBy: report.reviewed_by,
        findings: report.findings || [],
        recommendations: report.recommendations || [],
    });

    return (
        <Card hover padding={false} className="overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <Link
                                to={`/reports/${report.id}`}
                                className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                            >
                                {report.title}
                            </Link>
                            {getStatusBadge(report)}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {getMachineInfo(report)}
                            </p>

                            {report.serial_number && (
                                <p className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    SN: {report.serial_number}
                                </p>
                            )}

                            <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                By {report.prepared_by || 'Unknown'}
                            </p>

                            <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDate(report.created_at)}
                            </p>
                        </div>

                        {report.user_complaint && (
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {report.user_complaint.length > 100
                                    ? `${report.user_complaint.substring(0, 100)}...`
                                    : report.user_complaint
                                }
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-1 ml-4">
                        {/* Export Button - renders as icon button */}
                        <div className="relative group">
                            <ReportDownload
                                reportData={getReportDataForExport()}
                                buttonText=""
                                buttonVariant="ghost"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Export report
                            </div>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={() => onDuplicate?.(report)}
                                className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                title="Duplicate report"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Duplicate report
                            </div>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={() => onEdit?.(report)}
                                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                title="Edit report"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Edit report
                            </div>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={() => onDelete?.(report)}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete report"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Delete report
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {report.is_draft ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="font-medium">Draft in progress</span>
                        </div>
                        <button
                            onClick={() => onContinueDraft?.(report)}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            Continue Editing
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {report.findings?.length || 0} findings
                            </span>
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                {report.recommendations?.length || 0} recommendations
                            </span>
                        </div>

                        <Link
                            to={`/reports/${report.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            View Details →
                        </Link>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ReportCard;