import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';

const STORAGE_KEYS = {
  apiKey: 'openai_api_key',
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function sanitizeText(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function buildFallbackAnswer(userText, context) {
  const q = userText.toLowerCase();
  const { totals, topExpenseCategory } = context;

  if (q.includes('balance') || q.includes('money left') || q.includes('how much money')) {
    const balance = totals.income - totals.expense;
    return `Your current balance (income - expenses) is ₱${balance.toFixed(2)}.`;
  }

  if (q.includes('total income') || q.includes('income')) {
    return `Your total income is ₱${totals.income.toFixed(2)}.`;
  }

  if (q.includes('total expense') || q.includes('expenses') || q.includes('spent')) {
    return `Your total expense is ₱${totals.expense.toFixed(2)}.`;
  }

  if (q.includes('biggest') && (q.includes('expense') || q.includes('spending') || q.includes('category') || q.includes('where'))) {
    return topExpenseCategory
      ? `Your biggest spending category is “${topExpenseCategory.category}” with ₱${topExpenseCategory.amount.toFixed(2)}.`
      : 'You don’t have enough transaction data yet to identify your biggest expense category.';
  }

  if (q.includes('budget')) {
    return 'Try this: pick a category, set a monthly budget in the “Category Budget Tracker”, then keep an eye on the “Left” amount to avoid going over.';
  }

  return "I can’t call the real AI model right now, but I can still help with your finances.\n\nAsk me:\n- “What’s my balance?”\n- “Total income / total expenses?”\n- “Biggest expense category?”\n- “How should I budget?”";
}

export default function AIChatbot({ darkMode, totals, categoryTotals }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem('chat_messages'));
    if (Array.isArray(saved) && saved.length) return saved;
    return [
      {
        id: String(Date.now()),
        role: 'assistant',
        content:
          'Hi! I can help you understand your finances. Ask me anything (e.g., balance, spending by category, budgeting tips).',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState(() => localStorage.getItem(STORAGE_KEYS.apiKey) || '');

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const context = useMemo(() => {
    const income = Number(totals?.income ?? 0);
    const expense = Number(totals?.expense ?? 0);
    const topExpense = Object.entries(categoryTotals ?? {})
      .map(([category, amount]) => ({ category, amount: Number(amount ?? 0) }))
      .sort((a, b) => b.amount - a.amount)[0];

    return {
      totals: { income, expense },
      topExpenseCategory: topExpense && topExpense.amount > 0 ? topExpense : null,
    };
  }, [totals, categoryTotals]);

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus?.(), 100);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isOpen, isLoading]);

  const hasApiKey = useMemo(() => {
    const key = (localStorage.getItem(STORAGE_KEYS.apiKey) || '').trim();
    return key.length > 0;
  }, [showSettings]);

  const setApiKey = () => {
    const trimmed = apiKeyDraft.trim();
    localStorage.setItem(STORAGE_KEYS.apiKey, trimmed);
    setShowSettings(false);
  };

  const callOpenAI = async (userText) => {
    const apiKey = (localStorage.getItem(STORAGE_KEYS.apiKey) || '').trim();
    if (!apiKey) return buildFallbackAnswer(userText, context);

    const payload = {
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a helpful personal finance assistant embedded in a finance manager app. Use the provided transaction summaries when relevant. Be concise, clear, and actionable.',
        },
        {
          role: 'user',
          content:
            'User question: ' +
            userText +
            '\n\nFinance context:\n' +
            '- Balance: ' +
            String(context.totals.income - context.totals.expense) +
            '\n- Total income: ' +
            String(context.totals.income) +
            '\n- Total expenses: ' +
            String(context.totals.expense) +
            '\n- Category totals: ' +
            JSON.stringify(categoryTotals ?? {}, null, 0) +
            '\n\nAnswer the user.',
        },
      ],
    };

    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`OpenAI request failed: ${res.status} ${text}`);
    }

    const data = await res.json();

    const candidates = [
      data?.output_text,
      data?.output?.[0]?.content?.[0]?.text,
      data?.output?.[0]?.content?.find?.((c) => c?.text)?.text,
    ];

    const out = candidates.find((c) => typeof c === 'string' && c.trim().length > 0);
    return out ? out : 'I received a response, but it was empty. Please try again.';
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();

    const text = sanitizeText(input);
    if (!text) return;

    const userMsg = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setErrorMsg('');
    setIsLoading(true);

    try {
      const assistantText = hasApiKey ? await callOpenAI(text) : buildFallbackAnswer(text, context);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: assistantText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      const fallback = buildFallbackAnswer(text, context);
      setErrorMsg('AI request failed. Showing a helpful fallback response.');
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: fallback,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onQuickAsk = (q) => {
    setIsOpen(true);
    setInput(q);
    setTimeout(() => inputRef.current?.focus?.(), 100);
  };

  const clearChat = () => {
    const first = messages.find((m) => m.role === 'assistant') || null;
    const next = first
      ? [first]
      : [
          {
            id: String(Date.now()),
            role: 'assistant',
            content: 'Hi! I can help you understand your finances. Ask me anything.',
            createdAt: new Date().toISOString(),
          },
        ];
    setMessages(next);
    localStorage.removeItem('chat_messages');
  };

  const containerCls = darkMode ? 'bg-[#0f172a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900';
  const panelBg = darkMode ? 'bg-[#0f172a]' : 'bg-white';
  const bubbleUser = darkMode ? 'bg-indigo-500/15 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-900';
  const bubbleAssistant = darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-[999] bottom-5 right-5 md:bottom-6 md:right-6 ${darkMode ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'} shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 rounded-full p-4 transition-all focus:outline-none`}
        aria-label="Open AI Chat"
        title="AI Chat"
      >
        <Bot className="w-5 h-5" />
      </button>

      {showSettings && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className={`relative w-full max-w-md rounded-3xl shadow-2xl p-5 ${panelBg} border`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Settings</h3>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Paste your OpenAI API key to enable real AI responses. (Stored in your browser.)
                </p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2">OpenAI API key</label>
            <input
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              placeholder="sk-..."
              className={`w-full px-4 py-3 rounded-2xl border outline-none text-sm ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setApiKeyDraft('');
                  localStorage.removeItem(STORAGE_KEYS.apiKey);
                  setShowSettings(false);
                }}
                className={`flex-1 px-3 py-3 rounded-2xl font-bold text-sm ${darkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200'}`}
              >
                Remove key
              </button>
              <button
                onClick={setApiKey}
                className={`flex-1 px-3 py-3 rounded-2xl font-bold text-sm ${darkMode ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                Save
              </button>
            </div>

            <div className={`mt-4 text-[11px] leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tip: If AI fails, you’ll still get a helpful fallback response based on your app data.
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed z-[1000] bottom-0 right-0 w-full md:w-[420px] h-[72vh] md:h-[560px] md:bottom-0 md:top-auto md:right-0 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-[110%]'} ${darkMode ? 'text-white' : 'text-gray-900'} `}
      >
        <div className={`absolute inset-0 ${darkMode ? 'bg-black/30' : 'bg-black/10'} backdrop-blur-sm`} style={{ WebkitBackdropFilter: 'blur(8px)' }} />

        <div className={`relative mx-auto h-full w-full md:mr-0 md:ml-auto rounded-t-3xl md:rounded-3xl border ${containerCls} shadow-2xl overflow-hidden`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${darkMode ? 'border-white/10' : 'border-gray-200'} `}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-50 text-indigo-700'} border ${darkMode ? 'border-indigo-500/20' : 'border-indigo-100'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className={`font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Chatbot</div>
                <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(localStorage.getItem(STORAGE_KEYS.apiKey) || '').trim() ? 'Real AI mode' : 'Fallback mode'} • Ask anything
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}
                title="Settings"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className={`px-4 py-3 overflow-y-auto h-[calc(100%-116px)] ${darkMode ? 'custom-scrollbar' : ''}`}>
            <div className="flex gap-2 flex-wrap mb-3">
              {['What is my balance?', 'Biggest expense category?', 'How do I budget better?']
                .slice(0, 3)
                .map((q) => (
                  <button
                    key={q}
                    onClick={() => onQuickAsk(q)}
                    className={`text-[11px] px-3 py-1.5 rounded-full font-bold border ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'}`}
                  >
                    {q}
                  </button>
                ))}
            </div>

            {messages.map((m) => (
              <div key={m.id} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? bubbleUser : bubbleAssistant}`}>{m.content}</div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className={`max-w-[88%] rounded-2xl border px-3 py-2 text-sm ${bubbleAssistant} flex items-center gap-2`}>
                  <span className={`inline-block w-2 h-2 rounded-full ${darkMode ? 'bg-indigo-300' : 'bg-indigo-600'} animate-bounce`} />
                  Thinking...
                </div>
              </div>
            )}

            {errorMsg && <div className={`mt-2 text-[11px] font-bold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{errorMsg}</div>}
          </div>

          <form onSubmit={sendMessage} className={`p-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} `}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                rows={1}
                className={`flex-1 resize-none px-3 py-2 rounded-2xl border outline-none text-sm min-h-[44px] max-h-28 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                type="submit"
                disabled={isLoading}
                className={`p-3 rounded-2xl font-black transition-all shadow-md shadow-indigo-500/20 ${isLoading ? 'opacity-60 cursor-not-allowed' : darkMode ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                aria-label="Send"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} `}>Enter = send • Shift+Enter = newline</div>
              <button type="button" onClick={clearChat} className={`text-[10px] font-bold ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

