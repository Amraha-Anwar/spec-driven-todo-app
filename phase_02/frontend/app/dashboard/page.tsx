"use client";

import { TaskListAdvanced } from "../../components/tasks/task-list-advanced";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";

export default function DashboardPage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await authClient.getSession();
      setUserName(data?.user?.name || "User");
    };
    getUser();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glassmorphic rounded-2xl border border-pink-red/20 p-8 glow-effect">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-pink-red" />
          <h1 className="text-4xl font-bold glow-text">Welcome Back, {userName}!</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Manage your tasks with style and efficiency
        </p>
      </div>

      {/* Tasks */}
      <TaskListAdvanced />
    </div>
  );
}