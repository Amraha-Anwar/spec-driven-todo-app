"use client";

import React, { useState } from "react";
import { useAuth } from "../../app/hooks/use-auth";
import { useTasks } from "../../app/hooks/use-tasks";
import { api } from "../../lib/api";

export const AddTaskForm = () => {
  const [title, setTitle] = useState("");
  const { data: session } = useAuth();
  const { mutate } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = session?.user?.id;
    
    if (!userId || !title.trim()) {
      setError("Please enter a task title");
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      console.log("📤 Creating task for user:", userId);
      console.log("📤 API base URL:", api.defaults.baseURL);
      
      // ✅ CRITICAL FIX: Ensure /api prefix
      const response = await api.post(`/api/${userId}/tasks`, {
        title: title.trim(),
        description: "",
        is_completed: false
      });

      console.log("✅ Response:", response.status, response.data);

      if (response.status === 201) {
        setTitle("");
        mutate();
        console.log("✅ Task created successfully");
      }
    } catch (err: any) {
      console.error("❌ Failed to add task:", err);
      console.error("❌ Request URL:", err.config?.url);
      console.error("❌ Error response:", err.response?.data);
      const errorMsg = err.response?.data?.detail || "Failed to add task";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
};