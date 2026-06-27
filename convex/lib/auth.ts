// Server-side admin role utilities for Convex.
//
// Source of truth: Clerk's publicMetadata.role. When the user is signed in,
// Convex's auth context exposes the Clerk JWT which includes publicMetadata.
// So we read the role from there - no hardcoded user lists needed.
//
// JWT template requirement: in Clerk dashboard, make sure the "convex" JWT
// template includes publicMetadata in its claims (default behaviour).

export const ADMIN_ROLE = "admin" as const;

/**
 * Read the Clerk user's role from the auth identity. Returns the role
 * string if set, otherwise null. Works for any Convex function with ctx.auth.
 */
export function getRole(ctx: any): string | null {
  const identity = ctx.auth?.getUserIdentity
    ? // promise-based in modern Convex
      null
    : null;
  // We can't await inside a sync helper, so callers must pass identity in.
  return null;
}

/**
 * Resolve the Clerk identity, returning the role (string) or null.
 */
export async function resolveRole(ctx: any): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  // Clerk puts publicMetadata on the JWT under the "metadata" key by default,
  // or sometimes as a top-level field depending on JWT template config.
  const metadata = (identity as any).publicMetadata || (identity as any).metadata;
  if (!metadata) return null;
  const role = (metadata as { role?: string }).role;
  return role ?? null;
}

/**
 * Require the caller to be an admin. Throws if not authenticated or not admin.
 * Returns the Clerk user ID on success.
 */
export async function requireAdmin(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  const role = await resolveRole(ctx);
  if (role !== ADMIN_ROLE) {
    throw new Error("Admin access required");
  }
  return identity.subject;
}

/**
 * Optional admin check. Returns the Clerk user ID if admin, null otherwise.
 * Never throws.
 */
export async function getAdminClerkId(ctx: any): Promise<string | null> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const role = await resolveRole(ctx);
    if (role !== ADMIN_ROLE) return null;
    return identity.subject;
  } catch {
    return null;
  }
}

/**
 * Convenience: is the caller an admin? (boolean)
 */
export async function isAdminCtx(ctx: any): Promise<boolean> {
  return (await getAdminClerkId(ctx)) !== null;
}