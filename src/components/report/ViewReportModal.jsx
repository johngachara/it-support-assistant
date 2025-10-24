import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { reportService } from '../../services/database/reportService';
import RecommendationCard from "../ui/RecommendationCard.jsx";

const ViewReportModal = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        if (id) {
            loadReport();
        }
    }, [id]);

    const loadReport = async () => {
        setLoading(true);
        setError('');
        try {
            const report = await reportService.getReportById(id);
            setReportData({
                title: report.title || '',
                machineDetails: {
                    make: report.machine_make || '',
                    model: report.machine_model || '',
                    serialNumber: report.serial_number || '',
                    ram: report.ram || '',
                    storage: report.storage || '',
                    processor: report.processor || ''
                },
                userComplaint: report.user_complaint || '',
                findings: report.findings && report.findings.length > 0 ? report.findings : [],
                recommendations: report.recommendations && report.recommendations.length > 0 ? report.recommendations : [],
                preparedBy: report.prepared_by || '',
                reviewedBy: report.reviewed_by || '',
                createdAt: report.created_at,
                updatedAt: report.updated_at
            });
        } catch (err) {
            setError('Failed to load report: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate('/reports');
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            navigate('/reports');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        View Report
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackClick}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex">
                                <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6">
                            {/* Report Information */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                    Report Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Report Title
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.title || 'No title provided'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Prepared By
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-900 dark:text-white">{reportData.preparedBy || 'Not specified'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Reviewed By
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-900 dark:text-white">{reportData.reviewedBy || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Created
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-900 dark:text-white">
                                                    {reportData.createdAt ? new Date(reportData.createdAt).toLocaleString() : 'Not available'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Last Updated
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                <p className="text-gray-900 dark:text-white">
                                                    {reportData.updatedAt ? new Date(reportData.updatedAt).toLocaleString() : 'Not available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Machine Details */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                    Machine Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Make
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.machineDetails.make || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Model
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.machineDetails.model || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Serial Number
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.machineDetails.serialNumber || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            RAM
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.machineDetails.ram || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Storage
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.machineDetails.storage || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Processor
                                        </label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-white">{reportData.machineDetails.processor || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* User Complaint */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                    User Complaint
                                </h3>

                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {reportData.userComplaint || 'No complaint provided'}
                                    </p>
                                </div>
                            </Card>

                            {/* Findings */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                    Findings
                                </h3>

                                <div className="space-y-3">
                                    {reportData.findings.length > 0 ? (
                                        reportData.findings.map((finding, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{finding}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-500 dark:text-gray-400 italic">No findings provided</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Recommendations */}
                            <Card>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                    Recommendations
                                </h3>

                                <div className="space-y-3">
                                    {reportData.recommendations.length > 0 ? (
                                        reportData.recommendations.map((rec, index) => (
                                            <RecommendationCard key={rec.id || index} rec={rec} index={index} />
                                        ))
                                    ) : (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-500 dark:text-gray-400 italic">
                                                No recommendations provided
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    ) : null}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex justify-between">
                        <Button
                            onClick={handleBackClick}
                            variant="outline"
                        >
                            Back to Reports
                        </Button>
                        <Button
                            onClick={handleBackClick}
                            variant="primary"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewReportModal;