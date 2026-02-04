import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      style: {
        background: "rgba(34, 197, 94, 0.2)",
        border: "1px solid rgba(34, 197, 94, 0.5)",
      },
    });
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      style: {
        background: "rgba(239, 68, 68, 0.2)",
        border: "1px solid rgba(239, 68, 68, 0.5)",
      },
    });
  },
  info: (message: string) => {
    sonnerToast.info(message, {
      style: {
        background: "rgba(59, 130, 246, 0.2)",
        border: "1px solid rgba(59, 130, 246, 0.5)",
      },
    });
  },
};