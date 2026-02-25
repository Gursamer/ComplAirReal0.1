import type { Metadata } from "next";
import { type ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "ComplyAI Investor Demo",
  description: "AI compliance copilot for rapid contract and policy risk reviews.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-['Avenir_Next','Manrope','Segoe_UI',sans-serif]">{children}</body>
    </html>
  );
}
