"use client";

import { motion } from "framer-motion";
import { Home, BarChart3, Settings, CheckSquare, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { Avatar } from "../ui/avatar";
import { useAuth } from "../../app/hooks/use-auth";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  /** Controls whether sidebar shows in slim/compact mode (icons only) */
  isSlim?: boolean;
  /** Indicates if the viewport is mobile size (< 768px) */
  isMobile?: boolean;
}

export function Sidebar({ isSlim = false, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useAuth();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
          router.refresh();
        },
      },
    });
  };

  return (
    <motion.div
      animate={{ width: isSlim ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-[40] glassmorphic-3d border-r border-white/10 flex flex-col"
    >
      {/* Logo */}
      <div className={`border-b border-white/10 flex items-center justify-center ${isSlim ? "p-4" : "p-6"}`}>
        <motion.div
          animate={{ scale: isSlim ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={`font-bold glow-text ${isSlim ? "text-lg hidden" : "text-2xl"}`}>
            Plannoir
          </h1>
          {isSlim && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-red to-pink-red/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`border-b border-white/10 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all ${
          isSlim ? "p-3 m-2 justify-center" : "p-6 mx-2 my-2"
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }}>
          <Avatar
            name={session?.user?.name || "User"}
            imageUrl={session?.user?.image}
            size={isSlim ? "sm" : "md"}
          />
        </motion.div>
        {!isSlim && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-2 ${isSlim ? "p-3" : "p-4"}`}>
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                title={isSlim ? item.name : undefined}
                className={`flex items-center gap-3 rounded-lg transition-all group ${
                  isActive
                    ? "bg-pink-red/20 text-pink-red glow-effect"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                } ${isSlim ? "p-3 justify-center" : "px-4 py-3"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`${isActive ? "glow-strong" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                {!isSlim && <span className="font-medium">{item.name}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`border-t border-white/10 ${isSlim ? "p-3" : "p-4"}`}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSignOut}
          title={isSlim ? "Sign Out" : undefined}
          className={`rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all group ${
            isSlim
              ? "p-3 w-full flex justify-center"
              : "flex items-center gap-3 px-4 py-3 w-full"
          }`}
        >
          <motion.div whileHover={{ rotate: -10 }}>
            <LogOut className="w-5 h-5" />
          </motion.div>
          {!isSlim && <span className="font-medium">Sign Out</span>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}