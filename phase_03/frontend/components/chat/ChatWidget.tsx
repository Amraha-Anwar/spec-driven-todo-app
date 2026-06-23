"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  X,
  Loader2,
  MessageCircle,
  Sparkles,
  Languages,
  ListTodo,
  Zap,
  Circle,
  CheckCircle2,
  MessageSquareText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "../../lib/auth-client";
import { useTasks } from "../../app/hooks/use-tasks";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Z_INDEX = {
  CHAT_PANEL: 60,
};

// Global event other components (e.g. the sidebar) dispatch to open the chat.
export const OPEN_CHAT_EVENT = "plannior:open-chat";

// Quick-start prompts. Clicking one sends it straight into the conversation.
const SUGGESTIONS: Record<"en" | "ur", { icon: typeof Zap; text: string }[]> = {
  en: [
    { icon: Zap, text: "Add a task to buy milk tomorrow" },
    { icon: ListTodo, text: "Show all my pending tasks" },
    { icon: Sparkles, text: "Mark my meeting task as done" },
  ],
  ur: [
    { icon: Zap, text: "Mera milk add karo kal ke liye" },
    { icon: ListTodo, text: "Saare pending tasks dikhao" },
    { icon: Sparkles, text: "Meeting wala task complete kar do" },
  ],
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
  // Mobile only: which half is visible (chat vs the task list).
  const [mobileView, setMobileView] = useState<"chat" | "tasks">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live task list shown on the side panel; mutate() refreshes it after AI actions.
  const { tasks, isLoading: tasksLoading, mutate: mutateTasks } = useTasks();

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

  // Open the chat when any part of the app dispatches the open-chat event
  // (e.g. the sidebar "Chat Assistant" button). If signed out, send to sign in.
  useEffect(() => {
    const openHandler = () => {
      if (session?.session) {
        setIsOpen(true);
      } else {
        router.push("/auth/signin");
      }
    };
    window.addEventListener(OPEN_CHAT_EVENT, openHandler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openHandler);
  }, [session, router]);

  // Resolve the best available session token right before a request.
  // We prefer a live lookup (handles token rotation) but NEVER return empty if a
  // usable token already exists in component state — the live `/get-session`
  // response can omit the raw token, so falling back to the mounted session
  // avoids spurious 401s.
  const extractToken = (data: any): string =>
    data?.session?.token || data?.session?.accessToken || data?.token || "";

  const getFreshToken = async (): Promise<string> => {
    // 1) Token already held from mount/sign-in (known to work).
    const mounted = extractToken(session);

    // 2) Try a live lookup to pick up any rotation.
    try {
      const { data } = await authClient.getSession();
      const live = extractToken(data);
      if (data?.session) setSession(data); // keep local session in sync
      if (live) return live;
    } catch {
      /* ignore – fall back to mounted token below */
    }

    return mounted;
  };

  // Forget a conversation that no longer exists server-side (e.g. after a DB
  // reset). Clearing it lets the next message create a fresh conversation
  // instead of repeatedly referencing a dead id (which 403s/500s on the backend).
  const clearStaleConversation = () => {
    setConversationId(null);
    if (session?.user?.id) {
      localStorage.removeItem(`conversation_${session.user.id}`);
    }
  };

  // **T034 FIX**: Fetch chat history on mount for re-hydration
  // Retrieve conversation_id from localStorage and fetch existing messages from backend
  useEffect(() => {
    const restoreChatHistory = async () => {
      if (!session?.user) return;

      try {
        // Get conversation_id from localStorage if it exists
        const savedConversationId = localStorage.getItem(`conversation_${session.user.id}`);
        if (savedConversationId) {
          setConversationId(savedConversationId);

          // Fetch existing messages from backend (GET /api/{user_id}/chat/messages)
          const token = await getFreshToken();
          if (!token) return; // no valid session yet; skip silently
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/${session.user.id}/chat/messages?conversation_id=${savedConversationId}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Sync UI state with database history
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
              })));
            }
          } else if (response.status === 404 || response.status === 403 || response.status === 500) {
            // Saved conversation no longer exists (e.g. DB was reset). Forget it
            // so the next message starts a clean conversation.
            clearStaleConversation();
          }
        }
      } catch (err) {
        console.error("Failed to restore chat history:", err);
        // Continue silently - user can still chat
      }
    };

    restoreChatHistory();
    // Depend on the stable user *id* (a primitive), NOT the `session.user` object.
    // getFreshToken() calls setSession() with a new object on every send to pick
    // up token rotation; depending on the object reference would re-run this
    // effect mid-send and overwrite the optimistic user message with stale DB
    // history (making the just-sent message vanish until the reply arrives).
  }, [session?.user?.id]);

  // 2. Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Handle message submission
  const handleSendMessage = async (
    e: React.FormEvent | null,
    overrideText?: string
  ) => {
    e?.preventDefault();
    const messageText = (overrideText ?? inputValue).trim();
    if (!messageText || !session?.user || isLoading) return;

    setError(null);
    setIsLoading(true);
    const userMessage = messageText;
    setInputValue("");

    try {
      // Add user message to UI immediately
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, role: "user", content: userMessage },
      ]);

      // Helper: POST the message with a given token and conversation id.
      const postMessage = async (token: string, convId: string | null) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${session.user.id}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: convId,
            message: userMessage,
            language_hint: language,
          }),
        });

      // Resolve the best available token (handles rotation; never empty if a
      // mounted token exists).
      let token = await getFreshToken();
      let response = await postMessage(token, conversationId);

      // On 401, re-resolve the token and retry once.
      if (response.status === 401) {
        token = await getFreshToken();
        if (token) {
          response = await postMessage(token, conversationId);
        }
      }

      // On 403, the saved conversation_id is stale (e.g. DB reset). Forget it and
      // retry once with a fresh conversation so the message still goes through.
      if (response.status === 403 && conversationId) {
        clearStaleConversation();
        response = await postMessage(token, null);
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Genuinely signed out (no valid session at all). Show a clear message
          // instead of a disorienting redirect-bounce back to the dashboard.
          throw new Error("Your session has expired. Please sign in again to continue.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API error: ${response.status}`
        );
      }

      const data = await response.json();

      // Store conversation ID on first response (T034: Save to localStorage for re-hydration)
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
        localStorage.setItem(`conversation_${session.user.id}`, data.conversation_id);
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

      // The assistant may have added / completed / deleted tasks — refresh the
      // side panel so it reflects the new state.
      mutateTasks();

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

  // Derived task buckets for the side panel.
  const pendingTasks = (tasks ?? []).filter((t) => !t.is_completed);
  const doneTasks = (tasks ?? []).filter((t) => t.is_completed);

  // ── Side panel: live task list (right half on desktop / "Tasks" tab on mobile) ──
  // Kept as a plain JSX element (not a nested component) so React reconciles it
  // in place across re-renders instead of remounting it on every keystroke —
  // remounting was what made the list flicker / replay its enter animations.
  const taskPanel = (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9f1239] to-[#e11d48] flex items-center justify-center shadow-lg shadow-rose-900/40">
            <ListTodo className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-poppins font-extrabold text-lg leading-none tracking-tight">
              Your Tasks
            </h3>
            <p className="text-[11px] text-white/35 mt-1">
              {pendingTasks.length} pending · {doneTasks.length} done
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto chat-scroll px-6 pb-6 space-y-2">
        {tasksLoading ? (
          <div className="flex items-center justify-center h-32 text-white/30">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (tasks ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
              <ListTodo className="w-6 h-6 text-rose-400/70" />
            </div>
            <p className="text-white/50 text-sm font-poppins">
              {language === "en"
                ? "No tasks yet — ask the assistant to add one!"
                : "Abhi koi task nahi — assistant se add karwayein!"}
            </p>
          </div>
        ) : (
          <>
            {pendingTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="group flex items-start gap-3 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-rose-500/30 transition-colors"
              >
                <Circle className="w-4 h-4 mt-0.5 text-rose-400/60 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/85 font-poppins leading-snug truncate">
                    {task.title}
                  </p>
                  {task.priority && (
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        task.priority.toLowerCase() === "high"
                          ? "bg-rose-500/15 text-rose-300"
                          : task.priority.toLowerCase() === "medium"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-white/10 text-white/45"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {doneTasks.length > 0 && (
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/25 font-semibold pt-3 pb-1 px-1">
                {language === "en" ? "Completed" : "Mukammal"}
              </p>
            )}
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400/70 flex-shrink-0" />
                <p className="text-sm text-white/55 font-poppins leading-snug truncate line-through">
                  {task.title}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Chat — split-screen workspace overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-stretch justify-center sm:p-4 lg:p-6"
            style={{ zIndex: Z_INDEX.CHAT_PANEL }}
          >
            {/* Dimmed backdrop (click to close) */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* The split "page" */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full sm:h-full sm:max-h-[88vh] sm:max-w-5xl flex flex-col lg:flex-row overflow-hidden bg-[#080305]/95 backdrop-blur-2xl sm:rounded-3xl border border-rose-500/15 shadow-[0_32px_100px_rgba(0,0,0,0.7)]"
            >
              {/* Top hairline accent (matches auth/tasks cards) */}
              <div className="pointer-events-none absolute top-0 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

              {/* Mobile-only tab switch: Chat | Tasks (always visible so the
                  user can switch back from the task list) */}
              <div className="lg:hidden flex gap-1 p-1.5 m-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <button
                  onClick={() => setMobileView("chat")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    mobileView === "chat"
                      ? "bg-[#e11d48] text-white shadow-md shadow-rose-900/30"
                      : "text-white/45"
                  }`}
                >
                  <MessageSquareText className="w-4 h-4" /> Chat
                </button>
                <button
                  onClick={() => setMobileView("tasks")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    mobileView === "tasks"
                      ? "bg-[#e11d48] text-white shadow-md shadow-rose-900/30"
                      : "text-white/45"
                  }`}
                >
                  <ListTodo className="w-4 h-4" /> Tasks
                </button>
              </div>

              {/* ── LEFT HALF: chat ── */}
              <div
                className={`${
                  mobileView === "chat" ? "flex" : "hidden"
                } lg:flex flex-1 min-h-0 lg:w-1/2 flex-col min-w-0 lg:border-r border-rose-500/10 bg-[#080305]/60`}
              >
                {/* Header */}
                <div className="border-b border-rose-500/12 px-4 sm:px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9f1239] to-[#e11d48] flex items-center justify-center shadow-lg shadow-rose-900/40">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-poppins font-bold text-base leading-none tracking-tight">
                        Chat Assistant
                      </h3>
                      <p className="text-[11px] text-white/35 mt-1">Manage tasks with AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Language Toggle */}
                <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center gap-2 border-b border-rose-500/8">
                  <Languages className="w-4 h-4 text-white/30 mr-1" />
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      language === "en"
                        ? "bg-[#e11d48] text-white shadow-md shadow-rose-900/30"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("ur")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      language === "ur"
                        ? "bg-[#e11d48] text-white shadow-md shadow-rose-900/30"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    Roman Urdu
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="px-4 sm:px-5 py-2 bg-red-500/10 border-b border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto chat-scroll p-4 sm:p-5 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div className="max-w-xs">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/12 border border-rose-500/25 flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-7 h-7 text-rose-400" />
                        </div>
                        <p className="text-white/80 text-sm font-poppins font-medium mb-1">
                          {language === "en"
                            ? "Start a conversation"
                            : "Baat shuru kijiye"}
                        </p>
                        <p className="text-white/40 text-xs font-poppins mb-5">
                          {language === "en"
                            ? "Try one of these:"
                            : "In mein se koi try karein:"}
                        </p>

                        <div className="space-y-2 text-left">
                          {SUGGESTIONS[language].map((s) => {
                            const Icon = s.icon;
                            return (
                              <button
                                key={s.text}
                                onClick={() => handleSendMessage(null, s.text)}
                                disabled={isLoading}
                                className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-rose-500/50 hover:bg-white/[0.07] transition-all disabled:opacity-50"
                              >
                                <span className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/30 transition-colors">
                                  <Icon className="w-3 h-3 text-rose-400" />
                                </span>
                                <span className="text-xs text-white/70 font-poppins group-hover:text-white transition-colors">
                                  {s.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
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
                          className={`px-4 py-2.5 rounded-2xl max-w-[80%] sm:max-w-sm text-sm leading-relaxed font-poppins ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-[#9f1239] to-[#e11d48] text-white rounded-br-md shadow-md shadow-rose-900/25"
                              : "bg-white/[0.07] text-white/90 rounded-bl-md border border-white/10"
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
                      <div className="px-4 py-2.5 rounded-2xl bg-white/[0.07] border border-white/10 rounded-bl-md">
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-rose-500/12 p-4 sm:p-5">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        language === "en" ? "Type a message..." : "Likhen..."
                      }
                      className="flex-1 bg-white/[0.06] border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/45 focus:ring-1 focus:ring-rose-500/30 transition-all font-poppins"
                      disabled={isLoading}
                      autoFocus
                      style={{ fontSize: "16px" }}
                    />
                    <motion.button
                      whileHover={{ scale: isLoading ? 1 : 1.05 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-gradient-to-br from-[#9f1239] to-[#e11d48] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-opacity shadow-md shadow-rose-900/30"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* ── RIGHT HALF: live task list (desktop) / Tasks tab (mobile) ── */}
              <div
                className={`${
                  mobileView === "tasks" ? "flex" : "hidden"
                } lg:flex flex-1 min-h-0 w-full lg:w-1/2 relative flex-col bg-[#0a0a0f]/40`}
              >
                {/* ambient glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -top-16 -right-12 w-72 h-72 rounded-full bg-rose-600/15 blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-fuchsia-700/10 blur-[110px]" />
                </div>
                <div className="relative z-10 flex-1 min-h-0">
                  {taskPanel}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
