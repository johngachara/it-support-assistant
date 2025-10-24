import { createContext, useContext, useReducer, useEffect } from 'react';
import { cerebrasService } from '../services/ai/cerebrasService';
import { supabase } from '../services/database/supabaseClient';

const ChatContext = createContext();

// Action types
const CHAT_ACTIONS = {
    LOADING: 'LOADING',
    SEND_MESSAGE: 'SEND_MESSAGE',
    RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
    ERROR: 'ERROR',
    CLEAR_CHAT: 'CLEAR_CHAT',
    LOAD_HISTORY: 'LOAD_HISTORY',
    SET_TYPING: 'SET_TYPING',
    EXPORT_CHAT: 'EXPORT_CHAT'
};

// Initial state
const initialState = {
    messages: [
        {
            id: '1',
            content: "Hello! I'm your AI IT support assistant. I can help you with technical problems, troubleshooting, hardware recommendations, and more. What can I help you with today?",
            isUser: false,
            timestamp: new Date(),
            isWelcome: true
        }
    ],
    loading: false,
    typing: false,
    typingMessageId: null,
    error: null,
    conversationId: null
};

// Reducer
const chatReducer = (state, action) => {
    switch (action.type) {
        case CHAT_ACTIONS.LOADING:
            return {
                ...state,
                loading: action.payload,
                error: null
            };

        case CHAT_ACTIONS.SEND_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.payload],
                loading: true
            };

        case CHAT_ACTIONS.RECEIVE_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.payload],
                loading: false,
                typing: true,
                typingMessageId: action.payload.id
            };

        case CHAT_ACTIONS.SET_TYPING:
            return {
                ...state,
                typing: action.payload.typing,
                typingMessageId: action.payload.typing ? action.payload.messageId : null
            };

        case CHAT_ACTIONS.ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
                typing: false
            };

        case CHAT_ACTIONS.CLEAR_CHAT:
            return {
                ...initialState,
                conversationId: state.conversationId
            };

        case CHAT_ACTIONS.LOAD_HISTORY:
            return {
                ...state,
                messages: [
                    state.messages[0], // Keep welcome message
                    ...action.payload
                ]
            };

        default:
            return state;
    }
};

// Provider component
export const ChatProvider = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    // Load chat history from database
    const loadChatHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) {
                console.error('Error loading chat history:', error);
                return;
            }

            if (data && data.length > 0) {
                const historyMessages = data.flatMap((chat, index) => [
                    {
                        id: `history-user-${index}`,
                        content: chat.message,
                        isUser: true,
                        timestamp: new Date(chat.created_at)
                    },
                    {
                        id: `history-ai-${index}`,
                        content: chat.response,
                        isUser: false,
                        timestamp: new Date(chat.created_at)
                    }
                ]);

                dispatch({
                    type: CHAT_ACTIONS.LOAD_HISTORY,
                    payload: historyMessages
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    // Save chat interaction to database
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

    // Send a message
    const sendMessage = async (messageContent) => {
        const userMessage = {
            id: `user-${Date.now()}`,
            content: messageContent,
            isUser: true,
            timestamp: new Date()
        };

        // Add user message to chat
        dispatch({
            type: CHAT_ACTIONS.SEND_MESSAGE,
            payload: userMessage
        });

        try {
            // Get conversation history for context (exclude welcome message)
            const conversationHistory = state.messages
                .filter(msg => !msg.isWelcome)
                .slice(-10) // Last 10 messages for context
                .map(msg => ({
                    role: msg.isUser ? 'user' : 'assistant',
                    content: msg.content
                }));

            // Get AI response
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

            // Add AI response to chat
            dispatch({
                type: CHAT_ACTIONS.RECEIVE_MESSAGE,
                payload: aiMessage
            });

            // Save to database
            await saveChatToHistory(messageContent, aiResponse);

            return aiMessage;

        } catch (error) {
            console.error('Error getting AI response:', error);

            const errorMessage = {
                id: `error-${Date.now()}`,
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                isUser: false,
                timestamp: new Date(),
                isError: true
            };

            dispatch({
                type: CHAT_ACTIONS.RECEIVE_MESSAGE,
                payload: errorMessage
            });

            dispatch({
                type: CHAT_ACTIONS.ERROR,
                payload: error.message
            });
        }
    };

    // Set typing status
    const setTyping = (typing, messageId = null) => {
        dispatch({
            type: CHAT_ACTIONS.SET_TYPING,
            payload: { typing, messageId }
        });
    };

    // Clear chat history
    const clearChat = () => {
        dispatch({ type: CHAT_ACTIONS.CLEAR_CHAT });
    };

    // Export chat to text file
    const exportChat = () => {
        const chatContent = state.messages
            .filter(msg => !msg.isWelcome)
            .map(msg => {
                const timestamp = msg.timestamp.toLocaleString();
                const sender = msg.isUser ? 'You' : 'AI Assistant';
                return `[${timestamp}] ${sender}: ${msg.content}`;
            })
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

    // Get conversation summary
    const getConversationSummary = () => {
        const userMessages = state.messages.filter(msg => msg.isUser);
        const aiMessages = state.messages.filter(msg => !msg.isUser && !msg.isWelcome);

        return {
            totalMessages: state.messages.length - 1, // Exclude welcome message
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            startTime: userMessages[0]?.timestamp || new Date(),
            lastMessage: state.messages[state.messages.length - 1]?.timestamp || new Date(),
            hasErrors: state.messages.some(msg => msg.isError)
        };
    };

    // Clear error
    const clearError = () => {
        dispatch({
            type: CHAT_ACTIONS.ERROR,
            payload: null
        });
    };

    // Load initial chat history
    useEffect(() => {
        loadChatHistory();
    }, []);

    // Context value
    const value = {
        ...state,
        sendMessage,
        setTyping,
        clearChat,
        exportChat,
        getConversationSummary,
        clearError,
        loadChatHistory
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

// Hook to use the chat context
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

// Export action types for external use if needed
export { CHAT_ACTIONS };