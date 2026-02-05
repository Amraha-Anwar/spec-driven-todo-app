"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { Sidebar } from "../../components/layout/sidebar";
import { Toaster } from "../../components/ui/toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("dashboardSidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      setIsPending(true);
      try {
        const { data } = await authClient.getSession();
        setSession(data);

        if (!data?.session) {
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/auth/signin");
      } finally {
        setIsPending(false);
      }
    };

    checkSession();
  }, [router]);

  // Toggle sidebar and persist to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("dashboardSidebarCollapsed", JSON.stringify(newState));
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="glassmorphic rounded-xl p-8 border border-pink-red/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-pink-red rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-pink-red rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-pink-red rounded-full animate-pulse delay-150" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-red/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Mobile Sidebar Toggle Button (visible only on ≤768px) */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-3 glassmorphic-3d rounded-lg border border-white/10 text-white"
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </motion.button>

      {/* Sidebar (responsive) */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:block fixed md:relative z-40"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop (click to close sidebar) */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleSidebar}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Content (adjusts for sidebar state) */}
      <motion.div
        animate={{
          marginLeft: sidebarCollapsed ? 0 : 256,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen p-8 relative z-10 md:ml-64"
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </motion.div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}