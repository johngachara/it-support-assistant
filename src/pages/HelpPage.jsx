import { useState } from 'react';
import Card from '../components/ui/Card';

const HelpPage = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'technical'

    const sections = [
        { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'reports', name: 'Creating Reports', icon: '📝' },
        { id: 'ai-features', name: 'AI Features', icon: '🤖' },
        { id: 'chat', name: 'AI Chat Assistant', icon: '💬' },
        { id: 'export', name: 'Exporting Reports', icon: '📥' },
        { id: 'search', name: 'Finding Reports', icon: '🔍' },
        { id: 'technical', name: 'Technical Details', icon: '⚙️' }
    ];

    const FeatureCard = ({ icon, title, description, steps, tips, examples }) => (
        <Card className="mb-6">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 text-4xl">{icon}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>

                    {steps && steps.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                How to use:
                            </h4>
                            <ol className="list-decimal list-inside space-y-2">
                                {steps.map((step, index) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {tips && tips.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                💡 Pro Tips:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                {tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {examples && examples.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Examples:
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                {examples.map((example, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{example}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );

    const renderContent = () => {
        if (activeTab === 'technical') {
            return (
                <div className="space-y-6">
                    <FeatureCard
                        icon="🏗️"
                        title="System Architecture"
                        description="Understanding how the IT Support Assistant works under the hood"
                        steps={[
                            'Built with React 19 for a modern, responsive user interface',
                            'Supabase database stores all reports and chat history',
                            'Cerebras AI (GPT-OSS-120B model) powers intelligent recommendations',
                            'Tavily API provides web search capabilities for up-to-date information',
                            'Vite for fast development and optimized production builds'
                        ]}
                    />

                    <FeatureCard
                        icon="🤖"
                        title="AI Engine: How It Works"
                        description="The AI system uses advanced techniques to provide accurate recommendations"
                        steps={[
                            'Function Calling: AI can autonomously call web search when it needs current information',
                            'Context-Aware: Maintains conversation history for relevant responses',
                            'Structured Output: Parses AI responses into organized recommendations with priorities',
                            'Multi-Step Reasoning: Analyzes machine specs, complaints, and findings together',
                            'Real-time Search Integration: Searches for hardware compatibility, pricing, and solutions'
                        ]}
                        tips={[
                            'The AI uses a 120B parameter model for high-quality technical responses',
                            'Web search is automatically triggered when AI needs current data',
                            'Conversation history is limited to last 10 messages for optimal performance',
                            'All AI responses are parsed and validated before display'
                        ]}
                    />

                    <FeatureCard
                        icon="🔧"
                        title="AI Tools & Capabilities"
                        description="What the AI can do automatically"
                        examples={[
                            'Web Search Tool: Searches for hardware specs, compatibility info, and current pricing',
                            'Recommendation Parser: Structures AI output into actionable steps with priorities',
                            'Context Manager: Keeps track of conversation for relevant follow-up responses',
                            'Markdown Rendering: Formats responses with proper headings, lists, and code blocks'
                        ]}
                    />

                    <FeatureCard
                        icon="💾"
                        title="Data Storage & Privacy"
                        description="How your data is stored and managed"
                        steps={[
                            'All reports are stored in Supabase PostgreSQL database',
                            'Chat conversations are saved with full message history',
                            'Reports include: machine details, complaints, findings, and AI recommendations',
                            'Data is organized by creation/update timestamps for easy retrieval',
                            'Search indexing on title, machine model, serial number, and prepared by fields'
                        ]}
                    />

                    <FeatureCard
                        icon="📊"
                        title="Report Generation Process"
                        description="Step-by-step breakdown of report creation"
                        steps={[
                            'Step 1: User enters machine details (make, model, specs)',
                            'Step 2: User describes the complaint/issue',
                            'Step 3: Technician documents technical findings',
                            'Step 4: AI analyzes all data and generates recommendations',
                            'Step 5: AI may trigger web searches for current information',
                            'Step 6: Recommendations are parsed into structured format',
                            'Step 7: User reviews and can edit recommendations',
                            'Step 8: Report is saved to database with all metadata'
                        ]}
                    />

                    <FeatureCard
                        icon="🔍"
                        title="Search & Filter System"
                        description="How the search functionality works"
                        steps={[
                            'Searches across multiple fields: title, machine make/model, serial number, complaints',
                            'Uses case-insensitive matching for better results',
                            'Supports pagination with configurable page sizes',
                            'Real-time filtering updates results instantly',
                            'Sort by creation date, update date, or other fields'
                        ]}
                    />

                    <FeatureCard
                        icon="📤"
                        title="Export System"
                        description="How PDF and DOCX generation works"
                        examples={[
                            'PDF Export: Uses jsPDF library with autoTable for structured tables',
                            'DOCX Export: Uses docx library with proper bullet formatting and font sizing',
                            'Both formats include: title, machine details table, complaints, findings, recommendations',
                            'Supports complex recommendations with steps, risks, and priorities',
                            'Font sizes optimized for readability (11pt body, 14pt headers, 16pt title)'
                        ]}
                    />

                    <FeatureCard
                        icon="🎨"
                        title="UI Components & Styling"
                        description="Design system and theming"
                        steps={[
                            'Tailwind CSS for utility-first styling',
                            'Dark mode support with system preference detection',
                            'Reusable UI components: Button, Card, Modal, Badge, Input, etc.',
                            'Responsive design for desktop, tablet, and mobile',
                            'Loading states and error handling throughout'
                        ]}
                    />
                </div>
            );
        }

        switch (activeSection) {
            case 'getting-started':
                return (
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
                            <div className="text-center py-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Welcome to IT Support Assistant! 👋
                                </h2>
                                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                                    Your AI-powered companion for creating professional IT support reports,
                                    getting instant technical help, and managing all your support documentation.
                                </p>
                            </div>
                        </Card>

                        <FeatureCard
                            icon="🎯"
                            title="What Can This App Do?"
                            description="Key features and capabilities at your fingertips"
                            examples={[
                                'Create detailed IT support reports with machine specifications and technical findings',
                                'Get AI-powered recommendations for hardware and software issues',
                                'Chat with an AI assistant for instant technical support and troubleshooting',
                                'Export reports to professional PDF and DOCX formats',
                                'Search and manage all your historical reports',
                                'Track statistics: total reports, daily, weekly, and monthly metrics'
                            ]}
                        />

                        <FeatureCard
                            icon="🚦"
                            title="Quick Start Guide"
                            description="Get up and running in 3 simple steps"
                            steps={[
                                'Navigate to Dashboard to see an overview of your reports and system status',
                                'Click "Create Report" to start documenting a new IT support case',
                                'Or use "New Chat" to get instant help from the AI assistant',
                                'View all your reports anytime from the "All Reports" section',
                                'Access chat history to continue previous conversations'
                            ]}
                            tips={[
                                'Use the sidebar to navigate between different sections',
                                'Toggle dark mode using the theme button in the header',
                                'System status indicators show if AI and database services are online'
                            ]}
                        />

                        <FeatureCard
                            icon="🗺️"
                            title="Navigation Overview"
                            description="Understanding the sidebar menu"
                            examples={[
                                'Dashboard: Overview with stats, quick actions, and recent reports',
                                'Create Report: 4-step wizard to generate professional IT support reports',
                                'All Reports: Browse, search, and manage all historical reports',
                                'New Chat: Start a fresh conversation with the AI assistant',
                                'Chat History: Continue previous conversations or review past chats',
                                'Settings: Customize your experience (coming soon)',
                                'Help & Support: This comprehensive guide you\'re reading now'
                            ]}
                        />
                    </div>
                );

            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <FeatureCard
                            icon="📊"
                            title="Dashboard Overview"
                            description="Your command center for IT support activities"
                            steps={[
                                'View statistics: Total reports, reports created today, this week, and this month',
                                'Access quick actions for common tasks like creating reports or chatting with AI',
                                'Monitor system status for AI Service, Database, Web Search, and Export capabilities',
                                'See your most recent reports at a glance',
                                'Click on any report card to view, edit, duplicate, or delete'
                            ]}
                        />

                        <FeatureCard
                            icon="📈"
                            title="Statistics Cards"
                            description="Understanding your metrics"
                            examples={[
                                'Total Reports: Cumulative count of all reports in the system',
                                'Today: Reports created in the last 24 hours',
                                'This Week: Reports from the past 7 days',
                                'This Month: Reports from the past 30 days'
                            ]}
                        />

                        <FeatureCard
                            icon="⚡"
                            title="Quick Actions"
                            description="One-click access to common tasks"
                            examples={[
                                'Create Report: Jump straight to the report creation wizard',
                                'AI Assistant: Open a new chat conversation',
                                'View All Reports: Browse your complete report library',
                                'System Status: Check if all services are operational'
                            ]}
                        />

                        <FeatureCard
                            icon="🟢"
                            title="System Status Indicators"
                            description="Real-time service health monitoring"
                            examples={[
                                'AI Service: Shows if the Cerebras AI model is available',
                                'Database: Indicates Supabase connection status',
                                'Web Search: Shows Tavily search API availability',
                                'Export Service: Confirms PDF/DOCX generation is ready'
                            ]}
                            tips={[
                                'Green indicators mean everything is working normally',
                                'If any service shows offline, try refreshing the page',
                                'Contact support if issues persist'
                            ]}
                        />
                    </div>
                );

            case 'reports':
                return (
                    <div className="space-y-6">
                        <FeatureCard
                            icon="📝"
                            title="Creating a New Report"
                            description="Step-by-step guide to professional IT support reports"
                            steps={[
                                'Step 1 - Report Details: Enter machine specifications (make, model, serial number, RAM, storage, processor) and describe the user\'s complaint',
                                'Step 2 - Technical Findings: Document what you discovered during troubleshooting (hardware issues, software problems, test results)',
                                'Step 3 - AI Recommendations: The AI analyzes everything and generates prioritized, actionable recommendations with detailed steps',
                                'Step 4 - Review & Save: Preview the complete report, make any edits, and save to the database'
                            ]}
                            tips={[
                                'Be specific in machine details for better AI recommendations',
                                'Document findings as you discover them during troubleshooting',
                                'The AI can search the web for current hardware prices and compatibility',
                                'You can edit AI recommendations before saving',
                                'Save drafts at any step to continue later'
                            ]}
                        />

                        <FeatureCard
                            icon="🎯"
                            title="Report Details (Step 1)"
                            description="Capturing essential information"
                            examples={[
                                'Report Title: Descriptive name like "Dell Latitude Overheating Issue"',
                                'Machine Make: Brand (e.g., Dell, HP, Lenovo)',
                                'Machine Model: Specific model (e.g., Latitude 7490, ThinkPad T480)',
                                'Serial Number: For warranty and identification',
                                'RAM: Amount and type (e.g., 16GB DDR4)',
                                'Storage: Capacity and type (e.g., 512GB SSD)',
                                'Processor: CPU model (e.g., Intel Core i7-8650U)',
                                'User Complaint: What the user reported (e.g., "Computer shuts down randomly")'
                            ]}
                        />

                        <FeatureCard
                            icon="🔍"
                            title="Technical Findings (Step 2)"
                            description="Documenting your diagnostic work"
                            examples={[
                                'Hardware findings: "Fan running at maximum speed constantly", "CPU temperature reaching 95°C"',
                                'Software findings: "Windows Event Viewer shows kernel-power errors", "Antivirus scan clean"',
                                'Test results: "Stress test crashes after 5 minutes", "Memory diagnostic passed"',
                                'Configuration issues: "Thermal paste dried out", "Vents blocked with dust"'
                            ]}
                            tips={[
                                'Include specific measurements and test results',
                                'Note error messages exactly as they appear',
                                'Document what you\'ve already tried',
                                'Add each finding separately for better organization'
                            ]}
                        />

                        <FeatureCard
                            icon="🤖"
                            title="AI Recommendations (Step 3)"
                            description="How the AI generates smart solutions"
                            steps={[
                                'AI analyzes machine specs, user complaint, and your findings',
                                'If needed, AI searches the web for current information (prices, compatibility, solutions)',
                                'Generates 3-7 prioritized recommendations with urgency levels',
                                'Each recommendation includes: title, priority, category, steps, risks, cost estimates',
                                'Recommendations are automatically organized by priority (Critical → High → Medium → Low)'
                            ]}
                            examples={[
                                'Critical/Immediate: "Replace failing hard drive - data loss risk"',
                                'High/Same Day: "Clean thermal system and replace thermal paste"',
                                'Medium/This Week: "Update BIOS to latest version"',
                                'Low/This Month: "Consider RAM upgrade for better performance"'
                            ]}
                        />

                        <FeatureCard
                            icon="✏️"
                            title="Editing Reports"
                            description="Modifying existing reports"
                            steps={[
                                'Find the report in Dashboard or All Reports section',
                                'Click the Edit icon (pencil) on the report card',
                                'Make changes to any field: title, machine details, complaints, findings',
                                'Save changes - updates are timestamped automatically'
                            ]}
                        />

                        <FeatureCard
                            icon="📋"
                            title="Duplicating Reports"
                            description="Reuse report templates for similar issues"
                            steps={[
                                'Click the Duplicate icon on any report card',
                                'A copy is created with all the same data',
                                'Edit the copy to reflect the new case',
                                'Great for similar machines or recurring issues'
                            ]}
                            tips={[
                                'Duplicate reports for computers with same model and similar issues',
                                'Saves time by reusing machine specs',
                                'Update serial number and specific findings for each case'
                            ]}
                        />
                    </div>
                );

            case 'ai-features':
                return (
                    <div className="space-y-6">
                        <FeatureCard
                            icon="🧠"
                            title="AI-Powered Recommendations"
                            description="How the AI creates intelligent solutions"
                            steps={[
                                'Analyzes machine specifications to understand hardware capabilities and limitations',
                                'Reviews user complaints to identify the core problem',
                                'Studies technical findings to understand what\'s been diagnosed',
                                'Searches the web for current hardware prices, compatibility info, and recent solutions',
                                'Generates structured recommendations with priorities, steps, risks, and cost estimates',
                                'Organizes solutions from most critical to preventive measures'
                            ]}
                        />

                        <FeatureCard
                            icon="🔍"
                            title="Web Search Integration"
                            description="When and why the AI searches the web"
                            examples={[
                                'Hardware Compatibility: "Is this RAM compatible with Dell Latitude 7490?"',
                                'Current Pricing: "What\'s the current price for 512GB NVMe SSD?"',
                                'Driver Updates: "Latest BIOS version for HP EliteBook 840 G5"',
                                'Error Solutions: "Fix for Windows kernel-power error 41"',
                                'Product Specifications: "Technical specs for Samsung 970 EVO Plus"'
                            ]}
                            tips={[
                                'The AI decides autonomously when to search',
                                'Searches happen in real-time during recommendation generation',
                                'Results are integrated seamlessly into recommendations',
                                'You\'ll see "Search-enhanced" badge on recommendations that used web data'
                            ]}
                        />

                        <FeatureCard
                            icon="📊"
                            title="Recommendation Structure"
                            description="Understanding each recommendation component"
                            examples={[
                                '✅ Title: Brief description of what needs to be done',
                                '🎯 Priority: Critical, High, Medium, or Low',
                                '🏷️ Category: Immediate Action, Hardware, Software, Preventive, Security, etc.',
                                '⏰ Urgency: Immediate (0-4 hours), Same Day, This Week, or This Month',
                                '📝 Description: Detailed explanation of the issue and solution',
                                '👣 Steps: Numbered, actionable instructions',
                                '⚠️ Risks: Potential complications to watch for',
                                '💰 Cost Estimate: Approximate price range',
                                '🔄 Follow-up: Monitoring or next steps needed'
                            ]}
                        />

                        <FeatureCard
                            icon="🎓"
                            title="AI Capabilities"
                            description="What the AI assistant can help with"
                            examples={[
                                'Diagnose hardware issues based on symptoms',
                                'Recommend compatible upgrade components',
                                'Provide step-by-step troubleshooting guides',
                                'Suggest cost-effective solutions',
                                'Identify security risks and preventive measures',
                                'Explain technical concepts in simple terms',
                                'Compare different solution approaches',
                                'Estimate time and costs for repairs/upgrades'
                            ]}
                        />

                        <FeatureCard
                            icon="⚙️"
                            title="AI Model Details"
                            description="Technical specifications of the AI system"
                            steps={[
                                'Model: Cerebras GPT-OSS-120B (120 billion parameters)',
                                'Temperature: 0.7 (balanced creativity and accuracy)',
                                'Max Tokens: 2000 (comprehensive responses)',
                                'Context Window: Last 10 messages for conversation awareness',
                                'Reasoning Effort: Low (optimized for speed)',
                                'Tools: Web search via Tavily API for real-time information'
                            ]}
                        />
                    </div>
                );

            case 'chat':
                return (
                    <div className="space-y-6">
                        <FeatureCard
                            icon="💬"
                            title="AI Chat Assistant"
                            description="Your 24/7 technical support companion"
                            steps={[
                                'Click "New Chat" in the sidebar to start a fresh conversation',
                                'Type your technical question or describe your problem',
                                'The AI responds with detailed, helpful answers',
                                'Ask follow-up questions - the AI remembers the conversation',
                                'Get step-by-step instructions, explanations, and recommendations'
                            ]}
                            tips={[
                                'Be specific about your problem for better answers',
                                'Include hardware/software details when relevant',
                                'Ask for clarification if something isn\'t clear',
                                'The AI can search the web for current information'
                            ]}
                        />

                        <FeatureCard
                            icon="🗨️"
                            title="What to Ask the AI"
                            description="Types of questions the AI excels at"
                            examples={[
                                'Troubleshooting: "My computer won\'t boot - how do I diagnose the problem?"',
                                'How-to guides: "How do I upgrade RAM in a Dell Latitude 7490?"',
                                'Hardware recommendations: "What\'s the best budget SSD for gaming?"',
                                'Software issues: "Excel keeps crashing - what should I check?"',
                                'Compatibility questions: "Will 32GB DDR4-3200 work with my motherboard?"',
                                'Performance optimization: "How can I make Windows 11 run faster?"',
                                'Security concerns: "Is this error message a virus?"',
                                'Cost estimates: "How much does it cost to replace a laptop screen?"'
                            ]}
                        />

                        <FeatureCard
                            icon="🔄"
                            title="Conversation Features"
                            description="Working with chat conversations"
                            steps={[
                                'Context Awareness: AI remembers the last 10 messages in your conversation',
                                'Follow-up Questions: Build on previous answers naturally',
                                'Code Formatting: Get properly formatted commands and scripts',
                                'Markdown Support: Responses include headers, lists, and formatting',
                                'Typewriter Effect: Watch responses appear smoothly for better readability'
                            ]}
                        />

                        <FeatureCard
                            icon="📜"
                            title="Chat History"
                            description="Managing your conversations"
                            steps={[
                                'Click "Chat History" in the sidebar to see all past conversations',
                                'Each chat shows the first message and last update time',
                                'Click any chat card to continue the conversation',
                                'All messages are preserved - pick up right where you left off',
                                'Search through chat history to find specific topics'
                            ]}
                            tips={[
                                'Chats are saved automatically as you use them',
                                'Continue conversations days or weeks later',
                                'Use chat history as a personal knowledge base',
                                'Export important conversations for documentation'
                            ]}
                        />

                        <FeatureCard
                            icon="💾"
                            title="Chat Actions"
                            description="What you can do with conversations"
                            examples={[
                                '📥 Export Chat: Download conversation as a text file',
                                '🗑️ Clear Chat: Start fresh in the current conversation',
                                '🔙 Back to History: Return to the chat list',
                                '📋 Copy Messages: Select and copy specific answers',
                                '🔍 Search Context: AI searches within the conversation for relevant info'
                            ]}
                        />

                        <FeatureCard
                            icon="🎯"
                            title="Best Practices for Chat"
                            description="Getting the most helpful responses"
                            tips={[
                                'Start with a clear description of your problem or question',
                                'Include error messages exactly as they appear',
                                'Mention your operating system and software versions',
                                'Describe what you\'ve already tried',
                                'Ask one question at a time for focused answers',
                                'Use follow-ups to dig deeper into complex topics',
                                'Request step-by-step instructions when needed'
                            ]}
                        />
                    </div>
                );

            case 'export':
                return (
                    <div className="space-y-6">
                        <FeatureCard
                            icon="📥"
                            title="Exporting Reports"
                            description="Generate professional documents in PDF and DOCX formats"
                            steps={[
                                'Open any report from the Dashboard or All Reports section',
                                'Click the "View Report" button to see the full details',
                                'Choose your preferred format: PDF or DOCX',
                                'The file downloads immediately to your device',
                                'Open with your preferred viewer (Acrobat Reader, Microsoft Word, etc.)'
                            ]}
                        />

                        <FeatureCard
                            icon="📄"
                            title="PDF Export"
                            description="Professional PDF reports with formatted tables and text"
                            examples={[
                                '✅ Clean, professional layout with headers and sections',
                                '✅ Machine details displayed in a formatted table',
                                '✅ User complaints with proper bullet points',
                                '✅ Technical findings listed clearly',
                                '✅ AI recommendations with priorities and steps',
                                '✅ Signature sections for prepared by and reviewed by',
                                '✅ Optimized for printing on standard paper',
                                '✅ Compatible with all PDF readers'
                            ]}
                        />

                        <FeatureCard
                            icon="📝"
                            title="DOCX Export"
                            description="Editable Microsoft Word documents"
                            examples={[
                                '✅ Fully editable in Microsoft Word, Google Docs, or LibreOffice',
                                '✅ Proper bullet formatting (not dashes)',
                                '✅ Readable font sizes: 16pt title, 14pt headers, 11pt body text',
                                '✅ Structured recommendations with priority badges',
                                '✅ Numbered steps for implementation instructions',
                                '✅ Color-coded risks and warnings',
                                '✅ Professional formatting maintained across all platforms',
                                '✅ Easy to customize and add your organization\'s branding'
                            ]}
                            tips={[
                                'DOCX format is best for editing and customization',
                                'PDF format is best for final distribution and printing',
                                'Both formats maintain professional appearance',
                                'Font sizes are optimized for readability'
                            ]}
                        />

                        <FeatureCard
                            icon="🎨"
                            title="Report Formatting"
                            description="What\'s included in exported reports"
                            steps={[
                                'Title: Report name centered at the top',
                                'Machine Details: Table with make/model, serial, RAM, storage, processor',
                                'User Complaint: Bulleted description of the reported issue',
                                'Findings: Technical observations from troubleshooting',
                                'Recommendations: Prioritized solutions with detailed steps',
                                'Signature Section: Fields for prepared by and reviewed by with dates'
                            ]}
                        />

                        <FeatureCard
                            icon="📋"
                            title="Recommendation Details in Export"
                            description="How recommendations appear in exported documents"
                            examples={[
                                'Title with priority badge (Critical/High/Medium/Low)',
                                'Category and urgency timeline',
                                'Detailed description of the issue and solution',
                                'Numbered implementation steps',
                                'Prerequisites and required tools',
                                'Estimated time for completion',
                                'Expected outcome after implementation',
                                'Risk warnings and considerations',
                                'Cost estimates and alternatives'
                            ]}
                        />

                        <FeatureCard
                            icon="💡"
                            title="Export Tips"
                            description="Making the most of exported reports"
                            tips={[
                                'Review the report before exporting to ensure accuracy',
                                'Use DOCX if you need to add company logos or modify content',
                                'PDF exports are ready for immediate sharing via email',
                                'Keep digital copies for your records',
                                'Print PDFs for physical documentation',
                                'Share DOCX with team members for collaborative editing',
                                'File names include the report title for easy organization'
                            ]}
                        />
                    </div>
                );

            case 'search':
                return (
                    <div className="space-y-6">
                        <FeatureCard
                            icon="🔍"
                            title="Finding Reports"
                            description="Powerful search and filtering to locate any report"
                            steps={[
                                'Go to "All Reports" from the sidebar',
                                'Use the search bar at the top to find specific reports',
                                'Search works across: title, machine make/model, serial number, user complaint',
                                'Results update instantly as you type',
                                'Click any report card to view full details'
                            ]}
                        />

                        <FeatureCard
                            icon="🎯"
                            title="Search Examples"
                            description="What you can search for"
                            examples={[
                                'By Machine: "Dell Latitude" or "HP EliteBook"',
                                'By Model: "7490" or "840 G5"',
                                'By Serial Number: Full or partial serial',
                                'By Issue: "overheating" or "won\'t boot"',
                                'By Title: Any part of the report title',
                                'By Technician: "John Doe" or your name'
                            ]}
                            tips={[
                                'Search is case-insensitive - type however you like',
                                'Partial matches work - try "Lat" to find Latitude',
                                'Search multiple fields at once',
                                'Clear search to see all reports again'
                            ]}
                        />

                        <FeatureCard
                            icon="📑"
                            title="Viewing Report Cards"
                            description="Understanding report card information"
                            examples={[
                                '📋 Title: Report name at the top',
                                '💻 Machine: Make and model displayed prominently',
                                '🔧 User Complaint: Brief preview of the issue',
                                '🎯 Findings Count: Number of technical findings documented',
                                '📝 Recommendations: Count of AI-generated solutions',
                                '👤 Prepared By: Technician who created the report',
                                '📅 Date: When the report was created',
                                '⋮ Actions Menu: Edit, View, Duplicate, or Delete'
                            ]}
                        />

                        <FeatureCard
                            icon="🗂️"
                            title="Report Actions"
                            description="What you can do with each report"
                            steps={[
                                '👁️ View: Open full report with all details and export options',
                                '✏️ Edit: Modify any field in the report',
                                '📋 Duplicate: Create a copy for similar cases',
                                '🗑️ Delete: Remove report permanently (with confirmation)',
                                '📥 Export: Download as PDF or DOCX from view mode'
                            ]}
                        />

                        <FeatureCard
                            icon="📊"
                            title="Pagination"
                            description="Navigating through many reports"
                            steps={[
                                'Reports are shown 12 per page for easy browsing',
                                'Use Previous/Next buttons at the bottom to navigate',
                                'Page numbers show your current position',
                                'Total count displays how many reports match your search'
                            ]}
                        />

                        <FeatureCard
                            icon="🎨"
                            title="Report Organization"
                            description="How reports are sorted and displayed"
                            examples={[
                                'Default: Most recent reports appear first',
                                'Grid Layout: Clean card view with key information',
                                'Color-coded Status: Visual indicators for report states',
                                'Quick Preview: See essentials without opening full report',
                                'Responsive Design: Works on desktop, tablet, and mobile'
                            ]}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
                <Card className="sticky top-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Documentation
                    </h2>

                    {/* Tab Toggle */}
                    <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                                activeTab === 'user'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            📖 User Guide
                        </button>
                        <button
                            onClick={() => setActiveTab('technical')}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                                activeTab === 'technical'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            ⚙️ Technical
                        </button>
                    </div>

                    {/* User Guide Sections */}
                    {activeTab === 'user' && (
                        <nav className="space-y-1">
                            {sections.slice(0, -1).map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                        activeSection === section.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="mr-2">{section.icon}</span>
                                    {section.name}
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                                <span>Version:</span>
                                <span className="font-medium">1.0.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Updated:</span>
                                <span className="font-medium">2025</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {activeTab === 'technical' ? '⚙️ Technical Documentation' : '📖 User Guide'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {activeTab === 'technical'
                            ? 'Understanding how the IT Support Assistant works under the hood'
                            : 'Everything you need to know about using the IT Support Assistant'}
                    </p>
                </div>

                {renderContent()}

                {/* Need More Help */}
                <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
                    <div className="text-center py-6">
                        <div className="text-4xl mb-3">💡</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Need More Help?
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Can't find what you're looking for? Try asking the AI Chat Assistant!
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => window.location.href = '/chat'}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                💬 Ask AI Assistant
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default HelpPage;
