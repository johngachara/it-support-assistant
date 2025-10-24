import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import Badge from '../ui/Badge';
import { reportService } from '../../services/database/reportService';
import { validateCompleteReport } from '../../utils/validation';

const EditReportForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        machineDetails: {
            make: '',
            model: '',
            serialNumber: '',
            ram: '',
            storage: '',
            processor: ''
        },
        userComplaint: '',
        findings: [''],
        recommendations: [],
        preparedBy: '',
        reviewedBy: ''
    });

    useEffect(() => {
        if (id) {
            loadReport();
        }
    }, [id]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const report = await reportService.getReportById(id);
            setFormData({
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
                findings: report.findings && report.findings.length > 0 ? report.findings : [''],
                recommendations: report.recommendations && report.recommendations.length > 0 ? report.recommendations : [],
                preparedBy: report.prepared_by || '',
                reviewedBy: report.reviewed_by || ''
            });
        } catch (err) {
            setError('Failed to load report: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Clear validation error
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleArrayChange = (arrayName, index, value) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (arrayName) => {
        if (arrayName === 'recommendations') {
            // Add a new structured recommendation
            const newRec = {
                id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: '',
                priority: 'Medium',
                category: 'General',
                urgency: 'This Week (1-7 days)',
                description: '',
                steps: [''],
                prerequisites: [],
                estimated_time: 'Not specified',
                expected_outcome: '',
                risks: [],
                cost_estimate: 'Not specified',
                follow_up: '',
                alternative_solutions: []
            };
            setFormData(prev => ({
                ...prev,
                recommendations: [...prev.recommendations, newRec]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [arrayName]: [...prev[arrayName], '']
            }));
        }
    };

    const removeArrayItem = (arrayName, index) => {
        if (formData[arrayName].length > 1 || arrayName === 'recommendations') {
            setFormData(prev => ({
                ...prev,
                [arrayName]: prev[arrayName].filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateCompleteReport(formData);
        if (!validation.isValid) {
            console.error('errors', validation.errors);
            setValidationErrors(validation.errors);
            return;
        }

        setSaving(true);
        setError('');
        try {
            const updateData = {
                title: formData.title,
                machine_make: formData.machineDetails.make,
                machine_model: formData.machineDetails.model,
                serial_number: formData.machineDetails.serialNumber,
                ram: formData.machineDetails.ram,
                storage: formData.machineDetails.storage,
                processor: formData.machineDetails.processor,
                user_complaint: formData.userComplaint,
                findings: formData.findings.filter(f => f.trim()),
                recommendations: formData.recommendations,
                prepared_by: formData.preparedBy,
                reviewed_by: formData.reviewedBy,
                report_content: generateReportContent(formData)
            };

            await reportService.updateReport(id, updateData);
            navigate('/reports');
        } catch (err) {
            setError('Failed to update report: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const generateReportContent = (data) => {
        const recommendationsText = data.recommendations
            .map((rec, index) => {
                const steps = rec.steps?.filter(s => s.trim()).map((step, i) => `   ${i + 1}. ${step}`).join('\n') || '';
                return `${index + 1}. ${rec.title} [${rec.priority}]\n   Category: ${rec.category}\n   Urgency: ${rec.urgency}\n   ${rec.description}\n${steps ? '   Steps:\n' + steps : ''}`;
            })
            .join('\n\n');

        return `
# ${data.title}

## Machine Details
- Make & Model: ${data.machineDetails.make} ${data.machineDetails.model}
- Serial Number: ${data.machineDetails.serialNumber || 'N/A'}
- RAM: ${data.machineDetails.ram || 'N/A'}
- Storage: ${data.machineDetails.storage || 'N/A'}
- Processor: ${data.machineDetails.processor || 'N/A'}

## User Complaint
${data.userComplaint}

## Findings
${data.findings.filter(f => f.trim()).map((finding, index) => `${index + 1}. ${finding}`).join('\n')}

## Recommendations
${recommendationsText}

---
Report prepared by: ${data.preparedBy}
Report reviewed by: ${data.reviewedBy}
Last updated: ${new Date().toLocaleDateString()}
    `.trim();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Edit Report
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Update the report details and regenerate the content.
                </p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Report Information
                    </h3>

                    <div className="space-y-4">
                        <Input
                            label="Report Title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={validationErrors.title?.[0]}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Prepared By"
                                value={formData.preparedBy}
                                onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                                placeholder="Enter your name"
                            />

                            <Input
                                label="Reviewed By"
                                value={formData.reviewedBy}
                                onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
                                placeholder="Enter reviewer name"
                            />
                        </div>
                    </div>
                </Card>

                {/* Machine Details */}
                <Card>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                        Machine Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Make"
                            value={formData.machineDetails.make}
                            onChange={(e) => handleInputChange('machineDetails.make', e.target.value)}
                            error={validationErrors.machineDetails?.make}
                            required
                        />

                        <Input
                            label="Model"
                            value={formData.machineDetails.model}
                            onChange={(e) => handleInputChange('machineDetails.model', e.target.value)}
                            error={validationErrors.machineDetails?.model}
                            required
                        />

                        <Input
                            label="Serial Number"
                            value={formData.machineDetails.serialNumber}
                            onChange={(e) => handleInputChange('machineDetails.serialNumber', e.target.value)}
                        />

                        <Input
                            label="RAM"
                            value={formData.machineDetails.ram}
                            onChange={(e) => handleInputChange('machineDetails.ram', e.target.value)}
                            placeholder="e.g., 8GB DDR4"
                        />

                        <Input
                            label="Storage"
                            value={formData.machineDetails.storage}
                            onChange={(e) => handleInputChange('machineDetails.storage', e.target.value)}
                            placeholder="e.g., 512GB SSD"
                        />

                        <Input
                            label="Processor"
                            value={formData.machineDetails.processor}
                            onChange={(e) => handleInputChange('machineDetails.processor', e.target.value)}
                            placeholder="e.g., Intel Core i5"
                        />
                    </div>
                </Card>

                {/* User Complaint */}
                <Card>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                        User Complaint
                    </h3>

                    <TextArea
                        value={formData.userComplaint}
                        onChange={(e) => handleInputChange('userComplaint', e.target.value)}
                        error={validationErrors.userComplaint?.[0]}
                        rows={4}
                        placeholder="Describe the user's complaint or issue..."
                        required
                    />
                </Card>

                {/* Findings */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Findings
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('findings')}
                        >
                            Add Finding
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {formData.findings.map((finding, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium mt-2">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <TextArea
                                        value={finding}
                                        onChange={(e) => handleArrayChange('findings', index, e.target.value)}
                                        placeholder={`Enter finding ${index + 1}...`}
                                        rows={2}
                                    />
                                </div>

                                {formData.findings.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeArrayItem('findings', index)}
                                        className="text-red-600 hover:text-red-700 mt-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recommendations */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Recommendations
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('recommendations')}
                        >
                            Add Recommendation
                        </Button>
                    </div>

                    {formData.recommendations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No recommendations yet. Click "Add Recommendation" to create one.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.recommendations.map((recommendation, index) => (
                                <div key={recommendation.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                                    {/* Header with number and priority badge */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                                                {index + 1}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {recommendation.title || 'Untitled Recommendation'}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-3">
                                            <Badge variant={
                                                recommendation.priority === 'Critical' ? 'danger' :
                                                    recommendation.priority === 'High' ? 'warning' :
                                                        recommendation.priority === 'Medium' ? 'info' : 'default'
                                            } size="sm">
                                                {recommendation.priority}
                                            </Badge>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeArrayItem('recommendations', index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Category and Urgency */}
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                                            <span className="text-gray-600 dark:text-gray-400">{recommendation.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Urgency:</span>
                                            <span className="text-gray-600 dark:text-gray-400">{recommendation.urgency}</span>
                                        </div>
                                    </div>

                                    {/* Description (rendered as markdown) */}
                                    {recommendation.description && (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <div
                                                className="text-gray-700 dark:text-gray-300"
                                                dangerouslySetInnerHTML={{ __html: recommendation.description }}
                                            />
                                        </div>
                                    )}

                                    {/* Steps (rendered as markdown) */}
                                    {recommendation.steps && recommendation.steps.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                                Implementation Steps
                                            </h4>
                                            <div className="space-y-3">
                                                {recommendation.steps.map((step, stepIndex) => (
                                                    <div key={stepIndex} className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                                                            {stepIndex + 1}
                                                        </div>
                                                        <div
                                                            className="flex-1 text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: step }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional fields */}
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Estimated Time: </span>
                                                <span className="text-gray-600 dark:text-gray-400">{recommendation.estimated_time}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Cost Estimate: </span>
                                                <span className="text-gray-600 dark:text-gray-400">{recommendation.cost_estimate}</span>
                                            </div>
                                        </div>

                                        {recommendation.expected_outcome && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    Expected Outcome
                                                </h4>
                                                <div
                                                    className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: recommendation.expected_outcome }}
                                                />
                                            </div>
                                        )}

                                        {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    Prerequisites
                                                </h4>
                                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                    {recommendation.prerequisites.map((prereq, i) => (
                                                        <li key={i}>{prereq}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {recommendation.risks && recommendation.risks.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    Risks
                                                </h4>
                                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                    {recommendation.risks.map((risk, i) => (
                                                        <li key={i}>{risk}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {recommendation.alternative_solutions && recommendation.alternative_solutions.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    Alternative Solutions
                                                </h4>
                                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                    {recommendation.alternative_solutions.map((alt, i) => (
                                                        <li key={i}>{alt}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {recommendation.follow_up && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    Follow Up
                                                </h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {recommendation.follow_up}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Form Actions */}
                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/reports')}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={saving}
                    >
                        Update Report
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditReportForm;