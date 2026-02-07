"use client";

import { motion } from "framer-motion";
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
      {/* Header - Bento Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glassmorphic-3d rounded-3xl border border-pink-red/20 p-8 overflow-hidden relative"
      >
        {/* Background animated gradient orbs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-red/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-3 mb-2"
          >
            <Sparkles className="w-8 h-8 text-pink-red glow-strong" />
            <h1 className="text-5xl font-bold text-gradient-animated">
              Welcome Back, {userName}!
            </h1>
          </motion.div>
          <p className="text-gray-400 text-lg">
            Manage your tasks with style and efficiency
          </p>
        </div>
      </motion.div>

      {/* Tasks - Full width */}
      <TaskListAdvanced />
    </div>
  );
}