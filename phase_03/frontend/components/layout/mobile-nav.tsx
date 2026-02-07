"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Sparkles, DollarSign, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const mobileNavLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Features", href: "/#features", icon: Sparkles },
  { name: "Pricing", href: "/#pricing", icon: DollarSign },
  { name: "Dashboard", href: "/dashboard", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="p-2 text-white hover:text-pink-red transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </motion.button>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-full max-w-xs glassmorphic-3d border-r border-white/10 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold glow-text">Plannoir</h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:text-pink-red transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6 space-y-2">
                {mobileNavLinks.map((link, index) => (
                  <motion.button
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleLinkClick(link.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all group"
                  >
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                      <link.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="font-medium">{link.name}</span>
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}