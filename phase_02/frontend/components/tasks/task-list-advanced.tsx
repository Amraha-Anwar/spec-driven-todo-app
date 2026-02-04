"use client";

import { useState } from "react";
import { useTasks } from "../../app/hooks/use-tasks";
import { TaskCard } from "./task-card";
import { TaskEditModal } from "./task-edit-modal";
import { AddTaskFormAdvanced } from "./add-task-form-advanced";
import { Search } from "lucide-react";

export function TaskListAdvanced() {
  const { tasks, isLoading, isError, mutate } = useTasks();
  
  // Get userId from the first task (since useTasks already filters by userId)
  const userId = tasks?.[0]?.user_id;

  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created");

  // Filter and sort tasks
  let filteredTasks = tasks || [];

  // Search
  if (searchQuery) {
    filteredTasks = filteredTasks.filter((task: any) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by priority
  if (filterPriority !== "all") {
    filteredTasks = filteredTasks.filter((task: any) => task.priority === filterPriority);
  }

  // Filter by status
  if (filterStatus === "completed") {
    filteredTasks = filteredTasks.filter((task: any) => task.is_completed);
  } else if (filterStatus === "pending") {
    filteredTasks = filteredTasks.filter((task: any) => !task.is_completed);
  }

  // Sort
  filteredTasks = [...filteredTasks].sort((a: any, b: any) => {
    if (sortBy === "created") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "due_date") {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
    }
    return 0;
  });

  const pendingCount = tasks?.filter((t: any) => !t.is_completed).length || 0;
  const completedCount = tasks?.filter((t: any) => t.is_completed).length || 0;

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <AddTaskFormAdvanced />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glassmorphic rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold">{tasks?.length || 0}</p>
        </div>
        <div className="glassmorphic rounded-lg p-4 border border-yellow-500/30">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="glassmorphic rounded-lg p-4 border border-green-500/30">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
        </div>
        <div className="glassmorphic rounded-lg p-4 border border-pink-red/30">
          <p className="text-gray-400 text-sm">Completion</p>
          <p className="text-2xl font-bold text-pink-red">
            {tasks?.length ? Math.round((completedCount / tasks.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glassmorphic rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 outline-none transition-all"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 outline-none transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 outline-none transition-all"
          >
            <option value="created">Sort by Created</option>
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        )}

        {isError && (
          <div className="glassmorphic rounded-xl border border-red-500/30 p-6 text-center">
            <p className="text-red-400">Failed to load tasks. Please try again.</p>
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="glassmorphic rounded-xl border border-white/10 p-12 text-center">
            <p className="text-gray-400 text-lg">
              {searchQuery || filterPriority !== "all" || filterStatus !== "all"
                ? "No tasks found matching your filters"
                : "No tasks yet. Create your first task above!"}
            </p>
          </div>
        )}

        {!isLoading && userId && filteredTasks.map((task: any) => (
          <TaskCard
            key={task.id}
            task={task}
            userId={userId}
            onEdit={() => setEditingTask(task)}
            onUpdate={mutate}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingTask && userId && (
        <TaskEditModal
          task={editingTask}
          userId={userId}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={mutate}
        />
      )}
    </div>
  );
}