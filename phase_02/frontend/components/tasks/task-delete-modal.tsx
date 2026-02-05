"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glassmorphic-3d rounded-xl border border-red-500/30 p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1.1, 1]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Delete Task</h2>
                    <p className="text-sm text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-300 mb-2">
                  Are you sure you want to delete this task?
                </p>
                <div className="glassmorphic rounded-lg p-3 border border-white/10">
                  <p className="font-medium text-white truncate">{taskTitle}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 glassmorphic rounded-lg border border-white/10 font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-medium glow-effect hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
