import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import RecommendationCard from "../ui/RecommendationCard.jsx";

const ReportPreview = ({ reportData, onBack, onSubmit, onSave }) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('docx');
    const [fileName, setFileName] = useState('');
    const [preparedBy, setPreparedBy] = useState(reportData.preparedBy || 'IT Admin');
    const [reviewedBy, setReviewedBy] = useState(reportData.reviewedBy || '');
    const [exporting, setExporting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit({
                preparedBy,
                reviewedBy,
                finalSubmission: true
            });
        } finally {
            setSubmitting(false);
        }
    };

    const exportToPDF = async (content, filename) => {
        const { PDFExportService } = await import('../../services/export/pdfExport.js');
        await PDFExportService.exportToPDF({
            ...reportData,
            preparedBy,
            reviewedBy
        }, filename);
    };

    const exportToDocx = async (content, filename) => {
        const { DOCXExportService } = await import('../../services/export/docxExport.js');
        await DOCXExportService.exportToDOCX({
            ...reportData,
            preparedBy,
            reviewedBy
        }, filename);
    };

    const handleExport = async () => {
        if (!fileName.trim()) {
            alert('Please enter a file name');
            return;
        }

        setExporting(true);
        try {
            if (exportFormat === 'pdf') {
                await exportToPDF(null, fileName);
            } else {
                await exportToDocx(null, fileName);
            }

            setShowExportModal(false);
            setFileName('');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Report Preview
                        </h3>
                        <Button
                            variant="outline"
                            onClick={() => setShowExportModal(true)}
                        >
                            Export Report
                        </Button>
                    </div>

                    {/* Report Preview */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6 shadow-sm">
                        <div className="text-center border-b-2 border-gray-900 dark:border-gray-300 pb-4 mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {reportData.title || 'IT Support Report'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
                        </div>

                        {/* Machine Details */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
                                Machine Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-900 dark:text-white">
                                    <span className="font-medium">Make & Model:</span> {reportData.machineDetails?.make} {reportData.machineDetails?.model}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-900 dark:text-white">
                                    <span className="font-medium">Serial Number:</span> {reportData.machineDetails?.serialNumber || 'N/A'}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-900 dark:text-white">
                                    <span className="font-medium">RAM:</span> {reportData.machineDetails?.ram || 'N/A'}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-900 dark:text-white">
                                    <span className="font-medium">Storage:</span> {reportData.machineDetails?.storage || 'N/A'}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded md:col-span-2 text-gray-900 dark:text-white">
                                    <span className="font-medium">Processor:</span> {reportData.machineDetails?.processor || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* User Complaint */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
                                User Complaint
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {reportData.userComplaint || 'No complaint specified'}
                            </p>
                        </div>

                        {/* Findings */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
                                Findings
                            </h2>
                            <ol className="space-y-3">
                                {reportData.findings?.map((finding, index) => (
                                    <li key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border-l-4 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-white">
                                        <span className="font-medium">{index + 1}.</span> {finding}
                                    </li>
                                )) || <li className="text-gray-500 dark:text-gray-400">No findings specified</li>}
                            </ol>
                        </div>

                        {/* Recommendations */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">
                                Recommendations
                            </h2>
                            <ol className="space-y-3">
                                {reportData.recommendations?.length > 0 ? (
                                    reportData.recommendations.map((rec, index) => (
                                        <li key={rec.id || index}>
                                            <RecommendationCard rec={rec} index={index} />
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 dark:text-gray-400">No recommendations generated</li>
                                )}
                            </ol>

                        </div>

                        {/* Signature Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                            <div>
                                <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Report Prepared By</h4>
                                <div className="space-y-2">
                                    <Input
                                        label="Name"
                                        value={preparedBy}
                                        onChange={(e) => setPreparedBy(e.target.value)}
                                        placeholder="Enter preparer name"
                                    />
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p>Date: _________________________</p>
                                        <p>Sign: _________________________</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Reviewed By</h4>
                                <div className="space-y-2">
                                    <Input
                                        label="Name"
                                        value={reviewedBy}
                                        onChange={(e) => setReviewedBy(e.target.value)}
                                        placeholder="Enter reviewer name"
                                    />
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p>Date: _________________________</p>
                                        <p>Sign: _________________________</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onBack}
                >
                    Back to Recommendations
                </Button>

                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => onSave({ preparedBy, reviewedBy })}
                    >
                        Save Draft
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        Create Report
                    </Button>
                </div>
            </div>

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Export Report"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            File Format
                        </label>
                        <div className="space-y-2">
                            {/*<label className="flex items-center">*/}
                            {/*    <input*/}
                            {/*        type="radio"*/}
                            {/*        value="pdf"*/}
                            {/*        checked={exportFormat === 'pdf'}*/}
                            {/*        onChange={(e) => setExportFormat(e.target.value)}*/}
                            {/*        className="mr-2"*/}
                            {/*    />*/}
                            {/*    PDF Document*/}
                            {/*</label>*/}
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="docx"
                                    checked={exportFormat === 'docx'}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="mr-2"
                                />
                                Word Document (.docx)
                            </label>
                        </div>
                    </div>

                    <Input
                        label="File Name"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name (without extension)"
                        required
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowExportModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExport}
                            loading={exporting}
                        >
                            Export {exportFormat.toUpperCase()}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportPreview;