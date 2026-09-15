import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const body = IBM_Plex_Mono({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shop.bluemoundlab.com"),
  title: {
    default: "Blue Mound Tee Co.",
    template: "%s · Blue Mound Tee Co.",
  },
  description:
    "Upload your design. Pick a garment. We print on demand via Printful.",
  applicationName: "Blue Mound Tee Co.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shop.bluemoundlab.com",
    siteName: "Blue Mound Tee Co.",
    title: "Blue Mound Tee Co.",
    description:
      "Upload your design. Pick a garment. We print on demand via Printful.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Mound Tee Co.",
    description:
      "Upload your design. Pick a garment. We print on demand via Printful.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
