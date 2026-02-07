"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Send, X, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "../../lib/auth-client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Z_INDEX = {
  CHAT_BUTTON: 40,
  CHAT_PANEL: 50,
};

export function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [session, setSession] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.session) {
          setSession(data);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    checkAuth();
  }, []);

  // 2. Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Handle message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !session?.user || isLoading) return;

    setError(null);
    setIsLoading(true);
    const userMessage = inputValue;
    setInputValue("");

    try {
      // Add user message to UI immediately
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, role: "user", content: userMessage },
      ]);

      // Get JWT token from session
      const token = session.session?.token || session.session?.accessToken || "";

      // Send to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${session.user.id}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: userMessage,
            language_hint: language,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/signin");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API error: ${response.status}`
        );
      }

      const data = await response.json();

      // Store conversation ID on first response
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: data.assistant_message,
        },
      ]);

    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show icon but redirect on click
  if (!session?.session) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/auth/signin")}
        className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-burgundy to-purple-600 shadow-lg z-40 flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        aria-label="Open chat (sign in required)"
        title="Sign in to use chat"
        style={{ zIndex: Z_INDEX.CHAT_BUTTON }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-burgundy to-purple-600 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        aria-label="Toggle chat"
        style={{ zIndex: Z_INDEX.CHAT_BUTTON }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-2 right-2 w-[calc(100vw-1rem)] h-[80vh] sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] rounded-2xl border border-burgundy/30 bg-black/40 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ zIndex: Z_INDEX.CHAT_PANEL }}
          >
            {/* Header */}
            <div className="border-b border-burgundy/20 p-4 flex items-center justify-between bg-black/20">
              <div>
                <h3 className="text-white font-montserrat font-semibold text-lg">Chat Assistant</h3>
                <p className="text-xs text-gray-400">Manage tasks with AI</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="px-4 pt-3 pb-2 flex gap-2 border-b border-burgundy/10">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  language === "en"
                    ? "bg-burgundy text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("ur")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  language === "ur"
                    ? "bg-burgundy text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Roman Urdu
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <MessageCircle className="w-8 h-8 text-burgundy/50 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm font-poppins">
                      {language === "en"
                        ? "Start a conversation... try 'add a task to buy milk'"
                        : "Baat shuru kijiye... 'Mera milk add karo' likhen"}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-lg max-w-xs text-sm leading-relaxed font-poppins ${
                        msg.role === "user"
                          ? "bg-burgundy text-white rounded-br-none"
                          : "bg-white/10 text-gray-100 rounded-bl-none border border-white/10"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 rounded-bl-none">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-burgundy/20 p-4 bg-black/20">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    language === "en"
                      ? "Type a message..."
                      : "Likhen..."
                  }
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-burgundy/50 focus:ring-1 focus:ring-burgundy/30 transition-all font-poppins"
                  disabled={isLoading}
                  autoFocus
                  style={{ fontSize: '16px' }}
                />
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-burgundy hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
