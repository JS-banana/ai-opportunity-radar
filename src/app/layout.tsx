import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Opportunity Radar",
  description: "Curated AI events, programming challenges, hackathons, credits, benefits, and submission opportunities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
