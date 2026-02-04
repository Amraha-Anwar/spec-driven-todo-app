"use client";

import React from "react";
import { useTasks } from "../../app/hooks/use-tasks";
import { useAuth } from "../../app/hooks/use-auth";
import { AddTaskForm } from "../tasks/add-task-form";
import { api } from "../../lib/api";

export const TaskList = () => {
  const { tasks, isLoading, isError, mutate } = useTasks();
  const { data: session } = useAuth();
  const userId = session?.user?.id;

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    if (!userId) return;

    try {
      // ✅ FIXED: Added /api prefix
      const response = await api.patch(`/api/${userId}/tasks/${taskId}`, {
        is_completed: !currentStatus
      });

      if (response.status === 200) {
        mutate();
        console.log("✅ Task updated successfully");
      }
    } catch (error: any) {
      console.error("❌ Failed to update task:", error);
      alert(error.response?.data?.detail || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!userId) return;

    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        // ✅ FIXED: Added /api prefix
        const response = await api.delete(`/api/${userId}/tasks/${taskId}`);

        if (response.status === 204) {
          mutate();
          console.log("✅ Task deleted successfully");
        }
      } catch (error: any) {
        console.error("❌ Failed to delete task:", error);
        alert(error.response?.data?.detail || "Failed to delete task");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-black">Add a New Task</h2>
        <AddTaskForm />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Your Tasks</h2>

        {isLoading && <p className="text-gray-500">Loading tasks...</p>}

        {isError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            Could not load tasks. Please ensure the backend is running and the URL is correct.
          </div>
        )}

        {!isLoading && tasks && tasks.length > 0 ? (
          tasks.map((task: any) => (
            <div key={task.id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`text-xs px-2 py-1 rounded ${task.is_completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {task.is_completed ? "Done" : "In Progress"}
                </div>
                <button
                  onClick={() => handleToggleComplete(task.id, task.is_completed)}
                  className={`px-3 py-1 text-xs rounded ${
                    task.is_completed
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {task.is_completed ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : !isLoading && (
          <p className="text-gray-400 italic">No tasks found. Create your first task above!</p>
        )}
      </div>
    </div>
  );
};