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
  title: "Xtract - AI Automation Agency",
  description: "Xtract is a modern AI automation agency, perfect for AI startups and tech businesses. Sleek, responsive, SEO-friendly, and designed to showcase AI solutions.",
  openGraph: {
    title: "Xtract - AI Automation Agency",
    description: "Xtract is a modern AI automation agency, perfect for AI startups and tech businesses.",
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

