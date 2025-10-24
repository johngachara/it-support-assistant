import { useState } from 'react';
import TypeWriter from './TypeWriter';
import { marked } from "marked";
const ChatMessage = ({ message, isUser, isTyping = false, onTypingComplete }) => {
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopyFeedback(true);
            setTimeout(() => setShowCopyFeedback(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

     const formatMessage = (text) => {
        if (!text) return "";

        return marked(text, {
            breaks: true, // line breaks become <br>
            gfm: true,    // GitHub-flavored markdown (tables, strikethrough, etc.)
        });
    };
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white'
                }`}>
                    {isUser ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    )}
                </div>

                {/* Message */}
                <div className={`relative px-4 py-3 rounded-2xl ${
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                }`}>
                    <div className="text-sm leading-relaxed">
                        {isTyping && !isUser ? (
                            <TypeWriter
                                text={message}
                                speed={1}
                                onComplete={onTypingComplete}
                            />
                        ) : (
                            <div className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: formatMessage(message)
                                }}
                            />
                        )}
                    </div>

                    {/* Copy button for AI messages */}
                    {!isUser && !isTyping && (
                        <button
                            onClick={() => copyToClipboard(message)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    )}

                    {showCopyFeedback && (
                        <div className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded">
                            Copied!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;