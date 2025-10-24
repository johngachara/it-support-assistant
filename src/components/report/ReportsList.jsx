import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportCard from './ReportCard.jsx';
import SearchBar from '../../pages/SearchBar.jsx';
import Pagination from '../ui/Pagination.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import { reportService } from '../../services/database/reportService.js';
import {useReportActions} from "../../hooks/useReportActions.js";

const ReportsList = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchFilters, setSearchFilters] = useState({});
    const {
        handleEdit,
        handleDelete,
        confirmDelete,
        handleDuplicate,
        handleContinueDraft,
        deleteModal,
        setDeleteModal,
        deleting,
    } = useReportActions({ onReload: () => loadReports(searchFilters) });
    const itemsPerPage = 12;

    useEffect(() => {
        loadReports();
    }, [currentPage]);

    const loadReports = async (filters = {}) => {
        const isSearch = Object.keys(filters).length > 0;
        setLoading(!isSearch);
        setSearchLoading(isSearch);

        try {
            const result = await reportService.getReports({
                page: currentPage,
                limit: itemsPerPage,
                ...filters
            });

            setReports(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.count);

            if (isSearch) {
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleSearch = (filters) => {
        setSearchFilters(filters);
        loadReports(filters);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        All Reports
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {totalCount} total reports found
                    </p>
                </div>

                <Button onClick={() => navigate('/create-report')}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Report
                </Button>
            </div>

            <SearchBar onSearch={handleSearch} loading={searchLoading} />

            {reports.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Get started by creating a new IT support report.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/create-report')}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Report
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onDuplicate={handleDuplicate}
                                onContinueDraft={handleContinueDraft}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, report: null })}
                title="Delete Report"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete "{deleteModal.report?.title}"? This action cannot be undone.
                    </p>

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal({ show: false, report: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            loading={deleting}
                        >
                            Delete Report
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportsList;