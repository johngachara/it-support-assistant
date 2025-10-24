
class LangSearchClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = "https://api.langsearch.com/v1/web-search";
    }

    /**
     * Perform a web search using LangSearch
     * @param {string} query - Search query
     * @param {string} freshness - Optional freshness filter ("oneDay", "oneWeek", "oneMonth", "oneYear", "noLimit")
     * @param {number} count - Number of results (1–10)
     * @returns {Promise<Array>} - Array of search results with title, url, snippet, summary
     */
    async search(query, freshness = "noLimit", count = 5) {
        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query,
                    freshness,
                    count,
                    summary: true   // we want summaries directly from API
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Extract clean results
            const results = data?.SearchData?.webPages?.value || [];
            return results.map(item => ({
                id: item.id,
                title: item.name,
                url: item.url,
                snippet: item.snippet,
                summary: item.summary || "No summary available",
                datePublished: item.datePublished
            }));

        } catch (error) {
            console.error("Error fetching search results:", error);
            return [];
        }
    }
}
export default LangSearchClient
