import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="theme-blacked"
          enableSystem={false}
          themes={["theme-blacked", "theme-stoned", "theme-light-pro", "theme-midnight", "theme-slate", "light", "dark"]}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CurrencyProvider>
              <SmoothScroll>{children}</SmoothScroll>
              <Toaster />
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
