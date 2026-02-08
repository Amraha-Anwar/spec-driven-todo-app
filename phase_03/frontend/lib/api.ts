import axios from "axios";
import { authClient } from "./auth-client";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://amraha-anwar-plannior-ai-backend.hf.space",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Session Token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get fresh session from Better Auth
      const { data } = await authClient.getSession();
      
      // Better-Auth v1.4.15 stores session token in session.token
      const token = data?.session?.token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Session token attached:", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ No session token found");
        console.log("Session data:", data);
      }
    } catch (error) {
      console.error("❌ Error getting session:", error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("⚠️ 401 error, trying to refresh session...");
        
        // Try to get a fresh session
        const { data } = await authClient.getSession({ cached: false });
        const newToken = data?.session?.token;

        if (newToken) {
          console.log("✅ Got new session token");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          console.warn("❌ No valid session, redirecting to login");
          window.location.href = "/auth/signin";
        }
      } catch (err) {
        console.error("❌ Failed to refresh session:", err);
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  }
);