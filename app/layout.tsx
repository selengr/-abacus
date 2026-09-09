import {
  Syne,
  IBM_Plex_Mono,
} from "next/font/google";
import type { Metadata } from "next";
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
  title: "Soroban — Abacus Arena",
  description:
    "Slide the beads. Beat the clock. Climb the leaderboard on a living digital soroban.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${ibm.variable}`}>
      <body className="grain min-h-dvh font-display antialiased">{children}</body>
    </html>
  );
}
