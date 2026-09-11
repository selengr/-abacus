import Link from "next/link";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SiteNav } from "@/components/SiteNav";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="group">
          <p className="text-[11px] uppercase tracking-[0.35em] text-ash transition group-hover:text-paper">
            Soroban
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
        </Link>
        <SiteNav active="/settings" />
      </header>
      <p className="mb-6 max-w-md text-sm text-ash">
        Tune accent color, sound, motion, and your player name. Everything here
        stays on this device.
      </p>
      <SettingsPanel />
    </main>
  );
}
