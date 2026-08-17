import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { I18nProvider } from "@/components/i18n-provider";
import { en } from "@/lib/i18n/en";
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
    default: en["meta.title"],
    template: "%s | cp0x",
  },
  description: en["meta.description"],
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
    title: en["meta.title"],
    description: en["meta.socialDescription"],
    url: "/",
    siteName: "cp0x",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: en["meta.title"],
    description: en["meta.socialDescription"],
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
        <I18nProvider>
          <Providers>{children}</Providers>
          <Footer />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
