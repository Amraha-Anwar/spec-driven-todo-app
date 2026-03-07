"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authClient } from "../../lib/auth-client";
import { Sidebar } from "../../components/layout/sidebar";
import { Toaster } from "../../components/ui/toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

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
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#0a0a0f]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-red/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen z-20">
        <Sidebar isSlim={false} />
      </div>

      {/* Mobile Sidebar - Drawer with fixed header */}
      <div className="md:hidden">
        <Sidebar isSlim={false} isMobile={true} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full md:w-auto overflow-y-auto">
        <motion.div
          className="relative z-10 min-h-screen pt-14 md:pt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 md:p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
