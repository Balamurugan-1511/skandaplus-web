'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const QUICK_REPLIES = ['Courses', 'Fees & Batches', 'Placement Support', 'Talk to a Counsellor'];

// Calls our server-side /api/chatbot route, which holds the Gemini key.
// The key never ships to the browser.
async function getBotReply(message, history) {
  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { text: "Sorry, I'm having trouble replying right now. Please try again shortly.", link: null };
    }
    return { text: data.reply, link: null };
  } catch {
    return { text: "Sorry, I'm having trouble connecting. Please try again shortly.", link: null };
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm the AI Plus assistant. Ask me about courses, fees, or placements — or tap a quick option below.",
      link: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    // Gemini expects alternating user/model turns.
    const history = messages
      ?.filter((m) => m?.text)
      ?.map((m) => ({
        role: m?.from === 'user' ? 'user' : 'model',
        parts: [{ text: m?.text }],
      }));

    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');
    setLoading(true);

    const reply = await getBotReply(text, history);

    setMessages((prev) => [
      ...prev,
      { from: 'bot', text: reply.text, link: reply.link },
    ]);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-accentBlue text-white shadow-cardHover flex items-center justify-center hover:bg-navy transition-colors duration-200"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.18 0-2.303-.2-3.328-.566L3 21l1.664-4.157C3.61 15.481 3 13.79 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[92vw] max-w-sm h-[28rem] bg-white rounded-xl2 shadow-cardHover border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-navy text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentBlue flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
              AI+
            </div>
            <div>
              <p className="font-heading font-semibold text-sm leading-tight">
                AI Plus Assistant
              </p>
              <p className="text-xs text-blue-200 font-body">Usually replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages?.map((m, i) => (
              <div
                key={i}
                className={`flex ${m?.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm font-body leading-relaxed ${m?.from === 'user' ? 'bg-accentBlue text-white rounded-br-sm' : 'bg-white text-darkText border border-gray-100 rounded-bl-sm shadow-sm'}`}
                >
                  <p>{m?.text}</p>
                  {m?.link && (
                    <Link
                      href={m?.link?.href}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 mt-2 text-accentBlue font-semibold hover:text-navy transition-colors"
                    >
                      {m?.link?.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm bg-white text-darkText border border-gray-100 rounded-bl-sm shadow-sm">
                  Typing…
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="px-3 pt-2 flex flex-wrap gap-2 bg-white border-t border-gray-100">
            {QUICK_REPLIES?.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="text-xs font-body font-medium px-3 py-1.5 rounded-full border border-accentBlue/30 text-accentBlue hover:bg-accentBlue hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e?.target?.value)}
              placeholder="Type your message..."
              className="flex-1 text-sm font-body px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accentBlue"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="w-10 h-10 flex-shrink-0 rounded-lg bg-accentBlue text-white flex items-center justify-center hover:bg-navy transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
