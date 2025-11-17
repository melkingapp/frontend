import React, { useState } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const ChatMessage = ({ message }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.sender === 'user';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`flex gap-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot size={18} className="text-white" />
                </div>
            )}
            
            <div className={`flex-1 max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
                <div
                    className={`rounded-2xl px-5 py-3 shadow-sm ${
                        isUser
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                            : 'bg-white border border-gray-200'
                    }`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    ) : (
                        <MarkdownRenderer content={message.text} />
                    )}
                </div>
                
                <div className="flex items-center gap-2 mt-2 px-2">
                    <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                    {!isUser && (
                        <button
                            onClick={handleCopy}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                            title="کپی کردن"
                        >
                            {copied ? (
                                <Check size={14} className="text-green-500" />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    )}
                </div>
            </div>
            
            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-md">
                    <User size={18} className="text-white" />
                </div>
            )}
        </div>
    );
};

export default ChatMessage;

