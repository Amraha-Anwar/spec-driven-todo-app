"use client";

import { motion } from "framer-motion";
import { TaskListAdvanced } from "../../components/tasks/task-list-advanced";
import { Sparkles, CheckCircle2, Clock, Flame, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";

/* ─── helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text: "Burning midnight oil",  emoji: "🌙" };
  if (h < 12) return { text: "Good morning",           emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon",         emoji: "👋" };
  if (h < 21) return { text: "Good evening",           emoji: "🌆" };
  return       { text: "Working late",                  emoji: "🌙" };
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
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "clamp(22px, 3vw, 32px)",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}>{time}</div>
      <div style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: 11.5,
        color: "rgba(255,255,255,0.3)",
        marginTop: 5,
        letterSpacing: "0.03em",
      }}>{date}</div>
    </div>
  );
}

/* ─── stat card ─── */
const STATS = [
  { icon: CheckCircle2, label: "Completed",  value: "12",  sub: "today",      color: "#4ade80" },
  { icon: Clock,        label: "In progress", value: "5",   sub: "active",     color: "#f43f5e" },
  { icon: Flame,        label: "Streak",      value: "7",   sub: "days",       color: "#fb923c" },
  { icon: TrendingUp,   label: "This week",   value: "89%", sub: "completion", color: "#60a5fa" },
];

function StatCard({ icon: Icon, label, value, sub, color, delay }: typeof STATS[0] & { delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 0,
        padding: "20px 18px",
        borderRadius: 16,
        background: hov ? "rgba(18,7,11,0.97)" : "rgba(10,4,7,0.82)",
        border: `1px solid ${hov ? color + "30" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hov ? `0 8px 32px ${color}18` : "0 2px 12px rgba(0,0,0,0.3)",
        transition: "all 0.28s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top shimmer */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
        background: `linear-gradient(90deg, transparent, ${hov ? color + "55" : "rgba(255,255,255,0.07)"}, transparent)`,
        transition: "all 0.3s ease",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: color + "15",
          border: `1px solid ${color}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.28s ease",
          boxShadow: hov ? `0 0 14px ${color}30` : "none",
        }}>
          <Icon size={16} color={color} />
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 26, fontWeight: 700,
          color: hov ? color : "#fff",
          letterSpacing: "-0.04em", lineHeight: 1,
          transition: "color 0.28s ease",
        }}>{value}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{label}</div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", marginTop: 2, letterSpacing: "0.04em" }}>{sub}</div>
    </motion.div>
  );
}

/* ─── page ─── */
export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const greeting = getGreeting();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await authClient.getSession();
      setUserName(data?.user?.name?.split(" ")[0] || "User");
    };
    getUser();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');

        @keyframes dbFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes dbPulse  { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes dbOrbit  { from{transform:rotate(0deg) translateX(90px) rotate(0deg)} to{transform:rotate(360deg) translateX(90px) rotate(-360deg)} }
        @keyframes dbSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dbShine  {
          0%   { left:-100%; opacity:0 }
          10%  { opacity:1 }
          50%  { left:100%; opacity:0.6 }
          100% { left:100%; opacity:0 }
        }

        .db-stats { display:flex; gap:14px; }
        @media(max-width:700px) { .db-stats { flex-wrap:wrap; } .db-stats > * { flex: 1 1 calc(50% - 7px) !important; } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Poppins', sans-serif" }}>

        {/* ══════════════ HERO HEADER ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            borderRadius: 24,
            padding: "36px 40px",
            background: "rgba(8,3,5,0.94)",
            border: "1px solid rgba(244,63,94,0.14)",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* ── Atmosphere ── */}
          {/* Top shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.55), transparent)",
            pointerEvents: "none",
          }} />
          {/* Left rose glow */}
          <div style={{
            position: "absolute", top: "-30%", left: "-5%",
            width: 380, height: 300, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(159,18,57,0.22) 0%, transparent 65%)",
            filter: "blur(60px)", pointerEvents: "none",
            animation: "dbFloat 18s ease-in-out infinite",
          }} />
          {/* Right subtle glow */}
          <div style={{
            position: "absolute", bottom: "-20%", right: "5%",
            width: 300, height: 240, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(244,63,94,0.1) 0%, transparent 65%)",
            filter: "blur(50px)", pointerEvents: "none",
            animation: "dbFloat 24s ease-in-out infinite 8s",
          }} />
          {/* Decorative orbiting dot */}
          <div style={{
            position: "absolute", top: "50%", right: 60,
            width: 6, height: 6, borderRadius: "50%",
            background: "#f43f5e", boxShadow: "0 0 10px #f43f5e",
            animation: "dbOrbit 10s linear infinite",
            pointerEvents: "none",
          }} />
          {/* Spinning ring */}
          <div style={{
            position: "absolute", top: "50%", right: 60,
            width: 180, height: 180, borderRadius: "50%",
            border: "1px solid rgba(244,63,94,0.08)",
            transform: "translate(50%, -50%)",
            animation: "dbSpin 30s linear infinite",
            pointerEvents: "none",
          }} />
          {/* Diagonal lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="-5" y1="20" x2="105" y2="55" stroke="url(#heroLine)" strokeWidth="0.2" />
            <line x1="105" y1="15" x2="-5" y2="48" stroke="url(#heroLine)" strokeWidth="0.15" />
          </svg>
          {/* Shine sweep on load */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, width: "40%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
            animation: "dbShine 2.5s ease-out 0.5s both",
            pointerEvents: "none",
          }} />

          {/* ── Content ── */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            {/* Left: greeting */}
            <div>
              {/* Greeting badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "5px 14px", borderRadius: 40, marginBottom: 18,
                  background: "rgba(244,63,94,0.07)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", background: "#f43f5e",
                  boxShadow: "0 0 8px #f43f5e",
                  animation: "dbPulse 2.5s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,63,94,0.8)" }}>
                  {greeting.emoji} {greeting.text}
                </span>
              </motion.div>

              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 style={{
                  fontSize: "clamp(28px, 4vw, 46px)",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.05,
                  marginBottom: 10,
                  background: "linear-gradient(135deg, #fff 0%, #fff 45%, rgba(255,200,215,0.85) 75%, rgba(190,24,93,0.6) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {userName ? `Hey, ${userName} 👋` : "Your Dashboard"}
                </h1>
                <p style={{
                  fontSize: 14.5, color: "rgba(255,255,255,0.35)",
                  fontWeight: 400, lineHeight: 1.6,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Sparkles size={14} color="#f43f5e" />
                  Manage your tasks with AI-powered planning
                </p>
              </motion.div>
            </div>

            {/* Right: clock */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{
                padding: "16px 20px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}
            >
              <LiveClock />
            </motion.div>
          </div>
        </motion.div>

        {/* ══════════════ STATS ROW ══════════════ */}
        <div className="db-stats">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} delay={0.1 + i * 0.07} />
          ))}
        </div>

        {/* ══════════════ TASKS ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <TaskListAdvanced />
        </motion.div>

      </div>
    </>
  );
}