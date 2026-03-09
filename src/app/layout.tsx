import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { DemoDataProvider } from "@/lib/demo-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roventis Sourcing | Affiliate Program",
  description: "Join South Africa's fastest-growing product sourcing affiliate program. Earn uncapped commissions selling tactical gear, corporate merchandise, workwear, and custom manufacturing.",
  keywords: ["affiliate program", "South Africa", "sales", "commission", "tactical gear", "corporate merchandise"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${inter.variable} antialiased`}>
        <DemoDataProvider>
          {children}
        </DemoDataProvider>
      </body>
    </html>
  );
}
