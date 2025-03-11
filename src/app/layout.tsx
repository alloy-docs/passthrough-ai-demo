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
    "A Support AI Agent for a Shopify store using Alloy's Passthrough APIs",
  metadataBase: new URL("https://runalloy.com"),
  openGraph: {
    title: "SupportAgent",
    description:
      "A Support AI Agent for a Shopify store using Alloy's Passthrough APIs",
    images: [
      {
        url: "/alloy.png",
        width: 1200,
        height: 630,
        alt: "SupportAgent for Shopify",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SupportAgent",
    description:
      "A Support Agent for a Shopify store using Alloy's Passthrough APIs",
    images: ["/alloy.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
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
