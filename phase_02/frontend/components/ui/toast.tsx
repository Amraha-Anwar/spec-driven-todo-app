"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(20, 20, 30, 0.9)",
          border: "1px solid rgba(225, 29, 72, 0.3)",
          color: "#fff",
          backdropFilter: "blur(20px)",
        },
      }}
    />
  );
}