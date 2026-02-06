"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { Sidebar } from "../../components/layout/sidebar";
import { Toaster } from "../../components/ui/toast";
import { Z_INDEX } from "../../constants/zindex";
import { useSidebarMode } from "../../hooks/useSidebarMode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const { sidebarMode, isMobile, mounted, toggleSidebar } = useSidebarMode();

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
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-red/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Sidebar Toggle Button (visible on all screen sizes) */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className="fixed top-3 right-3 md:top-4 md:left-3 z-[45] p-2 rounded-md bg-black/40 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white hover:bg-black/60 transition-all"
        aria-label="Toggle sidebar"
      >
        {sidebarMode === "full" ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      {/* Sidebar (responsive with full/slim/hidden modes) */}
      <AnimatePresence mode="wait">
        {sidebarMode !== "hidden" && (
          <motion.div
            key={sidebarMode}
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed md:relative z-40"
          >
            <Sidebar isSlim={sidebarMode === "slim"} isMobile={isMobile} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop (click to close sidebar) */}
      <AnimatePresence>
        {sidebarMode === "full" && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Content (adjusts for sidebar state) */}
      <motion.div
        animate={{
          marginLeft: isMobile ? 0 : (sidebarMode === "hidden" ? 0 : (sidebarMode === "slim" ? 80 : 256))
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`min-h-screen p-8 relative z-10 ${!isMobile && sidebarMode !== "hidden" ? "md:block" : ""} pt-16 md:pt-8`}
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