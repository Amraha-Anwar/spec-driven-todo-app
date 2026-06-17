"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Z_INDEX } from "../../constants/zindex";
import { useModalPortal } from "../../hooks/useModalPortal";

interface TaskDeleteModalProps {
  isOpen: boolean;
  taskTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TaskDeleteModal({
  isOpen,
  taskTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: TaskDeleteModalProps) {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
            @keyframes tdmSpin { to{transform:rotate(360deg)} }
          `}</style>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm pointer-events-auto"
            style={{ zIndex: Z_INDEX.MODAL_BACKDROP, background: "rgba(0,0,0,0.7)" }}
            onClick={onCancel}
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md max-h-[85vh] overflow-auto pointer-events-auto my-auto"
            >
              <div style={{
                position: "relative",
                borderRadius: 20,
                padding: "28px 26px",
                background: "rgba(10,3,5,0.97)",
                border: "1px solid rgba(244,63,94,0.18)",
                boxShadow: "0 32px 90px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
                fontFamily: "'Poppins',sans-serif",
                overflow: "hidden",
              }}>
                {/* top shimmer */}
                <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.45),transparent)" }} />
                {/* ambient glow */}
                <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(244,63,94,0.1) 0%,transparent 65%)", filter: "blur(30px)", pointerEvents: "none" }} />

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.08, 1.08, 1.08, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      style={{
                        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(244,63,94,0.1)",
                        border: "1px solid rgba(244,63,94,0.28)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 18px rgba(244,63,94,0.18)",
                      }}
                    >
                      <AlertTriangle size={21} color="#f87171" />
                    </motion.div>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>Delete Task</h2>
                      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.32)", margin: "2px 0 0" }}>This action cannot be undone</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancel}
                    disabled={isDeleting}
                    aria-label="Close"
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                      background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <X size={15} />
                  </motion.button>
                </div>

                {/* Content */}
                <div style={{ marginBottom: 24, position: "relative", zIndex: 1 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
                    Are you sure you want to delete this task?
                  </p>
                  <div style={{
                    padding: "12px 16px", borderRadius: 11,
                    background: "rgba(244,63,94,0.05)",
                    border: "1px solid rgba(244,63,94,0.15)",
                  }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {taskTitle}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
                  <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 13.5, fontWeight: 600,
                      fontFamily: "'Poppins',sans-serif",
                      cursor: isDeleting ? "not-allowed" : "pointer",
                      opacity: isDeleting ? 0.5 : 1,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { if (!isDeleting) { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.color = "#fff"; } }}
                    onMouseLeave={e => { if (!isDeleting) { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = "rgba(255,255,255,0.55)"; } }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg,#9f1239 0%,#dc2626 100%)",
                      color: "#fff", fontSize: 13.5, fontWeight: 700,
                      fontFamily: "'Poppins',sans-serif",
                      cursor: isDeleting ? "not-allowed" : "pointer",
                      opacity: isDeleting ? 0.6 : 1,
                      boxShadow: "0 5px 22px rgba(220,38,38,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { if (!isDeleting) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { if (!isDeleting) (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                  >
                    {isDeleting ? (
                      <>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "tdmSpin 0.7s linear infinite" }} />
                        Deleting…
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return useModalPortal(modalContent);
}