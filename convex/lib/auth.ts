// Server-side admin check utilities for Convex

import { ActionInternal } from "../_generated/server";
import { v } from "convex/values";

// Admin Clerk IDs - should match the client-side list
const ADMIN_CLERK_IDS = [
  "user_3B7OeXBrhE04XG6KNSbtEE5UD1H", // liamxandersantos@gmail.com
];

export { ADMIN_CLERK_IDS };

/**
 * Check if a Clerk user ID is an admin
 */
export function isAdminClerkId(userId: string): boolean {
  return ADMIN_CLERK_IDS.includes(userId);
}

/**
 * Require the caller to be an admin - throws if not
 */
export async function requireAdmin(ctx: ActionInternal): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  if (!isAdminClerkId(identity.subject)) {
    throw new Error("Admin access required");
  }
  
  return identity.subject;
}

/**
 * Optional admin check - returns null if not admin, user ID if admin
 */
export async function getAdminClerkId(ctx: ActionInternal): Promise<string | null> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    if (!isAdminClerkId(identity.subject)) {
      return null;
    }
    
    return identity.subject;
  } catch {
    return null;
  }
}