import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReportCard from '../components/report/ReportCard.jsx';
import { reportService } from '../services/database/reportService';
import {useReportActions} from "../hooks/useReportActions.js";
import Modal from "../components/ui/Modal.jsx";

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        week: 0,
        month: 0
    });
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const {
        handleEdit,
        handleDelete,
        confirmDelete,
        handleDuplicate,
        handleContinueDraft,
        deleteModal,
        setDeleteModal,
        deleting,
    } = useReportActions({ onReload: () => loadDashboardData() });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, recentData] = await Promise.all([
                reportService.getReportsStats(),
                reportService.getRecentReports(6)
            ]);

            setStats(statsData);
            setRecentReports(recentData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
        <Card className="relative overflow-hidden">
            <div className="flex items-center">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </p>
                    <p className={`text-2xl font-bold text-gray-900 dark:text-white`}>
                        {value}
                    </p>
                    {change && (
                        <p className={`text-sm ${
                            change > 0
                                ? 'text-green-600 dark:text-green-400'
                                : change < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-500 dark:text-gray-400'
                        }`}>
                            {change > 0 ? '+' : ''}{change}% from last period
                        </p>
                    )}
                </div>

                <div className={`flex items-center justify-center w-12 h-12 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
                    {icon}
                </div>
            </div>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Overview of your IT support reports and system status.
                    </p>
                </div>

                <Button onClick={() => navigate('/create-report')}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Report
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Reports"
                    value={stats.total}
                    icon={
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    color="blue"
                />

                <StatCard
                    title="Today"
                    value={stats.today}
                    icon={
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="green"
                />

                <StatCard
                    title="This Week"
                    value={stats.week}
                    icon={
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    }
                    color="purple"
                />

                <StatCard
                    title="This Month"
                    value={stats.month}
                    icon={
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                    color="orange"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Quick Actions
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                            onClick={() => navigate('/create-report')}
                        >
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">Create Report</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Start a new IT support report</p>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                            onClick={() => navigate('/chat')}
                        >
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">AI Assistant</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Get help from AI support</p>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                            onClick={() => navigate('/reports')}
                        >
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-4">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v3m0 4h14" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">View All Reports</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Browse existing reports</p>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                            onClick={() => window.print()}
                        >
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg mr-4">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">System Status</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Check system health</p>
                                </div>
                            </div>
                        </Button>
                    </div>
                </Card>

                {/* System Status */}
                <Card>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        System Status
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">AI Service</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-green-600">Online</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-green-600">Connected</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Web Search</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-green-600">Available</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Export Service</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-green-600">Ready</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Reports */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Recent Reports
                    </h2>

                    <Link
                        to="/reports"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        View all reports →
                    </Link>
                </div>

                {recentReports.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating your first IT support report.
                        </p>
                        <div className="mt-6">
                            <Button onClick={() => navigate('/create-report')}>
                                Create Your First Report
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {recentReports.slice(0, 4).map((report) => (
                            <div  key={report.id}  className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                <ReportCard
                                    report={report}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onDuplicate={handleDuplicate}
                                    onContinueDraft={handleContinueDraft}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
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

export default Dashboard;