"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { authClient } from "../../../lib/auth-client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle2, Clock, TrendingUp, Target } from "lucide-react";

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  priorityDistribution: { name: string; value: number }[];
  weeklyProgress: { day: string; completed: number; created: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        const userId = sessionData?.user?.id;
        
        if (!userId) return;

        const response = await api.get(`/api/${userId}/tasks`);
        const tasks = response.data;

        // Calculate analytics
        const total = tasks.length;
        const completed = tasks.filter((t: any) => t.is_completed).length;
        const pending = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Priority distribution
        const priorities = tasks.reduce((acc: any, task: any) => {
          const p = task.priority || "medium";
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        }, {});

        const priorityData = [
          { name: "High", value: priorities.high || 0 },
          { name: "Medium", value: priorities.medium || 0 },
          { name: "Low", value: priorities.low || 0 },
        ];

        // Weekly progress (mock data for demonstration)
        const weeklyData = [
          { day: "Mon", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Tue", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Wed", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Thu", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Fri", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Sat", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
          { day: "Sun", completed: Math.floor(Math.random() * 10), created: Math.floor(Math.random() * 10) },
        ];

        setAnalytics({
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: pending,
          completionRate: rate,
          priorityDistribution: priorityData,
          weeklyProgress: weeklyData,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ["#e11d48", "#f97316", "#eab308"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold glow-text mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your productivity and task completion</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Total Tasks"
          value={analytics.totalTasks}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="Completed"
          value={analytics.completedTasks}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Pending"
          value={analytics.pendingTasks}
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
          color="pink"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="glassmorphic rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.priorityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 30, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Progress */}
        <div className="glassmorphic rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 30, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#22c55e" name="Completed" />
              <Bar dataKey="created" fill="#e11d48" name="Created" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Trend */}
      <div className="glassmorphic rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20, 20, 30, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#22c55e"
              strokeWidth={3}
              name="Completed Tasks"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    green: "text-green-400 bg-green-500/10 border-green-500/30",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    pink: "text-pink-red bg-pink-red/10 border-pink-red/30",
  };

  return (
    <div className="glassmorphic rounded-xl border border-white/10 p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}