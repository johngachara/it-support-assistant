import { useState } from 'react';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import Card from '../ui/Card';

const FindingsForm = ({ initialData, onNext, onBack, onSave }) => {
    const [findings, setFindings] = useState(initialData?.findings || ['']);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const addFinding = () => {
        setFindings(prev => [...prev, '']);
    };

    const removeFinding = (index) => {
        if (findings.length > 1) {
            setFindings(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateFinding = (index, value) => {
        setFindings(prev => prev.map((finding, i) => i === index ? value : finding));

        // Clear error for this finding
        if (errors[`finding_${index}`]) {
            setErrors(prev => ({
                ...prev,
                [`finding_${index}`]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const validFindings = findings.filter(finding => finding.trim());

        if (validFindings.length === 0) {
            newErrors.general = 'At least one finding is required';
        }

        findings.forEach((finding, index) => {
            if (index === 0 && !finding.trim()) {
                newErrors[`finding_${index}`] = 'First finding is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            const validFindings = findings.filter(finding => finding.trim());
            onNext({ findings: validFindings });
        }
    };

    const handleSave = async () => {
        const validFindings = findings.filter(finding => finding.trim());
        if (validFindings.length === 0) return;

        setSaving(true);
        try {
            await onSave({ findings: validFindings });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Technical Findings
                        </h3>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addFinding}
                        >
                            Add Finding
                        </Button>
                    </div>

                    {errors.general && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                            {errors.general}
                        </div>
                    )}

                    <div className="space-y-4">
                        {findings.map((finding, index) => (
                            <div key={index} className="relative">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium mt-2">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <TextArea
                                            value={finding}
                                            onChange={(e) => updateFinding(index, e.target.value)}
                                            placeholder={`Describe finding ${index + 1}...`}
                                            rows={3}
                                            error={errors[`finding_${index}`]}
                                        />
                                    </div>

                                    {findings.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFinding(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 mt-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex">
                            <svg className="flex-shrink-0 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Tips for Good Findings
                                </h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Be specific and technical</li>
                                        <li>Include measurements where relevant</li>
                                        <li>Focus on observable facts</li>
                                        <li>Avoid solutions (those come in recommendations)</li>
                                    </ul>
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
                    Back to Details
                </Button>

                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleSave}
                        loading={saving}
                    >
                        Save Draft
                    </Button>

                    <Button
                        onClick={handleNext}
                    >
                        Next: Generate Recommendations
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FindingsForm;