"use client";

import { motion } from "framer-motion";
import { TaskListAdvanced } from "../../../components/tasks/task-list-advanced";
import { ListTodo, Sparkles } from "lucide-react";

export default function TasksPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes tpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes tpPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes tpShine { 0%{left:-100%;opacity:0} 10%{opacity:1} 55%{left:110%;opacity:.5} 100%{left:110%;opacity:0} }
        @keyframes tpSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Poppins', sans-serif" }}>

        {/* ══ HEADER ══ */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", borderRadius: 22, padding: "32px 36px", background: "rgba(8,3,5,0.94)", border: "1px solid rgba(244,63,94,0.13)", overflow: "hidden", boxShadow: "0 20px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.5),transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-40%", left: "-5%", width: 340, height: 280, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,18,57,0.2) 0%,transparent 65%)", filter: "blur(55px)", pointerEvents: "none", animation: "tpFloat 16s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-30%", right: "8%", width: 260, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(244,63,94,0.09) 0%,transparent 65%)", filter: "blur(45px)", pointerEvents: "none", animation: "tpFloat 20s ease-in-out infinite 5s" }} />
          <div style={{ position: "absolute", top: "50%", right: 40, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(244,63,94,0.08)", transform: "translate(50%,-50%)", animation: "tpSpin 25s linear infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", right: 40, width: 80, height: 80, borderRadius: "50%", border: "1px dashed rgba(244,63,94,0.05)", transform: "translate(50%,-50%)", animation: "tpSpin 15s linear infinite reverse", pointerEvents: "none" }} />
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tpLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.065" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="-5" y1="25" x2="105" y2="60" stroke="url(#tpLine)" strokeWidth="0.2" />
            <line x1="105" y1="18" x2="-5" y2="52" stroke="url(#tpLine)" strokeWidth="0.14" />
          </svg>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.025),transparent)", animation: "tpShine 2.2s ease-out 0.3s both", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 40, marginBottom: 14, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 7px #f43f5e", animation: "tpPulse 2.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,63,94,0.8)" }}>Task manager</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08, marginBottom: 10, background: "linear-gradient(135deg,#fff 0%,#fff 45%,rgba(255,200,215,.85) 75%,rgba(190,24,93,.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Your Tasks
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32, duration: 0.45 }}
                style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)", fontWeight: 400, lineHeight: 1.6, display: "flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={13} color="#f43f5e" />
                Organise, prioritise, and get things done
              </motion.p>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.3, 0.64, 1] }}
              style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg,rgba(244,63,94,0.18),rgba(159,18,57,0.1))", border: "1px solid rgba(244,63,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px rgba(244,63,94,0.18)" }}>
              <ListTodo size={24} color="#f43f5e" />
            </motion.div>
          </div>
        </motion.div>

        {/* ══ TASK LIST — with add form enabled ══ */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <TaskListAdvanced showAddForm={true} />
        </motion.div>

      </div>
    </>
  );
}