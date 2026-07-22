import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
export const metadata: Metadata = { title: "HD Wallet Explorer", description: "Local HD wallet derivation explorer" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }