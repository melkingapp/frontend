import React, { useState, useEffect, useRef } from 'react';
import { Send, Download, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ChatMessage from '../../shared/components/legalAI/ChatMessage';
import ChatSidebar from '../../shared/components/legalAI/ChatSidebar';
import SuggestedQuestions from '../../shared/components/legalAI/SuggestedQuestions';
import { legalAIService } from '../../shared/services/legalAIService';

const LegalAI = () => {
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chats from sessionStorage on component mount
  useEffect(() => {
    const savedChats = sessionStorage.getItem('legalAI_chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
        
        // Load the last chat if available
        if (parsedChats.length > 0) {
          const lastChat = parsedChats[parsedChats.length - 1];
          setCurrentChat(lastChat);
          setMessages(lastChat.messages || []);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        toast.error('خطا در بارگذاری چت‌ها');
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save chats to sessionStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      sessionStorage.setItem('legalAI_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Generate fallback response (when API fails)
  const generateFallbackResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('سلام') || lowerQuestion.includes('hi')) {
      return `سلام! 👋 خوش آمدید به دستیار حقوقی ملکینگ!

من اینجا هستم تا در مسائل حقوقی مربوط به مدیریت ساختمان کمکتون کنم.

**می‌تونید در مورد این موضوعات ازم بپرسید:**
• مدیریت ساختمان و قوانین مربوطه
• مسائل مالی و شارژ ساختمان
• حقوق مالکان و ساکنان
• قراردادهای اجاره
• تخلیه ملک و مسائل قانونی

چه سوالی دارید؟ 😊`;
    }

    if (lowerQuestion.includes('مدیریت') || lowerQuestion.includes('مدیر')) {
      return `## مدیریت ساختمان

**وظایف مدیر ساختمان:**
• نگهداری و تعمیرات مشترک
• مدیریت مالی ساختمان
• اجرای آیین‌نامه ساختمان
• ارتباط با مالکان و ساکنان

**قوانین مهم:**
• قانون تملک آپارتمان‌ها
• آیین‌نامه اجرایی قانون تملک
• مقررات شهرداری

**نکات مهم:**
مدیر ساختمان باید گزارش‌های مالی ماهانه تهیه کند و در اختیار مالکان قرار دهد.`;
    }

    if (lowerQuestion.includes('شارژ') || lowerQuestion.includes('مالی') || lowerQuestion.includes('پول')) {
      return `## محاسبه شارژ ساختمان

**شارژ بر اساس:**
• متراژ واحد
• هزینه‌های مشترک ساختمان
• تعمیرات و نگهداری
• خدمات عمومی

**هزینه‌های مشترک شامل:**
• برق مشترک (راه‌پله، پارکینگ، آسانسور)
• آب و گاز مشترک
• تعمیرات عمومی
• بیمه ساختمان
• نظافت و نگهبانی

**نحوه محاسبه:**
شارژ هر واحد = (متراژ واحد ÷ مجموع متراژ کل ساختمان) × مجموع هزینه‌های مشترک

**مثال:** اگر ساختمان 1000 متر مربع باشد و واحد شما 100 متر مربع، شما 10% از هزینه‌های مشترک را پرداخت می‌کنید.`;
    }

    if (lowerQuestion.includes('حقوق') || lowerQuestion.includes('قانون')) {
      return `## حقوق مالکان و ساکنان

**حقوق مالکان:**
• حق استفاده از مشاعات ساختمان
• حق مشارکت در تصمیم‌گیری‌ها
• حق دریافت گزارش مالی ماهانه
• حق اعتراض به تصمیمات غیرقانونی

**حقوق ساکنان (مستاجران):**
• حق استفاده از امکانات مشترک
• حق دریافت خدمات مناسب
• حق اطلاع از قوانین ساختمان
• حق شکایت در صورت مشکلات

**وظایف مالکان:**
• پرداخت شارژ ماهانه به موقع
• رعایت آیین‌نامه ساختمان
• همکاری با مدیر ساختمان

**وظایف ساکنان:**
• رعایت قوانین ساختمان
• پرداخت اجاره به موقع
• مراقبت از ملک و عدم ایجاد مزاحمت`;
    }

    if (lowerQuestion.includes('اجاره') || lowerQuestion.includes('مستاجر') || lowerQuestion.includes('مالک')) {
      return `## قرارداد اجاره

**اجزای قرارداد اجاره:**

**مشخصات طرفین:**
• نام و نام خانوادگی کامل
• شماره ملی و شناسنامه
• آدرس و شماره تماس

**مشخصات ملک:**
• آدرس دقیق ملک
• متراژ و تعداد اتاق‌ها
• امکانات و تجهیزات

**شرایط مالی:**
• مبلغ اجاره ماهانه
• نحوه پرداخت (نقدی، چک، واریز)
• ودیعه و پیش‌پرداخت
• شرایط افزایش اجاره

**مدت قرارداد:**
• تاریخ شروع و پایان
• شرایط تمدید
• نحوه فسخ قرارداد

**شرایط مهم:**
• استفاده از ملک فقط برای سکونت
• ممنوعیت زیراجاره بدون اجازه
• تعهدات تعمیرات
• شرایط فسخ یکطرفه`;
    }

    if (lowerQuestion.includes('پول نمیده') || lowerQuestion.includes('پرداخت نمی') || lowerQuestion.includes('بدهکار')) {
      return `## عدم پرداخت اجاره

**مراحل قانونی برای عدم پرداخت:**

**مرحله 1: اخطار کتبی**
• ارسال اخطار رسمی به مستاجر
• تعیین مهلت 15 روزه برای پرداخت
• ذکر عواقب عدم پرداخت

**مرحله 2: اخطار دوم**
• در صورت عدم پاسخ، اخطار دوم
• مهلت 10 روزه اضافی
• تهدید به فسخ قرارداد

**مرحله 3: فسخ قرارداد**
• ارسال اخطار فسخ قرارداد
• مهلت 30 روزه برای تخلیه
• شروع مراحل قانونی تخلیه

**اقدامات قانونی:**
• شکایت به دادگاه
• درخواست تخلیه ملک
• مطالبه خسارت و اجاره معوقه

**محاسبه بدهی:**
• اجاره معوقه + سود
• هزینه‌های قانونی
• خسارت تأخیر تأدیه`;
    }

    if (lowerQuestion.includes('تخلیه') || lowerQuestion.includes('خروج') || lowerQuestion.includes('ترک')) {
      return `## تخلیه ملک

**مراحل تخلیه قانونی:**

**مرحله 1: اخطار تخلیه**
• ارسال اخطار کتبی رسمی
• تعیین مهلت 30 روزه
• ذکر دلیل تخلیه

**مرحله 2: شکایت به دادگاه**
• تنظیم دادخواست تخلیه
• ارائه مدارک و مستندات
• پرداخت هزینه دادرسی

**مرحله 3: حکم دادگاه**
• بررسی مدارک توسط قاضی
• صدور حکم تخلیه
• تعیین مهلت اجرا

**دلایل قانونی تخلیه:**
• عدم پرداخت اجاره (3 ماه متوالی)
• استفاده غیرمجاز از ملک
• ایجاد مزاحمت برای همسایگان
• فسخ قرارداد

**هزینه‌های تخلیه:**
• هزینه دادرسی
• هزینه اجرای حکم
• هزینه نقل و انتقال`;
    }

    if (lowerQuestion.includes('قرارداد') || lowerQuestion.includes('عقد') || lowerQuestion.includes('پیمان')) {
      return `## قرارداد اجاره

**اجزای قرارداد اجاره:**

**مشخصات طرفین:**
• نام و نام خانوادگی کامل
• شماره ملی و شناسنامه
• آدرس و شماره تماس

**مشخصات ملک:**
• آدرس دقیق ملک
• متراژ و تعداد اتاق‌ها
• امکانات و تجهیزات

**شرایط مالی:**
• مبلغ اجاره ماهانه
• نحوه پرداخت (نقدی، چک، واریز)
• ودیعه و پیش‌پرداخت
• شرایط افزایش اجاره

**مدت قرارداد:**
• تاریخ شروع و پایان
• شرایط تمدید
• نحوه فسخ قرارداد

**شرایط مهم:**
• استفاده از ملک فقط برای سکونت
• ممنوعیت زیراجاره بدون اجازه
• تعهدات تعمیرات
• شرایط فسخ یکطرفه`;
    }

    if (lowerQuestion.includes('مدل') || lowerQuestion.includes('هوش مصنوعی') || lowerQuestion.includes('ai')) {
      return `## درباره من

من یک دستیار حقوقی هوشمند هستم که برای کمک به مسائل حقوقی مربوط به مدیریت ساختمان طراحی شده‌ام.

**قابلیت‌های من:**
• پاسخگویی به سوالات حقوقی ساختمان
• راهنمایی در مورد قوانین مدیریت ساختمان
• کمک در مسائل مالی و شارژ
• راهنمایی در مورد قراردادهای اجاره
• مشاوره در مورد تخلیه ملک

**نکته مهم:**
من یک ابزار کمکی هستم و پاسخ‌هایم نباید به عنوان مشاوره حقوقی رسمی در نظر گرفته شود. برای مسائل پیچیده، حتماً با وکیل مشورت کنید.

**چگونه کار می‌کنم:**
من از دانش حقوقی مربوط به مدیریت ساختمان استفاده می‌کنم تا بهترین پاسخ ممکن را ارائه دهم.`;
    }

    return `متأسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً سوال خود را با جزئیات بیشتری مطرح کنید یا از سوالات پیشنهادی استفاده کنید.

**برای کمک بهتر، لطفاً:**
• سوال رو واضح‌تر بپرسید
• از کلمات کلیدی استفاده کنید مثل:
  - مدیریت ساختمان
  - مسائل مالی
  - حقوق مالکان
  - اجاره ساختمان
  - شارژ ساختمان
  - تخلیه ملک
  - قرارداد اجاره

**یا می‌تونید بپرسید:**
• "سلام" برای شروع
• "مدیریت ساختمان چیه؟"
• "شارژ ساختمان چطور محاسبه میشه؟"
• "مستاجرم پول نمیده چیکار کنم؟"

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
    setMessages([]);
    setChats(prev => [...prev, newChat]);
    inputRef.current?.focus();
  };

  const loadChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages || []);
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (currentChat && currentChat.id === chatId) {
      if (updatedChats.length > 0) {
        loadChat(updatedChats[updatedChats.length - 1]);
      } else {
        setCurrentChat(null);
        setMessages([]);
      }
    }
  };

  const exportChat = () => {
    if (!currentChat || messages.length === 0) {
      toast.warning('هیچ پیامی برای خروجی وجود ندارد');
      return;
    }

    const chatText = messages.map(msg => 
      `${msg.sender === 'user' ? 'شما' : 'دستیار هوش مصنوعی'} (${new Date(msg.timestamp).toLocaleString('fa-IR')}):\n${msg.text}\n\n`
    ).join('---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-ai-chat-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      title: chat.title === 'چت جدید' 
        ? (firstQuestion.length > 40 ? firstQuestion.substring(0, 40) + '...' : firstQuestion)
        : chat.title
    };
    
    setCurrentChat(updatedChat);
    setChats(prev => prev.map(c => 
      c.id === updatedChat.id ? updatedChat : c
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    sendMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-screen flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <ChatSidebar
            chats={chats}
            currentChat={currentChat}
            onSelectChat={loadChat}
            onNewChat={startNewChat}
            onDeleteChat={deleteChat}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center gap-1">
                    <div className="h-0.5 bg-gray-600 rounded"></div>
                    <div className="h-0.5 bg-gray-600 rounded"></div>
                    <div className="h-0.5 bg-gray-600 rounded"></div>
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">دستیار حقوقی ملکینگ</h1>
                    <p className="text-sm text-gray-500">پاسخگویی هوشمند به سوالات حقوقی</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={exportChat}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download size={18} />
                    خروجی چت
                  </button>
                )}
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm"
                >
                  <Sparkles size={18} />
                  چت جدید
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} userType="manager" />
            ) : (
              <div className="max-w-4xl mx-auto px-6 py-8">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex gap-4 mb-6 animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Loader2 size={18} className="text-white animate-spin" />
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      <div className="rounded-2xl px-5 py-3 bg-white border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                          <span className="text-sm text-gray-500">در حال تایپ...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="سوال حقوقی خود را بپرسید..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                    style={{ minHeight: '48px', maxHeight: '200px' }}
                  />
                  <div className="absolute left-3 bottom-3">
                    <Sparkles size={20} className="text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
    </div>
  );
};

export default LegalAI;
