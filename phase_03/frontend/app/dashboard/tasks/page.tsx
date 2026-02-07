"use client";

import { TaskListAdvanced } from "../../../components/tasks/task-list-advanced";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text mb-2">Your Tasks</h1>
        <p className="text-gray-400">Organize and manage all your tasks</p>
      </div>

      <TaskListAdvanced />
    </div>
  );
}