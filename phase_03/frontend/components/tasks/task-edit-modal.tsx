"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Tag } from "lucide-react";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-2xl w-full max-w-lg border border-pink-red/20 glow-effect">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold glow-text">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 focus:ring-2 focus:ring-pink-red/20 outline-none transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {dueDate ? format(dueDate, "PPP") : "Select date"}
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
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg font-medium glow-effect hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}