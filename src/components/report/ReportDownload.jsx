import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { PDFExportService } from '../../services/export/pdfExport';
import { DOCXExportService } from '../../services/export/docxExport';

const ReportDownload = ({ reportData, buttonText = "Download Report", buttonVariant = "primary" }) => {
    const [showModal, setShowModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('docx');
    const [fileName, setFileName] = useState('');
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!fileName.trim()) {
            alert('Please enter a file name');
            return;
        }

        setDownloading(true);

        try {
            if (exportFormat === 'pdf') {
                await PDFExportService.exportToPDF(reportData, fileName);
            } else {
                await DOCXExportService.exportToDOCX(reportData, fileName);
            }

            setShowModal(false);
            setFileName('');
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const getDefaultFileName = () => {
        const title = reportData.title || 'IT-Support-Report';
        const date = new Date().toISOString().split('T')[0];
        return `${title.replace(/\s+/g, '-')}-${date}`;
    };

    return (
        <>
            <Button
                variant={buttonVariant}
                onClick={() => {
                    setFileName(getDefaultFileName());
                    setShowModal(true);
                }}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {buttonText}
            </Button>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Download Report"
                size="md"
            >
                <div className="space-y-6">
                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Choose Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {/*<button*/}
                            {/*    type="button"*/}
                            {/*    onClick={() => setExportFormat('pdf')}*/}
                            {/*    className={`p-4 border-2 rounded-lg text-left transition-all ${*/}
                            {/*        exportFormat === 'pdf'*/}
                            {/*            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'*/}
                            {/*            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'*/}
                            {/*    }`}*/}
                            {/*>*/}
                            {/*    <div className="flex items-center space-x-3">*/}
                            {/*        <div className="flex-shrink-0">*/}
                            {/*            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">*/}
                            {/*                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>*/}
                            {/*            </svg>*/}
                            {/*        </div>*/}
                            {/*        <div>*/}
                            {/*            <p className="font-medium text-gray-900 dark:text-white">PDF</p>*/}
                            {/*            <p className="text-sm text-gray-500 dark:text-gray-400">*/}
                            {/*                Universal format, great for viewing and printing*/}
                            {/*            </p>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</button>*/}

                            <button
                                type="button"
                                onClick={() => setExportFormat('docx')}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                    exportFormat === 'docx'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                            <polyline points="14,2 14,8 20,8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                            <polyline points="10,9 9,9 8,9"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Word Document</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Editable format for Microsoft Word
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* File Name Input */}
                    <Input
                        label="File Name"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name (without extension)"
                        helperText={`File will be saved as: ${fileName}.${exportFormat}`}
                        required
                    />

                    {/* Preview Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Preview</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Title:</span> {reportData.title || 'Untitled Report'}</p>
                            <p><span className="font-medium">Machine:</span> {reportData.machineDetails?.make} {reportData.machineDetails?.model}</p>
                            <p><span className="font-medium">Findings:</span> {reportData.findings?.length || 0} items</p>
                            <p><span className="font-medium">Recommendations:</span> {reportData.recommendations?.length || 0} items</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            disabled={downloading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDownload}
                            loading={downloading}
                            disabled={!fileName.trim()}
                        >
                            {downloading ? 'Preparing Download...' : `Download ${exportFormat.toUpperCase()}`}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ReportDownload;