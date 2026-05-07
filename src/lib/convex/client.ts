import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_CONVEX_URL. Add it to your .env.local file or Vercel environment variables.");
}

export const convex = new ConvexReactClient(convexUrl);

export const useConvex = () => convex;
