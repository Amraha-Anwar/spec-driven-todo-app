"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Tag, Sparkles, X, Loader2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import { useTasks } from "../../app/hooks/use-tasks";
import { authClient } from "../../lib/auth-client";

const PRIORITIES = [
  { value: "low",    label: "Low",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)"  },
  { value: "medium", label: "Medium", color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.3)"  },
  { value: "high",   label: "High",   color: "#f43f5e", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.35)" },
];

export function AddTaskFormAdvanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  const { mutate } = useTasks();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await authClient.getSession();
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !title.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/api/${userId}/tasks`, {
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate?.toISOString(),
        is_completed: false,
      });
      toast.success("Task created successfully!");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(undefined);
      setIsOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(undefined);
  };

  const activePriority = PRIORITIES.find(p => p.value === priority)!;

  /* ── Collapsed trigger button ── */
  if (!isOpen) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
          @keyframes atfPulse { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
          @keyframes atfShine {
            0%{left:-100%;opacity:0} 12%{opacity:1} 55%{left:110%;opacity:.5} 100%{left:110%;opacity:0}
          }
          .atf-trigger {
            width:100%; padding:15px 22px;
            background:linear-gradient(135deg,#9f1239 0%,#e11d48 100%);
            border:none; border-radius:14px; cursor:pointer;
            display:flex; align-items:center; justify-content:center; gap:10px;
            font-family:'Poppins',sans-serif; font-size:14px; font-weight:700; color:#fff;
            box-shadow:0 6px 28px rgba(190,24,93,0.42), inset 0 1px 0 rgba(255,255,255,0.12);
            transition:all 0.22s ease; position:relative; overflow:hidden;
            letter-spacing:-0.01em;
          }
          .atf-trigger:hover {
            transform:translateY(-1px);
            box-shadow:0 10px 38px rgba(190,24,93,0.58), inset 0 1px 0 rgba(255,255,255,0.12);
          }
          .atf-trigger:hover .atf-plus { transform:rotate(90deg); }
          .atf-trigger::after {
            content:''; position:absolute; top:0; bottom:0; width:35%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);
            animation:atfShine 2s ease-out 0.3s both;
          }
          .atf-plus { transition:transform 0.3s ease; flex-shrink:0; }
          .atf-dot {
            width:5px; height:5px; border-radius:50%; background:#fff;
            opacity:.6; animation:atfPulse 2s ease-in-out infinite;
          }
        `}</style>
        <button className="atf-trigger" onClick={() => setIsOpen(true)}>
          <span className="atf-dot" />
          <Plus size={17} className="atf-plus" />
          Create New Task
          <Sparkles size={14} style={{ opacity: 0.8 }} />
        </button>
      </>
    );
  }

  /* ── Expanded form ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        @keyframes atfIn    { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes atfPulse { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }

        .atf-wrap {
          position:relative; border-radius:20px;
          background:rgba(8,3,5,0.96);
          border:1px solid rgba(244,63,94,0.16);
          padding:28px;
          box-shadow:0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04);
          font-family:'Poppins',sans-serif;
          animation:atfIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
          overflow:hidden;
        }
        .atf-wrap::before {
          content:''; position:absolute; top:0; left:12%; right:12%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(244,63,94,0.5),transparent);
        }
        .atf-glow {
          position:absolute; top:-40%; left:-10%;
          width:280px; height:220px; border-radius:50%;
          background:radial-gradient(ellipse,rgba(159,18,57,0.14) 0%,transparent 65%);
          filter:blur(45px); pointer-events:none;
        }

        /* header */
        .atf-header {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:24px; position:relative; z-index:1;
        }
        .atf-header-left { display:flex; align-items:center; gap:10px; }
        .atf-header-icon {
          width:32px; height:32px; border-radius:9px;
          background:linear-gradient(135deg,rgba(244,63,94,0.2),rgba(159,18,57,0.1));
          border:1px solid rgba(244,63,94,0.28);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 14px rgba(244,63,94,0.15);
        }
        .atf-header-title { font-size:15px; font-weight:700; color:#fff; letter-spacing:-0.02em; }
        .atf-header-sub   { font-size:11px; color:rgba(255,255,255,0.25); margin-top:1px; }
        .atf-close {
          width:30px; height:30px; border-radius:8px; border:none; cursor:pointer;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07);
          color:rgba(255,255,255,0.35); display:flex; align-items:center; justify-content:center;
          transition:all 0.2s ease;
        }
        .atf-close:hover { background:rgba(244,63,94,0.1); border-color:rgba(244,63,94,0.25); color:#f43f5e; }

        /* label */
        .atf-label {
          display:flex; align-items:center; gap:6px;
          font-size:10.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
          color:rgba(255,255,255,0.35); margin-bottom:8px;
        }

        /* inputs */
        .atf-input, .atf-textarea {
          width:100%; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08); border-radius:11px;
          color:#fff; font-family:'Poppins',sans-serif; outline:none;
          transition:border-color 0.25s, box-shadow 0.25s, background 0.25s;
          box-sizing:border-box;
        }
        .atf-input {
          padding:13px 16px; font-size:15px; font-weight:600; letter-spacing:-0.01em;
        }
        .atf-textarea { padding:12px 16px; font-size:13.5px; resize:none; }
        .atf-input::placeholder,.atf-textarea::placeholder { color:rgba(255,255,255,0.18); font-weight:400; }
        .atf-input:focus,.atf-textarea:focus {
          border-color:rgba(244,63,94,0.4);
          box-shadow:0 0 0 3px rgba(244,63,94,0.09);
          background:rgba(255,255,255,0.06);
        }

        /* priority buttons */
        .atf-priorities { display:flex; gap:8px; }
        .atf-priority {
          flex:1; padding:9px 12px; border-radius:10px; border:1px solid; cursor:pointer;
          font-family:'Poppins',sans-serif; font-size:12px; font-weight:600;
          display:flex; align-items:center; justify-content:center; gap:6px;
          transition:all 0.22s ease; letter-spacing:0.01em;
        }
        .atf-priority-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        /* date button */
        .atf-date-btn {
          width:100%; padding:12px 16px; border-radius:11px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.45); text-align:left; cursor:pointer;
          font-family:'Poppins',sans-serif; font-size:13px; font-weight:500;
          display:flex; align-items:center; gap:10px;
          transition:all 0.22s ease; box-sizing:border-box;
        }
        .atf-date-btn:hover {
          border-color:rgba(244,63,94,0.3);
          background:rgba(255,255,255,0.06);
          color:#fff;
        }
        .atf-date-btn.has-date { color:#fff; border-color:rgba(244,63,94,0.25); }

        /* calendar wrapper */
        .atf-cal {
          margin-top:10px; border-radius:12px;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          overflow:hidden;
          animation:atfIn 0.2s ease-out both;
        }

        /* actions */
        .atf-actions { display:flex; gap:10px; margin-top:6px; }
        .atf-cancel {
          flex:1; padding:13px; border-radius:12px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.45); cursor:pointer;
          font-family:'Poppins',sans-serif; font-size:13.5px; font-weight:600;
          transition:all 0.2s ease;
        }
        .atf-cancel:hover { background:rgba(255,255,255,0.07); color:#fff; border-color:rgba(255,255,255,0.14); }
        .atf-submit {
          flex:1.4; padding:13px; border-radius:12px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#9f1239 0%,#e11d48 100%);
          color:#fff; font-family:'Poppins',sans-serif; font-size:13.5px; font-weight:700;
          box-shadow:0 5px 22px rgba(190,24,93,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
          display:flex; align-items:center; justify-content:center; gap:7px;
          transition:all 0.22s ease; letter-spacing:-0.01em;
        }
        .atf-submit:hover:not(:disabled) {
          transform:translateY(-1px);
          box-shadow:0 9px 30px rgba(190,24,93,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .atf-submit:disabled { opacity:0.45; cursor:not-allowed; }
        .atf-spinner {
          width:14px; height:14px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          animation:atfSpin 0.7s linear infinite; flex-shrink:0;
        }
        @keyframes atfSpin { to{transform:rotate(360deg)} }
        @keyframes atfShine {
          0%{left:-100%;opacity:0} 12%{opacity:1} 55%{left:110%;opacity:.5} 100%{left:110%;opacity:0}
        }

        /* divider */
        .atf-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); margin:4px 0; }
      `}</style>

      <div className="atf-wrap">
        <div className="atf-glow" />

        {/* Header */}
        <div className="atf-header">
          <div className="atf-header-left">
            <div className="atf-header-icon">
              <Plus size={15} color="#f43f5e" />
            </div>
            <div>
              <div className="atf-header-title">New Task</div>
              <div className="atf-header-sub">Fill in the details below</div>
            </div>
          </div>
          <button className="atf-close" type="button" onClick={handleCancel} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative", zIndex: 1 }}>

          {/* Title */}
          <div>
            <label className="atf-label">
              <Sparkles size={11} color="#f43f5e" /> Task title
            </label>
            <input
              type="text"
              className="atf-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="atf-label">
              <span style={{ fontSize: 11, opacity: 0.7 }}>≡</span> Description
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>optional</span>
            </label>
            <textarea
              className="atf-textarea"
              placeholder="Add more context or notes…"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
            />
          </div>

          <div className="atf-divider" />

          {/* Priority */}
          <div>
            <label className="atf-label">
              <Tag size={11} /> Priority
            </label>
            <div className="atf-priorities">
              {PRIORITIES.map(p => {
                const active = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    className="atf-priority"
                    onClick={() => setPriority(p.value)}
                    style={{
                      background: active ? p.bg : "rgba(255,255,255,0.03)",
                      borderColor: active ? p.border : "rgba(255,255,255,0.08)",
                      color: active ? p.color : "rgba(255,255,255,0.38)",
                      boxShadow: active ? `0 0 12px ${p.color}18` : "none",
                    }}
                  >
                    <span
                      className="atf-priority-dot"
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
            <label className="atf-label">
              <CalendarIcon size={11} /> Due date
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>optional</span>
            </label>
            <button
              type="button"
              className={`atf-date-btn${dueDate ? " has-date" : ""}`}
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
              <div className="atf-cal">
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
          <div className="atf-actions">
            <button type="button" className="atf-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="atf-submit"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <><span className="atf-spinner" /> Creating…</>
              ) : (
                <><Plus size={15} /> Create Task</>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}