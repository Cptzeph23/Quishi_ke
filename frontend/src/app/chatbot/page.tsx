"use client";
/**
 * FILE:    frontend/src/app/chatbot/page.tsx
 * PURPOSE: AI-powered chatbot page for natural language property search
 */
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { chatbotApi } from "@/lib/api/chatbot";
import { useFilterStore } from "@/store/filterStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
  role:    "user" | "assistant";
  content: string;
  filters?: Record<string, any> | null;
}

const SUGGESTIONS = [
  "2 bedroom apartment in Kilimani under 100k",
  "Furnished studio near Westlands",
  "4 bed family house in Karen with a garden",
  "Office space in Upper Hill with parking",
];

export default function ChatbotPage() {
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { setFilters } = useFilterStore();
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chatbotApi.send(text, sessionId ?? undefined);
      setSessionId(res.session_id);
      setMessages((m) => [
        ...m,
        {
          role:    "assistant",
          content: res.message.content,
          filters: res.filters,
        },
      ]);
    } catch {
      toast.error("Failed to reach AI service. Please try again.");
      setMessages((m) => [
        ...m,
        {
          role:    "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function applyFilters(filters: Record<string, any>) {
    setFilters(filters);
    router.push("/properties");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      <main className="flex-1 page-container py-8 flex flex-col max-h-[calc(100vh-4rem)]">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <h1 className="heading-section">AI Property Search</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Describe what you're looking for in plain English. Our AI will find matching properties.
          </p>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-white border border-[#E8E4DC] rounded-2xl shadow-card
                        flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">

            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center
                                justify-center mb-4">
                  <Bot size={28} className="text-brand-500" />
                </div>
                <h2 className="font-display text-xl font-semibold text-gray-900 mb-2">
                  What are you looking for?
                </h2>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  Tell me about your ideal property — location, size, budget, amenities.
                  I'll find the best matches for you.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left px-4 py-2.5 rounded-xl border border-gray-200
                                 text-sm text-gray-600 hover:border-brand-300 hover:bg-brand-50
                                 hover:text-brand-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center
                                  justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-brand-600" />
                  </div>
                )}

                <div className={cn(
                  "max-w-[75%] space-y-2",
                  msg.role === "user" ? "items-end" : "items-start",
                  "flex flex-col"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-tr-sm"
                      : "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>

                  {/* Filter apply button */}
                  {msg.filters && Object.keys(msg.filters).length > 0 && (
                    <button
                      onClick={() => applyFilters(msg.filters!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 bg-brand-500 text-white text-xs font-medium
                                 hover:bg-brand-600 transition-colors animate-fade-in"
                    >
                      <Sparkles size={11} />
                      View {Object.keys(msg.filters).length} matching filters
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center
                                  justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center
                                justify-center flex-shrink-0">
                  <Bot size={14} className="text-brand-600" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm
                                px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder="e.g. 2 bedroom apartment in Kilimani under 150k…"
                className="input flex-1 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center
                           justify-center hover:bg-brand-600 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? <Spinner size="sm" className="text-white" /> : <Send size={15} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI can make mistakes. Always verify listing details with the agent.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}