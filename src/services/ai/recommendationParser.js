import { marked } from 'marked';

class RecommendationsParser {
     parseRecommendations(rawResponse) {
        const recommendations = [];

        // Extract recommendation blocks using regex
        const recommendationPattern = /```recommendation\s*([\s\S]*?)\s*```/g;
        let match;

        while ((match = recommendationPattern.exec(rawResponse)) !== null) {
            try {
                const jsonContent = match[1].trim();
                const recommendation = JSON.parse(jsonContent);

                // Validate required fields (only title and steps are required)
                if (this.validateRecommendation(recommendation)) {
                    // Apply defaults for missing fields
                    const normalizedRec = this.normalizeRecommendation(recommendation);

                    // Process markdown content for text fields
                    if (normalizedRec.description) {
                        normalizedRec.description = marked.parse(normalizedRec.description);
                    }
                    if (normalizedRec.steps && Array.isArray(normalizedRec.steps)) {
                        normalizedRec.steps = normalizedRec.steps.map(step =>
                            typeof step === 'string' ? marked.parseInline(step) : step
                        );
                    }
                    if (normalizedRec.expected_outcome) {
                        normalizedRec.expected_outcome = marked.parseInline(normalizedRec.expected_outcome);
                    }

                    // Add unique ID
                    normalizedRec.id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

                    recommendations.push(normalizedRec);
                }
            } catch (error) {
                console.error('Failed to parse recommendation:', error);
                // Continue parsing other recommendations even if one fails
            }
        }

        // If no structured recommendations found, try to parse as fallback
        if (recommendations.length === 0) {
            return this.parseAsFallback(rawResponse);
        }

        // Sort by priority and urgency
        return this.sortRecommendations(recommendations);
    }

     validateRecommendation(rec) {
        // Only title and steps are required
        return !!(
            rec.title &&
            typeof rec.title === 'string' &&
            rec.title.trim().length > 0 &&
            rec.steps &&
            Array.isArray(rec.steps) &&
            rec.steps.length > 0
        );
    }

    normalizeRecommendation(rec) {
        // Apply sensible defaults for missing optional fields
        return {
            title: rec.title,
            priority: rec.priority || 'Medium',
            category: rec.category || 'General',
            urgency: rec.urgency || 'This Week (1-7 days)',
            description: rec.description || '',
            steps: rec.steps || [],
            prerequisites: rec.prerequisites || [],
            estimated_time: rec.estimated_time || 'Not specified',
            expected_outcome: rec.expected_outcome || 'Improved system functionality',
            risks: rec.risks || [],
            cost_estimate: rec.cost_estimate || 'Not specified',
            follow_up: rec.follow_up || 'Monitor system performance',
            alternative_solutions: rec.alternative_solutions || []
        };
    }

      sortRecommendations(recommendations) {
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const urgencyOrder = {
            'Immediate (0-4 hours)': 4,
            'Same Day (4-24 hours)': 3,
            'This Week (1-7 days)': 2,
            'This Month (1-30 days)': 1
        };

        return recommendations.sort((a, b) => {
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;

            return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        });
    }

      parseAsFallback(rawResponse) {
        // Fallback parsing for non-structured responses
        const lines = rawResponse.split('\n');
        const recommendations = [];
        let currentRec = null;

        lines.forEach(line => {
            const trimmed = line.trim();

            // Look for numbered items that might be recommendations
            const numberMatch = trimmed.match(/^(\d+)\.?\s+(.+)/);
            if (numberMatch) {
                if (currentRec) {
                    recommendations.push(currentRec);
                }

                currentRec = {
                    id: `fallback_${Date.now()}_${recommendations.length}`,
                    title: numberMatch[2],
                    priority: 'Medium',
                    category: 'General',
                    urgency: 'This Week (1-7 days)',
                    description: marked.parseInline(numberMatch[2]),
                    steps: [],
                    prerequisites: [],
                    estimated_time: 'Not specified',
                    expected_outcome: 'Improved system functionality',
                    risks: [],
                    cost_estimate: 'Not specified',
                    follow_up: 'Monitor system performance',
                    alternative_solutions: []
                };
            } else if (currentRec && trimmed.length > 0 && !trimmed.startsWith('#')) {
                // Add content to current recommendation
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    currentRec.steps.push(marked.parseInline(trimmed.substring(1).trim()));
                } else {
                    currentRec.description += ' ' + marked.parseInline(trimmed);
                }
            }
        });

        if (currentRec) {
            recommendations.push(currentRec);
        }

        return recommendations.length > 0 ? recommendations : [{
            id: 'default_rec',
            title: 'General IT Support Recommendation',
            priority: 'Medium',
            category: 'General',
            urgency: 'This Week (1-7 days)',
            description: marked.parse(rawResponse),
            steps: ['Review the provided recommendations', 'Implement suggested solutions'],
            prerequisites: [],
            estimated_time: 'Varies',
            expected_outcome: 'Improved system performance',
            risks: [],
            cost_estimate: 'Not specified',
            follow_up: 'Monitor system performance',
            alternative_solutions: []
        }];
    }
}

const recommendationsParserInstance = new RecommendationsParser();
export default recommendationsParserInstance;