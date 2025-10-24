import { useParams } from 'react-router-dom';
import ChatInterface from '../components/chat/ChatInterface';
import { ChatHistoryList, ContinueChatInterface } from '../components/chat/ChatHistory';
import { useState, useEffect } from 'react';
import { supabase } from '../services/database/supabaseClient';

const ChatPage = () => {
    const { view, chatId } = useParams();
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (chatId) {
            loadChat(chatId);
        }
    }, [chatId]);

    const loadChat = async (id) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setSelectedChat(data);
        } catch (error) {
            console.error('Error loading chat:', error);
        } finally {
            setLoading(false);
        }
    };

    // Show chat history list
    if (view === 'history' && !chatId) {
        return <ChatHistoryList />;
    }

    // Show continue conversation interface
    if (chatId && selectedChat) {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            );
        }
        return <ContinueChatInterface selectedChat={selectedChat} />;
    }

    // Show new chat interface (default)
    return (
        <div className="h-full max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    AI Support Chat
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Get instant help with technical problems and IT support questions.
                </p>
            </div>

            <div className="h-[calc(100vh-200px)] min-h-[600px]">
                <ChatInterface />
            </div>
        </div>
    );
};

export default ChatPage;