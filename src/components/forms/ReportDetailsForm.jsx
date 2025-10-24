import { useState, useEffect } from 'react';
import Input from '../ui/Input.jsx';
import TextArea from '../ui/TextArea.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

const ReportDetailsForm = ({ initialData, onNext, onSave }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        machineDetails: {
            make: initialData?.machineDetails?.make || '',
            model: initialData?.machineDetails?.model || '',
            serialNumber: initialData?.machineDetails?.serialNumber || '',
            ram: initialData?.machineDetails?.ram || '',
            storage: initialData?.machineDetails?.storage || '',
            processor: initialData?.machineDetails?.processor || ''
        },
        userComplaint: initialData?.userComplaint || ''
    });

    // Update form data when initialData changes (for duplicate/draft scenarios)
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                title: initialData.title || '',
                machineDetails: {
                    make: initialData.machineDetails?.make || '',
                    model: initialData.machineDetails?.model || '',
                    serialNumber: initialData.machineDetails?.serialNumber || '',
                    ram: initialData.machineDetails?.ram || '',
                    storage: initialData.machineDetails?.storage || '',
                    processor: initialData.machineDetails?.processor || ''
                },
                userComplaint: initialData.userComplaint || ''
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

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

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Report title is required';
        }

        if (!formData.machineDetails.make.trim()) {
            newErrors['machineDetails.make'] = 'Machine make is required';
        }

        if (!formData.machineDetails.model.trim()) {
            newErrors['machineDetails.model'] = 'Machine model is required';
        }

        if (!formData.userComplaint.trim()) {
            newErrors.userComplaint = 'User complaint is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            onNext(formData);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Report Information
                        </h3>

                        <Input
                            label="Report Title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={errors.title}
                            placeholder="e.g., Laptop RAM Upgrade Request - John Doe"
                            required
                        />
                    </div>

                    <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                            Machine Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Make"
                                value={formData.machineDetails.make}
                                onChange={(e) => handleInputChange('machineDetails.make', e.target.value)}
                                error={errors['machineDetails.make']}
                                placeholder="e.g., HP"
                                required
                            />

                            <Input
                                label="Model"
                                value={formData.machineDetails.model}
                                onChange={(e) => handleInputChange('machineDetails.model', e.target.value)}
                                error={errors['machineDetails.model']}
                                placeholder="e.g., ProBook 450 G9"
                                required
                            />

                            <Input
                                label="Serial Number"
                                value={formData.machineDetails.serialNumber}
                                onChange={(e) => handleInputChange('machineDetails.serialNumber', e.target.value)}
                                placeholder="e.g., 5CD2306JD0"
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
                                placeholder="e.g., Intel® Core™ i5-1235U"
                            />
                        </div>
                    </div>

                    <div>
                        <TextArea
                            label="User Complaint"
                            value={formData.userComplaint}
                            onChange={(e) => handleInputChange('userComplaint', e.target.value)}
                            error={errors.userComplaint}
                            placeholder="Describe the user's complaint or issue in detail..."
                            rows={4}
                            required
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-between">
                <div></div> {/* Spacer for alignment */}

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
                        Next: Add Findings
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsForm;