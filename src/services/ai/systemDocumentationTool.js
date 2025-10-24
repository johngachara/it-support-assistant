import systemDocs from '../../../docs/system-documentation.json';

/**
 * System Documentation Tool for LLM Integration
 * Provides structured access to system documentation via function calling
 */

class SystemDocumentationTool {
    constructor() {
        this.documentation = systemDocs;
    }

    /**
     * Get the function definition for LLM function calling
     */
    getFunctionDefinition() {
        return {
            name: 'get_system_documentation',
            description: 'Retrieve comprehensive information about the IT Support Report Management System. Use this when users ask about app features, architecture, how to use specific functionality, database schema, or any system-related questions.',
            parameters: {
                type: 'object',
                properties: {
                    section: {
                        type: 'string',
                        enum: [
                            'overview',
                            'authentication',
                            'reportManagement',
                            'aiFeatures',
                            'chatSystem',
                            'exportSystem',
                            'dashboard',
                            'database',
                            'architecture',
                            'routing',
                            'userGuide',
                            'commonIssues',
                            'all'
                        ],
                        description: 'The section of documentation to retrieve. Use "all" for complete system overview.'
                    },
                    query: {
                        type: 'string',
                        description: 'Optional specific query within the section (e.g., "how to create reports", "database schema", "authentication flow")'
                    }
                },
                required: ['section']
            }
        };
    }

    /**
     * Execute the documentation query
     * @param {string} section - The documentation section to retrieve
     * @param {string} query - Optional specific query
     * @returns {object} The requested documentation
     */
    execute(section, query = '') {
        const queryLower = query.toLowerCase();

        switch (section) {
            case 'overview':
                return {
                    system: this.documentation.system,
                    summary: 'IT Support Report Management System - A comprehensive solution for managing IT support reports with AI assistance'
                };

            case 'authentication':
                return {
                    feature: this.documentation.features.authentication,
                    relatedFiles: [
                        'src/services/auth/authService.js',
                        'src/context/AuthContext.jsx',
                        'src/components/auth/ProtectedRoute.jsx',
                        'src/pages/Login.jsx'
                    ]
                };

            case 'reportManagement':
                return {
                    feature: this.documentation.features.reportManagement,
                    workflow: this.documentation.features.reportManagement.workflow,
                    relatedFiles: [
                        'src/pages/CreateReport.jsx',
                        'src/components/forms/ReportDetailsForm.jsx',
                        'src/components/forms/FindingsForm.jsx',
                        'src/services/database/reportService.js'
                    ]
                };

            case 'aiFeatures':
                return {
                    feature: this.documentation.features.aiFeatures,
                    providers: {
                        ai: this.documentation.features.aiFeatures.aiProvider,
                        search: this.documentation.features.aiFeatures.searchProvider
                    },
                    relatedFiles: [
                        'src/services/ai/cerebrasService.js',
                        'src/services/ai/tavilyService.js'
                    ]
                };

            case 'chatSystem':
                return {
                    feature: this.documentation.features.chatSystem,
                    relatedFiles: [
                        'src/pages/ChatPage.jsx',
                        'src/components/chat/ChatInterface.jsx',
                        'src/contexts/ChatContext.jsx'
                    ]
                };

            case 'exportSystem':
                return {
                    feature: this.documentation.features.exportSystem,
                    formats: this.documentation.features.exportSystem.formats
                };

            case 'dashboard':
                return {
                    feature: this.documentation.features.dashboard,
                    widgets: this.documentation.features.dashboard.widgets
                };

            case 'database':
                return {
                    database: this.documentation.database,
                    tables: this.documentation.database.tables
                };

            case 'architecture':
                return {
                    architecture: this.documentation.architecture,
                    layers: this.documentation.architecture.layers,
                    stateManagement: this.documentation.architecture.stateManagement
                };

            case 'routing':
                return {
                    routing: this.documentation.routing,
                    publicRoutes: this.documentation.routing.publicRoutes,
                    protectedRoutes: this.documentation.routing.protectedRoutes
                };

            case 'userGuide':
                return {
                    userGuide: this.documentation.userGuide,
                    topics: Object.keys(this.documentation.userGuide)
                };

            case 'commonIssues':
                return {
                    issues: this.documentation.commonIssues,
                    categories: Object.keys(this.documentation.commonIssues)
                };

            case 'all':
                return {
                    documentation: this.documentation,
                    summary: 'Complete system documentation including all features, architecture, and guides'
                };

            default:
                return {
                    error: 'Invalid section',
                    availableSections: [
                        'overview', 'authentication', 'reportManagement', 'aiFeatures',
                        'chatSystem', 'exportSystem', 'dashboard', 'database',
                        'architecture', 'routing', 'userGuide', 'commonIssues', 'all'
                    ]
                };
        }
    }

    /**
     * Search documentation for specific terms
     * @param {string} searchTerm - Term to search for
     * @returns {object} Search results
     */
    search(searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();

        // Search through all documentation sections
        const searchObject = (obj, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'string' && value.toLowerCase().includes(term)) {
                    results.push({
                        path: currentPath,
                        content: value,
                        type: 'string'
                    });
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === 'string' && item.toLowerCase().includes(term)) {
                            results.push({
                                path: `${currentPath}[${index}]`,
                                content: item,
                                type: 'array'
                            });
                        } else if (typeof item === 'object') {
                            searchObject(item, `${currentPath}[${index}]`);
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    searchObject(value, currentPath);
                }
            }
        };

        searchObject(this.documentation);

        return {
            searchTerm,
            resultsCount: results.length,
            results: results.slice(0, 10) // Limit to top 10 results
        };
    }

    /**
     * Get quick reference for common questions
     */
    getQuickReference() {
        return {
            'How do I create a report?': this.documentation.userGuide.creatingReports,
            'How do I use drafts?': this.documentation.userGuide.managingDrafts,
            'How do I export reports?': this.documentation.userGuide.exportingReports,
            'How do I use AI chat?': this.documentation.userGuide.usingAIChat,
            'What are the routes?': this.documentation.routing,
            'What is the database schema?': this.documentation.database.tables,
            'What AI features are available?': this.documentation.features.aiFeatures,
            'How does authentication work?': this.documentation.features.authentication
        };
    }

    /**
     * Get feature list
     */
    getFeaturesList() {
        return {
            features: Object.keys(this.documentation.features),
            descriptions: Object.entries(this.documentation.features).map(([key, value]) => ({
                name: key,
                description: value.description
            }))
        };
    }
}

// Export singleton instance
export const systemDocsTool = new SystemDocumentationTool();

// Export for use in Cerebras service
export const getSystemDocsFunctionDefinition = () => {
    return systemDocsTool.getFunctionDefinition();
};

// Export function to handle documentation queries
export const handleDocumentationQuery = (section, query) => {
    return systemDocsTool.execute(section, query);
};
