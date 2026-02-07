import { auth } from "../../../../lib/auth"; // Point to your auth.ts file
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);