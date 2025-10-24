class WebSearchService {
    constructor() {
        this.apiKey = import.meta.env.VITE_SEARCH_API_KEY;
        // Using SerpAPI as the search provider
        this.baseURL = 'https://google.serper.dev/search';
    }

    async search(query, options = {}) {
        const {
            num = 5,
            location = 'Kenya',
            hl = 'en'
        } = options;

        try {
            // If no API key, use DuckDuckGo Instant Answer API (free but limited)
            if (!this.apiKey) {
                return await this.searchDuckDuckGo(query);
            }

            const params = new URLSearchParams({
                api_key: this.apiKey,
                engine: 'google',
                q: query,
                num: num,
                location: location,
                hl: hl,
                safe: 'active'
            });

            const response = await fetch(`${this.baseURL}?${params}`);

            if (!response.ok) {
                throw new Error(`Search API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatSearchResults(data);

        } catch (error) {
            console.error('Search error:', error);
            // Fallback to DuckDuckGo if main search fails
            return await this.searchDuckDuckGo(query);
        }
    }

    async searchDuckDuckGo(query) {
        try {
            console.log('Searching the web')
            // DuckDuckGo Instant Answer API (free, no API key required)
            const response = await fetch(
                `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
            );

            if (!response.ok) {
                throw new Error(`DuckDuckGo API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatDuckDuckGoResults(data, query);

        } catch (error) {
            console.error('DuckDuckGo search error:', error);
            return {
                query,
                results: [],
                summary: 'Search service temporarily unavailable. Proceeding with general knowledge.',
                error: true
            };
        }
    }

    async formatSearchResults(data) {
        const result = {
            query: data.searchParameters?.q || '',
            knowledge: null,
            topResults: [],
            peopleAlsoAsk: [],
            relatedSearches: []
        };

        // Knowledge Graph (structured facts about the entity)
        if (data.knowledgeGraph) {
            result.knowledge = {
                title: data.knowledgeGraph.title,
                description: data.knowledgeGraph.description,
                source: data.knowledgeGraph.descriptionSource,
                sourceLink: data.knowledgeGraph.descriptionLink,
                attributes: data.knowledgeGraph.attributes || {},
                imageUrl: data.knowledgeGraph.imageUrl || null
            };
        }

        // Organic results (top 3–5 links)
        if (Array.isArray(data.organic)) {
            result.topResults = data.organic.slice(0, 5).map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet
            }));
        }

        // People Also Ask
        if (Array.isArray(data.peopleAlsoAsk)) {
            result.peopleAlsoAsk = data.peopleAlsoAsk.map(paa => ({
                question: paa.question,
                snippet: paa.snippet,
                link: paa.link
            }));
        }

        // Related searches
        if (Array.isArray(data.relatedSearches)) {
            result.relatedSearches = data.relatedSearches.map(rs => rs.query);
        }

        return result;
    }


    formatDuckDuckGoResults(data, originalQuery) {
        const results = [];
        let summary = '';

        // DuckDuckGo provides different types of results
        if (data.Abstract) {
            summary = data.Abstract;
            if (data.AbstractURL) {
                results.push({
                    title: data.Heading || 'Information',
                    link: data.AbstractURL,
                    snippet: data.Abstract,
                    source: this.extractDomain(data.AbstractURL)
                });
            }
        }

        // Related topics
        if (data.RelatedTopics) {
            for (const topic of data.RelatedTopics.slice(0, 3)) {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0],
                        link: topic.FirstURL,
                        snippet: topic.Text,
                        source: this.extractDomain(topic.FirstURL)
                    });
                }
            }
        }

        // If no good results, provide a generic response
        if (results.length === 0 && !summary) {
            summary = `Unable to find specific search results for "${originalQuery}". Please provide more specific search terms or check your internet connection.`;
        }

        return {
            query: originalQuery,
            results,
            summary: summary || 'Search completed but no specific information found.',
            total_results: results.length,
            search_time: 'N/A'
        };
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Unknown';
        }
    }

    // Method to get page content if needed (for more detailed analysis)
    async fetchPageContent(url) {
        try {
            // Note: This would typically require a CORS proxy in production
            // For now, we'll just return the URL
            return {
                url,
                content: 'Content fetching requires CORS proxy setup',
                status: 'limited'
            };
        } catch (error) {
            console.error('Error fetching page content:', error);
            return {
                url,
                content: 'Unable to fetch content',
                status: 'error'
            };
        }
    }
}

export const webSearchService = new WebSearchService();