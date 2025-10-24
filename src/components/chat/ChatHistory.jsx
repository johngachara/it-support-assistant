import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/database/supabaseClient';
import { cerebrasService } from '../../services/ai/cerebrasService';
import { marked } from 'marked';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';

// ChatHistoryList Component - Shows previous chats as a list
const ChatHistoryList = () => {
    const navigate = useNavigate();
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .order('updated_at', {ascending : false})
                .limit(50);

            if (error) {
                console.error('Error loading chat history:', error);
                return;
            }

            setChatHistory(data || []);
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const truncateText = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getPreviewText = (chat) => {
        // Get the last assistant message for preview
        if (chat.conversation && chat.conversation.length > 0) {
            const lastAssistantMsg = [...chat.conversation]
                .reverse()
                .find(msg => msg.role === 'assistant');
            return lastAssistantMsg?.content || 'No response yet';
        }
        return 'No messages';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (chatHistory.length === 0) {
        return (
            <div className="text-center p-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No chat history yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Start a new conversation to see it appear here
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Chat History
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View and continue your previous conversations
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {chatHistory.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => navigate(`/chat/continue/${chat.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 text-left border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                {formatDate(chat.updated_at || chat.created_at)}
                            </span>
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {chat.title || truncateText(chat.last_message || 'Untitled Chat', 80)}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                            {truncateText(getPreviewText(chat), 120)}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                <span>Continue conversation</span>
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {chat.conversation?.length || 0} messages
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ContinueChatInterface Component - View and continue a specific chat
const ContinueChatInterface = ({ selectedChat }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [typingMessageId, setTypingMessageId] = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (selectedChat) {
            setCurrentChatId(selectedChat.id);

            // Load conversation from the chat history
            if (selectedChat.conversation && selectedChat.conversation.length > 0) {
                const loadedMessages = selectedChat.conversation.map((msg, index) => ({
                    id: `${msg.role}-${selectedChat.id}-${index}`,
                    content: msg.role === 'assistant'
                        ? marked.parse(msg.content, { breaks: true, gfm: true })
                        : msg.content,
                    isUser: msg.role === 'user',
                    timestamp: new Date(selectedChat.created_at)
                }));
                setMessages(loadedMessages);
            }
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, []);

    const saveChatToHistory = async (userMessage, aiResponse) => {
        try {
            // Build the conversation array from current messages
            const conversation = messages.map(msg => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.isUser ? msg.content : msg.content.replace(/<[^>]*>/g, '') // Strip HTML from assistant messages
            }));

            // Add the new user message and AI response
            conversation.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );

            // Update the existing chat session
            await supabase
                .from('chat_history')
                .update({
                    conversation: conversation,
                    last_message: userMessage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentChatId);
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const handleSendMessage = async (messageContent) => {
        const userMessage = {
            id: `user-${Date.now()}`,
            content: messageContent,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const conversationHistory = messages.map(msg => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.isUser ? msg.content : msg.content.replace(/<[^>]*>/g, '') // Strip HTML for API call
            }));

            const aiResponse = await cerebrasService.chatResponse(
                messageContent,
                conversationHistory
            );

            const aiMessage = {
                id: `ai-${Date.now()}`,
                content: marked.parse(aiResponse, {
                    breaks: true,
                    gfm: true,
                }),
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
            setTypingMessageId(aiMessage.id);

            await saveChatToHistory(messageContent, aiResponse);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = {
                id: `error-${Date.now()}`,
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleTypingComplete = () => {
        setTypingMessageId(null);
    };

    const exportChat = () => {
        const chatContent = messages
            .map(msg => `${msg.isUser ? 'You' : 'AI'}: ${msg.content}`)
            .join('\n\n');

        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `it-support-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedChat?.title || 'Continue Conversation'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Continue your conversation with the AI assistant.
                </p>
            </div>

            <div className="h-[calc(100vh-200px)] min-h-[600px]">
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    IT Support Assistant
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {loading ? 'Thinking...' : 'Online'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportChat}
                                title="Export chat"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
                        {messages.map((message) => (
                            <div key={message.id} className="group">
                                <ChatMessage
                                    message={message.content}
                                    isUser={message.isUser}
                                    isTyping={typingMessageId === message.id}
                                    onTypingComplete={handleTypingComplete}
                                />
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start mb-4">
                                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                                    <LoadingSpinner size="sm" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        AI is thinking...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export { ChatHistoryList, ContinueChatInterface };