"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Tag, Sparkles } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";
import { useTasks } from "../../app/hooks/use-tasks";
import { authClient } from "../../lib/auth-client";

export function AddTaskFormAdvanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-xl font-medium flex items-center justify-center gap-2 glow-effect hover:opacity-90 transition-all group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        Create New Task
        <Sparkles className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="glassmorphic rounded-xl border border-pink-red/20 p-6 glow-effect">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-4 py-3 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 focus:ring-2 focus:ring-pink-red/20 outline-none transition-all text-lg font-medium"
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            rows={3}
            className="w-full px-4 py-3 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 focus:ring-2 focus:ring-pink-red/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Priority
          </label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                  priority === p
                    ? "bg-pink-red/20 border-pink-red text-pink-red glow-effect"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Due Date
          </label>
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-4 py-3 glassmorphic rounded-lg border border-white/10 hover:border-pink-red/50 transition-all text-left"
          >
            {dueDate ? format(dueDate, "PPP") : "Select date (optional)"}
          </button>
          
          {showCalendar && (
            <div className="mt-2">
              <Calendar
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setShowCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTitle("");
              setDescription("");
              setPriority("medium");
              setDueDate(undefined);
            }}
            className="flex-1 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg font-medium glow-effect hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}