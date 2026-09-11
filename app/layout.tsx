import {
  Syne,
  IBM_Plex_Mono,
} from "next/font/google";
import type { Metadata, Viewport } from "next";
import { PreferencesBoot } from "@/components/PreferencesBoot";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Soroban Arena",
    template: "%s · Soroban Arena",
  },
  description:
    "Slide the beads. Beat the clock. Climb the public leaderboard or race a rival on a living digital soroban.",
  applicationName: "Soroban Arena",
  keywords: ["soroban", "abacus", "math game", "race", "leaderboard"],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Soroban Arena",
    description:
      "A timed digital soroban with public scores and 1v1 bead races.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Soroban Arena",
    description:
      "A timed digital soroban with public scores and 1v1 bead races.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0c0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${ibm.variable}`}>
      <body className="grain min-h-dvh font-display antialiased">
        <PreferencesBoot />
        {children}
      </body>
    </html>
  );
}
