"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-red/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}