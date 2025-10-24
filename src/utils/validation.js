import { VALIDATION } from './constants';

export const validateReportTitle = (title) => {
    const errors = [];

    if (!title || title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (title && title.length > VALIDATION.MAX_TITLE_LENGTH) {
        errors.push(`Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`);
    }

    return errors;
};

export const validateMachineDetails = (machineDetails) => {
    const errors = {};

    if (!machineDetails.make || machineDetails.make.trim().length === 0) {
        errors.make = 'Machine make is required';
    }

    if (!machineDetails.model || machineDetails.model.trim().length === 0) {
        errors.model = 'Machine model is required';
    }

    return errors;
};

export const validateUserComplaint = (complaint) => {
    const errors = [];

    if (!complaint || complaint.trim().length === 0) {
        errors.push('User complaint is required');
    }

    if (complaint && complaint.length > VALIDATION.MAX_COMPLAINT_LENGTH) {
        errors.push(`Complaint must be less than ${VALIDATION.MAX_COMPLAINT_LENGTH} characters`);
    }

    return errors;
};

export const validateFindings = (findings) => {
    const errors = [];

    if (!findings || findings.length === 0) {
        errors.push('At least one finding is required');
    }

    findings?.forEach((finding, index) => {
        if (finding.length > VALIDATION.MAX_FINDING_LENGTH) {
            errors.push(`Finding ${index + 1} must be less than ${VALIDATION.MAX_FINDING_LENGTH} characters`);
        }
    });

    return errors;
};

export const validateRecommendations = (recommendations) => {
    const errors = [];

    if (!recommendations || recommendations.length === 0) {
        errors.push('At least one recommendation is required');
    }

    recommendations?.forEach((rec, index) => {
        if (rec.length > VALIDATION.MAX_RECOMMENDATION_LENGTH) {
            errors.push(`Recommendation ${index + 1} must be less than ${VALIDATION.MAX_RECOMMENDATION_LENGTH} characters`);
        }
    });

    return errors;
};

export const validateCompleteReport = (reportData) => {
    const errors = {};

    const titleErrors = validateReportTitle(reportData.title);
    if (titleErrors.length > 0) {
        errors.title = titleErrors;
    }

    const machineErrors = validateMachineDetails(reportData.machineDetails || {});
    if (Object.keys(machineErrors).length > 0) {
        errors.machineDetails = machineErrors;
    }

    const complaintErrors = validateUserComplaint(reportData.userComplaint);
    if (complaintErrors.length > 0) {
        errors.userComplaint = complaintErrors;
    }

    const findingsErrors = validateFindings(reportData.findings);
    if (findingsErrors.length > 0) {
        errors.findings = findingsErrors;
    }

    const recommendationsErrors = validateRecommendations(reportData.recommendations);
    if (recommendationsErrors.length > 0) {
        errors.recommendations = recommendationsErrors;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateSearchFilters = (filters) => {
    const errors = {};

    if (filters.dateFrom && filters.dateTo) {
        const fromDate = new Date(filters.dateFrom);
        const toDate = new Date(filters.dateTo);

        if (fromDate > toDate) {
            errors.dateRange = 'From date must be before to date';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};