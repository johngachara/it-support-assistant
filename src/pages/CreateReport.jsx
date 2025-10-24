import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReportProgress from '../components/report/ReportProgress';
import ReportDetailsForm from '../components/forms/ReportDetailsForm';
import FindingsForm from '../components/forms/FindingsForm';
import AIRecommendationsStep from '../components/report/AIRecommendationsStep';
import ReportPreview from '../components/report/ReportPreview';
import { reportService } from '../services/database/reportService';
import { showToast, handleDatabaseError } from '../utils/toast';

const CreateReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDraftMode, setIsDraftMode] = useState(false);
    const [draftId, setDraftId] = useState(null);

    const steps = [
        {
            id: 'details',
            name: 'Details',
            description: 'Machine details and complaint'
        },
        {
            id: 'findings',
            name: 'Findings',
            description: 'Technical findings'
        },
        {
            id: 'recommendations',
            name: 'Recommendations',
            description: 'AI-generated solutions'
        },
        {
            id: 'review',
            name: 'Review',
            description: 'Preview and finalize'
        }
    ];

    // Load duplicate or draft data if provided
    useEffect(() => {
        if (location.state?.duplicateFrom) {
            setReportData(location.state.duplicateFrom);
            setCurrentStep(location.state.startStep || 0);
            setIsDraftMode(location.state.isDraft || false);
            setDraftId(location.state.duplicateFrom.id || null);
            // Clear the location state to prevent issues on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const updateReportData = useCallback((newData) => {
        setReportData(prev => ({ ...prev, ...newData }));
    }, []);

    const handleNext = (stepData) => {
        updateReportData(stepData);
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSaveDraft = async (stepData = {}) => {


        const dataToSave = { ...reportData, ...stepData };

        setLoading(true);
        setError('');

        try {
            // Determine which step the user is on for draft continuation
            let draftStep = currentStep;

            // If we have findings, user is at least on step 2
            if (dataToSave.findings && dataToSave.findings.length > 0) {
                draftStep = Math.max(draftStep, 1);
            }

            // If we have recommendations, user is at least on step 3
            if (dataToSave.recommendations && dataToSave.recommendations.length > 0) {
                draftStep = Math.max(draftStep, 2);
            }

            const reportPayload = {
                title: dataToSave.title,
                machine_make: dataToSave.machineDetails?.make,
                machine_model: dataToSave.machineDetails?.model,
                serial_number: dataToSave.machineDetails?.serialNumber,
                ram: dataToSave.machineDetails?.ram,
                storage: dataToSave.machineDetails?.storage,
                processor: dataToSave.machineDetails?.processor,
                user_complaint: dataToSave.userComplaint,
                findings: dataToSave.findings || [],
                recommendations: dataToSave.recommendations || [],
                report_content: generateReportContent(dataToSave),
                prepared_by: dataToSave.preparedBy || 'IT Admin',
                reviewed_by: dataToSave.reviewedBy,
                is_draft: true,
                draft_step: draftStep
            };


            let savedDraft;
            if (isDraftMode && draftId) {
                // Update existing draft
                savedDraft = await reportService.updateReport(draftId, reportPayload);
            } else {
                // Create new draft
                savedDraft = await reportService.createReport(reportPayload);
                setDraftId(savedDraft.id);
                setIsDraftMode(true);
            }

            // Navigate back to reports with success message
            showToast.success('Draft saved successfully! You can continue editing it later.');
            navigate('/reports');
        } catch (err) {
            setError('Failed to save draft: ' + err.message);
            handleDatabaseError(err, 'save draft');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (finalData) => {
        const completeData = { ...reportData, ...finalData };

        setLoading(true);
        setError('');

        try {
            const reportPayload = {
                title: completeData.title,
                machine_make: completeData.machineDetails?.make,
                machine_model: completeData.machineDetails?.model,
                serial_number: completeData.machineDetails?.serialNumber,
                ram: completeData.machineDetails?.ram,
                storage: completeData.machineDetails?.storage,
                processor: completeData.machineDetails?.processor,
                user_complaint: completeData.userComplaint,
                findings: completeData.findings || [],
                recommendations: completeData.recommendations || [],
                report_content: generateReportContent(completeData),
                prepared_by: completeData.preparedBy || 'IT Admin',
                reviewed_by: completeData.reviewedBy,
                is_draft: false,
                draft_step: null // Clear draft step when completing
            };

            if (isDraftMode && draftId) {
                // Convert draft to completed report
                await reportService.updateReport(draftId, reportPayload);
                showToast.success('Report finalized successfully!');
            } else {
                // Create new report
                await reportService.createReport(reportPayload);
                showToast.success('Report created successfully!');
            }

            navigate('/reports');
        } catch (err) {
            setError('Failed to create report: ' + err.message);
            handleDatabaseError(err, 'create report');
        } finally {
            setLoading(false);
        }
    };

    const generateReportContent = (data) => {
        // Generate formatted report content for storage
        return `
# ${data.title || 'IT Support Report'}

## Machine Details
- Make & Model: ${data.machineDetails?.make || ''} ${data.machineDetails?.model || ''}
- Serial Number: ${data.machineDetails?.serialNumber || 'N/A'}
- RAM: ${data.machineDetails?.ram || 'N/A'}
- Storage: ${data.machineDetails?.storage || 'N/A'}
- Processor: ${data.machineDetails?.processor || 'N/A'}

## User Complaint
${data.userComplaint || 'No complaint specified'}

## Findings
${data.findings?.map((finding, index) => `${index + 1}. ${finding}`).join('\n') || 'No findings specified'}

## Recommendations
${data.recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || 'No recommendations generated'}

---
Report prepared by: ${data.preparedBy || 'IT Admin'}
Date: ${new Date().toLocaleDateString()}
    `.trim();
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <ReportDetailsForm
                        initialData={reportData}
                        onNext={handleNext}
                        onSave={handleSaveDraft}
                    />
                );
            case 1:
                return (
                    <FindingsForm
                        initialData={reportData}
                        onNext={handleNext}
                        onBack={handleBack}
                        onSave={handleSaveDraft}
                    />
                );
            case 2:
                return (
                    <AIRecommendationsStep
                        reportData={reportData}
                        onNext={handleNext}
                        onBack={handleBack}
                        onSave={handleSaveDraft}
                    />
                );
            case 3:
                return (
                    <ReportPreview
                        reportData={reportData}
                        onBack={handleBack}
                        onSubmit={handleFinalSubmit}
                        onSave={handleSaveDraft}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create IT Support Report
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Follow the steps to create a comprehensive technical report with AI-powered recommendations.
                </p>

                {location.state?.duplicateFrom && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            {location.state.isDraft ? (
                                <>📝 Continuing draft: "{location.state.duplicateFrom.title}"</>
                            ) : (
                                <>📋 Creating report from template: "{location.state.duplicateFrom.title}"</>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex">
                        <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <ReportProgress currentStep={currentStep} steps={steps} />

            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {renderCurrentStep()}
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-900 dark:text-white">Processing...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateReport;