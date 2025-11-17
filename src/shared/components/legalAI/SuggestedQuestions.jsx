import React from 'react';
import { Sparkles } from 'lucide-react';

const SuggestedQuestions = ({ onQuestionClick, userType = 'manager' }) => {
    const managerQuestions = [
        { id: 1, text: 'مدیریت ساختمان چیست؟', emoji: '🏢' },
        { id: 2, text: 'شارژ ساختمان چطور محاسبه می‌شود؟', emoji: '💰' },
        { id: 3, text: 'حقوق مالکان و ساکنان چیست؟', emoji: '⚖️' },
        { id: 4, text: 'مستاجر پول نمی‌دهد، چه کار کنم؟', emoji: '⚠️' },
        { id: 5, text: 'قرارداد اجاره باید چه مواردی داشته باشد؟', emoji: '📄' },
        { id: 6, text: 'چگونه ملک را تخلیه کنم؟', emoji: '🚪' }
    ];

    const residentQuestions = [
        { id: 1, text: 'حقوق و وظایف ساکنان چیست؟', emoji: '🏠' },
        { id: 2, text: 'شارژ ساختمان چطور محاسبه می‌شود؟', emoji: '💰' },
        { id: 3, text: 'با همسایه مشکل دارم چیکار کنم؟', emoji: '😤' },
        { id: 4, text: 'قوانین اجاره و قرارداد چیست؟', emoji: '📄' },
        { id: 5, text: 'آیین‌نامه ساختمان شامل چه مواردی است؟', emoji: '📋' },
        { id: 6, text: 'در صورت عدم پرداخت اجاره چه اتفاقی می‌افتد؟', emoji: '⚠️' }
    ];

    const questions = userType === 'resident' ? residentQuestions : managerQuestions;
    const title = userType === 'resident' ? 'دستیار حقوقی ساکن' : 'دستیار حقوقی ملکینگ';
    const description = userType === 'resident' 
        ? 'من اینجا هستم تا به سوالات حقوقی شما در زمینه سکونت، اجاره و قوانین ساختمان پاسخ دهم.'
        : 'من اینجا هستم تا به سوالات حقوقی شما در زمینه مدیریت ساختمان، اجاره و قوانین مربوطه پاسخ دهم.';

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-6">
                <Sparkles size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                {description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                {questions.map((q) => (
                    <button
                        key={q.id}
                        onClick={() => onQuestionClick(q.text)}
                        className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200 text-gray-800 text-sm font-medium text-right"
                    >
                        <span className="ml-2 text-lg">{q.emoji}</span>
                        {q.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SuggestedQuestions;

