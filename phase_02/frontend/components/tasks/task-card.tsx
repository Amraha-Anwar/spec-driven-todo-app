"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Pencil, Trash2, Check, Clock, Calendar, Flag } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import { TaskDeleteModal } from "./task-delete-modal";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  is_completed: boolean;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
  userId: string;
  onEdit: () => void;
  onUpdate: () => void;
  onDelete?: (taskId: string) => Promise<void>;
}

const PRIORITY_META: Record<string, { color: string; bg: string; border: string }> = {
  low:    { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)" },
  medium: { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)" },
  high:   { color: "#f43f5e", bg: "rgba(244,63,94,0.12)",  border: "rgba(244,63,94,0.3)"   },
};

export function TaskCard({ task, userId, onEdit, onUpdate, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkHover, setCheckHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Position the portal menu near the trigger button, clamped inside the viewport
  // (the portal escapes the card's overflow:hidden clipping).
  useEffect(() => {
    if (!showMenu) return;
    const updatePosition = () => {
      if (!menuBtnRef.current) return;
      const rect = menuBtnRef.current.getBoundingClientRect();
      const MARGIN = 8;                                  // gap from button and viewport edges
      const menuW = menuRef.current?.offsetWidth || 150;
      const menuH = menuRef.current?.offsetHeight || 88;

      // Right-align the menu to the button, then clamp within [MARGIN, viewportW - menuW - MARGIN]
      let left = rect.right - menuW;
      left = Math.max(MARGIN, Math.min(left, window.innerWidth - menuW - MARGIN));

      // Prefer above the button; if not enough room, drop below — then clamp vertically too.
      const spaceAbove = rect.top;
      let top = spaceAbove >= menuH + MARGIN
        ? rect.top - menuH - MARGIN
        : rect.bottom + MARGIN;
      top = Math.max(MARGIN, Math.min(top, window.innerHeight - menuH - MARGIN));

      setMenuPos({ top, left });
    };
    updatePosition();
    // Re-measure once the menu has rendered (so menuW/menuH reflect real size).
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showMenu]);

  const handleToggleComplete = async () => {
    try {
      await api.patch(`/api/${userId}/tasks/${task.id}`, { is_completed: !task.is_completed });
      toast.success(task.is_completed ? "Task marked as pending" : "Task completed!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update task");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(task.id);
      } else {
        await api.delete(`/api/${userId}/tasks/${task.id}`);
        toast.success("Task deleted successfully");
        onUpdate();
      }
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDueDateInfo = () => {
    if (!task.due_date) return null;
    const date = new Date(task.due_date);
    const isOverdue = isPast(date) && !task.is_completed;
    let label = format(date, "MMM d, yyyy");
    let color = "rgba(255,255,255,0.32)";
    if (isToday(date))        { label = "Today";    color = "#fb923c"; }
    else if (isTomorrow(date)) { label = "Tomorrow"; color = "#60a5fa"; }
    else if (isOverdue)        { label = `Overdue · ${label}`; color = "#f43f5e"; }
    return { label, color, isOverdue };
  };

  const dueDateInfo = getDueDateInfo();
  const pm = PRIORITY_META[task.priority || "medium"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes tcPulse { 0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.25)} 50%{box-shadow:0 0 0 5px rgba(244,63,94,0)} }
        @keyframes tcSpin  { to{transform:rotate(360deg)} }
        @keyframes tcCheckIn { from{transform:scale(0.4);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>

      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          borderRadius: 16,
          padding: "18px 20px",
          background: "rgba(8,3,5,0.9)",
          border: `1px solid ${dueDateInfo?.isOverdue ? "rgba(244,63,94,0.32)" : "rgba(255,255,255,0.07)"}`,
          opacity: task.is_completed ? 0.55 : 1,
          boxShadow: dueDateInfo?.isOverdue ? "0 0 0 1px rgba(244,63,94,0.08), 0 8px 28px rgba(244,63,94,0.07)" : "0 4px 18px rgba(0,0,0,0.3)",
          transition: "opacity 0.25s ease, border-color 0.25s ease",
          fontFamily: "'Poppins',sans-serif",
          overflow: "hidden",
        }}
      >
        {/* top shimmer */}
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: `linear-gradient(90deg,transparent,${dueDateInfo?.isOverdue ? "rgba(244,63,94,0.35)" : "rgba(255,255,255,0.06)"},transparent)` }} />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>

          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            onMouseEnter={() => setCheckHover(true)}
            onMouseLeave={() => setCheckHover(false)}
            style={{
              marginTop: 1, width: 24, height: 24, borderRadius: 8, flexShrink: 0,
              border: task.is_completed ? "none" : `2px solid ${checkHover ? "rgba(244,63,94,0.6)" : "rgba(255,255,255,0.18)"}`,
              background: task.is_completed ? "linear-gradient(135deg,#9f1239,#e11d48)" : "transparent",
              boxShadow: task.is_completed ? "0 0 12px rgba(244,63,94,0.35)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s ease", padding: 0,
            }}
          >
            {task.is_completed && (
              <span style={{ animation: "tcCheckIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                <Check size={14} color="#fff" strokeWidth={3} />
              </span>
            )}
          </button>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px",
              color: task.is_completed ? "rgba(255,255,255,0.35)" : "#fff",
              textDecoration: task.is_completed ? "line-through" : "none",
            }}>
              {task.title}
            </h3>

            {task.description && (
              <p style={{
                fontSize: 12.5, color: "rgba(255,255,255,0.35)", margin: "0 0 12px",
                lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {task.description}
              </p>
            )}

            {/* Metadata row */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: task.description ? 0 : 10 }}>
              {task.priority && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 7,
                  background: pm.bg, border: `1px solid ${pm.border}`,
                  fontSize: 11, fontWeight: 600, color: pm.color,
                  animation: task.priority === "high" && !task.is_completed ? "tcPulse 2.2s ease-in-out infinite" : "none",
                }}>
                  <Flag size={11} />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </div>
              )}

              {dueDateInfo && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: dueDateInfo.color }}>
                  <Calendar size={11} />
                  {dueDateInfo.label}
                </div>
              )}

              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Mono',monospace" }}>
                <Clock size={11} />
                {format(new Date(task.created_at), "MMM d")}
              </div>
            </div>
          </div>

          {/* Actions menu */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              ref={menuBtnRef}
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                background: showMenu ? "rgba(255,255,255,0.08)" : "transparent",
                color: "rgba(255,255,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => { if (!showMenu) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!showMenu) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <MoreVertical size={16} />
            </button>

            {mounted && createPortal(
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowMenu(false)} />
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: "fixed", top: menuPos.top, left: menuPos.left,
                        transformOrigin: "bottom right",
                        zIndex: 999, minWidth: 150,
                        borderRadius: 12, overflow: "hidden",
                        background: "rgba(14,5,9,0.98)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                        fontFamily: "'Poppins',sans-serif",
                      }}
                    >
                      <button
                        onClick={() => { onEdit(); setShowMenu(false); }}
                        style={{
                          width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 9,
                          background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                          fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.7)",
                          fontFamily: "'Poppins',sans-serif", transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        style={{
                          width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 9,
                          background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                          fontSize: 12.5, fontWeight: 500, color: "#f87171",
                          fontFamily: "'Poppins',sans-serif", transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.1)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>
      </motion.div>

      <TaskDeleteModal
        isOpen={showDeleteModal}
        taskTitle={task.title}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}