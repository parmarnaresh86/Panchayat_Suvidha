import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Languages, Bot } from 'lucide-react';
import axios from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

// A lightweight "select a question, get an answer" FAQ chat widget — not
// free-text AI chat, just a bilingual quick-reply list backed by each
// village's own FAQs table. No login required; visible on every public page.
const FaqChatWidget = () => {
    const { language, toggleLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const [faqs, setFaqs] = useState(null);
    const [thread, setThread] = useState([]); // [{ type: 'question'|'answer', text }]
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open && faqs === null) {
            axios.get('/faqs').then(res => setFaqs(res.data)).catch(() => setFaqs([]));
        }
    }, [open, faqs]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    const pick = (faq) => {
        const q = language === 'gu' && faq.question_gu ? faq.question_gu : faq.question_en;
        const a = language === 'gu' && faq.answer_gu ? faq.answer_gu : faq.answer_en;
        setThread(t => [...t, { type: 'question', text: q }, { type: 'answer', text: a }]);
    };

    return (
        <>
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
                aria-label={language === 'gu' ? 'પ્રશ્નો પૂછો' : 'Ask a question'}
            >
                {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom" style={{ height: '70vh', maxHeight: 560 }}>
                    <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <span className="font-semibold text-sm">
                                {language === 'gu' ? 'મદદ કેન્દ્ર' : 'Help Center'}
                            </span>
                        </div>
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 text-xs bg-white/15 hover:bg-white/25 rounded-full px-2.5 py-1 transition-colors"
                        >
                            <Languages className="w-3.5 h-3.5" />
                            {language === 'gu' ? 'English' : 'ગુજરાતી'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                        <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-gray-700 shadow-sm max-w-[80%]">
                                {language === 'gu'
                                    ? 'નમસ્તે! નીચેના પ્રશ્નોમાંથી પસંદ કરો, હું જવાબ આપીશ.'
                                    : "Hi! Pick a question below and I'll answer it."}
                            </div>
                        </div>

                        {thread.map((msg, i) => (
                            <div key={i} className={`flex items-start gap-2 ${msg.type === 'question' ? 'justify-end' : ''}`}>
                                {msg.type === 'answer' && (
                                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}
                                <div className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm max-w-[80%] ${
                                    msg.type === 'question'
                                        ? 'bg-primary-600 text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="border-t border-gray-100 p-3 flex-shrink-0 max-h-40 overflow-y-auto bg-white">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                            {language === 'gu' ? 'પ્રશ્નો પસંદ કરો' : 'Choose a question'}
                        </p>
                        {faqs === null && (
                            <div className="space-y-1.5">
                                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-full animate-pulse" />)}
                            </div>
                        )}
                        {faqs?.length === 0 && (
                            <p className="text-xs text-gray-400 py-2">
                                {language === 'gu' ? 'હજુ કોઈ પ્રશ્નો ઉમેરાયા નથી.' : 'No questions added yet.'}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                            {faqs?.map(faq => (
                                <button
                                    key={faq.id}
                                    onClick={() => pick(faq)}
                                    className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-full px-3 py-1.5 transition-colors"
                                >
                                    {language === 'gu' && faq.question_gu ? faq.question_gu : faq.question_en}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FaqChatWidget;
