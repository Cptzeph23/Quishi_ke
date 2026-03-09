/**
 * FILE:    frontend/src/app/layout.tsx
 * PURPOSE: Root layout — wraps every page with fonts, providers, and global styles
 */
import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { Providers }      from "./providers";
import { AIChatBubble }   from "@/components/layout/AIChatBubble";

const dmSans = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-dm-sans",
  display:  "swap",
});

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-playfair",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "SmartRealty — Find Your Perfect Property",
    template: "%s | SmartRealty",
  },
  description:
    "Discover apartments, houses, studios and offices across Nairobi. " +
    "AI-powered search to match you with your ideal property.",
  keywords: ["real estate", "property", "Nairobi", "apartments", "houses", "rental"],
  openGraph: {
    type:        "website",
    locale:      "en_KE",
    siteName:    "SmartRealty",
    title:       "SmartRealty — Find Your Perfect Property",
    description: "AI-powered real estate search across Nairobi.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#FAFAF8] font-sans antialiased">
        <Providers>
          {children}
          <AIChatBubble />
        </Providers>
      </body>
    </html>
  );
}