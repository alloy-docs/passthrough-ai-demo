import type React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";

import "@/app/globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SupportAgent",
  description:
    "A Support Agent for a Shopify store using Alloy's Passthroguh APIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrains.className} bg-card`}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  );
}
