import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  Send, 
  Download, 
  Loader2, 
  Sparkles,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

import ChatMessage from '../../shared/components/legalAI/ChatMessage';
import ChatSidebar from '../../shared/components/legalAI/ChatSidebar';
import SuggestedQuestions from '../../shared/components/legalAI/SuggestedQuestions';
import { legalAIService } from '../../shared/services/legalAIService';

const ResidentLegalAI = () => {
  const { selectedResidentBuilding } = useSelector(state => state.buildings);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const inputRef = useRef(null);

  // Load chats from sessionStorage
  useEffect(() => {
    // Migration: clear old localStorage data to prevent security leaks
    localStorage.removeItem('resident_legalAI_chats');

    const savedChats = sessionStorage.getItem('resident_legalAI_chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
        if (parsedChats.length > 0) {
          setCurrentChat(parsedChats[0]);
          setMessages(parsedChats[0].messages || []);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        sessionStorage.removeItem('resident_legalAI_chats');
      }
    }
  }, []);

  // Save chats to sessionStorage
  useEffect(() => {
    if (chats.length > 0) {
      sessionStorage.setItem('resident_legalAI_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Generate fallback response (when API fails)
  const generateFallbackResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('سلام') || lowerQuestion.includes('hi')) {
      return `سلام! 👋 خوش آمدید به دستیار حقوقی ملکینگ!

من اینجا هستم تا در مسائل حقوقی مربوط به سکونت و زندگی در ساختمان کمکتون کنم.

**به عنوان ساکن می‌تونید در مورد این موضوعات ازم بپرسید:**
• حقوق و وظایف ساکنان
• مسائل اجاره و قرارداد
• قوانین ساختمان و آیین‌نامه
• مشکلات با همسایگان
• مسائل مالی و شارژ

چه سوالی دارید؟ 😊`;
    }

    if (lowerQuestion.includes('حقوق') || lowerQuestion.includes('ساکن') || lowerQuestion.includes('مستاجر')) {
      return `## حقوق و وظایف ساکنان

**حقوق ساکنان:**
• حق استفاده از امکانات مشترک ساختمان
• حق دریافت خدمات مناسب و ایمن
• حق اطلاع از قوانین و آیین‌نامه ساختمان
• حق شکایت در صورت مشکلات
• حق دریافت رسید پرداخت اجاره و شارژ

**وظایف ساکنان:**
• پرداخت اجاره و شارژ به موقع
• رعایت قوانین ساختمان و آیین‌نامه
• مراقبت از ملک و عدم ایجاد خسارت
• عدم ایجاد مزاحمت برای همسایگان
• همکاری با مدیر ساختمان

**نکات مهم:**
ساکنان باید از قوانین ساختمان آگاه باشند و آن‌ها را رعایت کنند.`;
    }

    if (lowerQuestion.includes('اجاره') || lowerQuestion.includes('قرارداد') || lowerQuestion.includes('مالک')) {
      return `## قرارداد اجاره و مسائل مربوطه

**اجزای قرارداد اجاره:**
• مشخصات کامل طرفین (مالک و مستاجر)
• مشخصات دقیق ملک (آدرس، متراژ، امکانات)
• مبلغ اجاره ماهانه و نحوه پرداخت
• مدت قرارداد و شرایط تمدید
• ودیعه و پیش‌پرداخت

**حقوق مستاجر:**
• حق استفاده از ملک طبق قرارداد
• حق دریافت خدمات مناسب
• حق اطلاع از تغییرات مهم
• حق فسخ قرارداد در شرایط خاص

**وظایف مستاجر:**
• پرداخت اجاره به موقع
• مراقبت از ملک
• رعایت قوانین ساختمان
• عدم زیراجاره بدون اجازه مالک

**نکات مهم:**
قرارداد اجاره باید کتبی باشد و تمام شرایط را به وضوح مشخص کند.`;
    }

    if (lowerQuestion.includes('شارژ') || lowerQuestion.includes('مالی') || lowerQuestion.includes('پول')) {
      return `## شارژ ساختمان و مسائل مالی

**شارژ ساختمان شامل:**
• هزینه‌های مشترک (برق، آب، گاز)
• تعمیرات و نگهداری مشترک
• نظافت و نگهبانی
• بیمه ساختمان
• مدیریت ساختمان

**نحوه محاسبه شارژ:**
شارژ هر واحد بر اساس متراژ محاسبه می‌شود:
شارژ واحد = (متراژ واحد ÷ مجموع متراژ کل) × مجموع هزینه‌های مشترک

**حقوق ساکن در مورد شارژ:**
• حق دریافت فاکتور و رسید پرداخت
• حق اطلاع از نحوه محاسبه شارژ
• حق اعتراض به شارژ غیرمنطقی
• حق دریافت گزارش مالی ماهانه

**نکات مهم:**
پرداخت شارژ جزء وظایف ساکن است و عدم پرداخت آن می‌تواند منجر به مشکلات قانونی شود.`;
    }

    if (lowerQuestion.includes('همسایه') || lowerQuestion.includes('مزاحمت') || lowerQuestion.includes('سروصدا')) {
      return `## مسائل همسایگی و مزاحمت

**انواع مزاحمت:**
• سروصدای زیاد در ساعات استراحت
• استفاده غیرمجاز از مشاعات
• ایجاد آلودگی و بوی نامطبوع
• پارک غیرمجاز در جایگاه دیگران
• نگهداری حیوانات مزاحم

**راه‌های حل مشکل:**
• گفتگوی دوستانه با همسایه
• اطلاع‌رسانی به مدیر ساختمان
• شکایت به هیئت مدیره
• مراجعه به مراجع قانونی در صورت ادامه مشکل

**قوانین مهم:**
• سکوت در ساعات ۲۲ تا ۸ صبح
• عدم استفاده از مشاعات برای مصارف شخصی
• رعایت قوانین پارکینگ
• عدم ایجاد مزاحمت برای سایر ساکنان

**نکات مهم:**
اولین قدم همیشه گفتگوی دوستانه است. در صورت عدم نتیجه، می‌توان از مراجع بالاتر کمک گرفت.`;
    }

    if (lowerQuestion.includes('مدل') || lowerQuestion.includes('هوش مصنوعی') || lowerQuestion.includes('ai')) {
      return `## درباره من

من یک دستیار حقوقی هوشمند هستم که برای کمک به مسائل حقوقی مربوط به زندگی در ساختمان طراحی شده‌ام.

**قابلیت‌های من برای ساکنان:**
• پاسخگویی به سوالات حقوقی سکونت
• راهنمایی در مورد قوانین ساختمان
• کمک در مسائل اجاره و قرارداد
• مشاوره در مورد مشکلات همسایگی
• راهنمایی در مورد حقوق و وظایف ساکنان

**نکته مهم:**
من یک ابزار کمکی هستم و پاسخ‌هایم نباید به عنوان مشاوره حقوقی رسمی در نظر گرفته شود. برای مسائل پیچیده، حتماً با وکیل مشورت کنید.

**چگونه کار می‌کنم:**
من از دانش حقوقی مربوط به سکونت و زندگی در ساختمان استفاده می‌کنم تا بهترین پاسخ ممکن را ارائه دهم.`;
    }

    return `متأسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً سوال خود را با جزئیات بیشتری مطرح کنید یا از سوالات پیشنهادی استفاده کنید.

**برای کمک بهتر، لطفاً:**
• سوال رو واضح‌تر بپرسید
• از کلمات کلیدی استفاده کنید مثل:
  - حقوق ساکنان
  - مسائل اجاره
  - قوانین ساختمان
  - مشکلات همسایگی
  - شارژ ساختمان
  - قرارداد اجاره

**یا می‌تونید بپرسید:**
• "سلام" برای شروع
• "حقوق ساکنان چیه؟"
• "شارژ ساختمان چطور محاسبه میشه؟"
• "با همسایه مشکل دارم چیکار کنم؟"

من اینجا هستم تا کمکتون کنم! 😊`;
  };

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'چت جدید',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setCurrentChat(newChat);
    setChats(prev => [newChat, ...prev]);
    setMessages([]);
    setIsSidebarOpen(false);
    inputRef.current?.focus();
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages || []);
    setIsSidebarOpen(false);
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (currentChat?.id === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChat(updatedChats[0]);
        setMessages(updatedChats[0].messages || []);
      } else {
        setCurrentChat(null);
        setMessages([]);
      }
    }
  };

  const exportChat = () => {
    if (!currentChat || currentChat.messages.length === 0) {
      toast.error('چتی برای ذخیره وجود ندارد');
      return;
    }

    const chatContent = currentChat.messages.map(msg => 
      `${msg.sender === 'user' ? 'شما' : 'دستیار'}: ${msg.text}`
    ).join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('چت با موفقیت ذخیره شد');
  };

  const sendMessage = async (customQuestion = null) => {
    const questionText = customQuestion || inputMessage.trim();
    if (!questionText) return;

    // Create or ensure we have a current chat
    let chatToUse = currentChat;
    if (!chatToUse) {
      chatToUse = {
        id: Date.now(),
        title: 'چت جدید',
        messages: [],
        createdAt: new Date().toISOString()
      };
      setCurrentChat(chatToUse);
      setChats(prev => [...prev, chatToUse]);
    }

    const userMessage = {
      id: Date.now(),
      text: questionText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Try to use real API first
      console.log('Attempting to call Legal AI API...');
      const response = await legalAIService.askQuestion(questionText);
      console.log('API Response:', response);
      
      if (response && response.success && response.legalQuestion) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.legalQuestion.response || 'پاسخی دریافت نشد.',
          sender: 'ai',
          timestamp: new Date().toISOString()
        };

        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);
        updateChatInState(chatToUse, finalMessages, questionText);
        console.log('Successfully used API response');
      } else {
        throw new Error('No valid response from API');
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      console.log('Falling back to local response...');
      
      // Fallback to local response
      const aiResponse = generateFallbackResponse(questionText);
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      updateChatInState(chatToUse, finalMessages, questionText);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const updateChatInState = (chat, newMessages, firstQuestion) => {
    const updatedChat = {
      ...chat,
      messages: newMessages,
      title: chat.title === 'چت جدید' ? firstQuestion.substring(0, 30) + '...' : chat.title,
      updatedAt: new Date().toISOString()
    };

    setCurrentChat(updatedChat);
    setChats(prev => prev.map(c => c.id === chat.id ? updatedChat : c));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => sendMessage(question), 100);
  };

  if (!selectedResidentBuilding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ساختمان انتخاب نشده</h2>
          <p className="text-gray-600">لطفاً ابتدا یک ساختمان انتخاب کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          <div className="absolute inset-0 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative h-full lg:h-auto">
            <ChatSidebar
              chats={chats}
              currentChat={currentChat}
              onSelectChat={selectChat}
              onNewChat={startNewChat}
              onDeleteChat={deleteChat}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">دستیار حقوقی ساکن</h1>
              <p className="text-sm text-gray-600">{selectedResidentBuilding.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportChat}
              disabled={!currentChat || currentChat.messages.length === 0}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="ذخیره چت"
            >
              <Download size={20} />
            </button>
            <button
              onClick={startNewChat}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              چت جدید
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} userType="resident" />
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-4 mb-6 animate-fade-in-up">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 text-gray-800">
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">در حال پاسخگویی...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="سوال حقوقی خود را بپرسید..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles size={20} className="text-gray-400" />
                </div>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              این دستیار هوشمند است و ممکن است گاهی اشتباه کند. لطفاً اطلاعات مهم را بررسی کنید.
              <br />
              <span className="text-indigo-600">💡 برای تست: سوالات پیشنهادی را امتحان کنید</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentLegalAI;
