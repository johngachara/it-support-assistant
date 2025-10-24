import { supabase } from './supabaseClient.js';

class ReportService {
    constructor() {
        this.tableName = 'reports';
    }

    // Create a new report
    async createReport(reportData) {
        try {

            const insertData = {
                title: reportData.title,
                machine_make: reportData.machine_make || reportData.machineDetails?.make,
                machine_model: reportData.machine_model || reportData.machineDetails?.model,
                serial_number: reportData.serial_number || reportData.machineDetails?.serialNumber,
                ram: reportData.ram || reportData.machineDetails?.ram,
                storage: reportData.storage || reportData.machineDetails?.storage,
                processor: reportData.processor || reportData.machineDetails?.processor,
                user_complaint: reportData.user_complaint || reportData.userComplaint,
                findings: reportData.findings || [],
                recommendations: reportData.recommendations || [],
                report_content: reportData.report_content || reportData.reportContent,
                prepared_by: reportData.prepared_by || reportData.preparedBy || 'IT Admin',
                reviewed_by: reportData.reviewed_by || reportData.reviewedBy,
                is_draft: reportData.is_draft || false,
                draft_step: reportData.draft_step || null
            };



            const { data, error } = await supabase
                .from(this.tableName)
                .insert([insertData])
                .select()
                .single();


            if (error) {
                console.error('Error creating report:', error);
                throw new Error(`Failed to create report: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error in createReport:', error);
            throw error;
        }
    }

    // Get all reports with pagination and search
    async getReports({
                         page = 1,
                         limit = 10,
                         search = '',
                         sortBy = 'created_at',
                         sortOrder = 'desc'
                     } = {}) {
        try {
            let query = supabase
                .from(this.tableName)
                .select('*', { count: 'exact' });

            // Apply search filter
            if (search) {
                query = query.or(
                    `title.ilike.%${search}%,` +
                    `machine_make.ilike.%${search}%,` +
                    `machine_model.ilike.%${search}%,` +
                    `serial_number.ilike.%${search}%,` +
                    `user_complaint.ilike.%${search}%,` +
                    `prepared_by.ilike.%${search}%`
                );
            }

            // Apply sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Apply pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching reports:', error);
                throw new Error(`Failed to fetch reports: ${error.message}`);
            }

            return {
                data: data || [],
                count: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            };
        } catch (error) {
            console.error('Error in getReports:', error);
            throw error;
        }
    }

    // Get a single report by ID
    async getReportById(id) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Report not found');
                }
                console.error('Error fetching report:', error);
                throw new Error(`Failed to fetch report: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error in getReportById:', error);
            throw error;
        }
    }

    // Update a report
    async updateReport(id, updateData) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating report:', error);
                throw new Error(`Failed to update report: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error in updateReport:', error);
            throw error;
        }
    }

    // Delete a report
    async deleteReport(id) {
        try {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting report:', error);
                throw new Error(`Failed to delete report: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Error in deleteReport:', error);
            throw error;
        }
    }

    // Get recent reports for dashboard
    async getRecentReports(limit = 5) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching recent reports:', error);
                throw new Error(`Failed to fetch recent reports: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error in getRecentReports:', error);
            throw error;
        }
    }

    // Get reports statistics
    async getReportsStats() {
        try {
            // Total reports
            const { count: totalReports, error: totalError } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });

            if (totalError) {
                throw totalError;
            }

            // Reports created today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: todayReports, error: todayError } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            if (todayError) {
                throw todayError;
            }

            // Reports created this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);

            const { count: weekReports, error: weekError } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })
                .gte('created_at', weekAgo.toISOString());

            if (weekError) {
                throw weekError;
            }

            // Reports created this month
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            monthAgo.setHours(0, 0, 0, 0);

            const { count: monthReports, error: monthError } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })
                .gte('created_at', monthAgo.toISOString());

            if (monthError) {
                throw monthError;
            }

            return {
                total: totalReports || 0,
                today: todayReports || 0,
                week: weekReports || 0,
                month: monthReports || 0
            };
        } catch (error) {
            console.error('Error in getReportsStats:', error);
            return {
                total: 0,
                today: 0,
                week: 0,
                month: 0
            };
        }
    }

    // Search reports with advanced filters
    async searchReports(filters = {}) {
        try {
            let query = supabase.from(this.tableName).select('*');

            // Apply filters
            if (filters.search) {
                query = query.or(
                    `title.ilike.%${filters.search}%,` +
                    `machine_make.ilike.%${filters.search}%,` +
                    `machine_model.ilike.%${filters.search}%,` +
                    `serial_number.ilike.%${filters.search}%,` +
                    `user_complaint.ilike.%${filters.search}%`
                );
            }

            if (filters.dateFrom) {
                query = query.gte('created_at', filters.dateFrom);
            }

            if (filters.dateTo) {
                query = query.lte('created_at', filters.dateTo);
            }

            if (filters.machineType) {
                query = query.or(
                    `machine_make.ilike.%${filters.machineType}%,` +
                    `machine_model.ilike.%${filters.machineType}%`
                );
            }

            if (filters.preparedBy) {
                query = query.ilike('prepared_by', `%${filters.preparedBy}%`);
            }

            // Apply sorting
            const sortBy = filters.sortBy || 'created_at';
            const sortOrder = filters.sortOrder || 'desc';
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            const { data, error } = await query;

            if (error) {
                console.error('Error searching reports:', error);
                throw new Error(`Failed to search reports: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error in searchReports:', error);
            throw error;
        }
    }

    // Bulk operations
    async bulkDeleteReports(ids) {
        try {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .in('id', ids);

            if (error) {
                console.error('Error bulk deleting reports:', error);
                throw new Error(`Failed to delete reports: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Error in bulkDeleteReports:', error);
            throw error;
        }
    }

    // Export reports data (for backup or analysis)
    async exportReports(filters = {}) {
        try {
            const reports = await this.searchReports(filters);

            // Format data for export
            const exportData = reports.map(report => ({
                ID: report.id,
                Title: report.title,
                'Machine Make': report.machine_make,
                'Machine Model': report.machine_model,
                'Serial Number': report.serial_number,
                RAM: report.ram,
                Storage: report.storage,
                Processor: report.processor,
                'User Complaint': report.user_complaint,
                Findings: Array.isArray(report.findings) ? report.findings.join('; ') : report.findings,
                Recommendations: Array.isArray(report.recommendations) ? report.recommendations.join('; ') : report.recommendations,
                'Prepared By': report.prepared_by,
                'Reviewed By': report.reviewed_by,
                'Created At': new Date(report.created_at).toLocaleDateString(),
                'Updated At': new Date(report.updated_at).toLocaleDateString()
            }));

            return exportData;
        } catch (error) {
            console.error('Error in exportReports:', error);
            throw error;
        }
    }
}

export const reportService = new ReportService();