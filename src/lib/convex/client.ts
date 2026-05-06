import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://perfect-platypus-307.eu-west-1.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);

export const useConvex = () => convex;
