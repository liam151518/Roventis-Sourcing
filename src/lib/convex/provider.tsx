"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

// One Convex client per app instance. Reads NEXT_PUBLIC_CONVEX_URL from env.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_CONVEX_URL. Add it to your .env.local file or Vercel environment variables."
  );
}

export const convex = new ConvexReactClient(convexUrl, { unsavedChangesWarning: false });

/**
 * Provider that attaches a Clerk session JWT to every Convex request so
 * server-side queries/mutations can call `ctx.auth.getUserIdentity()` and
 * enforce roles. Without this, all Convex calls run unauthenticated.
 */
export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}