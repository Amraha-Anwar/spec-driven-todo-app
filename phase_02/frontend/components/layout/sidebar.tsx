"use client";

import { motion } from "framer-motion";
import { Home, BarChart3, Settings, CheckSquare, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { Avatar } from "../ui/avatar";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
    };
    getSession();
  }, []);

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
      initial={{ x: -256, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-64 glassmorphic-3d border-r border-white/10 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold glow-text">Plannoir</h1>
      </div>

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 border-b border-white/10 flex items-center gap-3 hover:bg-white/5 rounded-lg mx-2 my-2 transition-all"
      >
        <motion.div whileHover={{ scale: 1.1 }}>
          <Avatar
            name={session?.user?.name || "User"}
            imageUrl={session?.user?.image}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{session?.user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? "bg-pink-red/20 text-pink-red glow-effect"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`${isActive ? "glow-strong" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">{item.name}</span>
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
        className="p-4 border-t border-white/10"
      >
        <motion.button
          whileHover={{ scale: 1.02, x: 5 }}
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all w-full group"
        >
          <motion.div whileHover={{ rotate: -10 }}>
            <LogOut className="w-5 h-5" />
          </motion.div>
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}