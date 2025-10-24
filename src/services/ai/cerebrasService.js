import {SYSTEM_PROMPTS, USER_PROMPT_TEMPLATES} from "./promptTemplate.js";
import RecommendationsParser from "./recommendationParser.js";
import {getAnswerOnly} from "../search/tavily.js";
import { getSystemDocsFunctionDefinition, handleDocumentationQuery } from './systemDocumentationTool.js';

class CerebrasService {
    constructor() {
        this.apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;
        this.baseURL = 'https://api.cerebras.ai/v1';
        this.model = 'gpt-oss-120b';

        if (!this.apiKey) {
            throw new Error('VITE_CEREBRAS_API_KEY is not set in environment variables');
        }
    }

    async makeRequest(messages, tools = [], toolChoice = 'auto') {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    tools: tools.length > 0 ? tools : undefined,
                    tool_choice: tools.length > 0 ? toolChoice : undefined,
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false,
                    reasoning_effort : 'low'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Cerebras API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Cerebras API request failed:', error);
            throw error;
        }
    }

    async generateRecommendations(reportData) {
        const { machineDetails, userComplaint, findings } = reportData;
        const systemPrompt = SYSTEM_PROMPTS.RECOMMENDATIONS;

        // Enhanced user prompt template
        const userPrompt = USER_PROMPT_TEMPLATES.GENERATE_RECOMMENDATIONS(machineDetails,userComplaint,findings)

        const tools = [
            {
                type: 'function',
                function: {
                    name: 'search_web',
                    description: 'Search the web for specific hardware compatibility, software solutions, or current pricing information',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Specific search query for technical information or solution verification'
                            }
                        },
                        required: ['query']
                    }
                }
            }
        ];

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            let response = await this.makeRequest(messages, tools);
            let recommendations = '';

            // Handle tool calls if the AI wants to search
            if (response.choices[0]?.message?.tool_calls) {
                const toolCalls = response.choices[0].message.tool_calls;
                console.log(`AI initiated ${toolCalls.length} search(es) for enhanced recommendations`);

                for (const toolCall of toolCalls) {
                    if (toolCall.function.name === 'search_web') {
                        const searchQuery = JSON.parse(toolCall.function.arguments).query;
                        console.log(`Searching for: ${searchQuery}`);

                        try {

                            const searchResults = await getAnswerOnly(searchQuery);

                            messages.push({
                                role: 'assistant',
                                content: null,
                                tool_calls: [toolCall]
                            });

                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: `Search Results for "${searchQuery}":\n${JSON.stringify(searchResults,null,3)}`
                            });
                        } catch (searchError) {
                            console.error('Search failed:', searchError);
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: 'Search temporarily unavailable. Please use your expert knowledge to provide recommendations.'
                            });
                        }
                    }
                }

                // Get final response with search context
                response = await this.makeRequest(messages);
            }

            recommendations = response.choices[0]?.message?.content || 'Unable to generate recommendations at this time.';

            // Parse using enhanced parser
            const structuredRecommendations = RecommendationsParser.parseRecommendations(recommendations);

            return {
                raw: recommendations,
                structured: structuredRecommendations,
                metadata: {
                    generated_at: new Date().toISOString(),
                    total_recommendations: structuredRecommendations.length,
                    search_enhanced: response.choices[0]?.message?.tool_calls?.length > 0,
                    priority_breakdown: this.getPriorityBreakdown(structuredRecommendations)
                }
            };

        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw new Error(`Failed to generate recommendations: ${error.message}`);
        }
    }

// Helper method for metadata
    getPriorityBreakdown(recommendations) {
        const breakdown = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        recommendations.forEach(rec => {
            if (breakdown.hasOwnProperty(rec.priority)) {
                breakdown[rec.priority]++;
            }
        });
        return breakdown;
    }
    async chatResponse(message, conversationHistory = []) {
        const systemPrompt = SYSTEM_PROMPTS.CHAT_ASSISTANT;

        const tools = [
            {
                type: 'function',
                function: {
                    name: 'search_web',
                    description: 'Search the web for current information, technical documentation, or solutions',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'The search query'
                            }
                        },
                        required: ['query']
                    }
                }
            },
            {
                type: 'function',
                function: getSystemDocsFunctionDefinition()
            }
        ];

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        try {
            let response = await this.makeRequest(messages, tools);

            // Handle tool calls if needed
            if (response.choices[0]?.message?.tool_calls) {
                const toolCalls = response.choices[0].message.tool_calls;

                for (const toolCall of toolCalls) {
                    if (toolCall.function.name === 'search_web') {
                        const searchQuery = JSON.parse(toolCall.function.arguments).query;

                        try {
                            const searchResults = await getAnswerOnly(searchQuery);

                            messages.push({
                                role: 'assistant',
                                content: null,
                                tool_calls: [toolCall]
                            });

                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(searchResults)
                            });
                        } catch (searchError) {
                            messages.push({
                                role: 'assistant',
                                content: null,
                                tool_calls: [toolCall]
                            });

                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: 'Search temporarily unavailable. Please use your expert knowledge.'
                            });
                        }
                    } else if (toolCall.function.name === 'get_system_documentation') {
                        const args = JSON.parse(toolCall.function.arguments);
                        const section = args.section || 'overview';
                        const query = args.query || '';

                        try {
                            const docsResult = handleDocumentationQuery(section, query);

                            messages.push({
                                role: 'assistant',
                                content: null,
                                tool_calls: [toolCall]
                            });

                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(docsResult)
                            });
                        } catch (docsError) {
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: 'Search failed. Proceeding with general knowledge.'
                            });
                        }
                    }
                }

                response = await this.makeRequest(messages);
            }

            return response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';

        } catch (error) {
            console.error('Error in chat response:', error);
            throw new Error('Failed to get AI response. Please try again.');
        }
    }

    parseRecommendations(text) {
        // Parse the AI response into structured recommendations
        const lines = text.split('\n').filter(line => line.trim());
        const recommendations = [];

        let currentRecommendation = '';

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Check for numbered or bulleted recommendations
            if (/^[\d\-\*•]\s/.test(trimmedLine) || trimmedLine.includes('Recommendation')) {
                if (currentRecommendation) {
                    recommendations.push(currentRecommendation.trim());
                }
                currentRecommendation = trimmedLine.replace(/^[\d\-\*•]\s*/, '');
            } else if (currentRecommendation) {
                currentRecommendation += ' ' + trimmedLine;
            }
        }

        if (currentRecommendation) {
            recommendations.push(currentRecommendation.trim());
        }

        return recommendations.length > 0 ? recommendations : [text];
    }
}

export const cerebrasService = new CerebrasService();