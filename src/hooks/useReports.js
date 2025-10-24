import { useState, useEffect } from 'react';
import { reportService } from '../services/database/reportService';

export const useReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadReports = async (filters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await reportService.getReports(filters);
            setReports(result.data);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createReport = async (reportData) => {
        try {
            const newReport = await reportService.createReport(reportData);
            setReports(prev => [newReport, ...prev]);
            return newReport;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateReport = async (id, updateData) => {
        try {
            const updatedReport = await reportService.updateReport(id, updateData);
            setReports(prev => prev.map(report =>
                report.id === id ? updatedReport : report
            ));
            return updatedReport;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deleteReport = async (id) => {
        try {
            await reportService.deleteReport(id);
            setReports(prev => prev.filter(report => report.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    return {
        reports,
        loading,
        error,
        loadReports,
        createReport,
        updateReport,
        deleteReport
    };
};