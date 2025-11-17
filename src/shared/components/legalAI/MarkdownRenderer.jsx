import React from 'react';

const MarkdownRenderer = ({ content }) => {
    // Simple markdown renderer for AI responses
    const renderContent = (text) => {
        if (!text) return null;

        // Split by lines
        const lines = text.split('\n');
        const elements = [];
        let listItems = [];
        let isInList = false;

        lines.forEach((line, index) => {
            // Headers
            if (line.startsWith('###')) {
                if (isInList) {
                    elements.push(<ul key={`ul-${index}`} className="list-disc mr-6 mb-4 space-y-1">{listItems}</ul>);
                    listItems = [];
                    isInList = false;
                }
                elements.push(
                    <h3 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">
                        {line.replace('###', '').trim()}
                    </h3>
                );
            } else if (line.startsWith('##')) {
                if (isInList) {
                    elements.push(<ul key={`ul-${index}`} className="list-disc mr-6 mb-4 space-y-1">{listItems}</ul>);
                    listItems = [];
                    isInList = false;
                }
                elements.push(
                    <h2 key={index} className="text-xl font-bold text-gray-900 mt-4 mb-2">
                        {line.replace('##', '').trim()}
                    </h2>
                );
            }
            // Bold text (using **)
            else if (line.includes('**')) {
                if (isInList) {
                    elements.push(<ul key={`ul-${index}`} className="list-disc mr-6 mb-4 space-y-1">{listItems}</ul>);
                    listItems = [];
                    isInList = false;
                }
                const parts = line.split('**');
                const formatted = parts.map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
                );
                elements.push(<p key={index} className="mb-2">{formatted}</p>);
            }
            // List items
            else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                isInList = true;
                listItems.push(
                    <li key={index} className="text-gray-700">
                        {line.replace('•', '').replace(/^-\s*/, '').trim()}
                    </li>
                );
            }
            // Empty lines
            else if (line.trim() === '') {
                if (isInList) {
                    elements.push(<ul key={`ul-${index}`} className="list-disc mr-6 mb-4 space-y-1">{listItems}</ul>);
                    listItems = [];
                    isInList = false;
                }
                elements.push(<div key={index} className="h-2" />);
            }
            // Regular text
            else if (line.trim()) {
                if (isInList) {
                    elements.push(<ul key={`ul-${index}`} className="list-disc mr-6 mb-4 space-y-1">{listItems}</ul>);
                    listItems = [];
                    isInList = false;
                }
                elements.push(<p key={index} className="mb-2 text-gray-700 leading-relaxed">{line}</p>);
            }
        });

        // Add remaining list items
        if (isInList && listItems.length > 0) {
            elements.push(<ul key="ul-final" className="list-disc mr-6 mb-4 space-y-1">{listItems}</ul>);
        }

        return elements;
    };

    return <div className="markdown-content">{renderContent(content)}</div>;
};

export default MarkdownRenderer;

