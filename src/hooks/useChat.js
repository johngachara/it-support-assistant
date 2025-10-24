import { useState, useEffect } from 'react';
import { cerebrasService } from '../services/ai/cerebrasService';
import { supabase } from '../services/database/supabaseClient';

export const useChat = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            content: "Hello! I'm your AI IT support assistant. I can help you with technical problems, troubleshooting, hardware recommendations, and more. What can I help you with today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveChatToHistory = async (userMessage, aiResponse) => {
        try {
            await supabase
                .from('chat_history')
                .insert({
                    message: userMessage,
                    response: aiResponse
                });
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const sendMessage = async (messageContent) => {
        const userMessage = {
            id: `user-${Date.now()}`,
            content: messageContent,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            // Get conversation history for context
            const conversationHistory = messages
                .filter(msg => msg.id !== '1') // Exclude welcome message
                .slice(-10) // Last 10 messages for context
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
                content: aiResponse,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);

            // Save to history
            await saveChatToHistory(messageContent, aiResponse);

            return aiMessage;

        } catch (err) {
            console.error('Error getting AI response:', err);
            setError(err.message);

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

    const clearChat = () => {
        setMessages([messages[0]]); // Keep welcome message
    };

    useEffect(() => {
        loadChatHistory();
    }, []);

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearChat
    };
};