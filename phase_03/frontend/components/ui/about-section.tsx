'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════
   CHAT DEMO DATA
══════════════════════════════════════════ */
type TaskAction = "add" | "update" | "delete" | "complete";
interface ChatMsg {
  id: number;
  role: "user" | "agent";
  text: string;
  action?: TaskAction;
  taskChip?: string;   // shown as an inline task pill in agent reply
  delay: number;       // ms from start before this message appears
}

const CHAT_SCRIPT: ChatMsg[] = [
  {
    id: 1, role: "user", delay: 600,
    text: "Add a task: Review the landing page designs by tomorrow 5pm, high priority",
  },
  {
    id: 2, role: "agent", delay: 1800, action: "add",
    taskChip: "Review landing page designs",
    text: "Done! I've added it to your list with a due date of tomorrow at 5:00 PM and set the priority to High. Want me to also set a reminder for it?",
  },
  {
    id: 3, role: "user", delay: 3400,
    text: "Yes, remind me 2 hours before. Also mark the 'Client call prep' task as complete",
  },
  {
    id: 4, role: "agent", delay: 5000, action: "complete",
    taskChip: "Client call prep",
    text: "Reminder set for 3:00 PM tomorrow. And 'Client call prep' is now marked complete — great job finishing that one! 🎉",
  },
  {
    id: 5, role: "user", delay: 6600,
    text: "Update the design review task — push the deadline to Friday and change priority to medium",
  },
  {
    id: 6, role: "agent", delay: 8000, action: "update",
    taskChip: "Review landing page designs",
    text: "Updated! Deadline moved to Friday EOD and priority changed to Medium. Your reminder has been adjusted to Friday 3:00 PM automatically.",
  },
  {
    id: 7, role: "user", delay: 9600,
    text: "Delete the 'Buy office supplies' task, I already handled it",
  },
  {
    id: 8, role: "agent", delay: 10800, action: "delete",
    taskChip: "Buy office supplies",
    text: "Removed! 'Buy office supplies' has been deleted. You've got 4 tasks remaining for this week — you're on track!",
  },
];

/* ══════════════════════════════════════════
   TERMINAL LINES
══════════════════════════════════════════ */
const TERMINAL_LINES = [
  { delay: 0,    text: "$ whoami",                          type: "cmd"  },
  { delay: 600,  text: "> Amraha Anwar",                    type: "out"  },
  { delay: 1000, text: "$ cat role.txt",                    type: "cmd"  },
  { delay: 1500, text: "> Solo Developer & Founder",        type: "out"  },
  { delay: 2000, text: "> Owner of Plannior",               type: "out"  },
  { delay: 2600, text: "$ ls skills/",                      type: "cmd"  },
  { delay: 3200, text: "> React  TypeScript  Node.js",      type: "out"  },
  { delay: 3700, text: "> UI/UX  Product  Strategy",        type: "out"  },
  { delay: 4400, text: "$ cat mission.txt",                 type: "cmd"  },
  { delay: 5000, text: "> Build tools that feel human.",    type: "out"  },
  { delay: 5600, text: "> Ship fast. Iterate forever.",     type: "out"  },
  { delay: 6400, text: "$ _",                               type: "cursor"},
];

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const Ico = {
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Send: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Github: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════
   TERMINAL COMPONENT
══════════════════════════════════════════ */
const Terminal = () => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [typingIdx, setTypingIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
        setTypingIdx(i);
      }, line.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Typewriter for commands
  useEffect(() => {
    const line = TERMINAL_LINES[typingIdx];
    if (!line || line.type !== "cmd") return;
    let i = 0;
    setTyped("");
    const iv = setInterval(() => {
      i++;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) clearInterval(iv);
    }, 38);
    return () => clearInterval(iv);
  }, [typingIdx]);

  return (
    <div style={{
      background: "rgba(6,2,4,0.95)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      overflow: "hidden",
      fontFamily: "'DM Mono', monospace",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      {/* Terminal title bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {["#f43f5e","#e8a838","#3fb950"].map((c,i) => (
          <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.8 }} />
        ))}
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginLeft:8, letterSpacing:"0.05em" }}>
          amraha@plannior ~ terminal
        </span>
      </div>

      {/* Terminal body */}
      <div style={{ padding:"20px 20px 22px", minHeight:260 }}>
        {TERMINAL_LINES.map((line, i) => {
          if (!visibleLines.includes(i)) return null;
          const isLast = i === TERMINAL_LINES.length - 1;
          const isActive = i === typingIdx && line.type === "cmd";

          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              marginBottom: 6,
              animation: "termLine 0.2s ease-out both",
            }}>
              {line.type === "cmd" && (
                <span style={{ color:"#f43f5e", fontSize:12, flexShrink:0, marginTop:1 }}>❯</span>
              )}
              {line.type === "out" && (
                <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12, flexShrink:0, marginTop:1 }}>·</span>
              )}
              {line.type === "cursor" && (
                <span style={{ color:"#f43f5e", fontSize:12, flexShrink:0, marginTop:1 }}>❯</span>
              )}
              <span style={{
                fontSize: 12.5, lineHeight: 1.6,
                color: line.type === "cmd" ? "rgba(255,255,255,0.85)"
                     : line.type === "cursor" ? "transparent"
                     : "rgba(244,63,94,0.75)",
                letterSpacing: "0.02em",
              }}>
                {line.type === "cmd" && isActive ? typed : line.text}
                {line.type === "cursor" && (
                  <span style={{ animation:"termBlink 1s step-end infinite" }}>█</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ACTION CHIP — inline task pill in messages
══════════════════════════════════════════ */
const actionMeta: Record<TaskAction, { label: string; color: string; bg: string; icon: string }> = {
  add:      { label: "Added",     color: "#4ade80", bg: "rgba(74,222,128,0.1)",   icon: "+" },
  update:   { label: "Updated",   color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   icon: "✎" },
  delete:   { label: "Deleted",   color: "#f87171", bg: "rgba(248,113,113,0.1)",  icon: "×" },
  complete: { label: "Completed", color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   icon: "✓" },
};

const TaskChip = ({ action, label }: { action: TaskAction; label: string }) => {
  const meta = actionMeta[action];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "5px 11px",
      borderRadius: 8,
      background: meta.bg,
      border: `1px solid ${meta.color}30`,
      marginBottom: 8,
      animation: "chipPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
    }}>
      <span style={{
        width: 16, height: 16, borderRadius: 5,
        background: meta.color + "22",
        border: `1px solid ${meta.color}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 800, color: meta.color,
        flexShrink: 0,
      }}>{meta.icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: meta.color, letterSpacing: "0.01em" }}>
        {meta.label}:
      </span>
      <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════
   TYPING INDICATOR
══════════════════════════════════════════ */
const TypingDots = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 5, height: 5, borderRadius: "50%",
        background: "rgba(244,63,94,0.6)",
        animation: `typingDot 1.2s ease-in-out infinite`,
        animationDelay: `${i * 0.18}s`,
      }} />
    ))}
  </div>
);

/* ══════════════════════════════════════════
   CHAT WINDOW COMPONENT
══════════════════════════════════════════ */
const ChatWindow = () => {
  const [visibleMsgs, setVisibleMsgs] = useState<number[]>([]);
  const [typingFor, setTypingFor] = useState<number | null>(null); // msg id being "typed"
  const [inputVal, setInputVal] = useState("Ask Plannior AI anything...");
  const [cycleIdx, setCycleIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Replay the demo script on a loop
  const startScript = useCallback(() => {
    setVisibleMsgs([]);
    setTypingFor(null);

    const timers: ReturnType<typeof setTimeout>[] = [];

    CHAT_SCRIPT.forEach((msg) => {
      // Show typing indicator before agent replies
      if (msg.role === "agent") {
        timers.push(setTimeout(() => setTypingFor(msg.id), msg.delay - 900));
      }
      timers.push(setTimeout(() => {
        setTypingFor(null);
        setVisibleMsgs(prev => [...prev, msg.id]);
      }, msg.delay));
    });

    // Restart loop after last message + pause
    const lastDelay = CHAT_SCRIPT[CHAT_SCRIPT.length - 1].delay;
    timers.push(setTimeout(() => {
      setCycleIdx(c => c + 1);
    }, lastDelay + 3200));

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const cleanup = startScript();
    return cleanup;
  }, [cycleIdx, startScript]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMsgs, typingFor]);

  // Rotate placeholder suggestions
  const suggestions = [
    "Add: standup every Monday 9am",
    "Complete: Write blog post",
    "Delete: Old grocery list",
    "Update: Q4 report deadline",
  ];

  return (
    <div style={{
      borderRadius: 18,
      overflow: "hidden",
      background: "rgba(6,2,4,0.97)",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 32px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Title bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px",
        background: "rgba(255,255,255,0.025)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          {/* Agent avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(244,63,94,0.3), rgba(190,18,93,0.15))",
            border: "1.5px solid rgba(244,63,94,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#f43f5e",
            flexShrink: 0,
            boxShadow: "0 0 14px rgba(244,63,94,0.2)",
          }}>P</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              Plannior AI
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", background: "#4ade80",
                boxShadow: "0 0 6px #4ade80", animation: "recBlink 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
                Online · Natural language tasks
              </span>
            </div>
          </div>
        </div>

        {/* Decorative pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {["Add", "Update", "Delete"].map((t, i) => (
            <div key={i} style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "3px 8px", borderRadius: 20,
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minHeight: 300,
          maxHeight: 300,
          scrollbarWidth: "none",
        }}
      >
        {/* Welcome hint — shown before first message */}
        {visibleMsgs.length === 0 && typingFor === null && (
          <div style={{
            textAlign: "center", padding: "24px 16px",
            animation: "aFadeIn 0.4s ease-out both",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, margin: "0 auto 12px",
            }}>✦</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
              Talk to your tasks
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)" }}>
              Add, update, delete, and complete in plain English
            </div>
          </div>
        )}

        {CHAT_SCRIPT.map(msg => {
          const isVisible = visibleMsgs.includes(msg.id);
          const isUser = msg.role === "user";
          if (!isVisible) return null;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 9,
                animation: "msgSlide 0.35s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {/* Avatar */}
              {!isUser && (
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(244,63,94,0.28), rgba(190,18,93,0.12))",
                  border: "1px solid rgba(244,63,94,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: "#f43f5e",
                  marginBottom: 2,
                }}>P</div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: isUser
                  ? "linear-gradient(135deg, #9f1239 0%, #e11d48 100%)"
                  : "rgba(255,255,255,0.05)",
                border: isUser
                  ? "none"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isUser
                  ? "0 4px 16px rgba(190,24,93,0.3)"
                  : "0 2px 12px rgba(0,0,0,0.3)",
              }}>
                {/* Task chip for agent messages */}
                {!isUser && msg.action && msg.taskChip && (
                  <TaskChip action={msg.action} label={msg.taskChip} />
                )}
                <p style={{
                  fontSize: 13, lineHeight: 1.6,
                  color: isUser ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.78)",
                  margin: 0,
                  fontWeight: isUser ? 500 : 400,
                }}>
                  {msg.text}
                </p>
              </div>

              {/* User avatar placeholder */}
              {isUser && (
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                  marginBottom: 2,
                }}>U</div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingFor !== null && (
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 9,
            animation: "aFadeIn 0.2s ease-out both",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(244,63,94,0.28), rgba(190,18,93,0.12))",
              border: "1px solid rgba(244,63,94,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#f43f5e",
            }}>P</div>
            <div style={{
              padding: "10px 16px",
              borderRadius: "16px 16px 16px 4px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: "12px 14px 14px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.02)",
        flexShrink: 0,
      }}>
        {/* Suggestion chips */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 10,
          flexWrap: "wrap",
        }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              fontSize: 10.5, fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "4px 10px", borderRadius: 20,
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(244,63,94,0.08)"; el.style.borderColor = "rgba(244,63,94,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.35)"; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Input row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{
            flex: 1, fontSize: 12.5,
            color: "rgba(255,255,255,0.22)",
            fontStyle: "italic",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            Ask Plannior AI anything...
          </span>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #9f1239, #e11d48)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", boxShadow: "0 2px 10px rgba(190,24,93,0.35)",
          }}>
            <Ico.Send />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STAT PILL
══════════════════════════════════════════ */
const StatPill = ({ num, label, delay }: { num:string; label:string; delay:number }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex:1, minWidth:0, textAlign:"center", padding:"22px 12px",
        borderRadius:14,
        border:`1px solid ${hov ? 'rgba(244,63,94,0.22)' : 'rgba(255,255,255,0.055)'}`,
        background: hov ? 'rgba(18,7,11,0.97)' : 'rgba(10,4,7,0.75)',
        transition:"all 0.3s ease",
        animation:`aSlideUp 0.55s ease-out ${delay}s both`,
        position:"relative", overflow:"hidden", cursor:"default",
      }}
    >
      <div style={{
        position:"absolute", top:0, left:"15%", right:"15%", height:1,
        background:`linear-gradient(90deg,transparent,rgba(244,63,94,${hov ? '0.5' : '0.1'}),transparent)`,
        transition:"all 0.35s ease",
      }} />
      <div style={{
        fontSize:30, fontWeight:800, letterSpacing:"-0.05em", lineHeight:1,
        color: hov ? "#f43f5e" : "#fff",
        fontFamily:"'DM Mono',monospace",
        transition:"color 0.3s ease", marginBottom:6,
      }}>{num}</div>
      <div style={{ fontSize:10.5, fontWeight:500, color:"rgba(255,255,255,0.3)", letterSpacing:"0.07em", textTransform:"uppercase" }}>
        {label}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════════ */
const AboutSection = React.memo(() => (
  <section
    id="about"
    style={{
      position:"relative", background:"#000",
      padding:"130px 24px 155px",
      overflow:"hidden",
      fontFamily:"'Poppins', sans-serif",
    }}
  >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');

      @keyframes aSlideUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes aFadeIn    { from{opacity:0} to{opacity:1} }
      @keyframes aPulse     { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
      @keyframes aFloat     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes aSpin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes recBlink   { 0%,100%{opacity:1} 50%{opacity:0.2} }
      @keyframes termLine   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
      @keyframes termBlink  { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes msgSlide   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes chipPop    { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
      @keyframes typingDot  { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }

      .about-main { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:28px; align-items:start; }
      .about-social { display:flex; gap:10px; flex-wrap:wrap; }

      @media(max-width:920px) {
        .about-main { grid-template-columns:1fr; }
      }
    `}</style>

    {/* ── Atmosphere ── */}
    <div aria-hidden="true" style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      <div style={{
        position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:"55%", maxWidth:680, height:1,
        background:"linear-gradient(90deg,transparent,rgba(244,63,94,0.3),transparent)",
      }} />
      <div style={{
        position:"absolute", left:"5%", top:"30%", width:520, height:420, borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(190,18,93,0.09) 0%,transparent 65%)",
        filter:"blur(72px)", animation:"aFloat 18s ease-in-out infinite",
      }} />
      <div style={{
        position:"absolute", right:"3%", top:"55%", width:400, height:320, borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(244,63,94,0.07) 0%,transparent 65%)",
        filter:"blur(62px)", animation:"aFloat 22s ease-in-out infinite 5s",
      }} />
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)",
        backgroundSize:"64px 64px",
        maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)",
        WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)",
      } as React.CSSProperties} />
      <div style={{
        position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"35%", maxWidth:450, height:1,
        background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)",
      }} />
    </div>

    <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>

      {/* ── Section header ── */}
      <div style={{ textAlign:"center", marginBottom:64, animation:"aFadeIn 0.7s ease-out both" }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"5px 14px", borderRadius:40,
          border:"1px solid rgba(244,63,94,0.22)",
          background:"rgba(244,63,94,0.055)", marginBottom:20,
        }}>
          <span style={{
            width:5, height:5, borderRadius:"50%", background:"#f43f5e",
            boxShadow:"0 0 8px #f43f5e", display:"inline-block",
            animation:"aPulse 2.5s ease-in-out infinite",
          }} />
          <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#f43f5e" }}>
            About
          </span>
        </div>
        <h2 style={{
          fontSize:"clamp(2rem,4.5vw,3.2rem)",
          fontWeight:800, letterSpacing:"-0.045em", lineHeight:1.1,
          background:"linear-gradient(170deg,#fff 0%,#fff 38%,rgba(255,200,215,0.85) 70%,rgba(170,60,95,0.55) 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          marginBottom:16,
        }}>
          One person built all of this.
        </h2>
        <p style={{ fontSize:15.5, lineHeight:1.75, color:"rgba(255,255,255,0.38)", maxWidth:500, margin:"0 auto" }}>
          No team. No funding. Just one developer who refused to settle for tools that didn't feel right.
        </p>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="about-main" style={{ marginBottom:52 }}>

        {/* Left — Chat window */}
        <div style={{ animation:"aSlideUp 0.65s ease-out 0.1s both", minWidth:0, overflow:"hidden" }}>
          <ChatWindow />
        </div>

        {/* Right — Identity panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:20, animation:"aSlideUp 0.65s ease-out 0.2s both" }}>

          {/* Name card */}
          <div style={{
            padding:"28px 26px",
            borderRadius:18,
            background:"rgba(10,4,7,0.85)",
            border:"1px solid rgba(255,255,255,0.07)",
            boxShadow:"0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{
              position:"absolute", top:0, left:"8%", right:"8%", height:1,
              background:"linear-gradient(90deg,transparent,rgba(244,63,94,0.35),transparent)",
            }} />
            <div style={{
              position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%",
              background:"radial-gradient(circle,rgba(244,63,94,0.1) 0%,transparent 65%)",
              filter:"blur(24px)", pointerEvents:"none",
            }} />

            {/* Avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20, position:"relative", zIndex:1 }}>
              <div style={{
                width:58, height:58, borderRadius:"50%", flexShrink:0,
                background:"linear-gradient(135deg, rgba(244,63,94,0.25), rgba(190,18,93,0.1))",
                border:"1.5px solid rgba(244,63,94,0.4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:800, color:"#f43f5e",
                fontFamily:"'DM Mono',monospace",
                boxShadow:"0 0 22px rgba(244,63,94,0.25)",
              }}>AA</div>
              <div>
                <div style={{
                  fontSize:17, fontWeight:800, letterSpacing:"-0.025em",
                  color:"#fff", marginBottom:3,
                }}>Amraha Anwar</div>
                <div style={{
                  fontSize:11, fontWeight:600, letterSpacing:"0.06em",
                  textTransform:"uppercase", color:"rgba(244,63,94,0.7)",
                }}>
                  Solo Developer & Founder
                </div>
              </div>
            </div>

            <p style={{
              fontSize:13.5, lineHeight:1.75, color:"rgba(255,255,255,0.42)",
              margin:"0 0 20px", position:"relative", zIndex:1,
            }}>
              I built Plannior from scratch — every feature, every pixel, every fix. It's a one-person product and I think that's exactly what makes it feel different. No committees. No compromises.
            </p>

            {/* Social links */}
            <div className="about-social" style={{ position:"relative", zIndex:1 }}>
              {[
                { icon:<Ico.Github />,  label:"GitHub",   href:"#" },
                { icon:<Ico.Twitter />, label:"Twitter",  href:"#" },
                { icon:<Ico.Arrow />,   label:"Portfolio", href:"#" },
              ].map(s => (
                <a key={s.label} href={s.href} style={{
                  display:"inline-flex", alignItems:"center", gap:7,
                  fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.45)",
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  padding:"7px 13px", borderRadius:8, textDecoration:"none",
                  transition:"all 0.2s ease",
                }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.color="#fff"; el.style.background="rgba(244,63,94,0.1)"; el.style.borderColor="rgba(244,63,94,0.25)"; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.color="rgba(255,255,255,0.45)"; el.style.background="rgba(255,255,255,0.04)"; el.style.borderColor="rgba(255,255,255,0.07)"; }}
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Terminal */}
          <Terminal />

        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{
        display:"flex", gap:12, flexWrap:"wrap",
        marginBottom:52,
      }}>
        {[
          { num:"50k+", label:"Daily users",    delay:0.1 },
          { num:"1",    label:"Developer",      delay:0.17 },
          { num:"4.9★", label:"Rating",         delay:0.24 },
          { num:"2022", label:"Founded",        delay:0.31 },
        ].map(s => <StatPill key={s.label} {...s} />)}
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{
        textAlign:"center",
        animation:"aFadeIn 0.7s ease-out 0.35s both",
      }}>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:40 }}>
          <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06))" }} />
          {[0,1,2].map(i=>(
            <div key={i} style={{
              width:i===1?5:3, height:i===1?5:3, borderRadius:"50%",
              background:i===1?"#f43f5e":"rgba(244,63,94,0.28)",
              boxShadow:i===1?"0 0 9px #f43f5e":"none",
            }} />
          ))}
          <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,255,255,0.06),transparent)" }} />
        </div>

        <p style={{ fontSize:15, color:"rgba(255,255,255,0.28)", marginBottom:26 }}>
          Want to use what one person built for thousands?
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <a href="#" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.58)",
            background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.1)",
            padding:"13px 26px", borderRadius:12, textDecoration:"none",
            transition:"all 0.2s ease",
          }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color="#fff";el.style.background="rgba(255,255,255,0.08)";}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color="rgba(255,255,255,0.58)";el.style.background="rgba(255,255,255,0.05)";}}
          >Follow the journey</a>
          <a href="#" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            fontSize:14, fontWeight:700, color:"#fff",
            background:"linear-gradient(135deg,#9f1239 0%,#e11d48 100%)",
            padding:"13px 30px", borderRadius:12, textDecoration:"none",
            boxShadow:"0 4px 24px rgba(190,24,93,0.38),inset 0 1px 0 rgba(255,255,255,0.12)",
            transition:"all 0.2s ease",
          }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="scale(1.04)";el.style.boxShadow="0 8px 32px rgba(190,24,93,0.52),inset 0 1px 0 rgba(255,255,255,0.12)";}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="scale(1)";el.style.boxShadow="0 4px 24px rgba(190,24,93,0.38),inset 0 1px 0 rgba(255,255,255,0.12)";}}
          >Get started free <Ico.Arrow /></a>
        </div>
      </div>

    </div>
  </section>
));
AboutSection.displayName = "AboutSection";

export default AboutSection;