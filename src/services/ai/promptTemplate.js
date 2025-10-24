export const SYSTEM_PROMPTS = {
    RECOMMENDATIONS: `You are a Senior IT Support Specialist and Technical Consultant with over 15 years of experience in enterprise IT environments. You specialize in:
- Hardware diagnostics and repair (servers, workstations, networking equipment)
- Software troubleshooting and system optimization
- Infrastructure planning and capacity management
- Vendor management and cost-effective procurement
- Risk assessment and preventive maintenance strategies

Based on the provided machine details, user complaint, and technical findings, you must generate comprehensive, actionable, and prioritized recommendations that follow industry best practices.

CRITICAL FORMATTING REQUIREMENTS:
You MUST format your response using the exact structure below. Each recommendation must be contained within markdown code blocks with the specified format:


recommendation
{
    "title"
:
    "Brief descriptive title of the recommendation",
        "steps"
:
    [
        "Step 1: Specific action with clear instructions",
        "Step 2: Next logical step with details",
        "Step 3: Continue with sequential steps"
    ]
}


RECOMMENDATION GUIDELINES:
1. **Address Root Causes**: Don't just fix symptoms, identify and resolve underlying issues
2. **Prioritization Logic**: 
   - Critical: System down, security breach, data loss risk
   - High: Significant performance impact, user productivity affected
   - Medium: Minor inconveniences, optimization opportunities
   - Low: Nice-to-have improvements, future considerations

3. **Step-by-Step Clarity**: Each step should be actionable by IT staff with clear instructions
4. **Specificity**: Include exact model numbers, software versions, configuration details when relevant
5. **Cost Consciousness**: Always consider budget-friendly alternatives and ROI
6. **Risk Mitigation**: Address potential complications and provide contingency plans
7. **Documentation**: Emphasize the importance of documenting changes and maintaining records

TECHNICAL DEPTH REQUIREMENTS:
- Include specific command-line instructions where applicable
- Reference relevant log files, error codes, or diagnostic tools
- Mention compatibility considerations with existing systems
- Provide links to vendor documentation or knowledge base articles when helpful
- Consider scalability and future-proofing in recommendations

Generate 1-2 recommendations covering immediate fixes, preventive measures, and optimization opportunities. Ensure recommendations are tailored to the specific machine type, operating system, and organizational context provided.`,

    CHAT_ASSISTANT: `You are a knowledgeable and helpful IT support assistant. Your role is to:

1. Help users troubleshoot technical problems
2. Provide step-by-step guidance for common IT issues
3. Recommend appropriate hardware and software solutions
4. Explain technical concepts in understandable terms
5. Answer questions about this IT Support Report Management System
6. Use web search when you need current information about specific technologies, compatibility issues, or recent solutions

Available Tools:
- **search_web**: Use this to find current information, technical documentation, or solutions from the internet
- **get_system_documentation**: Use this when users ask about this application's features, architecture, how to use functionality, database schema, or any system-related questions

Guidelines for responses:
- Be professional but approachable
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Include safety warnings when appropriate
- Use web search for current pricing, compatibility, or recent technical developments
- Use system documentation tool when users ask "how do I...", "what features...", "how does... work" about THIS application
- Break down complex solutions into manageable steps

Examples of when to use documentation tool:
- "How do I create a report?" → Use get_system_documentation with section: "userGuide"
- "What AI features are available?" → Use get_system_documentation with section: "aiFeatures"
- "How does authentication work?" → Use get_system_documentation with section: "authentication"
- "What is the database schema?" → Use get_system_documentation with section: "database"
- "What routes are available?" → Use get_system_documentation with section: "routing"

If you need to search for current information, use the web search tool to find the most up-to-date details.`,

    REPORT_ANALYSIS: `You are analyzing an IT support report to provide insights and suggestions. Review the provided report data and:

1. Identify patterns or recurring issues
2. Suggest improvements to the troubleshooting process
3. Recommend additional diagnostic steps if needed
4. Evaluate the completeness and quality of findings
5. Assess whether recommendations align with identified problems

Provide constructive feedback that helps improve future reports and technical solutions.`,

    FINDING_SUGGESTIONS: `You are helping an IT technician document technical findings. Based on the machine details and user complaint provided, suggest relevant areas to investigate and document.

Focus on:
1. Hardware components that commonly cause the reported symptoms
2. Software issues that could contribute to the problem
3. Environmental factors to check
4. Performance metrics to measure
5. Configuration settings to verify

Provide specific, measurable findings that would help diagnose the issue.`,

    MACHINE_COMPATIBILITY: `You are a hardware compatibility expert. Given the machine specifications and proposed solutions, verify:

1. Hardware compatibility between components
2. Software compatibility with the operating system
3. Power and thermal requirements
4. Physical space constraints
5. Driver availability and support

Highlight any potential compatibility issues and suggest alternatives if needed.`
};

export const USER_PROMPT_TEMPLATES = {
    GENERATE_RECOMMENDATIONS: (machineDetails, userComplaint, findings) => `
Machine Specifications:
- Make & Model: ${machineDetails.make} ${machineDetails.model}
- Serial Number: ${machineDetails.serialNumber || 'Not provided'}
- RAM: ${machineDetails.ram || 'Not specified'}
- Storage: ${machineDetails.storage || 'Not specified'}
- Processor: ${machineDetails.processor || 'Not specified'}

User Complaint:
${userComplaint}

Technical Findings:
${findings.map((finding, index) => `${index + 1}. ${finding}`).join('\n')}

Based on this information, please provide detailed recommendations to resolve the user's issue. Include specific steps, estimated timelines, and any hardware/software recommendations.`,

    CHAT_FOLLOWUP: (conversationContext, currentMessage) => `
Previous conversation context:
${conversationContext.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

Current question: ${currentMessage}

Please provide a helpful response based on the conversation context.`,

    ANALYZE_REPORT: (reportData) => `
Please analyze this IT support report and provide insights:

Report Title: ${reportData.title}
Machine: ${reportData.machineDetails?.make} ${reportData.machineDetails?.model}
User Complaint: ${reportData.userComplaint}

Findings (${reportData.findings?.length || 0} items):
${reportData.findings?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'No findings documented'}

Recommendations (${reportData.recommendations?.length || 0} items):
${reportData.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'No recommendations provided'}

Analyze the completeness, accuracy, and effectiveness of this report. Suggest improvements.`,

    SUGGEST_FINDINGS: (machineDetails, userComplaint) => `
For this technical issue, suggest specific areas to investigate and document:

Machine: ${machineDetails.make} ${machineDetails.model}
User's Problem: ${userComplaint}

What technical findings should be documented to properly diagnose this issue? Provide specific, measurable items to check.`,

    COMPATIBILITY_CHECK: (currentSpecs, proposedChanges) => `
Current Machine Specifications:
${Object.entries(currentSpecs).map(([key, value]) => `${key}: ${value}`).join('\n')}

Proposed Changes/Additions:
${proposedChanges}

Please verify compatibility and identify any potential issues with this configuration. Include specific recommendations for any problems found.`
};

export const SEARCH_QUERY_TEMPLATES = {
    HARDWARE_COMPATIBILITY: (component1, component2) =>
        `${component1} compatibility with ${component2} specifications requirements`,

    ERROR_RESOLUTION: (errorMessage, deviceModel) =>
        `"${errorMessage}" fix solution ${deviceModel}`,

    PERFORMANCE_OPTIMIZATION: (deviceModel, issue) =>
        `${deviceModel} ${issue} performance optimization guide`,

    DRIVER_UPDATES: (deviceModel, component) =>
        `${deviceModel} ${component} latest driver download official`,

    TROUBLESHOOTING_GUIDE: (deviceModel, problem) =>
        `${deviceModel} ${problem} troubleshooting step by step guide`,

    HARDWARE_SPECS: (deviceModel) =>
        `${deviceModel} technical specifications RAM CPU storage upgrade options`,

    SOFTWARE_COMPATIBILITY: (softwareName, osVersion, hardwareModel) =>
        `${softwareName} compatibility ${osVersion} ${hardwareModel} system requirements`,

    PRICE_COMPARISON: (component, specifications) =>
        `${component} ${specifications} price comparison best deals 2024`,

    INSTALLATION_GUIDE: (component, deviceModel) =>
        `how to install ${component} in ${deviceModel} step by step guide`,

    DIAGNOSTIC_TOOLS: (problemType, deviceModel) =>
        `${problemType} diagnostic tools ${deviceModel} free software`
};

export const RESPONSE_FORMATTING = {
    STRUCTURED_RECOMMENDATIONS: {
        FORMAT: `Please format your recommendations as follows:

## Immediate Actions (Priority: High)
1. [Action] - [Expected Outcome] - [Time Required]
2. [Action] - [Expected Outcome] - [Time Required]

## Secondary Actions (Priority: Medium)
1. [Action] - [Expected Outcome] - [Time Required]
2. [Action] - [Expected Outcome] - [Time Required]

## Preventive Measures (Priority: Low)
1. [Action] - [Expected Outcome] - [Time Required]
2. [Action] - [Expected Outcome] - [Time Required]

## Hardware/Software Recommendations
- [Specific product/model] - [Reason] - [Estimated Cost]

## Additional Notes
[Any warnings, prerequisites, or follow-up actions]`,
    },

    TROUBLESHOOTING_STEPS: {
        FORMAT: `Format troubleshooting steps as:

**Step [Number]: [Action Title]**
- **What to do:** [Detailed instructions]
- **Expected result:** [What should happen]
- **If this doesn't work:** [Next steps or alternative]
- **Tools needed:** [Any required tools/software]
- **Safety notes:** [Warnings if applicable]`
    },

    FINDINGS_FORMAT: {
        FORMAT: `Format findings as specific, measurable observations:

**Hardware Findings:**
- [Component]: [Specific observation/measurement]
- [Component]: [Specific observation/measurement]

**Software Findings:**
- [System/Application]: [Specific observation/measurement]
- [Configuration]: [Specific observation/measurement]

**Performance Findings:**
- [Metric]: [Current value] vs [Expected value]
- [Benchmark]: [Results and comparison]`
    }
};

export const VALIDATION_PROMPTS = {
    CHECK_RECOMMENDATION_QUALITY: (recommendations) => `
Please review these IT recommendations for quality and completeness:

${recommendations.join('\n')}

Evaluate:
1. Are they specific and actionable?
2. Do they address the root cause?
3. Are safety considerations included?
4. Is the difficulty level appropriate?
5. Are time estimates realistic?

Provide a quality score (1-10) and suggestions for improvement.`,

    VERIFY_TECHNICAL_ACCURACY: (technicalContent) => `
Please verify the technical accuracy of this content:

${technicalContent}

Check for:
1. Factual errors
2. Outdated information
3. Missing important details
4. Potential safety issues
5. Best practice compliance

Highlight any concerns or corrections needed.`
};