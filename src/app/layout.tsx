import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solaris CMS — Laravel Admin Panel",
  description:
    "Filament-style admin panel for content management, user roles, and media. Built with Laravel 11 + Filament 3.",
  openGraph: {
    title: "Solaris CMS — Laravel Admin Panel",
    description: "Filament-style Laravel admin panel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-stone-50 font-sans text-stone-900 antialiased transition-colors dark:bg-stone-950 dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
