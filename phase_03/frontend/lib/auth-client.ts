import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // In the browser, always call back to the origin that served the page
    // (so it works regardless of which port this app runs on, e.g. 3000 vs 3001).
    // On the server, fall back to the configured env URL.
    baseURL:
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || ""
});