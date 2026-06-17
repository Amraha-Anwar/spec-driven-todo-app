"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, Tag, Pencil, Sparkles } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  is_completed: boolean;
}

interface TaskEditModalProps {
  task: Task;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const PRIORITIES = [
  { value: "low",    label: "Low",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)"  },
  { value: "medium", label: "Medium", color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)"  },
  { value: "high",   label: "High",   color: "#f43f5e", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.35)" },
];

export function TaskEditModal({ task, userId, isOpen, onClose, onUpdate }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setShowCalendar(false);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.patch(`/api/${userId}/tasks/${task.id}`, {
        title,
        description,
        priority,
        due_date: dueDate?.toISOString(),
      });

      toast.success("Task updated successfully!");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
            @keyframes temSpin { to{transform:rotate(360deg)} }

            /* hide scrollbar visually while keeping scroll behaviour */
            .tem-scroll { scrollbar-width: none; -ms-overflow-style: none; }
            .tem-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }

            .tem-label {
              display:flex; align-items:center; gap:6px;
              font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
              color:rgba(255,255,255,0.35); margin-bottom:8px;
            }
            .tem-input, .tem-textarea {
              width:100%; background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.08); border-radius:11px;
              color:#fff; font-family:'Poppins',sans-serif; outline:none;
              transition:border-color 0.25s, box-shadow 0.25s, background 0.25s;
              box-sizing:border-box;
            }
            .tem-input { padding:13px 16px; font-size:15px; font-weight:600; letter-spacing:-0.01em; }
            .tem-textarea { padding:12px 16px; font-size:13.5px; resize:none; }
            .tem-input::placeholder,.tem-textarea::placeholder { color:rgba(255,255,255,0.18); font-weight:400; }
            .tem-input:focus,.tem-textarea:focus {
              border-color:rgba(244,63,94,0.4);
              box-shadow:0 0 0 3px rgba(244,63,94,0.09);
              background:rgba(255,255,255,0.06);
            }

            .tem-priorities { display:flex; gap:8px; }
            .tem-priority {
              flex:1; padding:9px 12px; border-radius:10px; border:1px solid; cursor:pointer;
              font-family:'Poppins',sans-serif; font-size:12px; font-weight:600;
              display:flex; align-items:center; justify-content:center; gap:6px;
              transition:all 0.22s ease; letter-spacing:0.01em;
            }
            .tem-priority-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

            .tem-date-btn {
              width:100%; padding:12px 16px; border-radius:11px;
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.08);
              color:rgba(255,255,255,0.45); text-align:left; cursor:pointer;
              font-family:'Poppins',sans-serif; font-size:13px; font-weight:500;
              display:flex; align-items:center; gap:10px;
              transition:all 0.22s ease; box-sizing:border-box;
            }
            .tem-date-btn:hover {
              border-color:rgba(244,63,94,0.3);
              background:rgba(255,255,255,0.06);
              color:#fff;
            }
            .tem-date-btn.has-date { color:#fff; border-color:rgba(244,63,94,0.25); }

            .tem-cal {
              margin-top:10px; border-radius:12px;
              background:rgba(255,255,255,0.03);
              border:1px solid rgba(255,255,255,0.07);
              overflow:hidden;
            }

            .tem-actions { display:flex; gap:10px; margin-top:6px; }
            .tem-cancel {
              flex:1; padding:13px; border-radius:12px;
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.08);
              color:rgba(255,255,255,0.45); cursor:pointer;
              font-family:'Poppins',sans-serif; font-size:13.5px; font-weight:600;
              transition:all 0.2s ease;
            }
            .tem-cancel:hover { background:rgba(255,255,255,0.07); color:#fff; border-color:rgba(255,255,255,0.14); }
            .tem-submit {
              flex:1.4; padding:13px; border-radius:12px; border:none; cursor:pointer;
              background:linear-gradient(135deg,#9f1239 0%,#e11d48 100%);
              color:#fff; font-family:'Poppins',sans-serif; font-size:13.5px; font-weight:700;
              box-shadow:0 5px 22px rgba(190,24,93,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
              display:flex; align-items:center; justify-content:center; gap:7px;
              transition:all 0.22s ease; letter-spacing:-0.01em;
            }
            .tem-submit:hover:not(:disabled) {
              transform:translateY(-1px);
              box-shadow:0 9px 30px rgba(190,24,93,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
            }
            .tem-submit:disabled { opacity:0.45; cursor:not-allowed; }
            .tem-spinner {
              width:14px; height:14px; border-radius:50%;
              border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
              animation:temSpin 0.7s linear infinite; flex-shrink:0;
            }
            .tem-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); margin:4px 0; }
            .tem-close {
              width:30px; height:30px; border-radius:8px; cursor:pointer;
              background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07);
              color:rgba(255,255,255,0.35); display:flex; align-items:center; justify-content:center;
              transition:all 0.2s ease; flex-shrink:0;
            }
            .tem-close:hover { background:rgba(244,63,94,0.1); border-color:rgba(244,63,94,0.25); color:#f43f5e; }
          `}</style>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal container */}
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
            <motion.div
              className="tem-scroll"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", pointerEvents: "auto" }}
            >
              <div style={{
                position: "relative", borderRadius: 20, padding: 28,
                background: "rgba(8,3,5,0.96)",
                border: "1px solid rgba(244,63,94,0.16)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
                fontFamily: "'Poppins',sans-serif", overflow: "hidden",
              }}>
                {/* top shimmer */}
                <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.5),transparent)" }} />
                {/* ambient glow */}
                <div style={{ position: "absolute", top: "-40%", left: "-10%", width: 280, height: 220, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(159,18,57,0.14) 0%,transparent 65%)", filter: "blur(45px)", pointerEvents: "none" }} />

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,rgba(244,63,94,0.2),rgba(159,18,57,0.1))", border: "1px solid rgba(244,63,94,0.28)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(244,63,94,0.15)" }}>
                      <Pencil size={14} color="#f43f5e" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Edit Task</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>Update the details below</div>
                    </div>
                  </div>
                  <button className="tem-close" type="button" onClick={onClose} aria-label="Close">
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative", zIndex: 1 }}>

                  {/* Title */}
                  <div>
                    <label className="tem-label">
                      <Sparkles size={11} color="#f43f5e" /> Task title
                    </label>
                    <input
                      type="text"
                      className="tem-input"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="tem-label">
                      <span style={{ fontSize: 11, opacity: 0.7 }}>≡</span> Description
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>optional</span>
                    </label>
                    <textarea
                      className="tem-textarea"
                      placeholder="Add more context or notes…"
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="tem-divider" />

                  {/* Priority */}
                  <div>
                    <label className="tem-label">
                      <Tag size={11} /> Priority
                    </label>
                    <div className="tem-priorities">
                      {PRIORITIES.map(p => {
                        const active = priority === p.value;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            className="tem-priority"
                            onClick={() => setPriority(p.value)}
                            style={{
                              background: active ? p.bg : "rgba(255,255,255,0.03)",
                              borderColor: active ? p.border : "rgba(255,255,255,0.08)",
                              color: active ? p.color : "rgba(255,255,255,0.38)",
                              boxShadow: active ? `0 0 12px ${p.color}18` : "none",
                            }}
                          >
                            <span
                              className="tem-priority-dot"
                              style={{ background: active ? p.color : "rgba(255,255,255,0.2)" }}
                            />
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="tem-label">
                      <CalendarIcon size={11} /> Due date
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>optional</span>
                    </label>
                    <button
                      type="button"
                      className={`tem-date-btn${dueDate ? " has-date" : ""}`}
                      onClick={() => setShowCalendar(s => !s)}
                    >
                      <CalendarIcon size={14} color={dueDate ? "#f43f5e" : "rgba(255,255,255,0.25)"} />
                      {dueDate ? (
                        <span style={{ color: "#fff", fontWeight: 600 }}>{format(dueDate, "PPP")}</span>
                      ) : (
                        <span>Pick a date…</span>
                      )}
                      {dueDate && (
                        <span
                          style={{
                            marginLeft: "auto", fontSize: 10.5, color: "rgba(244,63,94,0.6)",
                            fontWeight: 600, letterSpacing: "0.04em",
                            background: "rgba(244,63,94,0.08)", padding: "2px 8px",
                            borderRadius: 20, border: "1px solid rgba(244,63,94,0.18)",
                          }}
                          onClick={e => { e.stopPropagation(); setDueDate(undefined); }}
                        >
                          Clear
                        </span>
                      )}
                    </button>

                    {showCalendar && (
                      <div className="tem-cal">
                        <Calendar
                          selected={dueDate}
                          onSelect={date => {
                            setDueDate(date);
                            setShowCalendar(false);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="tem-actions">
                    <button type="button" className="tem-cancel" onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="tem-submit"
                      disabled={isSubmitting || !title.trim()}
                    >
                      {isSubmitting ? (
                        <><span className="tem-spinner" /> Saving…</>
                      ) : (
                        <><Pencil size={15} /> Save Changes</>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
