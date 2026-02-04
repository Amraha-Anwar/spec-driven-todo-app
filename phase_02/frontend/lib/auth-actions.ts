import { authClient } from "../lib/auth-client";
import { setAccessToken } from "../lib/token-store";
import { mutate } from "swr";

export const logout = async () => {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    setAccessToken(null);
    // Clear SWR cache
    mutate(() => true, undefined, { revalidate: false });
    // Redirect is handled by the component or router usually, but typically we return here
    // and let the caller redirect.
  }
};
