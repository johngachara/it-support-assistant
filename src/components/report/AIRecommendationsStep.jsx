import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { cerebrasService } from '../../services/ai/cerebrasService';

const AIRecommendationsStep = ({ reportData, onNext, onBack, onSave }) => {
    const [recommendations, setRecommendations] = useState(reportData.recommendations || []);
    const [generating, setGenerating] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editingRec, setEditingRec] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchProgress, setSearchProgress] = useState('');
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [metadata, setMetadata] = useState(null);

    useEffect(() => {
        // Auto-generate recommendations if not already present
        if (recommendations.length === 0 && reportData.findings?.length > 0) {
            generateRecommendations();
        }
    }, []);

    const generateRecommendations = async () => {
        if (!reportData.findings || reportData.findings.length === 0) {
            setError('Please add findings before generating recommendations');
            return;
        }

        setGenerating(true);
        setError('');
        setSearchProgress('AI is analyzing your report in detail...');

        try {
            setSearchProgress('Processing machine specifications and technical findings...');

            const result = await cerebrasService.generateRecommendations(reportData);

            if (result.structured && result.structured.length > 0) {
                setRecommendations(result.structured);
                setMetadata(result.metadata);
                setSearchProgress('');

                // Auto-expand first few items
                const firstFewIndices = result.structured
                    .map((rec, index) => index < 3 ? index : null)
                    .filter(index => index !== null);
                setExpandedCards(new Set(firstFewIndices));
            } else {
                throw new Error('No recommendations were generated');
            }
        } catch (err) {
            setError('Failed to generate recommendations: ' + err.message);
            setSearchProgress('');
            console.error('AI generation error:', err);
        } finally {
            setGenerating(false);
        }
    };

    const regenerateRecommendations = async () => {
        setRecommendations([]);
        setMetadata(null);
        setExpandedCards(new Set());
        await generateRecommendations();
    };

    const addCustomRecommendation = () => {
        const newRec = {
            id: `custom_${Date.now()}`,
            title: '',
            description: ''
        };

        const newRecommendations = [...recommendations, newRec];
        setRecommendations(newRecommendations);
        setEditingIndex(recommendations.length);
        setEditingRec({ ...newRec });
        setExpandedCards(new Set([...expandedCards, recommendations.length]));
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditingRec({ ...recommendations[index] });
        setExpandedCards(new Set([...expandedCards, index]));
    };

    const updateEditingField = (field, value) => {
        setEditingRec(prev => ({ ...prev, [field]: value }));
    };

    const saveEdit = () => {
        if (!editingRec.title.trim() || !editingRec.description.trim()) {
            setError('Title and description are required');
            return;
        }

        const updatedRec = { ...editingRec };

        const updatedRecommendations = recommendations.map((rec, i) =>
            i === editingIndex ? updatedRec : rec
        );

        setRecommendations(updatedRecommendations);
        setEditingIndex(-1);
        setEditingRec(null);
        setError('');
    };

    const cancelEdit = () => {
        // If this was a new empty recommendation, remove it
        if (editingIndex === recommendations.length - 1 && !recommendations[editingIndex].title) {
            setRecommendations(prev => prev.slice(0, -1));
            setExpandedCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(editingIndex);
                return newSet;
            });
        }
        setEditingIndex(-1);
        setEditingRec(null);
        setError('');
    };

    const removeRecommendation = (index) => {
        const updatedRecommendations = recommendations.filter((_, i) => i !== index);
        setRecommendations(updatedRecommendations);
        setExpandedCards(prev => {
            const newSet = new Set();
            prev.forEach(i => {
                if (i < index) newSet.add(i);
                else if (i > index) newSet.add(i - 1);
            });
            return newSet;
        });
    };

    const toggleExpanded = (index) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleNext = () => {
        const validRecommendations = recommendations.filter(rec => rec.title?.trim());
        if (validRecommendations.length === 0) {
            setError('Please add at least one recommendation before proceeding');
            return;
        }
        onNext({ recommendations: validRecommendations });

    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const validRecommendations = recommendations.filter(rec => rec.title?.trim());
            await onSave({ recommendations: validRecommendations });
        } catch (err) {
            setError('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (generating) {
        return (
            <Card className="text-center py-12">
                <LoadingSpinner size="lg" className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    AI is analyzing your report...
                </h3>
                {searchProgress && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {searchProgress}
                    </p>
                )}
                <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Our expert AI system is analyzing machine specifications, user complaints, and technical findings to generate comprehensive, prioritized recommendations with actionable steps.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                            <div className="animate-pulse">🔍</div>
                            <span className="text-sm">Processing technical data...</span>
                            <div className="animate-pulse">🧠</div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Expert IT Recommendations
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                AI-generated recommendations based on technical analysis.
                            </p>
                            {metadata && (
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Total: {metadata.total_recommendations}</span>
                                    {metadata.search_enhanced && <span className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Web-enhanced</span>}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addCustomRecommendation}
                                title="Add custom recommendation"
                                className="w-full sm:w-auto"
                            >
                                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="hidden sm:inline">Add Custom</span>
                                <span className="sm:hidden">Add Custom Recommendation</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={regenerateRecommendations}
                                loading={generating}
                                title="Regenerate all recommendations"
                                className="w-full sm:w-auto"
                            >
                                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="hidden sm:inline">Regenerate</span>
                                <span className="sm:hidden">Regenerate All</span>
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex">
                                <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {recommendations.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recommendations yet</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Generate AI-powered recommendations based on your findings, or add custom ones.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <Button onClick={generateRecommendations} className="w-full sm:w-auto">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate AI Recommendations
                                </Button>
                                <Button variant="outline" onClick={addCustomRecommendation} className="w-full sm:w-auto">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Manual Recommendation
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recommendations.map((recommendation, index) => {
                                const isExpanded = expandedCards.has(index);
                                const isEditing = editingIndex === index;

                                return (
                                    <div key={recommendation.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        {/* Header */}
                                        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-start sm:items-center justify-between gap-3">
                                                <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full mt-1 sm:mt-0 text-sm font-medium">
                                                        {index + 1}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white break-words">
                                                            {recommendation.title || `Recommendation ${index + 1}`}
                                                        </h4>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => toggleExpanded(index)}
                                                        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        title={isExpanded ? 'Collapse' : 'Expand'}
                                                    >
                                                        <svg className={`w-4 h-4 transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {!isEditing && (
                                                        <>
                                                            <button
                                                                onClick={() => startEditing(index)}
                                                                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                title="Edit recommendation"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>

                                                            <button
                                                                onClick={() => removeRecommendation(index)}
                                                                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                title="Remove recommendation"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="p-3 sm:p-4">
                                                {isEditing ? (
                                                    <div className="space-y-4">
                                                        {/* Edit Form */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Title
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editingRec.title}
                                                                onChange={(e) => updateEditingField('title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="Brief descriptive title"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                value={editingRec.description}
                                                                onChange={(e) => updateEditingField('description', e.target.value)}
                                                                rows={5}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="Detailed explanation of what needs to be done and why..."
                                                            />
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                            <Button onClick={saveEdit} className="w-full sm:w-auto">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Save Changes
                                                            </Button>
                                                            <Button variant="outline" onClick={cancelEdit} className="w-full sm:w-auto">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Description */}
                                                        {recommendation.description && recommendation.description.trim() && (
                                                            <div>
                                                                <div
                                                                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm"
                                                                    dangerouslySetInnerHTML={{ __html: recommendation.description }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {recommendations.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex">
                                <svg className="flex-shrink-0 w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                                        {recommendations.length} Expert Recommendation{recommendations.length !== 1 ? 's' : ''} Generated
                                    </h4>
                                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                        AI has analyzed your technical findings and generated prioritized, actionable recommendations with detailed implementation steps, time estimates, and risk assessments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="w-full sm:w-auto"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Findings
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleSave}
                        loading={saving}
                        className="w-full sm:w-auto"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save Draft
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={recommendations.length === 0}
                        className="w-full sm:w-auto"
                    >
                        Next: Review Report
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AIRecommendationsStep;