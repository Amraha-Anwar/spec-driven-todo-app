"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, Settings, CheckSquare, LogOut, X, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { OPEN_CHAT_EVENT } from "../chat/ChatWidget";
import { Avatar } from "../ui/avatar";
import { useAuth } from "../../app/hooks/use-auth";
import {
  Sidebar as SidebarUI,
  SidebarBody,
} from "../ui/sidebar";
import { useState, useEffect } from "react";

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

const SidebarStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
    @keyframes sbPulse { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
    @keyframes sbSpin  { to{transform:rotate(360deg)} }

    .sb-link {
      display:flex; align-items:center; gap:12px; border-radius:12px;
      transition:all 0.2s ease; position:relative; overflow:hidden;
      font-family:'Poppins',sans-serif; text-decoration:none;
    }
    .sb-link-icon { flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:transform 0.25s ease; }
    .sb-link:hover .sb-link-icon { transform:scale(1.08); }
    .sb-link-active::before {
      content:''; position:absolute; left:0; top:14%; bottom:14%; width:3px; border-radius:0 4px 4px 0;
      background:linear-gradient(180deg,#f43f5e,#9f1239);
      box-shadow:0 0 8px rgba(244,63,94,0.5);
    }

    .sb-signout { transition:all 0.2s ease; font-family:'Poppins',sans-serif; }
    .sb-signout:hover { background:rgba(248,113,113,0.1) !important; color:#f87171 !important; }

    .sb-profile { transition:all 0.2s ease; }
    .sb-profile:hover { background:rgba(255,255,255,0.04) !important; }
  `}</style>
);

export function Sidebar({ isSlim = false, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useAuth();
  const [open, setOpen] = useState(!isSlim);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobileView && open) setOpen(false);
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

  // Open the AI chat workspace (handled by ChatWidget via a global event).
  const openChat = () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT));

  /* ── Mobile drawer version ── */
  if (isMobileView) {
    return (
      <>
        <SidebarStyles />

        {/* Mobile Header */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 100,
          background: "rgba(6,2,4,0.97)",
          borderBottom: "1px solid rgba(244,63,94,0.1)",
          display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
          backdropFilter: "blur(12px)",
        }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(!open)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", cursor: "pointer",
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: "linear-gradient(135deg,#9f1239,#e11d48)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, color: "#fff",
              boxShadow: "0 3px 10px rgba(190,24,93,0.4)",
            }}>P</div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", fontFamily: "'Poppins',sans-serif" }}>Plannior</span>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                style={{ position: "fixed", inset: 0, top: 56, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                style={{
                  position: "fixed", left: 0, top: 56, bottom: 0, width: 260, zIndex: 50,
                  background: "rgba(8,3,5,0.98)",
                  borderRight: "1px solid rgba(244,63,94,0.1)",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, fontFamily: "'Poppins',sans-serif" }}>
                  {/* Nav */}
                  <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    {navigation.map((item, index) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`sb-link ${isActive ? "sb-link-active" : ""}`}
                            style={{
                              padding: "12px 16px", minHeight: 44,
                              background: isActive ? "rgba(244,63,94,0.1)" : "transparent",
                              color: isActive ? "#f43f5e" : "rgba(255,255,255,0.55)",
                            }}
                          >
                            <span className="sb-link-icon" style={{ color: isActive ? "#f43f5e" : "rgba(255,255,255,0.4)" }}>
                              <item.icon size={18} />
                            </span>
                            <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}>{item.name}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* Chat Assistant launcher */}
                  <motion.button
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: navigation.length * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { openChat(); setOpen(false); }}
                    className="sb-link"
                    style={{
                      padding: "12px 16px", minHeight: 44, width: "100%", marginTop: 4, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg,rgba(159,18,57,0.22),rgba(225,29,72,0.16))",
                      boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.25)",
                      color: "#fff",
                    }}
                  >
                    <span className="sb-link-icon" style={{ color: "#f43f5e" }}>
                      <Sparkles size={18} />
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>Chat Assistant</span>
                  </motion.button>

                  {/* Profile + Sign out */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
                      className="sb-profile"
                      style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 11, padding: 10 }}
                    >
                      <Avatar name={session?.user?.name || "User"} imageUrl={session?.user?.image} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.name}</p>
                        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.email}</p>
                      </div>
                    </motion.div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="sb-signout"
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 44,
                        padding: "10px 14px", borderRadius: 11, border: "none", cursor: "pointer",
                        background: "transparent", color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      <LogOut size={17} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Sign Out</span>
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

  /* ── Desktop sidebar version ── */
  return (
    <>
      <SidebarStyles />
      <SidebarUI open={open} setOpen={setOpen} animate={true}>
        <SidebarBody
          className="justify-between gap-10"
          style={{ background: "rgba(8,3,5,0.97)", borderRight: "1px solid rgba(244,63,94,0.1)" }}
        >
          {/* Logo & Navigation */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

            {/* Logo */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: open ? "flex-start" : "center",
              gap: 10, paddingBottom: 22, marginBottom: 22,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <motion.div
                animate={{ scale: open ? 1 : 0.92 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: "linear-gradient(135deg,#9f1239,#e11d48)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900, color: "#fff",
                  boxShadow: "0 4px 14px rgba(190,24,93,0.4)",
                }}
              >P</motion.div>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.2 }}
                  style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.035em", color: "#fff", fontFamily: "'Poppins',sans-serif" }}
                >
                  Plannior
                </motion.span>
              )}
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Link
                      href={item.href}
                      title={!open ? item.name : undefined}
                      className={`sb-link ${isActive ? "sb-link-active" : ""}`}
                      style={{
                        padding: open ? "11px 16px" : "11px",
                        justifyContent: open ? "flex-start" : "center",
                        background: isActive ? "rgba(244,63,94,0.1)" : "transparent",
                        color: isActive ? "#f43f5e" : "rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; } }}
                    >
                      <span className="sb-link-icon" style={{ color: isActive ? "#f43f5e" : "inherit" }}>
                        <item.icon size={18} />
                      </span>
                      {open && <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}>{item.name}</span>}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Chat Assistant launcher */}
              <motion.button
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: navigation.length * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={openChat}
                title={!open ? "Chat Assistant" : undefined}
                className="sb-link"
                style={{
                  marginTop: 6, width: "100%", border: "none", cursor: "pointer",
                  padding: open ? "11px 16px" : "11px",
                  justifyContent: open ? "flex-start" : "center",
                  background: "linear-gradient(135deg,rgba(159,18,57,0.22),rgba(225,29,72,0.16))",
                  boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.25)",
                  color: "#fff",
                }}
              >
                <span className="sb-link-icon" style={{ color: "#f43f5e" }}>
                  <Sparkles size={18} />
                </span>
                {open && <span style={{ fontSize: 13.5, fontWeight: 700 }}>Chat Assistant</span>}
              </motion.button>
            </nav>
          </div>

          {/* Profile & Sign out */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="sb-profile"
              style={{
                display: "flex", alignItems: "center", gap: 10, borderRadius: 11,
                padding: open ? "10px" : "10px",
                justifyContent: open ? "flex-start" : "center",
              }}
            >
              <Avatar name={session?.user?.name || "User"} imageUrl={session?.user?.image} size={open ? "md" : "sm"} />
              {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.name}</p>
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.email}</p>
                </motion.div>
              )}
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              title={!open ? "Sign Out" : undefined}
              className="sb-signout"
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: open ? "11px 16px" : "11px",
                justifyContent: open ? "flex-start" : "center",
                borderRadius: 11, border: "none", cursor: "pointer",
                background: "transparent", color: "rgba(255,255,255,0.45)",
              }}
            >
              <LogOut size={17} style={{ flexShrink: 0 }} />
              {open && <span style={{ fontSize: 13, fontWeight: 600 }}>Sign Out</span>}
            </motion.button>
          </div>
        </SidebarBody>
      </SidebarUI>
    </>
  );
}