import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, X } from 'lucide-react';

const ChatSidebar = ({ chats, currentChat, onSelectChat, onNewChat, onDeleteChat }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm font-medium"
                >
                    <Plus size={20} />
                    چت جدید
                </button>
            </div>

            {/* Search */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="relative">
                    <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو در چت‌ها..."
                        className="w-full pr-10 pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredChats.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'چتی یافت نشد' : 'هنوز چتی ایجاد نشده است'}
                        </p>
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat)}
                            className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                currentChat?.id === chat.id
                                    ? 'bg-white shadow-sm border border-indigo-200'
                                    : 'hover:bg-white border border-transparent'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare size={16} className={currentChat?.id === chat.id ? 'text-indigo-600' : 'text-gray-400'} />
                                        <h4 className={`text-sm font-medium truncate ${
                                            currentChat?.id === chat.id ? 'text-indigo-700' : 'text-gray-800'
                                        }`}>
                                            {chat.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(chat.createdAt).toLocaleDateString('fa-IR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-all duration-200"
                                    title="حذف چت"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="text-xs text-gray-500 text-center">
                    <p>تعداد چت‌ها: {chats.length}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;

