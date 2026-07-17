import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import Link from "next/link";

import { BrandWordmark } from "@/components/brand-wordmark";

import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Broke Gamer",
    template: "%s · Broke Gamer",
  },
  description: "Best for the least. Game deals under €10 across PC and console.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-stroke">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="flex flex-col gap-1">
              <Link href="/deals" className="w-fit">
                <BrandWordmark size="sm" />
              </Link>
              <p className="text-sm text-muted">Broke. Still gaming.</p>
            </div>
            <p className="text-xs text-muted">Deals under €10 · PC &amp; console</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
