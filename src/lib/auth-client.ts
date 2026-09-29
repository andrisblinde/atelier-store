import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// Same-origin /api/auth. The type-only import gives `session.user.role` its type
// without bundling the server config.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
