// Admin emails - these users will have access to the admin dashboard
export const ADMIN_EMAILS = [
  "luanras@icloud.com",
  "dino.fernandes@icloud.com",
  "marcusdeaguiar17@gmail.com",
  "echarddeklerk@icloud.com",
  "liamxandersantos@gmail.com",
];

// Admin Clerk User IDs - more reliable than email
export const ADMIN_USER_IDS = [
  "user_3B7OeXBrhE04XG6KNSbtEE5UD1H", // liamxandersantos@gmail.com
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isAdminUserId(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}
