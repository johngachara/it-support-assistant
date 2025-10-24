import { createContext, useContext, useReducer, useEffect } from 'react';
import { reportService } from '../services/database/reportService';

const ReportContext = createContext();

// Action types
const REPORT_ACTIONS = {
    LOADING: 'LOADING',
    LOAD_SUCCESS: 'LOAD_SUCCESS',
    LOAD_ERROR: 'LOAD_ERROR',
    CREATE_SUCCESS: 'CREATE_SUCCESS',
    UPDATE_SUCCESS: 'UPDATE_SUCCESS',
    DELETE_SUCCESS: 'DELETE_SUCCESS',
    SET_CURRENT: 'SET_CURRENT',
    CLEAR_CURRENT: 'CLEAR_CURRENT',
    SET_FILTERS: 'SET_FILTERS',
    SET_PAGINATION: 'SET_PAGINATION'
};

// Initial state
const initialState = {
    reports: [],
    currentReport: null,
    loading: false,
    error: null,
    filters: {
        search: '',
        dateFrom: '',
        dateTo: '',
        machineType: '',
        preparedBy: '',
        status: ''
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 12
    },
    stats: {
        total: 0,
        today: 0,
        week: 0,
        month: 0
    }
};

// Reducer
const reportReducer = (state, action) => {
    switch (action.type) {
        case REPORT_ACTIONS.LOADING:
            return {
                ...state,
                loading: true,
                error: null
            };

        case REPORT_ACTIONS.LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                reports: action.payload.reports,
                pagination: {
                    ...state.pagination,
                    ...action.payload.pagination
                },
                error: null
            };

        case REPORT_ACTIONS.LOAD_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case REPORT_ACTIONS.CREATE_SUCCESS:
            return {
                ...state,
                reports: [action.payload, ...state.reports],
                stats: {
                    ...state.stats,
                    total: state.stats.total + 1,
                    today: state.stats.today + 1
                }
            };

        case REPORT_ACTIONS.UPDATE_SUCCESS:
            return {
                ...state,
                reports: state.reports.map(report =>
                    report.id === action.payload.id ? action.payload : report
                ),
                currentReport: state.currentReport?.id === action.payload.id ? action.payload : state.currentReport
            };

        case REPORT_ACTIONS.DELETE_SUCCESS:
            return {
                ...state,
                reports: state.reports.filter(report => report.id !== action.payload),
                currentReport: state.currentReport?.id === action.payload ? null : state.currentReport,
                stats: {
                    ...state.stats,
                    total: Math.max(0, state.stats.total - 1)
                }
            };

        case REPORT_ACTIONS.SET_CURRENT:
            return {
                ...state,
                currentReport: action.payload
            };

        case REPORT_ACTIONS.CLEAR_CURRENT:
            return {
                ...state,
                currentReport: null
            };

        case REPORT_ACTIONS.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload
                }
            };

        case REPORT_ACTIONS.SET_PAGINATION:
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    ...action.payload
                }
            };

        default:
            return state;
    }
};

// Provider component
export const ReportProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reportReducer, initialState);

    // Load reports
    const loadReports = async (customFilters = {}) => {
        dispatch({ type: REPORT_ACTIONS.LOADING });

        try {
            const filters = { ...state.filters, ...customFilters };
            const result = await reportService.getReports({
                page: state.pagination.currentPage,
                limit: state.pagination.pageSize,
                ...filters
            });

            dispatch({
                type: REPORT_ACTIONS.LOAD_SUCCESS,
                payload: {
                    reports: result.data,
                    pagination: {
                        currentPage: result.page,
                        totalPages: result.totalPages,
                        totalCount: result.count,
                        pageSize: result.limit
                    }
                }
            });

            return result;
        } catch (error) {
            dispatch({
                type: REPORT_ACTIONS.LOAD_ERROR,
                payload: error.message
            });
            throw error;
        }
    };

    // Create report
    const createReport = async (reportData) => {
        try {
            const newReport = await reportService.createReport(reportData);
            dispatch({
                type: REPORT_ACTIONS.CREATE_SUCCESS,
                payload: newReport
            });
            return newReport;
        } catch (error) {
            dispatch({
                type: REPORT_ACTIONS.LOAD_ERROR,
                payload: error.message
            });
            throw error;
        }
    };

    // Update report
    const updateReport = async (id, updateData) => {
        try {
            const updatedReport = await reportService.updateReport(id, updateData);
            dispatch({
                type: REPORT_ACTIONS.UPDATE_SUCCESS,
                payload: updatedReport
            });
            return updatedReport;
        } catch (error) {
            dispatch({
                type: REPORT_ACTIONS.LOAD_ERROR,
                payload: error.message
            });
            throw error;
        }
    };

    // Delete report
    const deleteReport = async (id) => {
        try {
            await reportService.deleteReport(id);
            dispatch({
                type: REPORT_ACTIONS.DELETE_SUCCESS,
                payload: id
            });
        } catch (error) {
            dispatch({
                type: REPORT_ACTIONS.LOAD_ERROR,
                payload: error.message
            });
            throw error;
        }
    };

    // Get single report
    const getReport = async (id) => {
        dispatch({ type: REPORT_ACTIONS.LOADING });

        try {
            const report = await reportService.getReportById(id);
            dispatch({
                type: REPORT_ACTIONS.SET_CURRENT,
                payload: report
            });
            return report;
        } catch (error) {
            dispatch({
                type: REPORT_ACTIONS.LOAD_ERROR,
                payload: error.message
            });
            throw error;
        }
    };

    // Set filters
    const setFilters = (newFilters) => {
        dispatch({
            type: REPORT_ACTIONS.SET_FILTERS,
            payload: newFilters
        });
    };

    // Set pagination
    const setPagination = (paginationData) => {
        dispatch({
            type: REPORT_ACTIONS.SET_PAGINATION,
            payload: paginationData
        });
    };

    // Clear current report
    const clearCurrentReport = () => {
        dispatch({ type: REPORT_ACTIONS.CLEAR_CURRENT });
    };

    // Load stats
    const loadStats = async () => {
        try {
            const stats = await reportService.getReportsStats();
            dispatch({
                type: REPORT_ACTIONS.LOAD_SUCCESS,
                payload: {
                    reports: state.reports,
                    pagination: state.pagination,
                    stats
                }
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    // Search reports
    const searchReports = async (searchFilters) => {
        setFilters(searchFilters);
        await loadReports(searchFilters);
    };

    // Change page
    const changePage = async (page) => {
        setPagination({ currentPage: page });
        await loadReports();
    };

    // Load initial data
    useEffect(() => {
        loadReports();
        loadStats();
    }, []);

    // Context value
    const value = {
        ...state,
        loadReports,
        createReport,
        updateReport,
        deleteReport,
        getReport,
        setFilters,
        setPagination,
        clearCurrentReport,
        searchReports,
        changePage,
        loadStats
    };

    return (
        <ReportContext.Provider value={value}>
            {children}
        </ReportContext.Provider>
    );
};

// Hook to use the report context
export const useReportContext = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReportContext must be used within a ReportProvider');
    }
    return context;
};

// Export action types for external use if needed
export { REPORT_ACTIONS };