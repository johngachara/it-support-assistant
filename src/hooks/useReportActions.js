import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/database/reportService';
import { showToast, handleDatabaseError } from '../utils/toast';

export const useReportActions = ({ onReload }) => {
    const navigate = useNavigate();
    const [deleteModal, setDeleteModal] = useState({ show: false, report: null });
    const [deleting, setDeleting] = useState(false);

    const handleEdit = (report) => {
        navigate(`/reports/${report.id}/edit`);
    };

    const handleDelete = (report) => {
        setDeleteModal({ show: true, report });
    };

    const confirmDelete = async () => {
        if (!deleteModal.report) return;
        setDeleting(true);

        try {
            await reportService.deleteReport(deleteModal.report.id);
            setDeleteModal({ show: false, report: null });
            showToast.success('Report deleted successfully');
            onReload?.(); // let parent re-fetch data
        } catch (err) {
            console.error("Delete failed", err);
            handleDatabaseError(err, 'delete report');
        } finally {
            setDeleting(false);
        }
    };

    const handleDuplicate = (report) => {
        navigate('/create-report', {
            state: {
                duplicateFrom: {
                    title: `${report.title} (Copy)`,
                    machineDetails: {
                        make: report.machine_make,
                        model: report.machine_model,
                        serialNumber: report.serial_number,
                        ram: report.ram,
                        storage: report.storage,
                        processor: report.processor,
                    },
                    userComplaint: report.user_complaint,
                    findings: report.findings,
                    recommendations: report.recommendations,
                },
                isDraft: false,
                startStep: 0
            },
        });
    };

    const handleContinueDraft = (report) => {
        navigate('/create-report', {
            state: {
                duplicateFrom: {
                    id: report.id, // Keep the ID to update the draft
                    title: report.title,
                    machineDetails: {
                        make: report.machine_make,
                        model: report.machine_model,
                        serialNumber: report.serial_number,
                        ram: report.ram,
                        storage: report.storage,
                        processor: report.processor,
                    },
                    userComplaint: report.user_complaint,
                    findings: report.findings || [],
                    recommendations: report.recommendations || [],
                    preparedBy: report.prepared_by,
                    reviewedBy: report.reviewed_by,
                },
                isDraft: true,
                startStep: report.draft_step || 0
            },
        });
    };

    return {
        handleEdit,
        handleDelete,
        confirmDelete,
        handleDuplicate,
        handleContinueDraft,
        deleteModal,
        setDeleteModal,
        deleting,
    };
};
