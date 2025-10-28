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

                // Validate required fields (only title and description are required)
                if (this.validateRecommendation(recommendation)) {
                    // Apply normalization
                    const normalizedRec = this.normalizeRecommendation(recommendation);

                    // Process markdown content for description
                    if (normalizedRec.description) {
                        normalizedRec.description = marked.parse(normalizedRec.description);
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
        // Only title and description are required
        return !!(
            rec.title &&
            typeof rec.title === 'string' &&
            rec.title.trim().length > 0 &&
            rec.description &&
            typeof rec.description === 'string' &&
            rec.description.trim().length > 0
        );
    }

    normalizeRecommendation(rec) {
        // Return only title and description
        return {
            title: rec.title,
            description: rec.description
        };
    }

      sortRecommendations(recommendations) {
        // No sorting needed since we don't have priority/urgency anymore
        // Just return recommendations in the order they were generated
        return recommendations;
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
                    description: marked.parseInline(numberMatch[2])
                };
            } else if (currentRec && trimmed.length > 0 && !trimmed.startsWith('#')) {
                // Add content to current recommendation description
                currentRec.description += ' ' + marked.parseInline(trimmed);
            }
        });

        if (currentRec) {
            recommendations.push(currentRec);
        }

        return recommendations.length > 0 ? recommendations : [{
            id: 'default_rec',
            title: 'General IT Support Recommendation',
            description: marked.parse(rawResponse)
        }];
    }
}

const recommendationsParserInstance = new RecommendationsParser();
export default recommendationsParserInstance;