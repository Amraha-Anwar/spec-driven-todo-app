"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../../lib/api";
import { authClient } from "../../../lib/auth-client";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CheckCircle2, Clock, TrendingUp, Target, BarChart2, Sparkles } from "lucide-react";

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  priorityDistribution: { name: string; value: number }[];
  weeklyProgress: { day: string; completed: number; created: number }[];
}

/* ── themed tooltip ── */
const TOOLTIP_STYLE = {
  backgroundColor: "rgba(8,3,5,0.97)",
  border: "1px solid rgba(244,63,94,0.2)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 12,
  fontFamily: "'Poppins',sans-serif",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

/* ── chart card ── */
function ChartCard({ title, icon: Icon, children, delay = 0 }: { title: string; icon: any; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 18, padding: "24px 22px",
        background: "rgba(8,3,5,0.92)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.18),transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} color="#f43f5e" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

/* ── stat card ── */
function StatCard({ icon: Icon, label, value, color, delay }: any) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16, padding: "20px 18px",
        background: hov ? "rgba(18,7,11,0.97)" : "rgba(8,3,5,0.88)",
        border: `1px solid ${hov ? color + "30" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hov ? `0 8px 28px ${color}18` : "0 2px 12px rgba(0,0,0,0.3)",
        transition: "all 0.28s ease", cursor: "default", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${hov ? color + "50" : "rgba(255,255,255,0.06)"},transparent)`, transition: "all 0.3s ease" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "15", border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hov ? `0 0 14px ${color}30` : "none", transition: "all 0.28s ease" }}>
          <Icon size={17} color={color} />
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 28, fontWeight: 700, color: hov ? color : "#fff", letterSpacing: "-0.04em", lineHeight: 1, transition: "color 0.28s ease" }}>{value}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{label}</div>
    </motion.div>
  );
}

/* ── custom legend ── */
function CustomLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
      {items.map(item => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ MAIN ═══════════ */
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        const userId = sessionData?.user?.id;
        if (!userId) return;

        const response = await api.get(`/api/${userId}/tasks`);
        const tasks = response.data;

        const total     = tasks.length;
        const completed = tasks.filter((t: any) => t.is_completed).length;
        const pending   = total - completed;
        const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;

        const priorities = tasks.reduce((acc: any, task: any) => {
          const p = task.priority || "medium";
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        }, {});

        const priorityData = [
          { name: "High",   value: priorities.high   || 0 },
          { name: "Medium", value: priorities.medium || 0 },
          { name: "Low",    value: priorities.low    || 0 },
        ];

        const weeklyData = [
          { day: "Mon", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Tue", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Wed", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Thu", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Fri", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Sat", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Sun", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
        ];

        setAnalytics({ totalTasks: total, completedTasks: completed, pendingTasks: pending, completionRate: rate, priorityDistribution: priorityData, weeklyProgress: weeklyData });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  /* loading */
  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px #f43f5e", animation: "apPulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Poppins',sans-serif" }}>Loading analytics…</span>
      </div>
      <style>{`@keyframes apPulse { 0%,100%{opacity:.3;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  if (!analytics) return null;

  const PRIORITY_COLORS = ["#f43f5e", "#fb923c", "#60a5fa"];
  const AXIS_STYLE = { stroke: "rgba(255,255,255,0.18)", fontSize: 11, fontFamily: "'DM Mono',monospace" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes apFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes apPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes apShine { 0%{left:-100%;opacity:0} 10%{opacity:1} 55%{left:110%;opacity:.5} 100%{left:110%;opacity:0} }
        @keyframes apSpin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .ap-chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:800px) { .ap-chart-grid { grid-template-columns:1fr; } }
        .ap-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media(max-width:700px) { .ap-stats { grid-template-columns:repeat(2,1fr); } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Poppins',sans-serif" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", borderRadius: 22, padding: "32px 36px", background: "rgba(8,3,5,0.94)", border: "1px solid rgba(244,63,94,0.13)", overflow: "hidden", boxShadow: "0 20px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.5),transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-40%", left: "-5%", width: 320, height: 260, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,18,57,0.18) 0%,transparent 65%)", filter: "blur(55px)", pointerEvents: "none", animation: "apFloat 16s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-30%", right: "8%", width: 250, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(244,63,94,0.09) 0%,transparent 65%)", filter: "blur(45px)", pointerEvents: "none", animation: "apFloat 20s ease-in-out infinite 5s" }} />
          <div style={{ position: "absolute", top: "50%", right: 40, width: 110, height: 110, borderRadius: "50%", border: "1px solid rgba(244,63,94,0.08)", transform: "translate(50%,-50%)", animation: "apSpin 22s linear infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.025),transparent)", animation: "apShine 2.2s ease-out 0.3s both", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 13px", borderRadius: 40, marginBottom: 14, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 7px #f43f5e", animation: "apPulse 2.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,63,94,0.8)" }}>Analytics</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.08, marginBottom: 10, background: "linear-gradient(135deg,#fff 0%,#fff 45%,rgba(255,200,215,.85) 75%,rgba(190,24,93,.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Your Productivity
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32, duration: 0.45 }}
                style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)", fontWeight: 400, lineHeight: 1.6, display: "flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={13} color="#f43f5e" />
                Track your task completion and weekly trends
              </motion.p>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.3, 0.64, 1] }}
              style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg,rgba(244,63,94,0.18),rgba(159,18,57,0.1))", border: "1px solid rgba(244,63,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px rgba(244,63,94,0.18)" }}>
              <BarChart2 size={24} color="#f43f5e" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="ap-stats">
          <StatCard icon={Target}       label="Total Tasks"      value={analytics.totalTasks}     color="#60a5fa" delay={0.08} />
          <StatCard icon={CheckCircle2} label="Completed"        value={analytics.completedTasks} color="#4ade80" delay={0.14} />
          <StatCard icon={Clock}        label="Pending"          value={analytics.pendingTasks}   color="#fb923c" delay={0.20} />
          <StatCard icon={TrendingUp}   label="Completion Rate"  value={`${analytics.completionRate}%`} color="#f43f5e" delay={0.26} />
        </div>

        {/* ── Charts row ── */}
        <div className="ap-chart-grid">
          {/* Priority Distribution */}
          <ChartCard title="Priority Distribution" icon={Target} delay={0.32}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.priorityDistribution}
                  cx="50%" cy="48%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                  outerRadius={90}
                  innerRadius={42}
                  dataKey="value"
                  stroke="none"
                >
                  {analytics.priorityDistribution.map((_, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend items={[
              { color: "#f43f5e", label: "High" },
              { color: "#fb923c", label: "Medium" },
              { color: "#60a5fa", label: "Low" },
            ]} />
          </ChartCard>

          {/* Weekly Progress */}
          <ChartCard title="Weekly Progress" icon={BarChart2} delay={0.38}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.weeklyProgress} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="completed" fill="#4ade80" name="Completed" radius={[5,5,0,0]} maxBarSize={28} />
                <Bar dataKey="created"   fill="#f43f5e" name="Created"   radius={[5,5,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
            <CustomLegend items={[{ color: "#4ade80", label: "Completed" }, { color: "#f43f5e", label: "Created" }]} />
          </ChartCard>
        </div>

        {/* ── Completion Trend (full width) ── */}
        <ChartCard title="Completion Trend" icon={TrendingUp} delay={0.44}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.weeklyProgress}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(244,63,94,0.3)", strokeWidth: 1 }} />
              <Line
                type="monotone" dataKey="completed"
                stroke="#f43f5e" strokeWidth={2.5}
                dot={{ fill: "#f43f5e", strokeWidth: 0, r: 4 }}
                activeDot={{ fill: "#fff", stroke: "#f43f5e", strokeWidth: 2, r: 6 }}
                name="Completed Tasks"
              />
            </LineChart>
          </ResponsiveContainer>
          <CustomLegend items={[{ color: "#f43f5e", label: "Completed Tasks" }]} />
        </ChartCard>

      </div>
    </>
  );
}