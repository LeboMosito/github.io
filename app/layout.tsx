import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { HomeReadyProvider } from "@/components/HomeReadyProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeReady AI",
  description: "A first-time homebuyer assistant for Tennessee THDA Great Choice buyers."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans text-ink antialiased dark:bg-navy dark:text-white">
        <HomeReadyProvider>
          <AppShell>{children}</AppShell>
        </HomeReadyProvider>
      </body>
    </html>
  );
}
