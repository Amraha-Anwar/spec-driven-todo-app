"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Check, Clock, Calendar, Flag } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { toast } from "../../lib/toast";
import { api } from "../../lib/api";

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
}

export function TaskCard({ task, userId, onEdit, onUpdate }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityColors = {
    low: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    high: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const handleToggleComplete = async () => {
    try {
      await api.patch(`/api/${userId}/tasks/${task.id}`, {
        is_completed: !task.is_completed,
      });
      toast.success(task.is_completed ? "Task marked as pending" : "Task completed!");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/${userId}/tasks/${task.id}`);
      toast.success("Task deleted successfully");
      onUpdate();
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
    let colorClass = "text-gray-400";
    
    if (isToday(date)) {
      label = "Today";
      colorClass = "text-yellow-400";
    } else if (isTomorrow(date)) {
      label = "Tomorrow";
      colorClass = "text-blue-400";
    } else if (isOverdue) {
      label = `Overdue - ${label}`;
      colorClass = "text-red-400";
    }
    
    return { label, colorClass, isOverdue };
  };

  const dueDateInfo = getDueDateInfo();

  return (
    <div
      className={`glassmorphic rounded-xl border p-5 transition-all hover:border-pink-red/30 ${
        task.is_completed ? "opacity-60" : ""
      } ${dueDateInfo?.isOverdue ? "border-red-500/30 glow-effect" : "border-white/10"}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.is_completed
              ? "bg-pink-red border-pink-red"
              : "border-white/30 hover:border-pink-red/50"
          }`}
        >
          {task.is_completed && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold mb-1 ${
              task.is_completed ? "line-through text-gray-500" : "text-white"
            }`}
          >
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Priority */}
            {task.priority && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md border ${
                  priorityColors[task.priority as keyof typeof priorityColors]
                }`}
              >
                <Flag className="w-3 h-3" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            )}

            {/* Due Date */}
            {dueDateInfo && (
              <div className={`flex items-center gap-1 ${dueDateInfo.colorClass}`}>
                <Calendar className="w-3 h-3" />
                {dueDateInfo.label}
              </div>
            )}

            {/* Created */}
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3 h-3" />
              {format(new Date(task.created_at), "MMM d")}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 z-20 glassmorphic rounded-lg border border-white/10 overflow-hidden min-w-[150px] shadow-xl">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-left"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-500/20 text-red-400 transition-colors text-left disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}