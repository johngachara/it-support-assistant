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

                // Auto-expand critical and high priority items
                const criticalHighIndices = result.structured
                    .map((rec, index) => rec.priority === 'Critical' || rec.priority === 'High' ? index : null)
                    .filter(index => index !== null);
                setExpandedCards(new Set(criticalHighIndices));
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
            priority: 'Medium',
            category: 'Custom',
            urgency: 'This Week (1-7 days)',
            description: '',
            steps: [''],
            prerequisites: [],
            estimated_time: '',
            expected_outcome: '',
            risks: [],
            cost_estimate: '',
            follow_up: '',
            alternative_solutions: []
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

    const addStep = () => {
        setEditingRec(prev => ({
            ...prev,
            steps: [...prev.steps, '']
        }));
    };

    const updateStep = (stepIndex, value) => {
        setEditingRec(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => i === stepIndex ? value : step)
        }));
    };

    const removeStep = (stepIndex) => {
        setEditingRec(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== stepIndex)
        }));
    };

    const saveEdit = () => {
        if (!editingRec.title.trim() || editingRec.steps.filter(s => s.trim()).length === 0) {
            setError('Title and at least one step are required');
            return;
        }

        const validSteps = editingRec.steps.filter(step => step.trim());
        const updatedRec = { ...editingRec, steps: validSteps };

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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
        }
    };

    const getCategoryIcon = (category) => {
        const iconClass = "w-5 h-5";
        switch (category) {
            case 'Immediate Action':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>;
            case 'Hardware':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>;
            case 'Software':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>;
            case 'Security':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>;
            case 'Performance':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>;
            default:
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>;
        }
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Expert IT Recommendations
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                AI-generated recommendations based on technical analysis.
                            </p>
                            {metadata && (
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Total: {metadata.total_recommendations}</span>
                                    {metadata.search_enhanced && <span className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Web-enhanced</span>}
                                    {Object.entries(metadata.priority_breakdown).map(([priority, count]) =>
                                        count > 0 && <span key={priority}>{priority}: {count}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addCustomRecommendation}
                                title="Add custom recommendation"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Custom
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={regenerateRecommendations}
                                loading={generating}
                                title="Regenerate all recommendations"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Regenerate
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
                            <div className="flex justify-center space-x-3">
                                <Button onClick={generateRecommendations}>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate AI Recommendations
                                </Button>
                                <Button variant="outline" onClick={addCustomRecommendation}>
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
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                                                        {getCategoryIcon(recommendation.category)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                                                {recommendation.title || `Recommendation ${index + 1}`}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                                                                {recommendation.priority}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {recommendation.category}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400">•</span>
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {recommendation.urgency}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => toggleExpanded(index)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                title="Edit recommendation"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>

                                                            <button
                                                                onClick={() => removeRecommendation(index)}
                                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                            <div className="p-4">
                                                {isEditing ? (
                                                    <div className="space-y-4">
                                                        {/* Edit Form */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                    Priority
                                                                </label>
                                                                <select
                                                                    value={editingRec.priority}
                                                                    onChange={(e) => updateEditingField('priority', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                >
                                                                    <option value="Critical">Critical</option>
                                                                    <option value="High">High</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="Low">Low</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Category
                                                                </label>
                                                                <select
                                                                    value={editingRec.category}
                                                                    onChange={(e) => updateEditingField('category', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                >
                                                                    <option value="Immediate Action">Immediate Action</option>
                                                                    <option value="Hardware">Hardware</option>
                                                                    <option value="Software">Software</option>
                                                                    <option value="Preventive">Preventive</option>
                                                                    <option value="Security">Security</option>
                                                                    <option value="Performance">Performance</option>
                                                                    <option value="Cost Optimization">Cost Optimization</option>
                                                                    <option value="Custom">Custom</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Urgency
                                                                </label>
                                                                <select
                                                                    value={editingRec.urgency}
                                                                    onChange={(e) => updateEditingField('urgency', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                >
                                                                    <option value="Immediate (0-4 hours)">Immediate (0-4 hours)</option>
                                                                    <option value="Same Day (4-24 hours)">Same Day (4-24 hours)</option>
                                                                    <option value="This Week (1-7 days)">This Week (1-7 days)</option>
                                                                    <option value="This Month (1-30 days)">This Month (1-30 days)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                value={editingRec.description}
                                                                onChange={(e) => updateEditingField('description', e.target.value)}
                                                                rows={3}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="Detailed explanation of what needs to be done and why..."
                                                            />
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    Steps
                                                                </label>
                                                                <Button size="sm" variant="outline" onClick={addStep}>
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    Add Step
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {editingRec.steps.map((step, stepIndex) => (
                                                                    <div key={stepIndex} className="flex items-start space-x-2">
                                                                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full flex items-center justify-center mt-1">
                                                                            {stepIndex + 1}
                                                                        </span>
                                                                        <textarea
                                                                            value={step}
                                                                            onChange={(e) => updateStep(stepIndex, e.target.value)}
                                                                            rows={2}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                            placeholder={`Step ${stepIndex + 1}...`}
                                                                        />
                                                                        <button
                                                                            onClick={() => removeStep(stepIndex)}
                                                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                                                                            title="Remove step"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Estimated Time
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editingRec.estimated_time}
                                                                    onChange={(e) => updateEditingField('estimated_time', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="e.g., 2-3 hours"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Cost Estimate
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editingRec.cost_estimate}
                                                                    onChange={(e) => updateEditingField('cost_estimate', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    placeholder="e.g., $100-500 or Free"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Expected Outcome
                                                            </label>
                                                            <textarea
                                                                value={editingRec.expected_outcome}
                                                                onChange={(e) => updateEditingField('expected_outcome', e.target.value)}
                                                                rows={2}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="What should happen after implementing this recommendation..."
                                                            />
                                                        </div>

                                                        <div className="flex space-x-3 pt-2">
                                                            <Button onClick={saveEdit}>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Save Changes
                                                            </Button>
                                                            <Button variant="outline" onClick={cancelEdit}>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Description - Only show if not empty */}
                                                        {recommendation.description && recommendation.description.trim() && (
                                                            <div>
                                                                <div
                                                                    className="prose dark:prose-invert max-w-none text-gray-900 dark:text-white"
                                                                    dangerouslySetInnerHTML={{ __html: recommendation.description }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Steps */}
                                                        {recommendation.steps && recommendation.steps.length > 0 && (
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Implementation Steps:</h5>
                                                                <div className="space-y-2">
                                                                    {recommendation.steps.map((step, stepIndex) => (
                                                                        <div key={stepIndex} className="flex items-start space-x-3">
                                                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full flex items-center justify-center">
                                                                                {stepIndex + 1}
                                                                            </span>
                                                                            <div
                                                                                className="flex-1 text-gray-700 dark:text-gray-300"
                                                                                dangerouslySetInnerHTML={{ __html: step }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Details Grid - Only show if values are not defaults */}
                                                        {(
                                                            (recommendation.estimated_time && recommendation.estimated_time !== 'Not specified') ||
                                                            (recommendation.cost_estimate && recommendation.cost_estimate !== 'Not specified') ||
                                                            (recommendation.expected_outcome && recommendation.expected_outcome !== 'Improved system functionality')
                                                        ) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                                                {recommendation.estimated_time && recommendation.estimated_time !== 'Not specified' && (
                                                                    <div>
                                                                        <h6 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Time Estimate</h6>
                                                                        <p className="text-sm text-gray-900 dark:text-white">{recommendation.estimated_time}</p>
                                                                    </div>
                                                                )}
                                                                {recommendation.cost_estimate && recommendation.cost_estimate !== 'Not specified' && (
                                                                    <div>
                                                                        <h6 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cost Estimate</h6>
                                                                        <p className="text-sm text-gray-900 dark:text-white">{recommendation.cost_estimate}</p>
                                                                    </div>
                                                                )}
                                                                {recommendation.expected_outcome && recommendation.expected_outcome !== 'Improved system functionality' && (
                                                                    <div className="md:col-span-2">
                                                                        <h6 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Outcome</h6>
                                                                        <div
                                                                            className="text-sm text-gray-900 dark:text-white"
                                                                            dangerouslySetInnerHTML={{ __html: recommendation.expected_outcome }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Warnings/Risks */}
                                                        {recommendation.risks && recommendation.risks.length > 0 && (
                                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                                                <div className="flex">
                                                                    <svg className="flex-shrink-0 w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <div>
                                                                        <h6 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Risks & Considerations</h6>
                                                                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                                                            {recommendation.risks.map((risk, riskIndex) => (
                                                                                <li key={riskIndex}>• {risk}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
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

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onBack}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Findings
                </Button>

                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleSave}
                        loading={saving}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save Draft
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={recommendations.length === 0}
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