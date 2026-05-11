"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Flag, TrendingUp, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { authClient } from "../../lib/auth-client";
import { useTasks } from "../hooks/use-tasks";
import { format, isToday, isTomorrow, isPast } from "date-fns";

/* ─── helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text: "Burning midnight oil", emoji: "🌙" };
  if (h < 12) return { text: "Good morning",          emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon",        emoji: "👋" };
  if (h < 21) return { text: "Good evening",          emoji: "🌆" };
  return       { text: "Working late",                 emoji: "🌙" };
}

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(20px,3vw,30px)", fontWeight: 700, color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>{time}</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>{date}</div>
    </div>
  );
}

const PM: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: "#f43f5e", bg: "rgba(244,63,94,0.12)",  label: "High"   },
  medium: { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  label: "Med"    },
  low:    { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  label: "Low"    },
};

function dueMeta(due?: string, done?: boolean) {
  if (!due) return null;
  const d = new Date(due);
  if (isToday(d))            return { label: "Today",    color: "#fb923c" };
  if (isTomorrow(d))         return { label: "Tomorrow", color: "#60a5fa" };
  if (isPast(d) && !done)    return { label: "Overdue",  color: "#f43f5e" };
  return { label: format(d, "MMM d"), color: "rgba(255,255,255,0.3)" };
}

/* ─── stat card ─── */
function StatCard({ icon: Icon, label, value, sub, color, delay }: any) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, minWidth: 0, padding: "20px 18px", borderRadius: 16, background: hov ? "rgba(18,7,11,0.97)" : "rgba(10,4,7,0.82)", border: `1px solid ${hov ? color + "30" : "rgba(255,255,255,0.07)"}`, boxShadow: hov ? `0 8px 32px ${color}18` : "0 2px 12px rgba(0,0,0,0.3)", transition: "all 0.28s ease", cursor: "default", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${hov ? color + "55" : "rgba(255,255,255,0.07)"},transparent)`, transition: "all 0.3s ease" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: color + "15", border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hov ? `0 0 14px ${color}30` : "none", transition: "all 0.28s ease" }}><Icon size={16} color={color} /></div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 26, fontWeight: 700, color: hov ? color : "#fff", letterSpacing: "-0.04em", lineHeight: 1, transition: "color 0.28s ease" }}>{value}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{label}</div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", marginTop: 2, letterSpacing: "0.04em" }}>{sub}</div>
    </motion.div>
  );
}

/* ─── mini task row ─── */
function MiniTaskRow({ task, index }: { task: any; index: number }) {
  const pm = PM[task.priority] || PM.medium;
  const due = dueMeta(task.due_date, task.is_completed);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", opacity: task.is_completed ? 0.5 : 1 }}
    >
      <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: task.is_completed ? "#4ade80" : pm.color, boxShadow: `0 0 5px ${task.is_completed ? "#4ade80" : pm.color}` }} />
      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: task.is_completed ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.8)", textDecoration: task.is_completed ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: pm.color, background: pm.bg, padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>{pm.label}</span>
      {due && <span style={{ fontSize: 10, color: due.color, fontWeight: 600, flexShrink: 0, fontFamily: "'DM Mono',monospace" }}>{due.label}</span>}
    </motion.div>
  );
}

/* ─── activity log ─── */
interface LogEntry { id: string; text: string; time: string; color: string; icon: string; }

function ActivityLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AnimatePresence initial={false}>
        {entries.map((e, i) => (
          <motion.div key={e.id}
            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", position: "relative" }}
          >
            {i < entries.length - 1 && <div style={{ position: "absolute", left: 10, top: 24, bottom: -1, width: 1, background: "rgba(255,255,255,0.05)" }} />}
            <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: e.color + "18", border: `1px solid ${e.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, marginTop: 1 }}>{e.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", fontWeight: 500, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.text}</div>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.2)", marginTop: 1, fontFamily: "'DM Mono',monospace" }}>{e.time}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── progress ring ─── */
function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg width={84} height={84} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={42} cy={42} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5.5} />
      <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={5.5}
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s ease" }} />
    </svg>
  );
}

/* ═══════════════════════════════════════ MAIN ═══════════════════════════════════════ */
export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const greeting = getGreeting();
  const { tasks, isLoading } = useTasks();
  const [log, setLog] = useState<LogEntry[]>([]);
  const prevRef = useRef<any[]>([]);
  const seededRef = useRef(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => setUserName(data?.user?.name?.split(" ")[0] || "User"));
  }, []);

  /* Real-time activity detection */
  useEffect(() => {
    if (!tasks) return;
    const prev = prevRef.current;
    const now = format(new Date(), "HH:mm:ss");
    const entries: LogEntry[] = [];

    tasks.forEach((t: any) => {
      const old = prev.find((p: any) => p.id === t.id);
      if (!old) entries.push({ id: `add-${t.id}-${Date.now()}`, text: `Added: "${t.title}"`, time: now, color: "#4ade80", icon: "✦" });
      else if (!old.is_completed && t.is_completed) entries.push({ id: `done-${t.id}-${Date.now()}`, text: `Completed: "${t.title}"`, time: now, color: "#f43f5e", icon: "✓" });
      else if (old.is_completed && !t.is_completed) entries.push({ id: `undo-${t.id}-${Date.now()}`, text: `Reopened: "${t.title}"`, time: now, color: "#fb923c", icon: "↩" });
    });
    prev.forEach((old: any) => {
      if (!tasks.find((t: any) => t.id === old.id)) entries.push({ id: `del-${old.id}-${Date.now()}`, text: `Deleted: "${old.title}"`, time: now, color: "#f87171", icon: "×" });
    });

    if (entries.length) setLog(l => [...entries, ...l].slice(0, 12));
    prevRef.current = tasks;
  }, [tasks]);

  /* Seed log once on first load */
  useEffect(() => {
    if (!tasks?.length || seededRef.current) return;
    seededRef.current = true;
    const seed: LogEntry[] = tasks.slice(0, 6).map((t: any) => ({
      id: `seed-${t.id}`,
      text: t.is_completed ? `Completed: "${t.title}"` : `Active: "${t.title}"`,
      time: format(new Date(t.created_at || Date.now()), "HH:mm:ss"),
      color: t.is_completed ? "#4ade80" : "#f43f5e",
      icon: t.is_completed ? "✓" : "✦",
    }));
    setLog(seed);
    prevRef.current = tasks;
  }, [tasks]);

  /* Derived */
  const total     = tasks?.length || 0;
  const completed = tasks?.filter((t: any) => t.is_completed).length || 0;
  const pending   = total - completed;
  const rate      = total ? Math.round((completed / total) * 100) : 0;
  const highCount = tasks?.filter((t: any) => t.priority === "high" && !t.is_completed).length || 0;
  const dueSoon   = tasks?.filter((t: any) => {
    if (!t.due_date || t.is_completed) return false;
    const d = new Date(t.due_date);
    return isToday(d) || isTomorrow(d);
  }).length || 0;

  const recentPending = [...(tasks || [])].filter((t: any) => !t.is_completed)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const recentDone = [...(tasks || [])].filter((t: any) => t.is_completed).slice(0, 4);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes dbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes dbPulse { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes dbOrbit { from{transform:rotate(0deg) translateX(90px) rotate(0deg)} to{transform:rotate(360deg) translateX(90px) rotate(-360deg)} }
        @keyframes dbSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dbShine { 0%{left:-100%;opacity:0} 10%{opacity:1} 50%{left:100%;opacity:.6} 100%{left:100%;opacity:0} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
        .db-stats { display:flex; gap:14px; }
        .db-grid  { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .db-card  { border-radius:18px; padding:22px 20px; background:rgba(8,3,5,0.92); border:1px solid rgba(255,255,255,0.07); box-shadow:0 8px 30px rgba(0,0,0,0.4); position:relative; overflow:hidden; }
        .db-shimmer { position:absolute; top:0; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent); }
        .db-title { font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:14px; display:flex; align-items:center; gap:7px; }
        .db-dot   { width:5px; height:5px; border-radius:50%; background:#4ade80; box-shadow:0 0 5px #4ade80; animation:blink 2s ease-in-out infinite; }
        .db-skel  { height:36px; border-radius:9px; background:rgba(255,255,255,0.04); animation:dbPulse 2s ease-in-out infinite; }
        @media(max-width:700px) {
          .db-stats { flex-wrap:wrap; }
          .db-stats > * { flex:1 1 calc(50% - 7px) !important; }
          .db-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Poppins',sans-serif" }}>

        {/* ══ HERO ══ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", borderRadius: 24, padding: "36px 40px", background: "rgba(8,3,5,0.94)", border: "1px solid rgba(244,63,94,0.14)", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.55),transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-30%", left: "-5%", width: 380, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,18,57,0.22) 0%,transparent 65%)", filter: "blur(60px)", pointerEvents: "none", animation: "dbFloat 18s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "5%", width: 300, height: 240, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(244,63,94,0.1) 0%,transparent 65%)", filter: "blur(50px)", pointerEvents: "none", animation: "dbFloat 24s ease-in-out infinite 8s" }} />
          <div style={{ position: "absolute", top: "50%", right: 60, width: 6, height: 6, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 10px #f43f5e", animation: "dbOrbit 10s linear infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", right: 60, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(244,63,94,0.08)", transform: "translate(50%,-50%)", animation: "dbSpin 30s linear infinite", pointerEvents: "none" }} />
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hL" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="-5" y1="20" x2="105" y2="55" stroke="url(#hL)" strokeWidth="0.2" />
            <line x1="105" y1="15" x2="-5" y2="48" stroke="url(#hL)" strokeWidth="0.15" />
          </svg>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "40%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)", animation: "dbShine 2.5s ease-out 0.5s both", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 40, marginBottom: 18, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px #f43f5e", animation: "dbPulse 2.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,63,94,0.8)" }}>{greeting.emoji} {greeting.text}</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <h1 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.05, marginBottom: 10, background: "linear-gradient(135deg,#fff 0%,#fff 45%,rgba(255,200,215,.85) 75%,rgba(190,24,93,.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {userName ? `Hey, ${userName} 👋` : "Your Dashboard"}
                </h1>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.35)", fontWeight: 400, lineHeight: 1.6, display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={14} color="#f43f5e" />
                  {isLoading ? "Loading your workspace…" : `${pending} pending · ${completed} completed · ${rate}% done`}
                </p>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
              <LiveClock />
            </motion.div>
          </div>
        </motion.div>

        {/* ══ STATS ══ */}
        <div className="db-stats">
          <StatCard icon={CheckCircle2} label="Completed"     value={completed}    sub="tasks done"    color="#4ade80" delay={0.10} />
          <StatCard icon={Clock}        label="Pending"       value={pending}      sub="to do"         color="#f43f5e" delay={0.17} />
          <StatCard icon={Flag}         label="High priority" value={highCount}    sub="urgent tasks"  color="#fb923c" delay={0.24} />
          <StatCard icon={TrendingUp}   label="Completion"    value={`${rate}%`}   sub="overall rate"  color="#60a5fa" delay={0.31} />
        </div>

        {/* ══ MAIN GRID ══ */}
        <div className="db-grid">

          {/* Active tasks */}
          <motion.div className="db-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="db-shimmer" />
            <div className="db-title">
              <span className="db-dot" />
              Active tasks
              <span style={{ marginLeft: "auto", fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#f43f5e", fontWeight: 700 }}>{pending}</span>
            </div>
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[1,2,3].map(i => <div key={i} className="db-skel" />)}
              </div>
            ) : recentPending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>All caught up!</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>No pending tasks</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recentPending.map((t: any, i: number) => <MiniTaskRow key={t.id} task={t} index={i} />)}
                {pending > 6 && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    +{pending - 6} more in Tasks tab <ArrowRight size={10} />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Progress */}
            <motion.div className="db-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <div className="db-shimmer" />
              <div className="db-title"><Zap size={10} color="#f43f5e" /> Overall progress</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ProgressRing pct={rate} color="#f43f5e" />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{rate}%</span>
                    <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>done</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  {[
                    { label: "Total",      val: total,     color: "rgba(255,255,255,0.45)" },
                    { label: "Completed",  val: completed, color: "#4ade80" },
                    { label: "Pending",    val: pending,   color: "#f43f5e" },
                    { label: "Due soon",   val: dueSoon,   color: "#fb923c" },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", fontWeight: 500 }}>{r.label}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Activity log */}
            <motion.div className="db-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ flex: 1 }}>
              <div className="db-shimmer" />
              <div className="db-title"><span className="db-dot" /> Live activity</div>
              {log.length === 0 ? (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "18px 0" }}>
                  Activity appears here as you work
                </div>
              ) : (
                <ActivityLog entries={log} />
              )}
            </motion.div>
          </div>
        </div>

        {/* ══ RECENTLY COMPLETED ══ */}
        {recentDone.length > 0 && (
          <motion.div className="db-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="db-shimmer" />
            <div className="db-title"><CheckCircle2 size={10} color="#4ade80" /> Recently completed</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recentDone.map((t: any, i: number) => <MiniTaskRow key={t.id} task={t} index={i} />)}
            </div>
          </motion.div>
        )}

      </div>
    </>
  );
}