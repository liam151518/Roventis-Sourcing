"use client";

import { convex } from "@/lib/convex/client";
import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
