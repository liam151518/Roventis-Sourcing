// Admin role detection - reads from Clerk publicMetadata.role
//
// To promote a user to admin (do this in Clerk dashboard):
//   Users -> select user -> Metadata -> Public metadata ->
//     { "role": "admin" }
//
// The role check is centralised here so there is a single source of truth
// across the frontend. The backend mirrors this in convex/lib/auth.ts.

export const ADMIN_ROLE = "admin" as const;
export type AdminRole = typeof ADMIN_ROLE;

/**
 * Check if a Clerk user has the admin role set in publicMetadata.
 * Accepts the full Clerk User object (or any object shaped like one).
 */
export function isAdminUser(user: { publicMetadata?: unknown } | null | undefined): boolean {
  if (!user) return false;
  const meta = user.publicMetadata as { role?: string } | null | undefined;
  return meta?.role === ADMIN_ROLE;
}

/**
 * Convenience: pass the email string directly. Used by Server Components
 * or anywhere we have the email but not the full user object. Falls back
 * to the email allow-list during the cutover window — remove once all
 * admins have been migrated to Clerk roles.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const legacyAdmins = [
    "liamxandersantos@gmail.com",
  ];
  return legacyAdmins.includes(email.toLowerCase());
}

/**
 * Combined check used by client layouts. Returns true if either the new
 * Clerk role says admin, or the legacy email allow-list still matches
 * (so existing admins don't get locked out before you migrate them).
 */
export function isAdmin(
  user: { publicMetadata?: unknown } | null | undefined,
  userEmail?: string | null,
): boolean {
  if (isAdminUser(user)) return true;
  if (userEmail && isAdminEmail(userEmail)) return true;
  return false;
}