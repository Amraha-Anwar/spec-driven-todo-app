"use client";

import { motion } from "framer-motion";
import { Home, BarChart3, Settings, CheckSquare, LogOut, X, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { Avatar } from "../ui/avatar";
import { useAuth } from "../../app/hooks/use-auth";
import {
  Sidebar as SidebarUI,
  SidebarBody,
} from "../ui/sidebar";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

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
  const [open, setOpen] = useState(!isSlim);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Detect if actually on mobile
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On mobile, close sidebar when navigating
  useEffect(() => {
    if (isMobileView && open) {
      setOpen(false);
    }
  }, [pathname, isMobileView]);

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

  // Mobile drawer version
  if (isMobileView) {
    return (
      <>
        {/* Mobile Header - Sticky */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0f] border-b border-white/10 z-[100] flex items-center px-4 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(!open)}
            className="text-white hover:text-pink-red transition-colors p-1 -ml-1"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
          <h1 className="font-bold glow-text text-lg">Plannoir</h1>
        </div>

        {/* Mobile Drawer - Fixed */}
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/50 z-[40] top-14"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="fixed left-0 top-14 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/10 z-[50] overflow-y-auto"
              >
                <div className="flex flex-col h-full p-4">
                  {/* Navigation */}
                  <nav className="flex-1 space-y-1">
                    {navigation.map((item, index) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-lg transition-all group px-4 py-3 min-h-[44px] ${
                              isActive
                                ? "bg-pink-red/20 text-pink-red glow-effect"
                                : "text-gray-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`flex-shrink-0 ${isActive ? "glow-strong" : ""}`}
                            >
                              <item.icon className="w-5 h-5" />
                            </motion.div>
                            <span className="font-medium text-sm">{item.name}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* User Profile & Sign Out */}
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all p-3"
                    >
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Avatar
                          name={session?.user?.name || "User"}
                          imageUrl={session?.user?.image}
                          size="sm"
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                      </div>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all w-full min-h-[44px]"
                    >
                      <motion.div whileHover={{ rotate: -10 }} className="flex-shrink-0">
                        <LogOut className="w-5 h-5" />
                      </motion.div>
                      <span className="font-medium text-sm">Sign Out</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar version - Sticky with fixed height
  return (
    <SidebarUI open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10">
        {/* Logo & Navigation Section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="border-b border-white/10 flex items-center justify-center pb-6">
            <motion.div
              animate={{ scale: open ? 1 : 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className={`font-bold glow-text ${open ? "text-2xl" : "text-lg hidden"}`}>
                Plannoir
              </h1>
              {!open && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-red to-pink-red/50 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 mt-8">
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
                    title={!open ? item.name : undefined}
                    className={`flex items-center gap-3 rounded-lg transition-all group ${
                      isActive
                        ? "bg-pink-red/20 text-pink-red glow-effect"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    } ${open ? "px-4 py-3" : "p-3 justify-center"}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`flex-shrink-0 ${isActive ? "glow-strong" : ""}`}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    {open && <span className="font-medium text-sm">{item.name}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Section */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all ${
              open ? "p-3 mx-0" : "p-3 justify-center"
            }`}
          >
            <motion.div whileHover={{ scale: 1.1 }} className="flex-shrink-0">
              <Avatar
                name={session?.user?.name || "User"}
                imageUrl={session?.user?.image}
                size={open ? "md" : "sm"}
              />
            </motion.div>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Sign Out Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            title={!open ? "Sign Out" : undefined}
            className={`rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all ${
              open
                ? "flex items-center gap-3 px-4 py-3 w-full"
                : "p-3 w-full flex justify-center"
            }`}
          >
            <motion.div whileHover={{ rotate: -10 }} className="flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </motion.div>
            {open && <span className="font-medium text-sm">Sign Out</span>}
          </motion.button>
        </div>
      </SidebarBody>
    </SidebarUI>
  );
}
