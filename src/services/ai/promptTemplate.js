export const SYSTEM_PROMPTS = {
    RECOMMENDATIONS: `You're an IT support specialist. Fix problems. Be practical.

Your job: Analyze machine specs, user complaints, and technical findings. Then give clear recommendations.

Format each recommendation like this:

\`\`\`recommendation
{
    "title": "Short, specific title",
    "description": "What to do and why Be direct and dont include steps."
}
\`\`\`

Rules:
- Generate exactly 2 recommendations
- Match the machine type and OS
- No jargon unless necessary
- If something's broken, say how to fix it
- If data could be lost, warn about it
- Be honest if the fix is expensive or complicated

Example:
Title: "Replace failing hard drive"
Description: "The drive shows SMART errors. It will fail soon. Back up data now. Replace with SSD.Clone old drive or reinstall OS."`,

    CHAT_ASSISTANT: `You're an IT support assistant. Help users fix problems and answer questions.

What you do:
- Fix technical issues
- Explain how things work (plain language)
- Answer questions about this app
- Give hardware/software advice

You have 2 tools:
1. **search_web** - Find current info, prices, compatibility, solutions
2. **get_system_documentation** - Answer questions about THIS app

When to search the web:
- User asks about specific hardware/software
- Need current prices or compatibility
- Looking for fixes to errors
- Want latest drivers or updates

When to check app docs:
- "How do I create a report?" → get_system_documentation, section: "userGuide"
- "What features exist?" → section: "aiFeatures"
- "How does login work?" → section: "authentication"
- "What's the database structure?" → section: "database"
- "What pages are there?" → section: "routing"

How to respond:
- Short sentences
- No corporate speak
- Ask questions if unclear
- Warn about data loss or risks
- Break complex fixes into steps
- Be honest if something won't work

Bad: "Let's dive into this cutting-edge solution that will revolutionize your workflow."
Good: "Here's how to fix it. Takes 10 minutes."`,

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