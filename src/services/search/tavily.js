import {supabase} from "../database/supabaseClient.js";


/**
 * Basic search - returns full parsed data
 */
async function basicSearch(query) {
    const { data, error } = await supabase.functions.invoke('tavily-search', {
        body: {
            query: query
        }
    });

    if (error) {
        console.error('Error:', error);
        return null;
    }

    return data;
}

/**
 * Search with sources included
 */
async function searchWithSources(query, maxSources = 3) {
    const { data, error } = await supabase.functions.invoke('tavily-search', {
        body: {
            query: query,
            includeSources: true,
            maxSources: maxSources
        }
    });

    if (error) {
        console.error('Error:', error);
        return null;
    }

    return data;
}

/**
 * Get LLM-formatted response (ready for prompt context)
 */
export async function searchForLLM(query, includeSources = false) {
    const { data, error } = await supabase.functions.invoke('tavily-search', {
        body: {
            query: query,
            includeSources: includeSources,
            maxSources: 3,
            format: 'llm'
        }
    });

    if (error) {
        console.error('Error:', error);
        return null;
    }

    // Returns: { formatted: "Query: ...\n\nAnswer: ..." }
    return data.formatted;
}

/**
 * Get answer only (most compact)
 */
export async function getAnswerOnly(query) {
    const { data, error } = await supabase.functions.invoke('tavily', {
        body: {
            query: query,
            format: 'answer'
        }
    });

    if (error) {
        console.error('Error:', error);
        return null;
    }

    // Returns: { answer: "..." }
    return data.answer;
}

