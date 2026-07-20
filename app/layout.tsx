import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { clsx } from "clsx";

import { SiteFooter } from "@/components/site-footer";
import { APP_VERSION } from "@/lib/app-version";
import { loadChangelogReleases } from "@/lib/changelog";

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
  const releases = loadChangelogReleases();

  return (
    <html
      lang="en"
      className={clsx(bricolage.variable, dmSans.variable, "h-full antialiased")}
    >
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter version={APP_VERSION} releases={releases} />
      </body>
    </html>
  );
}
