import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hlrecovery.cp0x.com"),
  title: {
    default: "cp0x | Hyperliquid recovery",
    template: "%s | cp0x",
  },
  description:
    "Inspect a Hyperliquid account and recover assets stuck in orders, positions, vaults, DEX collateral, spot balances, borrow/lend, and USDC. Free permissionless interface by cp0x.",
  applicationName: "cp0x Hyperliquid Recovery",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  keywords: [
    "Hyperliquid recovery",
    "Hyperliquid withdrawal",
    "stuck Hyperliquid assets",
    "USDC withdrawal",
    "Arbitrum",
    "wallet recovery",
    "cp0x",
    "permissionless interface",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "cp0x | Hyperliquid recovery",
    description:
      "Inspect a Hyperliquid account and recover stuck balances, vault funds, collateral, orders, positions, and USDC. Free permissionless interface by cp0x.",
    url: "/",
    siteName: "cp0x",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cp0x | Hyperliquid recovery",
    description:
      "Inspect a Hyperliquid account and recover stuck balances, vault funds, collateral, orders, positions, and USDC. Free permissionless interface by cp0x.",
    site: "@cp0xdotcom",
    creator: "@cp0xdotcom",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#16161f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
