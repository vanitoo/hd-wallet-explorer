import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./suite.css";

export const metadata: Metadata = {
  title: "HD Wallet Explorer",
  description: "Offline-first BIP39, BIP32, Bitcoin, Ethereum and watch-only exploration suite",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
