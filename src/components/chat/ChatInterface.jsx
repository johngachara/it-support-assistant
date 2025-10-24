import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import { cerebrasService } from '../../services/ai/cerebrasService';
import { supabase } from '../../services/database/supabaseClient';
import { marked } from "marked";

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            content: "Hello! I'm your AI IT support assistant. I can help you with technical problems, troubleshooting, hardware recommendations, and more. What can I help you with today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [typingMessageId, setTypingMessageId] = useState(null);
    const [currentChatId, setCurrentChatId] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const saveChatToHistory = async (userMessage, aiResponse) => {
        try {
            // Build the conversation array from current messages (excluding the initial greeting)
            const conversation = messages
                .filter(msg => msg.id !== '1')
                .map(msg => ({
                    role: msg.isUser ? 'user' : 'assistant',
                    content: msg.content
                }));

            // Add the new user message and AI response
            conversation.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );

            if (currentChatId) {
                // Update existing chat session
                await supabase
                    .from('chat_history')
                    .update({
                        conversation: conversation,
                        last_message: userMessage,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentChatId);
            } else {
                // Create new chat session
                const { data, error } = await supabase
                    .from('chat_history')
                    .insert({
                        conversation: conversation,
                        last_message: userMessage,
                        title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')
                    })
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setCurrentChatId(data.id);
                }
            }
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
            const conversationHistory = messages
                .filter(msg => msg.id !== '1')
                .slice(-10)
                .map(msg => ({
                    role: msg.isUser ? 'user' : 'assistant',
                    content: msg.content
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

    const clearChat = () => {
        setMessages([messages[0]]);
        setCurrentChatId(null); // Start a new chat session
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

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearChat}
                        title="Clear chat"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ minHeight: 0 }}
            >
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
    );
};

export default ChatInterface;