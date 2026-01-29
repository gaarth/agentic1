import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/providers/smooth-scroll";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MACANE - Multi-Agent Portfolio Manager",
  description: "MACANE is a cutting-edge multi-agent portfolio manager. Optimize your investments with AI-driven risk assessment, growth strategies, and automated rebalancing.",
  openGraph: {
    title: "MACANE - Multi-Agent Portfolio Manager",
    description: "MACANE is a cutting-edge multi-agent portfolio manager. Optimize your investments with AI-driven risk assessment, growth strategies, and automated rebalancing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} font-sans antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

