import { authClient } from "../../lib/auth-client";

export const useAuth = () => {
  const session = authClient.useSession();
  
  return {
    data: session.data,
    isPending: session.isPending,
    error: session.error,
    isAuthenticated: !!session.data?.session,
  };
};
