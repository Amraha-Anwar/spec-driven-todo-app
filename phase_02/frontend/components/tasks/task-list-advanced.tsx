"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTasks } from "../../app/hooks/use-tasks";
import { TaskCard } from "./task-card";
import { TaskEditModal } from "./task-edit-modal";
import { AddTaskFormAdvanced } from "./add-task-form-advanced";
import { Search, TrendingUp, CheckCircle2, Clock, BarChart2, SlidersHorizontal } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "../../lib/toast";

interface TaskListAdvancedProps {
  showAddForm?: boolean;
}

export function TaskListAdvanced({ showAddForm = false }: TaskListAdvancedProps) {
  const { tasks, isLoading, isError, mutate } = useTasks();
  const userId = tasks?.[0]?.user_id;

  const [editingTask, setEditingTask]     = useState<any>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus]   = useState<string>("all");
  const [sortBy, setSortBy]               = useState<string>("created");
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);

  /* ── optimistic delete ── */
  const handleOptimisticDelete = async (taskId: string) => {
    setDeletingTaskIds(prev => new Set(prev).add(taskId));
    try {
      await api.delete(`/api/${userId}/tasks/${taskId}`);
      mutate((cur: any[] | undefined) => cur?.filter((t: any) => t.id !== taskId), false);
      toast.success("Task deleted successfully");
      setTimeout(() => mutate(), 300);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete task");
      mutate();
    } finally {
      setDeletingTaskIds(prev => { const n = new Set(prev); n.delete(taskId); return n; });
    }
  };

  /* ── filter / sort ── */
  let filtered = (tasks || []).filter((t: any) => !deletingTaskIds.has(t.id));
  if (searchQuery)          filtered = filtered.filter((t: any) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  if (filterPriority !== "all") filtered = filtered.filter((t: any) => t.priority === filterPriority);
  if (filterStatus === "completed") filtered = filtered.filter((t: any) => t.is_completed);
  if (filterStatus === "pending")   filtered = filtered.filter((t: any) => !t.is_completed);
  filtered = [...filtered].sort((a: any, b: any) => {
    if (sortBy === "created")  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "due_date") { if (!a.due_date) return 1; if (!b.due_date) return -1; return new Date(a.due_date).getTime() - new Date(b.due_date).getTime(); }
    if (sortBy === "priority") { const o = { high: 0, medium: 1, low: 2 }; return (o[a.priority as keyof typeof o] ?? 1) - (o[b.priority as keyof typeof o] ?? 1); }
    return 0;
  });

  const total     = tasks?.length || 0;
  const pending   = tasks?.filter((t: any) => !t.is_completed).length || 0;
  const completed = tasks?.filter((t: any) => t.is_completed).length || 0;
  const rate      = total ? Math.round((completed / total) * 100) : 0;

  const STAT_CARDS = [
    { label: "Total",      value: total,     color: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.08)", icon: BarChart2 },
    { label: "Pending",    value: pending,   color: "#fb923c",               border: "rgba(251,146,60,0.22)",  icon: Clock },
    { label: "Completed",  value: completed, color: "#4ade80",               border: "rgba(74,222,128,0.22)",  icon: CheckCircle2 },
    { label: "Completion", value: `${rate}%`,color: "#f43f5e",               border: "rgba(244,63,94,0.22)",   icon: TrendingUp },
  ];

  const SELECT_STYLE: React.CSSProperties = {
    padding: "10px 14px", borderRadius: 11,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    outline: "none", cursor: "pointer", appearance: "none" as const,
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 34,
    transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes tlPulse { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes tlIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .tl-stat { position:relative; overflow:hidden; border-radius:14px; padding:18px 16px; background:rgba(8,3,5,0.88); transition:all 0.28s ease; cursor:default; flex:1; min-width:0; }
        .tl-stat:hover { transform:translateY(-2px); }
        .tl-stat-shimmer { position:absolute; top:0; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,var(--sc),transparent); transition:opacity 0.3s; opacity:0.4; }
        .tl-stat:hover .tl-stat-shimmer { opacity:1; }

        .tl-search-wrap { position:relative; flex:1.2; min-width:0; }
        .tl-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); pointer-events:none; transition:color 0.2s; }
        .tl-search { width:100%; padding:10px 14px 10px 38px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:11px; color:#fff; font-size:13px; font-family:'Poppins',sans-serif; outline:none; transition:border-color 0.25s,box-shadow 0.25s,background 0.25s; box-sizing:border-box; }
        .tl-search::placeholder { color:rgba(255,255,255,0.2); }
        .tl-search:focus { border-color:rgba(244,63,94,0.4); box-shadow:0 0 0 3px rgba(244,63,94,0.08); background:rgba(255,255,255,0.06); }
        .tl-search-wrap:focus-within .tl-search-icon { color:rgba(244,63,94,0.7) !important; }

        select.tl-sel:focus { border-color:rgba(244,63,94,0.4) !important; box-shadow:0 0 0 3px rgba(244,63,94,0.08) !important; background:rgba(255,255,255,0.06) !important; }
        select.tl-sel option { background:#0a0205; color:#fff; }

        .tl-empty { border-radius:16px; background:rgba(8,3,5,0.88); border:1px solid rgba(255,255,255,0.06); padding:52px 24px; text-align:center; }

        @media(max-width:700px) {
          .tl-stats { flex-wrap:wrap; }
          .tl-stats > * { flex:1 1 calc(50% - 6px) !important; }
          .tl-filters { flex-direction:column; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "'Poppins',sans-serif" }}>

        {/* Add Task Form */}
        {showAddForm && <AddTaskFormAdvanced />}

        {/* ── Stat cards ── */}
        <div className="tl-stats" style={{ display: "flex", gap: 12 }}>
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              className="tl-stat"
              style={{ border: `1px solid ${s.border}` } as React.CSSProperties}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              // @ts-ignore
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${s.color}18`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <div className="tl-stat-shimmer" style={{ "--sc": s.color } as React.CSSProperties} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: s.color + "14", border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={14} color={s.color} />
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(8,3,5,0.88)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}
        >
          {/* top shimmer */}
          <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />
          {/* filter icon label */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <SlidersHorizontal size={11} color="rgba(244,63,94,0.6)" />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>Filter & search</span>
          </div>
          <div className="tl-filters" style={{ display: "flex", gap: 10 }}>
            {/* Search */}
            <div className="tl-search-wrap">
              <Search size={14} className="tl-search-icon" color="rgba(255,255,255,0.25)" />
              <input type="text" className="tl-search" placeholder="Search tasks…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {/* Priority */}
            <select className="tl-sel" style={SELECT_STYLE} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟠 Medium</option>
              <option value="low">🔵 Low</option>
            </select>
            {/* Status */}
            <select className="tl-sel" style={SELECT_STYLE} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="completed">✅ Completed</option>
            </select>
            {/* Sort */}
            <select className="tl-sel" style={SELECT_STYLE} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="created">↓ Created</option>
              <option value="due_date">📅 Due Date</option>
              <option value="priority">🚩 Priority</option>
            </select>
          </div>
        </motion.div>

        {/* ── Task list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 14, background: "rgba(8,3,5,0.88)", border: "1px solid rgba(255,255,255,0.06)", animation: "tlPulse 2s ease-in-out infinite" }} />
              ))}
            </div>
          )}

          {isError && (
            <div style={{ borderRadius: 14, border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.05)", padding: "20px 24px", textAlign: "center" }}>
              <p style={{ color: "#f87171", fontSize: 13 }}>Failed to load tasks. Please try again.</p>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="tl-empty">
              <div style={{ fontSize: 32, marginBottom: 12 }}>{searchQuery || filterPriority !== "all" || filterStatus !== "all" ? "🔍" : "✨"}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                {searchQuery || filterPriority !== "all" || filterStatus !== "all" ? "No tasks match your filters" : "No tasks yet"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
                {showAddForm ? "Create your first task above!" : "Head to the Tasks tab to add tasks"}
              </div>
            </div>
          )}

          {!isLoading && userId && filtered.map((task: any, i: number) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <TaskCard task={task} userId={userId} onEdit={() => setEditingTask(task)} onUpdate={mutate} onDelete={handleOptimisticDelete} />
            </motion.div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingTask && userId && (
          <TaskEditModal task={editingTask} userId={userId} isOpen={!!editingTask} onClose={() => setEditingTask(null)} onUpdate={mutate} />
        )}
      </div>
    </>
  );
}